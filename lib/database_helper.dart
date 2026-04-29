import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  static Database? _database;

  factory DatabaseHelper() => _instance;

  DatabaseHelper._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'ipos_database.db');
    return await openDatabase(
      path,
      version: 13,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      await db.execute('''
        CREATE TABLE IF NOT EXISTS exchange_rates(
          currency TEXT PRIMARY KEY,
          rate REAL
        )
      ''');
    }
    if (oldVersion < 3) {
      await db.execute('ALTER TABLE orders ADD COLUMN paymentMethod TEXT');
    }
    if (oldVersion < 4) {
      await db.execute('ALTER TABLE orders ADD COLUMN itemsJson TEXT');
    }
    if (oldVersion < 5) {
      await db.execute('ALTER TABLE orders ADD COLUMN amountReceived REAL');
      await db.execute('ALTER TABLE orders ADD COLUMN changeAmount REAL');
    }
    if (oldVersion < 6) {
      await db.execute('ALTER TABLE orders ADD COLUMN synced INTEGER DEFAULT 0');
    }
    if (oldVersion < 7) {
      await db.execute('ALTER TABLE products ADD COLUMN unit TEXT');
    }
    if (oldVersion < 8) {
      try {
        await db.execute('ALTER TABLE orders ADD COLUMN remark TEXT');
      } catch (_) {}
    }
    if (oldVersion < 9) {
      // Recreate products table with TEXT id to support UUID
      await db.execute('DROP TABLE IF EXISTS products');
      await db.execute('''
        CREATE TABLE products(
          id TEXT PRIMARY KEY,
          name TEXT,
          imagePath TEXT,
          price REAL,
          stock INTEGER,
          unit TEXT
        )
      ''');
    }
    if (oldVersion < 11) {
      try {
        await db.execute('ALTER TABLE orders ADD COLUMN userId TEXT');
      } catch (_) {}
      try {
        await db.execute('ALTER TABLE orders ADD COLUMN userName TEXT');
      } catch (_) {}
    }
    if (oldVersion < 12) {
      try {
        await db.execute('ALTER TABLE products ADD COLUMN min_stock_level INTEGER DEFAULT 5');
      } catch (_) {}
    }
    if (oldVersion < 13) {
      try {
        await db.execute('ALTER TABLE products ADD COLUMN category_id TEXT');
        await db.execute('ALTER TABLE products ADD COLUMN category_name TEXT');
        await db.execute('ALTER TABLE products ADD COLUMN supplier_id TEXT');
        
        await db.execute('''
          CREATE TABLE IF NOT EXISTS categories(
            id TEXT PRIMARY KEY,
            name TEXT,
            shop_id TEXT
          )
        ''');
      } catch (_) {}
    }
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE products(
        id TEXT PRIMARY KEY,
        name TEXT,
        imagePath TEXT,
        price REAL,
        stock INTEGER,
        unit TEXT,
        min_stock_level INTEGER DEFAULT 5,
        category_id TEXT,
        category_name TEXT,
        supplier_id TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS categories(
        id TEXT PRIMARY KEY,
        name TEXT,
        shop_id TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE orders(
        id TEXT PRIMARY KEY,
        date TEXT,
        total REAL,
        status TEXT,
        currency TEXT,
        paymentMethod TEXT,
        itemsJson TEXT,
        amountReceived REAL,
        changeAmount REAL,
        synced INTEGER DEFAULT 0,
        remark TEXT,
        userId TEXT,
        userName TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE exchange_rates(
        currency TEXT PRIMARY KEY,
        rate REAL
      )
    ''');
  }

  // Product Operations
  Future<void> insertProducts(List<Map<String, dynamic>> products) async {
    final db = await database;
    Batch batch = db.batch();
    
    // Clear existing products before sync
    batch.delete('products');
    
    for (var product in products) {
      batch.insert('products', product);
    }
    await batch.commit();
  }

  Future<List<Map<String, dynamic>>> getProducts() async {
    final db = await database;
    return await db.query('products');
  }

  // Category Operations
  Future<void> insertCategories(List<Map<String, dynamic>> categories) async {
    final db = await database;
    Batch batch = db.batch();
    batch.delete('categories');
    for (var cat in categories) {
      batch.insert('categories', cat);
    }
    await batch.commit();
  }

  Future<List<Map<String, dynamic>>> getCategories() async {
    final db = await database;
    return await db.query('categories');
  }

  // Order Operations
  Future<void> insertOrder(Map<String, dynamic> order) async {
    final db = await database;
    await db.insert('orders', order);
  }

  Future<void> updateProductStock(String id, int quantitySold) async {
    final db = await database;
    final List<Map<String, dynamic>> products = await db.query('products', where: 'id = ?', whereArgs: [id]);
    if (products.isNotEmpty) {
      int currentStock = int.tryParse(products.first['stock'].toString()) ?? 0;
      int newStock = currentStock - quantitySold;
      if (newStock < 0) newStock = 0;
      
      print('Updating Stock for ID $id: $currentStock -> $newStock (Sold: $quantitySold)');
      
      await db.update('products', {'stock': newStock}, where: 'id = ?', whereArgs: [id]);
    }
  }

  Future<List<Map<String, dynamic>>> getOrders() async {
    final db = await database;
    return await db.query('orders', orderBy: 'date DESC');
  }

  Future<List<Map<String, dynamic>>> getUnsyncedOrders() async {
    final db = await database;
    return await db.query('orders', where: 'synced = 0');
  }


  Future<void> markOrdersAsSynced(List<String> ids) async {
    final db = await database;
    Batch batch = db.batch();
    for (var id in ids) {
      batch.update('orders', {'synced': 1}, where: 'id = ?', whereArgs: [id]);
    }
    await batch.commit();
  }


  Future<bool> cancelOrder(String orderId, {String? remark}) async {
    final db = await database;
    
    // 1. Get the order
    final List<Map<String, dynamic>> orders = await db.query('orders', where: 'id = ?', whereArgs: [orderId]);
    if (orders.isEmpty) return false;
    
    final order = orders.first;
    if (order['status'] == 'Cancelled') return false; // Already cancelled

    try {
      // 2. Parse items and return stock
      if (order['itemsJson'] != null && order['itemsJson'].toString().isNotEmpty) {
        final List<dynamic> items = json.decode(order['itemsJson'] as String);
        
        for (var item in items) {
          String productId = item['id']?.toString() ?? '';
          int qty = item['quantity'] is int 
              ? item['quantity'] 
              : int.tryParse(item['quantity'].toString()) ?? 0;
          
          final List<Map<String, dynamic>> productRes = await db.query('products', where: 'id = ?', whereArgs: [productId]);
          if (productRes.isNotEmpty) {
            int currentStock = int.tryParse(productRes.first['stock'].toString()) ?? 0;
            await db.update('products', {'stock': currentStock + qty}, where: 'id = ?', whereArgs: [productId]);
            print('Returned Stock for Product ID $productId: $currentStock -> ${currentStock + qty}');
          }
        }
      }

      // 3. Mark as Cancelled and set synced to 0 to resend status to server
      int rowsAffected = await db.update(
        'orders', 
        {'status': 'Cancelled', 'synced': 0, 'remark': remark}, 
        where: 'id = ?', 
        whereArgs: [orderId]
      );
      
      print('Order $orderId marked as Cancelled with remark: $remark. Rows affected: $rowsAffected');
      return rowsAffected > 0;
    } catch (e) {
      print('Error cancelling order: $e');
      return false;
    }
  }

  // Currency Operations
  Future<void> updateExchangeRates(Map<String, dynamic> data) async {
    final db = await database;
    Batch batch = db.batch();
    
    // Support both { 'LAK': 1.0, 'THB': 750 } and { 'rates': { 'LAK': 1.0, ... } }
    Map<String, dynamic> rates = data.containsKey('rates') ? data['rates'] : data;

    for (var entry in rates.entries) {
      batch.insert(
        'exchange_rates', 
        {'currency': entry.key.toUpperCase(), 'rate': (entry.value as num).toDouble()},
        conflictAlgorithm: ConflictAlgorithm.replace
      );
    }
    await batch.commit();
  }

  Future<Map<String, double>> getExchangeRates() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('exchange_rates');
    return {
      for (var item in maps) item['currency'] as String: (item['rate'] as num).toDouble()
    };
  }

  Future<void> clearAllData() async {
    final db = await database;
    Batch batch = db.batch();
    batch.delete('products');
    batch.delete('orders');
    batch.delete('exchange_rates');
    await batch.commit();
  }
}
