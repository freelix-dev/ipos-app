import 'package:flutter/material.dart';
import 'package:ipos/payment_screen.dart';
import 'package:ipos/database_helper.dart';
import 'package:ipos/main_drawer.dart';
import 'package:ipos/api_config.dart';
import 'package:ipos/view_orders_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Product {
  final String id;
  final String name;
  final String imagePath;
  final double price;
  final int stock;
  final int min_stock_level;
  final String unit;
  final int initialQuantity;
  final String categoryId;
  final String categoryName;
  final String supplierId;

  Product({
    required this.id,
    required this.name,
    required this.imagePath,
    required this.price,
    required this.stock,
    required this.unit,
    this.min_stock_level = 5,
    this.initialQuantity = 1,
    this.categoryId = '',
    this.categoryName = '',
    this.supplierId = '',
  });
}

class Category {
  final String id;
  final String name;

  Category({required this.id, required this.name});
}

class CartItem {
  final Product product;
  int quantity;

  CartItem({required this.product, required this.quantity});
}

class PosScreen extends StatefulWidget {
  const PosScreen({super.key});

  @override
  State<PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends State<PosScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<Product> products = [];
  List<Category> categories = [];
  List<CartItem> cartItems = [];
  String searchQuery = '';
  String selectedCategoryId = 'all';
  String selectedCurrency = 'LAK';
  String shopName = 'Namkhong Beer';
  final TextEditingController _searchController = TextEditingController();
  Map<String, double> exchangeRates = {'LAK': 1.0};
  bool _isLoading = true;
  bool isGridView = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final localProducts = await DatabaseHelper().getProducts();
    final localCategories = await DatabaseHelper().getCategories();
    final localRates = await DatabaseHelper().getExchangeRates();
    final prefs = await SharedPreferences.getInstance();
    final savedShopName = prefs.getString('shop_name') ?? 'Namkhong Beer';

    setState(() {
      categories = [Category(id: 'all', name: 'ທັງໝົດ')] + 
          localCategories.map((c) => Category(id: c['id'], name: c['name'])).toList();

      products = localProducts
          .map(
            (p) => Product(
              id: p['id']?.toString() ?? '',
              name: p['name'],
              imagePath: p['imagePath'],
              price: (p['price'] as num).toDouble(),
              stock: int.tryParse(p['stock'].toString()) ?? 0,
              min_stock_level: int.tryParse(p['min_stock_level']?.toString() ?? '5') ?? 5,
              unit: p['unit'] ?? '',
              categoryId: p['category_id']?.toString() ?? '',
              categoryName: p['category_name']?.toString() ?? '',
              supplierId: p['supplier_id']?.toString() ?? '',
            ),
          )
          .toList();

      if (localRates.isNotEmpty) {
        localRates.forEach((key, value) {
          exchangeRates[key] = value;
        });
      }
      shopName = savedShopName;
      _isLoading = false;
    });
  }

  List<Product> get filteredProducts {
    return products.where((p) {
      final matchesSearch = p.name.toLowerCase().contains(searchQuery.toLowerCase());
      final matchesCategory = selectedCategoryId == 'all' || p.categoryId == selectedCategoryId;
      return matchesSearch && matchesCategory;
    }).toList();
  }

  List<Product> get lowStockProducts {
    return products.where((p) => p.stock <= p.min_stock_level).toList();
  }

  double get cartTotal => cartItems.fold(
    0,
    (sum, item) => sum + (item.product.price * item.quantity),
  );

  double _convertPrice(double priceInLak) {
    double rate = exchangeRates[selectedCurrency] ?? 1.0;
    if (selectedCurrency == 'LAK') return priceInLak;
    return priceInLak / rate;
  }

  String _getImageUrl(String? path) {
    if (path == null || path.trim().isEmpty) {
      return '${ApiConfig.baseUrl}/assets/images/default.png';
    }
    
    if (path.startsWith('http')) return path;
    
    String normalizedPath = path.trim();
    if (normalizedPath.startsWith('/')) {
      normalizedPath = normalizedPath.substring(1);
    }
    
    // If it's just a filename or missing the root folder, assume public/assets/images/
    if (!normalizedPath.startsWith('assets/') && 
        !normalizedPath.startsWith('public/') && 
        !normalizedPath.startsWith('uploads/')) {
       normalizedPath = 'public/assets/images/$normalizedPath';
    } else if (!normalizedPath.startsWith('public/')) {
       // If it starts with assets/ or uploads/, prepend public/
       normalizedPath = 'public/$normalizedPath';
    }
    
    // Add cache busting timestamp
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return '${ApiConfig.baseUrl}/$normalizedPath?t=$timestamp';
  }

  String formatPrice(double price) {
    return price
        .toStringAsFixed(0)
        .replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]},',
        );
  }

  void addToCart(Product product, int quantity) {
    setState(() {
      final existingIndex = cartItems.indexWhere(
        (item) => item.product.name == product.name,
      );
      if (existingIndex >= 0) {
        cartItems[existingIndex].quantity += quantity;
      } else {
        cartItems.add(CartItem(product: product, quantity: quantity));
      }
    });

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('ເພີ່ມ ${product.name} ເຂົ້າກະຕ່າແລ້ວ'),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  void _showCartSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return SafeArea(
              child: Padding(
                padding: EdgeInsets.only(
                  bottom: MediaQuery.of(context).viewInsets.bottom + 20,
                  left: 20,
                  right: 20,
                  top: 20,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'ກະຕ່າຂອງທ່ານ',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Row(
                          children: [
                            if (cartItems.isNotEmpty)
                              TextButton.icon(
                                onPressed: () {
                                  setState(() => cartItems.clear());
                                  setModalState(() {});
                                },
                                icon: const Icon(
                                  Icons.delete_sweep,
                                  color: Colors.red,
                                  size: 20,
                                ),
                                label: const Text(
                                  'ລ້າງກະຕ່າ',
                                  style: TextStyle(color: Colors.red),
                                ),
                              ),
                            IconButton(
                              icon: const Icon(Icons.close),
                              onPressed: () => Navigator.pop(context),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const Divider(),
                    if (cartItems.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 40.0),
                        child: Column(
                          children: [
                            Icon(
                              Icons.shopping_cart_outlined,
                              size: 60,
                              color: Colors.grey,
                            ),
                            SizedBox(height: 10),
                            Text(
                              'ກະຕ່າວ່າງເປົ່າ',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      )
                    else
                      Flexible(
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: cartItems.length,
                          itemBuilder: (context, index) {
                            final item = cartItems[index];
                            return ListTile(
                              contentPadding: EdgeInsets.zero,
                              leading: Container(
                                width: 45,
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade100,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Image.network(
                                  _getImageUrl(item.product.imagePath),
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) => Image.network(
                                    '${ApiConfig.baseUrl}/assets/images/default.png',
                                    errorBuilder: (context, e, s) => Icon(Icons.image_not_supported_rounded, color: Colors.grey.shade300, size: 24),
                                  ),
                                ),
                              ),
                              title: Text(
                                item.product.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              subtitle: Text(
                                '${item.product.price.toStringAsFixed(0)} x ${item.quantity} ${item.product.unit}',
                                style: TextStyle(color: Colors.grey.shade600),
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    formatPrice(
                                      _convertPrice(
                                        item.product.price * item.quantity,
                                      ),
                                    ),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  IconButton(
                                    icon: const Icon(
                                      Icons.remove_circle_outline,
                                      color: Colors.red,
                                    ),
                                    onPressed: () {
                                      setState(() => cartItems.removeAt(index));
                                      setModalState(() {});
                                    },
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                    const Divider(),
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'ລວມທັງໝົດ',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Flexible(
                            child: Text(
                              '${formatPrice(_convertPrice(cartTotal))} ${selectedCurrency == 'LAK'
                                  ? 'ກີບ'
                                  : selectedCurrency == 'THB'
                                  ? 'ບາດ'
                                  : "\$"}',
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: primaryGreen,
                              ),
                              textAlign: TextAlign.right,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryGreen,
                          padding: const EdgeInsets.symmetric(vertical: 15),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: cartItems.isEmpty
                            ? null
                            : () async {
                                final result = await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => PaymentScreen(
                                      totalAmount: cartTotal,
                                      initialCurrency: selectedCurrency,
                                      exchangeRates: exchangeRates,
                                      cartItems: cartItems,
                                    ),
                                  ),
                                );
                                _loadData();
                                if (result == true) {
                                  Navigator.pop(context);
                                  setState(() => cartItems.clear());
                                }
                              },
                        child: const Text(
                          'ຊຳລະເງິນ',
                          style: TextStyle(color: Colors.white, fontSize: 18),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  final Color primaryGreen = const Color(0xFF76A258);
  final Color darkSlate = const Color(0xFF1E293B);
  final Color orangeColor = const Color(0xFFF59E0B);

  @override
  Widget build(BuildContext context) {
    final filteredProducts = products
        .where((p) => p.name.toLowerCase().contains(searchQuery.toLowerCase()))
        .toList();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: MainDrawer(primaryGreen: primaryGreen, onSyncComplete: _loadData),
      appBar: AppBar(
        backgroundColor: primaryGreen,
        elevation: 0,
        centerTitle: true,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu_rounded, color: Colors.white),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: Column(
          children: [
            Text(
              shopName,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 20,
              ),
            ),
            const Text(
              'ນ້ຳຂອງ ວຽງຈັນ',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        actions: [
          Row(
            children: [
              if (lowStockProducts.isNotEmpty)
                IconButton(
                  icon: Stack(
                    children: [
                      const Icon(Icons.notifications_active_outlined, color: Colors.white),
                      Positioned(
                        right: 0,
                        top: 0,
                        child: Container(
                          padding: const EdgeInsets.all(2),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          constraints: const BoxConstraints(minWidth: 12, minHeight: 12),
                          child: Text(
                            '${lowStockProducts.length}',
                            style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                    ],
                  ),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('ສິນຄ້າໃກ້ໝົດສຕັອກ'),
                        content: SizedBox(
                          width: double.maxFinite,
                          child: ListView.builder(
                            shrinkWrap: true,
                            itemCount: lowStockProducts.length,
                            itemBuilder: (context, i) => ListTile(
                              leading: const Icon(Icons.warning, color: Colors.orange),
                              title: Text(lowStockProducts[i].name),
                              trailing: Text('${lowStockProducts[i].stock} ${lowStockProducts[i].unit}', 
                                style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(context), child: const Text('ປິດ'))
                        ],
                      ),
                    );
                  },
                ),
              IconButton(
                icon: const Icon(Icons.history, color: Colors.white),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const ViewOrdersScreen()),
                  );
                },
              ),
              PopupMenuButton<String>(
                onSelected: (String value) => setState(() => selectedCurrency = value),
                itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
                  const PopupMenuItem<String>(value: 'LAK', child: Text('LAK (₭)')),
                  const PopupMenuItem<String>(value: 'THB', child: Text('THB (฿)')),
                  const PopupMenuItem<String>(value: 'USD', child: Text('USD (\$)')),
                ],
                child: Row(
                  children: [
                    Text(
                      selectedCurrency,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                    const Icon(Icons.arrow_drop_down, color: Colors.white),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Colors.white),
                onPressed: () => setState(() => cartItems.clear()),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 52,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.03),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (value) => setState(() => searchQuery = value),
                      style: const TextStyle(fontWeight: FontWeight.w600),
                      decoration: InputDecoration(
                        hintText: 'ລະຫັດສິນຄ້າ',
                        hintStyle: TextStyle(
                          color: Colors.grey.shade400,
                          fontWeight: FontWeight.w500,
                        ),
                        prefixIcon: Icon(
                          Icons.search_rounded,
                          color: Colors.grey.shade400,
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          vertical: 14,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                GestureDetector(
                  onTap: () => setState(() => isGridView = !isGridView),
                  child: Container(
                    height: 52,
                    width: 52,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Icon(
                      isGridView
                          ? Icons.grid_view_rounded
                          : Icons.view_list_rounded,
                      color: darkSlate,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Exchange Rate & Sync Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: primaryGreen.withOpacity(0.05),
              border: Border(
                bottom: BorderSide(color: primaryGreen.withOpacity(0.1)),
                top: BorderSide(color: primaryGreen.withOpacity(0.1)),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.sync_outlined, size: 14, color: Colors.blue),
                const SizedBox(width: 4),
                const Text(
                  'SYNC: ONLINE',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.blue),
                ),
                const Spacer(),
                if (exchangeRates.containsKey('THB')) ...[
                  const Icon(Icons.currency_exchange, size: 14, color: Colors.orange),
                  const SizedBox(width: 4),
                  Text(
                    '1 ฿ = ${exchangeRates['THB']?.toStringAsFixed(0)} ₭',
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.orange),
                  ),
                  const SizedBox(width: 12),
                ],
                if (exchangeRates.containsKey('USD')) ...[
                  const Icon(Icons.attach_money, size: 14, color: Colors.blueGrey),
                  const SizedBox(width: 4),
                  Text(
                    '1 \$ = ${exchangeRates['USD']?.toStringAsFixed(0)} ₭',
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.blueGrey),
                  ),
                ],
              ],
            ),
          ),

          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: categories.map((cat) => 
                _buildCategoryChip(cat.name, selectedCategoryId == cat.id, cat.id)
              ).toList(),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : products.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.inventory_2_outlined,
                          size: 64,
                          color: Colors.grey.shade300,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No products found\nPlease sync with intelligence hub',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.grey.shade500,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  )
                : GridView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: isGridView ? 2 : 1,
                      childAspectRatio: isGridView ? 0.58 : 3.0,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: filteredProducts.length,
                    itemBuilder: (context, index) {
                      final product = filteredProducts[index];
                      final displayPrice = formatPrice(
                        _convertPrice(product.price),
                      );
                      return ProductCard(
                        product: product,
                        primaryGreen: primaryGreen,
                        selectedCurrency: selectedCurrency,
                        displayPrice: displayPrice,
                        isGridView: isGridView,
                        onAdd: (qty) => addToCart(product, qty),
                      );
                    },
                  ),
          ),
          if (cartItems.isNotEmpty)
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(30),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 20,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: GestureDetector(
                onTap: _showCartSheet,
                child: Container(
                  height: 64,
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [primaryGreen, const Color(0xFF059669)],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: primaryGreen.withOpacity(0.3),
                        blurRadius: 15,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.shopping_basket_rounded,
                            color: Colors.white,
                          ),
                          const SizedBox(width: 12),
                          Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${cartItems.length} ITEMS',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.8),
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 1,
                                ),
                              ),
                              const Text(
                                'ເບິ່ງລາຍການໃນກະຕ່າ',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 15,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Text(
                        '${formatPrice(_convertPrice(cartTotal))} ${selectedCurrency == 'LAK'
                            ? '₭'
                            : selectedCurrency == 'THB'
                            ? '฿'
                            : "\$"}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String label, bool isActive, String id) {
    return GestureDetector(
      onTap: () => setState(() => selectedCategoryId = id),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? darkSlate : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isActive ? darkSlate : Colors.grey.shade200),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: darkSlate.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? Colors.white : Colors.grey.shade600,
            fontWeight: FontWeight.w800,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class ProductCard extends StatefulWidget {
  final Product product;
  final Color primaryGreen;
  final String selectedCurrency;
  final String displayPrice;
  final Function(int) onAdd;
  final bool isGridView;

  const ProductCard({
    super.key,
    required this.product,
    required this.primaryGreen,
    required this.selectedCurrency,
    required this.displayPrice,
    required this.onAdd,
    this.isGridView = true,
  });

  @override
  State<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard> {
  int quantity = 1;

  String _getImageUrl(String? path) {
    if (path == null || path.trim().isEmpty) {
      return '${ApiConfig.baseUrl}/assets/images/default.png';
    }
    if (path.startsWith('http')) return path;
    
    String normalizedPath = path.trim();
    if (normalizedPath.startsWith('/')) {
      normalizedPath = normalizedPath.substring(1);
    }
    
    // Remove public/ if it's already there
    if (normalizedPath.startsWith('public/')) {
      normalizedPath = normalizedPath.substring(7);
    }
    
    if (!normalizedPath.startsWith('assets/') && 
        !normalizedPath.startsWith('uploads/')) {
       normalizedPath = 'assets/images/$normalizedPath';
    }
    
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return '${ApiConfig.baseUrl}/$normalizedPath?t=$timestamp';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade300),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          widget.onAdd(1);
        },
        borderRadius: BorderRadius.circular(24),
        child: widget.isGridView ? _buildVertical() : _buildHorizontal(),
      ),
    );
  }

  Widget _buildVertical() {
    return Column(
      children: [
        Expanded(
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Stack(
              children: [
                Center(
                  child: Image.network(
                    _getImageUrl(widget.product.imagePath),
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) => Image.network(
                      '${ApiConfig.baseUrl}/assets/images/default.png',
                      fit: BoxFit.contain,
                      errorBuilder: (context, e, s) => Icon(Icons.image_not_supported_rounded, color: Colors.grey.shade300, size: 40),
                    ),
                  ),
                ),
                if (widget.product.stock <= widget.product.min_stock_level)
                  Positioned(
                    top: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'LOW',
                        style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(5.0),
          child: Column(
            children: [
              Text(
                widget.product.name,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                'ຄັງເຫຼືອ: ${widget.product.stock} ${widget.product.unit}',
                style: TextStyle(
                  fontSize: 12,
                  color: widget.product.stock <= widget.product.min_stock_level ? Colors.red : const Color(0xFFF59E0B),
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${widget.displayPrice} ${widget.selectedCurrency == 'LAK' ? 'ກີບ' : 'ບາດ'}',
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _qtyButton(Icons.remove, Colors.redAccent, () {
                    if (quantity > 1) setState(() => quantity--);
                  }),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Text(
                      '$quantity',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  _qtyButton(Icons.add, const Color(0xFF76A258), () {
                    setState(() => quantity++);
                  }),
                  const SizedBox(width: 4),
                  GestureDetector(
                    onTap: () => widget.onAdd(quantity),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF76A258),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'ເພີ່ມ',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHorizontal() {
    return Row(
      children: [
        Container(
          width: 160,
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
          ),
          child: Stack(
            children: [
              Center(
                child: Image.network(
                  _getImageUrl(widget.product.imagePath),
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) => Image.network(
                    '${ApiConfig.baseUrl}/assets/images/default.png',
                    fit: BoxFit.contain,
                    errorBuilder: (context, e, s) => Icon(Icons.image_not_supported_rounded, color: Colors.grey.shade300, size: 40),
                  ),
                ),
              ),
              if (widget.product.stock <= widget.product.min_stock_level)
                Positioned(
                  top: 0,
                  left: 0,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'LOW STOCK',
                      style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.product.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'ຄັງເຫຼືອ: ${widget.product.stock} ${widget.product.unit}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFFF59E0B),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${widget.displayPrice} ${widget.selectedCurrency == 'LAK' ? 'ກີບ' : 'ບາດ'}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: Row(
            children: [
              _qtyButton(Icons.remove, Colors.redAccent, () {
                if (quantity > 1) setState(() => quantity--);
              }),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Text(
                  '$quantity',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
              _qtyButton(Icons.add, const Color(0xFF76A258), () {
                setState(() => quantity++);
              }),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () => widget.onAdd(quantity),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF76A258),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'ເພີ່ມ',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _qtyButton(IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: color.withOpacity(0.8),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Icon(icon, color: Colors.white, size: 20),
      ),
    );
  }
}
