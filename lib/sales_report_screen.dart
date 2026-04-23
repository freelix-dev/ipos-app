import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:ipos/database_helper.dart';
import 'package:ipos/api_config.dart';

class SalesReportScreen extends StatefulWidget {
  const SalesReportScreen({super.key});

  @override
  State<SalesReportScreen> createState() => _SalesReportScreenState();
}

class _SalesReportScreenState extends State<SalesReportScreen> {
  final Color primaryGreen = const Color(0xFF76A258);
  bool _isLoading = true;
  bool _isSyncing = false;
  double _totalSalesLAK = 0;
  double _totalChangeAmountLAK = 0;
  int _totalOrders = 0;
  int _unsyncedCount = 0;
  Map<String, double> _salesByMethod = {'cash': 0, 'bank': 0};
  Map<String, int> _ordersByCurrency = {};
  Map<String, double> _amountsByCurrency = {};
  Map<String, double> _exchangeRates = {'LAK': 1.0, 'THB': 1.0, 'USD': 1.0};
  DateTimeRange? _selectedDateRange;

  String formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }



  @override
  void initState() {
    super.initState();
    _loadReport();
  }

  Future<void> _loadReport() async {
    setState(() => _isLoading = true);
    final orders = await DatabaseHelper().getOrders();
    final unsyncedOrders = await DatabaseHelper().getUnsyncedOrders();
    final rates = await DatabaseHelper().getExchangeRates();
    
    double totalLAK = 0;
    double totalChangeLAK = 0;
    Map<String, double> byMethodLAK = {'cash': 0, 'bank': 0};
    Map<String, int> ordersByCurr = {};
    Map<String, double> amountsByCurr = {};
    Map<String, double> currentRates = rates.isNotEmpty ? rates : _exchangeRates;

    for (var order in orders) {
      if (order['status'] == 'Cancelled') continue;

      // Date Range Filter
      if (_selectedDateRange != null) {
        try {
          String orderDateStr = order['date'].toString().substring(0, 10);
          String startDateStr = _selectedDateRange!.start.toIso8601String().substring(0, 10);
          String endDateStr = _selectedDateRange!.end.toIso8601String().substring(0, 10);
          
          if (orderDateStr.compareTo(startDateStr) < 0 || orderDateStr.compareTo(endDateStr) > 0) {
            continue;
          }
        } catch (e) {
          // If date parsing fails, keep the order
        }
      }
      
      double orderTotal = (order['total'] as num).toDouble();
      double orderChange = (order['changeAmount'] as num?)?.toDouble() ?? 0.0;
      String curr = order['currency'] ?? 'LAK';
      
      // Convert to LAK for reporting
      double rate = currentRates[curr] ?? 1.0;
      double orderTotalLAK = (curr == 'LAK') ? orderTotal : (orderTotal * rate);
      double orderChangeLAK = (curr == 'LAK') ? orderChange : (orderChange * rate);
      
      totalLAK += orderTotalLAK;
      totalChangeLAK += orderChangeLAK;
      
      String method = order['paymentMethod'] ?? 'cash';
      byMethodLAK[method] = (byMethodLAK[method] ?? 0) + orderTotalLAK;

      ordersByCurr[curr] = (ordersByCurr[curr] ?? 0) + 1;
      amountsByCurr[curr] = (amountsByCurr[curr] ?? 0) + orderTotal;
    }

    setState(() {
      _totalSalesLAK = totalLAK;
      _totalChangeAmountLAK = totalChangeLAK;
      _exchangeRates = currentRates;
      _totalOrders = orders.where((o) {
        if (o['status'] == 'Cancelled') return false;
        if (_selectedDateRange != null) {
          try {
            String orderDateStr = o['date'].toString().substring(0, 10);
            String startDateStr = _selectedDateRange!.start.toIso8601String().substring(0, 10);
            String endDateStr = _selectedDateRange!.end.toIso8601String().substring(0, 10);
            return orderDateStr.compareTo(startDateStr) >= 0 && orderDateStr.compareTo(endDateStr) <= 0;
          } catch (e) { return true; }
        }
        return true;
      }).length;
      _unsyncedCount = unsyncedOrders.length;
      _salesByMethod = byMethodLAK;
      _ordersByCurrency = ordersByCurr;
      _amountsByCurrency = amountsByCurr;
      _isLoading = false;
    });
  }

  Future<void> _syncOrdersToBackend() async {
    if (_unsyncedCount == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ບໍ່ມີຂໍ້ມູນໃໝ່ທີ່ຕ້ອງຊິງ')),
      );
      return;
    }

    setState(() => _isSyncing = true);

    try {
      final unsynced = await DatabaseHelper().getUnsyncedOrders();
      final url = Uri.parse(ApiConfig.ordersUrl);
      
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode(unsynced),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        // Mark as synced locally
        final ids = unsynced.map((o) => o['id'] as String).toList();
        await DatabaseHelper().markOrdersAsSynced(ids);
        
        
        await _loadReport(); // Refresh counts
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('ຊິງຂໍ້ມູນສຳເລັດ! ສົ່ງແລ້ວ ${ids.length} ລາຍການ')),
        );
      } else {
        throw Exception('Server Error: ${response.statusCode}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('ເກີດຂໍ້ຜິດພາດໃນການຊິງ: $e')),
      );
    } finally {
      setState(() => _isSyncing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: primaryGreen,
        title: const Text('ລາຍງານຍອດຂາຍ', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(
              Icons.calendar_today,
              color: _selectedDateRange != null ? Colors.amber : Colors.white,
            ),
            onPressed: _selectDateRange,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 50,
                    margin: const EdgeInsets.only(bottom: 16),
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        _buildShortcutChip('ມື້ນີ້', DateTime.now(), DateTime.now()),
                        _buildShortcutChip('ມື້ວານ', DateTime.now().subtract(const Duration(days: 1)), DateTime.now().subtract(const Duration(days: 1))),
                        _buildShortcutChip('ເດືອນນີ້', DateTime(DateTime.now().year, DateTime.now().month, 1), DateTime.now()),
                      ],
                    ),
                  ),
                  if (_selectedDateRange != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Chip(
                        avatar: const Icon(Icons.date_range, size: 16, color: Colors.blue),
                        label: Text(
                          '${_selectedDateRange!.start.toString().substring(0, 10)} - ${_selectedDateRange!.end.toString().substring(0, 10)}',
                          style: const TextStyle(fontSize: 12),
                        ),
                        onDeleted: () {
                          setState(() {
                            _selectedDateRange = null;
                            _loadReport();
                          });
                        },
                        deleteIconColor: Colors.red,
                        backgroundColor: Colors.blue.withOpacity(0.05),
                      ),
                    ),
                  _buildSummaryCard(),
                  const SizedBox(height: 20),
                  _buildCloseSaleButton(),
                  const SizedBox(height: 24),
                  const Text('ແຍກຕາມຊ່ອງທາງຊຳລະເງິນ', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  _buildMethodSection(),
                  const SizedBox(height: 24),
                  const Text('ແຍກຕາມສະກຸນເງິນທີ່ຊຳລະ', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  _buildCurrencySection(),
                ],
              ),
            ),
    );
  }

  Widget _buildSummaryCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: primaryGreen,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: primaryGreen.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 5)),
        ],
      ),
      child: Column(
        children: [
          const Text('ຍອດລວມທັງໝົດ (LAK)', style: TextStyle(color: Colors.white70, fontSize: 16)),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              '${formatPrice(_totalSalesLAK)} ກີບ',
              style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 16),
          const Divider(color: Colors.white24),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('ຍອດເງີນທອນທັງໝົດ:', style: TextStyle(color: Colors.white70, fontSize: 13)),
              const SizedBox(width: 8),
              Flexible(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    '${formatPrice(_totalChangeAmountLAK)} ກີບ',
                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildMiniStat('ອໍເດີທັງໝົດ', '$_totalOrders ລາຍການ'),
              _buildMiniStat('ສະເລ່ຍຕໍ່ອໍເດີ', '${formatPrice(_totalOrders > 0 ? _totalSalesLAK / _totalOrders : 0)} ກີບ'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStat(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 13)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildCloseSaleButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: primaryGreen,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
            side: BorderSide(color: primaryGreen, width: 2),
          ),
          elevation: 0,
        ),
        icon: _isSyncing 
          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
          : const Icon(Icons.cloud_upload),
        label: Text(
          _isSyncing ? 'ກຳລັງສົ່ງຂໍ້ມູນ...' : 'ປິດຍອດ ແລະ ຊິງຂໍ້ມູນ ($_unsyncedCount)',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        onPressed: _isSyncing ? null : _syncOrdersToBackend,
      ),
    );
  }

  Widget _buildMethodSection() {
    return Row(
      children: [
        Expanded(child: _buildInfoBox('ເງິນສົດ', _salesByMethod['cash']!, Icons.money, Colors.orange)),
        const SizedBox(width: 12),
        Expanded(child: _buildInfoBox('ໂອນເງິນ', _salesByMethod['bank']!, Icons.account_balance, Colors.blue)),
      ],
    );
  }

  Widget _buildInfoBox(String title, double amount, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color),
          const SizedBox(height: 12),
          Text(title, style: const TextStyle(color: Colors.grey)),
          const SizedBox(height: 8),
          Text(
            '${formatPrice(amount)} ກີບ',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrencySection() {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: _ordersByCurrency.entries.map((entry) {
          return ListTile(
            leading: CircleAvatar(
              backgroundColor: primaryGreen.withOpacity(0.1),
              child: Text(entry.key[0], style: TextStyle(color: primaryGreen, fontWeight: FontWeight.bold)),
            ),
            title: Text(entry.key),
            subtitle: Text('${entry.value} ອໍເດີ'),
            trailing: Text(
              '${formatPrice(_amountsByCurrency[entry.key] ?? 0)} ${entry.key}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          );
        }).toList(),
      ),
    );
  }

  Future<void> _selectDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      initialDateRange: _selectedDateRange,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: primaryGreen,
              onPrimary: Colors.white,
              onSurface: Colors.black87,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _selectedDateRange = picked;
      });
      _loadReport();
    }
  }

  Widget _buildShortcutChip(String label, DateTime start, DateTime end) {
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: ActionChip(
        label: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        side: BorderSide(color: Colors.grey.shade300),
        onPressed: () {
          setState(() {
            _selectedDateRange = DateTimeRange(start: start, end: end);
          });
          _loadReport();
        },
      ),
    );
  }
}
