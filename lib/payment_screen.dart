import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:ipos/database_helper.dart';
import 'package:ipos/pos_screen.dart';
import 'package:uuid/uuid.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ipos/printer_service.dart';

class PaymentScreen extends StatefulWidget {
  final double totalAmount; // Base amount in LAK
  final String initialCurrency;
  final Map<String, double> exchangeRates;
  final List<dynamic> cartItems; // Simple list of items

  const PaymentScreen({
    super.key,
    required this.totalAmount,
    required this.initialCurrency,
    required this.exchangeRates,
    required this.cartItems,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final Color primaryGreen = const Color(0xFF76A258);
  String? selectedMethod;
  late String currentCurrency;
  final TextEditingController _cashController = TextEditingController();
  double _receivedAmount = 0;
  bool _isProcessing = false;
  bool _vatEnabled = false;
  double _taxRate = 0;
  double _vatAmount = 0;
  double _subtotalInLak = 0;

  @override
  void initState() {
    super.initState();
    currentCurrency = widget.initialCurrency;
    _subtotalInLak = widget.totalAmount;
    _loadVatSettings();
  }

  Future<void> _loadVatSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _vatEnabled = prefs.getBool('vat_enabled') ?? false;
      String taxRateStr = prefs.getString('system_tax_rate') ?? '0';
      _taxRate = double.tryParse(taxRateStr) ?? 0;
      
      if (_vatEnabled) {
        _vatAmount = (_subtotalInLak * _taxRate) / 100;
      } else {
        _vatAmount = 0;
      }
    });
  }

  String formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  double _convertPrice(double priceInLak) {
    Map<String, double> finalRates = {'LAK': 1.0};
    widget.exchangeRates.forEach((key, value) {
      finalRates[key] = value;
    });

    double rate = finalRates[currentCurrency] ?? 1.0;
    if (currentCurrency == 'LAK') return priceInLak;
    return priceInLak / rate;
  }

  double get _totalInLak => _subtotalInLak + _vatAmount;

  double get _convertedTotal => _convertPrice(_totalInLak);
  double get _convertedVat => _convertPrice(_vatAmount);
  double get _convertedSubtotal => _convertPrice(_subtotalInLak);

  @override
  void dispose() {
    _cashController.dispose();
    super.dispose();
  }

  double get _change => _receivedAmount > 0 ? _receivedAmount - _convertedTotal : 0;
  bool get _canConfirm => selectedMethod == 'bank' || (selectedMethod == 'cash' && _receivedAmount >= _convertedTotal);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: primaryGreen,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'ຊຳລະເງິນ',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Column(
                children: [
                  const Text(
                    'ຍອດຊຳລະທັງໝົດ',
                    style: TextStyle(fontSize: 18, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${formatPrice(_convertedTotal)} ${currentCurrency == 'LAK' ? 'ກີບ' : currentCurrency == 'THB' ? 'ບາດ' : '\$'}',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: primaryGreen,
                    ),
                  ),
                  if (_vatEnabled) ...[
                    const SizedBox(height: 8),
                    Text(
                      'ລວມກ່ອນພາສີ: ${formatPrice(_convertedSubtotal)} | VAT ($_taxRate%): ${formatPrice(_convertedVat)}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w600),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 30),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: widget.exchangeRates.keys.toList().map((curr) {
                bool isSel = currentCurrency == curr;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4.0),
                  child: ChoiceChip(
                    label: Text(curr),
                    selected: isSel,
                    selectedColor: primaryGreen,
                    labelStyle: TextStyle(color: isSel ? Colors.white : Colors.black),
                    onSelected: (selected) {
                      setState(() {
                        currentCurrency = curr;
                        _cashController.clear();
                        _receivedAmount = 0;
                      });
                    },
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            const Text(
              'ເລືອກຊ່ອງທາງການຊຳລະເງິນ',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildPaymentOption(
              icon: Icons.money,
              title: 'ຊຳລະດ້ວຍເງິນສົດ',
              subtitle: 'Cash Payment',
              value: 'cash',
            ),
            const SizedBox(height: 12),
            _buildPaymentOption(
              icon: Icons.account_balance,
              title: 'ໂອນຜ່ານທະນາຄານ',
              subtitle: 'Bank Transfer',
              value: 'bank',
            ),
            if (selectedMethod == 'cash') ...[
              const SizedBox(height: 24),
              const Text(
                'ຮັບເງິນຈາກລູກຄ້າ:',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _cashController,
                keyboardType: TextInputType.number,
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                decoration: InputDecoration(
                  hintText: '0',
                  suffixText: currentCurrency == 'LAK' ? 'ກີບ' : currentCurrency == 'THB' ? 'ບາດ' : '\$',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.attach_money),
                ),
                onChanged: (value) {
                  setState(() {
                    _receivedAmount = double.tryParse(value) ?? 0;
                  });
                },
              ),
              if (_receivedAmount > 0) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: _receivedAmount >= _convertedTotal ? Colors.green.shade50 : Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _receivedAmount >= _convertedTotal ? 'ເງິນທອນ:' : 'ຍັງເຫຼືອ:',
                        style: TextStyle(
                          fontSize: 18, 
                          fontWeight: FontWeight.bold,
                          color: _receivedAmount >= _convertedTotal ? Colors.green : Colors.red,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Flexible(
                        child: Text(
                          '${formatPrice((_receivedAmount - _convertedTotal).abs())} ${currentCurrency == 'LAK' ? 'ກີບ' : currentCurrency == 'THB' ? 'ບາດ' : '\$'}',
                          style: TextStyle(
                            fontSize: 22, 
                            fontWeight: FontWeight.bold,
                            color: _receivedAmount >= _convertedTotal ? Colors.green : Colors.red,
                          ),
                          textAlign: TextAlign.right,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: selectedMethod == null ? Colors.grey : primaryGreen,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                    onPressed: (!_canConfirm || _isProcessing)
                    ? null
                    : () async {
                        setState(() => _isProcessing = true);
                        try {
                        // Get User Info
                        final prefs = await SharedPreferences.getInstance();
                        final userId = prefs.getString('user_id');
                        final userName = prefs.getString('user_name');

                        // Save to Database
                        final order = {
                          'id': const Uuid().v4(),
                          'date': DateTime.now().toIso8601String(),
                          'total': _convertedTotal, // เก็บยอดตามสกุลเงินที่เลือก (Converted Amount)
                          'status': 'Completed',
                          'currency': currentCurrency,
                          'paymentMethod': selectedMethod,
                          'itemsJson': json.encode(widget.cartItems.map((item) => {
                            'id': item.product.id,
                            'name': item.product.name,
                            'quantity': item.quantity,
                            'price': _convertPrice(item.product.price), // บันทึกราคาที่แปลงแล้วลง JSON
                          }).toList()),
                          'amountReceived': selectedMethod == 'cash' ? _receivedAmount : 0,
                          'changeAmount': selectedMethod == 'cash' ? _change : 0,
                          'userId': userId,
                          'userName': userName,
                          'vat_amount': _convertedVat,
                          'vat_rate': _taxRate,
                        };
                        await DatabaseHelper().insertOrder(order);

                        // Deduct Stock
                        try {
                          print('Checkout: Deducting stock for ${widget.cartItems.length} items');
                          for (var item in widget.cartItems) {
                            print(' - Deducting ${item.quantity} from ${item.product.name} (ID: ${item.product.id})');
                            await DatabaseHelper().updateProductStock(item.product.id, item.quantity);
                          }
                        } catch (e) {
                          print('ERROR DURING STOCK DEDUCTION: $e');
                        }
                        
                        _showSuccessDialog(order);
                        } catch (e) {
                          print('Error during checkout: $e');
                        } finally {
                          if (mounted) setState(() => _isProcessing = false);
                        }
                      },
                child: const Text(
                  'ຢືນຢັນການຊຳລະເງິນ',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required String value,
  }) {
    bool isSelected = selectedMethod == value;
    return InkWell(
      onTap: () {
        setState(() {
          selectedMethod = value;
        });
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? primaryGreen : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
          color: isSelected ? primaryGreen.withOpacity(0.05) : Colors.white,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected ? primaryGreen : Colors.grey.shade100,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: isSelected ? Colors.white : Colors.grey,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? primaryGreen : Colors.black87,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(Icons.check_circle, color: primaryGreen, size: 28),
          ],
        ),
      ),
    );
  }

  void _showSuccessDialog(Map<String, dynamic> order) async {
    final prefs = await SharedPreferences.getInstance();
    bool autoPrint = prefs.getBool('auto_print') ?? true;
    
    if (autoPrint) {
      PrinterService.printReceipt(order);
    }

    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 80),
            const SizedBox(height: 16),
            const Text(
              'ຊຳລະເງິນສຳເລັດ!',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'ລະບົບໄດ້ບັນທຶກຂໍ້ມູນຮຽບຮ້ອຍແລ້ວ',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () => PrinterService.printReceipt(order),
                    icon: const Icon(Icons.print),
                    label: const Text('ພິມໃບບິນ'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryGreen,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () {
                      Navigator.pop(context); // Close dialog
                      Navigator.pop(context, true); // Back to POS with success flag
                    },
                    child: const Text('ຕົກລົງ', style: TextStyle(color: Colors.white)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
