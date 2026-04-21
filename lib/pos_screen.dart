import 'package:flutter/material.dart';
import 'package:ipos/payment_screen.dart';
import 'package:ipos/database_helper.dart';
import 'package:ipos/main_drawer.dart';

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
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        Row(
                          children: [
                            if (cartItems.isNotEmpty)
                              TextButton.icon(
                                onPressed: () {
                                  setState(() => cartItems.clear());
                                  setModalState(() {});
                                },
                                icon: const Icon(Icons.delete_sweep, color: Colors.red, size: 20),
                                label: const Text('ລ້າງກະຕ່າ', style: TextStyle(color: Colors.red)),
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
                            Icon(Icons.shopping_cart_outlined, size: 60, color: Colors.grey),
                            SizedBox(height: 10),
                            Text('ກະຕ່າວ່າງເປົ່າ', style: TextStyle(color: Colors.grey)),
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
                                child: Image.asset(item.product.imagePath, fit: BoxFit.contain),
                              ),
                              title: Text(item.product.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text(
                                '${item.product.price.toStringAsFixed(0)} x ${item.quantity} ${item.product.unit}',
                                style: TextStyle(color: Colors.grey.shade600),
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    formatPrice(_convertPrice(item.product.price * item.quantity)),
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                  ),
                                  const SizedBox(width: 8),
                                  IconButton(
                                    icon: const Icon(Icons.remove_circle_outline, color: Colors.red),
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
                          const Text('ລວມທັງໝົດ', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(width: 12),
                          Flexible(
                            child: Text(
                              '${formatPrice(_convertPrice(cartTotal))} ${selectedCurrency == 'LAK' ? 'ກີບ' : selectedCurrency == 'THB' ? 'ບາດ' : "\$"}',
                              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: primaryGreen),
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
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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
                        child: const Text('ຊຳລະເງິນ', style: TextStyle(color: Colors.white, fontSize: 18)),
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

  @override
  Widget build(BuildContext context) {
    final filteredProducts = products
        .where((p) => p.name.toLowerCase().contains(searchQuery.toLowerCase()))
        .toList();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.white,
      drawer: MainDrawer(primaryGreen: primaryGreen, onSyncComplete: _loadData),
      appBar: AppBar(
        backgroundColor: primaryGreen,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Colors.white),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: Column(
          children: [
            const Text(
              'Namkhong Beer',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
            ),
            Text(
              'Namkhong Vientiane',
              style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 14),
            ),
          ],
        ),
        centerTitle: true,
        actions: [
          PopupMenuButton<String>(
            onSelected: (String value) => setState(() => selectedCurrency = value),
            itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
              const PopupMenuItem<String>(value: 'LAK', child: Text('LAK (Lao Kip)')),
              const PopupMenuItem<String>(value: 'THB', child: Text('THB (Thai Baht)')),
              const PopupMenuItem<String>(value: 'USD', child: Text('USD (US Dollar)')),
            ],
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4.0),
              child: Row(
                children: [
                  Text(selectedCurrency, style: const TextStyle(color: Colors.white, fontSize: 16)),
                  const Icon(Icons.arrow_drop_down, color: Colors.white),
                ],
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: Colors.white),
            onPressed: () => setState(() => cartItems.clear()),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (value) => setState(() => searchQuery = value),
                      decoration: const InputDecoration(
                        hintText: 'ລະຫັດສິນຄ້າ',
                        contentPadding: EdgeInsets.symmetric(horizontal: 12),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Material(
                  color: primaryGreen,
                  borderRadius: BorderRadius.circular(4),
                  child: InkWell(
                    onTap: () => setState(() => isGridView = !isGridView),
                    child: Container(
                      height: 50,
                      width: 50,
                      alignment: Alignment.center,
                      child: Icon(isGridView ? Icons.view_list : Icons.grid_view, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Material(
                color: primaryGreen,
                borderRadius: BorderRadius.circular(4),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: const Text(
                    'ທົ່ວໄປ',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : products.isEmpty
                    ? const Center(child: Text('ບໍ່ມີຂໍ້ມູນສິນຄ້າ\nກະລຸນາຊິງຂໍ້ມູນຈາກ Backend', textAlign: TextAlign.center))
                    : GridView.builder(
                        padding: const EdgeInsets.all(8),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: isGridView ? 2 : 1,
                          childAspectRatio: isGridView ? 0.70 : 2.2,
                          crossAxisSpacing: 8,
                          mainAxisSpacing: 8,
                        ),
                        itemCount: filteredProducts.length,
                        itemBuilder: (context, index) {
                          final product = filteredProducts[index];
                          final displayPrice = formatPrice(_convertPrice(product.price));
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
          InkWell(
            onTap: _showCartSheet,
            child: Container(
              color: primaryGreen,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('ກະຕ່າສິນຄ້າ', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      '${formatPrice(_convertPrice(cartTotal))} ${selectedCurrency == 'LAK' ? 'ກີບ' : selectedCurrency == 'THB' ? 'ບາດ' : "\$"}',
                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.right,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
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
    if (widget.isGridView) {
      return Card(
        color: Colors.white,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: Colors.grey.shade200),
        ),
        child: _buildOldVertical(),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: InkWell(
        onTap: () => setState(() => quantity++),
        borderRadius: BorderRadius.circular(20),
        child: _buildPremiumHorizontal(),
      ),
    );
  }

  Widget _buildOldVertical() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          flex: 4,
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Center(child: Image.asset(widget.product.imagePath, fit: BoxFit.contain)),
          ),
        ),
        Text(widget.product.name, style: const TextStyle(fontWeight: FontWeight.bold), maxLines: 1),
        Text(
          'ຄົງເຫຼືອ: ${widget.product.stock} ${widget.product.unit}',
          style: TextStyle(fontSize: 11, color: Colors.orange.shade800, fontWeight: FontWeight.w600),
        ),
        Text(
          '${widget.displayPrice} ${widget.selectedCurrency == 'LAK' ? 'ກີບ' : widget.selectedCurrency == 'THB' ? 'ບາດ' : '\$'}',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        const SizedBox(height: 8),
        _buildSimpleControls(),
      ],
    );
  }

  Widget _buildSimpleControls() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 2.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _circularButton(Icons.remove, Colors.red.shade400, Colors.white, () {
            if (quantity > 1) setState(() => quantity--);
          }),
          Expanded(child: Center(child: Text('$quantity', style: const TextStyle(fontWeight: FontWeight.bold)))),
          _circularButton(Icons.add, widget.primaryGreen, Colors.white, () => setState(() => quantity++)),
          const SizedBox(width: 4),
          ElevatedButton(
            onPressed: () {
              widget.onAdd(quantity);
              setState(() => quantity = 1);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: widget.primaryGreen,
              padding: const EdgeInsets.symmetric(horizontal: 6),
              minimumSize: const Size(36, 32),
            ),
            child: const Text('ເພີ່ມ', style: TextStyle(color: Colors.white, fontSize: 11)),
          ),
        ],
      ),
    );
  }

  Widget _buildPremiumHorizontal() {
    return Row(
      children: [
        Container(
          width: 120,
          height: double.infinity,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.horizontal(left: Radius.circular(20)),
          ),
          child: Padding(padding: const EdgeInsets.all(12.0), child: Image.asset(widget.product.imagePath, fit: BoxFit.contain)),
        ),
        Expanded(child: Padding(padding: const EdgeInsets.all(12.0), child: _buildInfoContent())),
      ],
    );
  }

  Widget _buildInfoContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.product.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
            Text(
              'ຄົງເຫຼືອ: ${widget.product.stock} ${widget.product.unit}',
              style: TextStyle(fontSize: 12, color: Colors.orange.shade800, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(child: Text(widget.displayPrice, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: widget.primaryGreen), overflow: TextOverflow.ellipsis)),
            Text(widget.selectedCurrency == 'LAK' ? 'ກີບ' : widget.selectedCurrency == 'THB' ? 'ບາດ' : '\$', style: TextStyle(fontSize: 12, color: widget.primaryGreen, fontWeight: FontWeight.w700)),
          ],
        ),
        Container(
          padding: const EdgeInsets.all(2),
          decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(12)),
          child: Row(
            children: [
              _circularButton(Icons.remove, Colors.white, Colors.black54, () {
                if (quantity > 1) setState(() => quantity--);
              }),
              const SizedBox(width: 2),
              Expanded(child: Center(child: Text('$quantity', style: const TextStyle(fontWeight: FontWeight.w900)))),
              const SizedBox(width: 2),
              _circularButton(Icons.add, Colors.white, Colors.black54, () => setState(() => quantity++)),
              const SizedBox(width: 4),
              Material(
                color: widget.primaryGreen,
                borderRadius: BorderRadius.circular(10),
                child: InkWell(
                  onTap: () {
                    widget.onAdd(quantity);
                    setState(() => quantity = 1);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.add_shopping_cart, color: Colors.white, size: 16),
                        SizedBox(width: 4),
                        Text('ເພີ່ມ', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _circularButton(IconData icon, Color color, Color iconColor, VoidCallback onTap) {
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
}
