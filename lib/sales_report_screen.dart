import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:ipos/database_helper.dart';
import 'package:ipos/api_config.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SalesReportScreen extends StatefulWidget {
  const SalesReportScreen({super.key});

  @override
  State<SalesReportScreen> createState() => _SalesReportScreenState();
}

class _SalesReportScreenState extends State<SalesReportScreen> {
  final Color primaryGreen = const Color(0xFF10B981);
  final Color darkSlate = const Color(0xFF0F172A);
  
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

      if (_selectedDateRange != null) {
        try {
          String orderDateStr = order['date'].toString().substring(0, 10);
          String startDateStr = _selectedDateRange!.start.toIso8601String().substring(0, 10);
          String endDateStr = _selectedDateRange!.end.toIso8601String().substring(0, 10);
          if (orderDateStr.compareTo(startDateStr) < 0 || orderDateStr.compareTo(endDateStr) > 0) continue;
        } catch (e) {}
      }
      
      double orderTotal = (order['total'] as num).toDouble();
      double orderChange = (order['changeAmount'] as num?)?.toDouble() ?? 0.0;
      String curr = order['currency'] ?? 'LAK';
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
    if (_unsyncedCount == 0) return;
    setState(() => _isSyncing = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('user_token') ?? '';
      final unsynced = await DatabaseHelper().getUnsyncedOrders();
      final url = Uri.parse(ApiConfig.ordersUrl);
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token'
        },
        body: json.encode(unsynced),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final ids = unsynced.map((o) => o['id'] as String).toList();
        await DatabaseHelper().markOrdersAsSynced(ids);
        await _loadReport();
      }
    } catch (e) {} finally {
      setState(() => _isSyncing = false);
    }
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
            colorScheme: ColorScheme.light(primary: primaryGreen, onPrimary: Colors.white, onSurface: darkSlate),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _selectedDateRange = picked);
      _loadReport();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'SALES ANALYTICS',
          style: TextStyle(
            color: darkSlate,
            fontWeight: FontWeight.w900,
            fontSize: 16,
            letterSpacing: 1.5,
          ),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: darkSlate, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(
              Icons.calendar_month_rounded,
              color: _selectedDateRange != null ? primaryGreen : Colors.grey,
            ),
            onPressed: _selectDateRange,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Quick Filters
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.only(bottom: 24),
                    child: Row(
                      children: [
                        _buildShortcutChip('TODAY', DateTime.now(), DateTime.now()),
                        _buildShortcutChip('YESTERDAY', DateTime.now().subtract(const Duration(days: 1)), DateTime.now().subtract(const Duration(days: 1))),
                        _buildShortcutChip('THIS MONTH', DateTime(DateTime.now().year, DateTime.now().month, 1), DateTime.now()),
                      ],
                    ),
                  ),
                  
                  if (_selectedDateRange != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 20),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: primaryGreen.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: primaryGreen.withOpacity(0.2)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.date_range_rounded, size: 16, color: primaryGreen),
                          const SizedBox(width: 8),
                          Text(
                            '${_selectedDateRange!.start.toString().substring(0, 10)} - ${_selectedDateRange!.end.toString().substring(0, 10)}',
                            style: TextStyle(fontSize: 13, color: primaryGreen, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedDateRange = null;
                                _loadReport();
                              });
                            },
                            child: Icon(Icons.close_rounded, size: 16, color: primaryGreen),
                          ),
                        ],
                      ),
                    ),

                  _buildSummaryCard(),
                  const SizedBox(height: 24),
                  _buildCloseSaleButton(),
                  
                  const SizedBox(height: 40),
                  _buildSectionHeader('PAYMENT DISTRIBUTION'),
                  const SizedBox(height: 16),
                  _buildMethodSection(),
                  
                  const SizedBox(height: 32),
                  _buildSectionHeader('CURRENCY METRICS'),
                  const SizedBox(height: 16),
                  _buildCurrencySection(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w900,
        color: darkSlate.withOpacity(0.4),
        letterSpacing: 1.5,
      ),
    );
  }

  Widget _buildSummaryCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [darkSlate, const Color(0xFF1E293B)],
        ),
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: darkSlate.withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            'AGGREGATED REVENUE (LAK)',
            style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1.2),
          ),
          const SizedBox(height: 12),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              '₭ ${formatPrice(_totalSalesLAK)}',
              style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900, letterSpacing: -1),
            ),
          ),
          const SizedBox(height: 30),
          Container(
            height: 1,
            width: double.infinity,
            color: Colors.white.withOpacity(0.1),
          ),
          const SizedBox(height: 30),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildMiniStat('TOTAL TRANSACTIONS', '${_totalOrders} Orders'),
              Container(width: 1, height: 40, color: Colors.white.withOpacity(0.1)),
              _buildMiniStat('CHANGE DISBURSED', '₭ ${formatPrice(_totalChangeAmountLAK)}'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStat(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
        ),
      ],
    );
  }

  Widget _buildCloseSaleButton() {
    return Container(
      width: double.infinity,
      height: 64,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: primaryGreen.withOpacity(0.2),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ElevatedButton.icon(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
        icon: _isSyncing 
          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
          : const Icon(Icons.auto_awesome_rounded),
        label: Text(
          _isSyncing ? 'SYNCHRONIZING...' : 'CLOSE SESSION & SYNC ($_unsyncedCount)',
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1),
        ),
        onPressed: _isSyncing ? null : _syncOrdersToBackend,
      ),
    );
  }

  Widget _buildMethodSection() {
    return Row(
      children: [
        Expanded(child: _buildInfoBox('CASH FLOW', _salesByMethod['cash']!, Icons.payments_rounded, Colors.amber)),
        const SizedBox(width: 16),
        Expanded(child: _buildInfoBox('BANK TRANSFER', _salesByMethod['bank']!, Icons.account_balance_rounded, Colors.blueAccent)),
      ],
    );
  }

  Widget _buildInfoBox(String title, double amount, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: TextStyle(color: Colors.grey.shade400, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.5),
          ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              '₭ ${formatPrice(amount)}',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: darkSlate),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrencySection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Column(
        children: _ordersByCurrency.entries.map((entry) {
          return ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            leading: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: primaryGreen.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                entry.key[0], 
                style: TextStyle(color: primaryGreen, fontWeight: FontWeight.w900, fontSize: 16)
              ),
            ),
            title: Text(
              entry.key, 
              style: TextStyle(fontWeight: FontWeight.w800, color: darkSlate)
            ),
            subtitle: Text(
              '${entry.value} COMPLETED ORDERS',
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.grey.shade400),
            ),
            trailing: Text(
              '${formatPrice(_amountsByCurrency[entry.key] ?? 0)} ${entry.key}',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: darkSlate),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildShortcutChip(String label, DateTime start, DateTime end) {
    bool isSelected = _selectedDateRange?.start.day == start.day && 
                     _selectedDateRange?.start.month == start.month &&
                     _selectedDateRange?.end.day == end.day;

    return Container(
      margin: const EdgeInsets.only(right: 12),
      child: ActionChip(
        label: Text(label),
        labelStyle: TextStyle(
          fontSize: 11, 
          fontWeight: FontWeight.w900, 
          color: isSelected ? Colors.white : darkSlate.withOpacity(0.6)
        ),
        backgroundColor: isSelected ? darkSlate : Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: BorderSide(color: isSelected ? darkSlate : Colors.grey.shade200),
        ),
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
