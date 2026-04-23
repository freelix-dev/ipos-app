import 'package:flutter/material.dart';
import 'package:ipos/payment_screen.dart';
import 'package:ipos/database_helper.dart';
import 'package:ipos/main_drawer.dart';
import 'package:ipos/api_config.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Product {
  final String id;
  final String name;
  final String imagePath;
  final double price;
  final int stock;
  final String unit;
  final int initialQuantity;

  Product({
    required this.id,
    required this.name,
    required this.imagePath,
    required this.price,
    required this.stock,
    required this.unit,
    this.initialQuantity = 1,
  });
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
  List<CartItem> cartItems = [];
  String searchQuery = '';
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
    final localRates = await DatabaseHelper().getExchangeRates();
    final prefs = await SharedPreferences.getInstance();
    final savedShopName = prefs.getString('shop_name') ?? 'Namkhong Beer';

    setState(() {
      products = localProducts
          .map(
            (p) => Product(
              id: p['id']?.toString() ?? '',
              name: p['name'],
              imagePath: p['imagePath'],
              price: (p['price'] as num).toDouble(),
              stock: int.tryParse(p['stock'].toString()) ?? 0,
              unit: p['unit'] ?? '',
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

  double get cartTotal => cartItems.fold(
    0,
    (sum, item) => sum + (item.product.price * item.quantity),
  );

  double _convertPrice(double priceInLak) {
    double rate = exchangeRates[selectedCurrency] ?? 1.0;
    if (selectedCurrency == 'LAK') return priceInLak;
    return priceInLak / rate;
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
                                  item.product.imagePath.startsWith('http') 
                                      ? item.product.imagePath 
                                      : '${ApiConfig.baseUrl}/${item.product.imagePath}',
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) => Icon(Icons.image_not_supported_rounded, color: Colors.grey.shade300, size: 24),
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

  final Color primaryGreen = const Color(0xFF10B981);
  final Color darkSlate = const Color(0xFF0F172A);

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
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: Builder(
          builder: (context) => IconButton(
            icon: Icon(Icons.menu_rounded, color: darkSlate),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: Text(
          shopName.toUpperCase(),
          style: TextStyle(
            color: darkSlate,
            fontWeight: FontWeight.w900,
            fontSize: 16,
            letterSpacing: 1.2,
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: PopupMenuButton<String>(
              onSelected: (String value) =>
                  setState(() => selectedCurrency = value),
              itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
                const PopupMenuItem<String>(
                  value: 'LAK',
                  child: Text('LAK (₭)'),
                ),
                const PopupMenuItem<String>(
                  value: 'THB',
                  child: Text('THB (฿)'),
                ),
                const PopupMenuItem<String>(
                  value: 'USD',
                  child: Text('USD (\$)'),
                ),
              ],
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12.0),
                child: Row(
                  children: [
                    Text(
                      selectedCurrency,
                      style: TextStyle(
                        color: darkSlate,
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                      ),
                    ),
                    Icon(
                      Icons.keyboard_arrow_down_rounded,
                      color: darkSlate,
                      size: 18,
                    ),
                  ],
                ),
              ),
            ),
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
                        hintText: 'Search intelligence...',
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
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildCategoryChip('All Products', true),
                _buildCategoryChip('Beverages', false),
                _buildCategoryChip('Snacks', false),
                _buildCategoryChip('Other', false),
              ],
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
                      childAspectRatio: isGridView ? 0.72 : 2.4,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
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
                                'View Terminal Cart',
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

  Widget _buildCategoryChip(String label, bool isActive) {
    return Container(
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

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 15,
            offset: const Offset(0, 8),
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
            padding: const EdgeInsets.all(16),
            child: Image.network(
              widget.product.imagePath.startsWith('http') 
                  ? widget.product.imagePath 
                  : '${ApiConfig.baseUrl}/${widget.product.imagePath}',
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) => Icon(Icons.image_not_supported_rounded, color: Colors.grey.shade300, size: 40),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.product.name,
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 14,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'STOCK: ${widget.product.stock}',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.grey.shade500,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Text(
                    widget.product.unit.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      color: widget.primaryGreen,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.displayPrice,
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 17,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: widget.primaryGreen.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.add_rounded,
                      color: widget.primaryGreen,
                      size: 20,
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
          width: 100,
          padding: const EdgeInsets.all(12),
          child: Image.network(
            widget.product.imagePath.startsWith('http') 
                ? widget.product.imagePath 
                : '${ApiConfig.baseUrl}/${widget.product.imagePath}',
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) => Icon(Icons.image_not_supported_rounded, color: Colors.grey.shade300, size: 30),
          ),
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.product.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                  ),
                  maxLines: 1,
                ),
                Text(
                  'AVAILABLE STOCK: ${widget.product.stock} ${widget.product.unit}',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey.shade500,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(right: 16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                widget.displayPrice,
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: widget.primaryGreen,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.add_rounded,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

Widget _circularButton(
  IconData icon,
  Color color,
  Color iconColor,
  VoidCallback onTap,
) {
  return Material(
    color: color,
    borderRadius: BorderRadius.circular(8),
    elevation: 1,
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: 28,
        height: 28,
        alignment: Alignment.center,
        child: Icon(icon, color: iconColor, size: 14),
      ),
    ),
  );
}
