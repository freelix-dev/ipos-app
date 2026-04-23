import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:ipos/database_helper.dart';
import 'package:ipos/api_config.dart';
import 'package:ipos/printer_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ViewOrdersScreen extends StatefulWidget {
  const ViewOrdersScreen({super.key});

  @override
  State<ViewOrdersScreen> createState() => _ViewOrdersScreenState();
}

class _ViewOrdersScreenState extends State<ViewOrdersScreen> {
  final Color primaryGreen = const Color(0xFF10B981);
  final Color darkSlate = const Color(0xFF0F172A);
  
  String selectedFilter = 'ທັງໝົດ';
  List<Map<String, dynamic>> orders = [];
  bool isLoading = true;
  bool isSyncing = false;
  DateTimeRange? selectedDateRange;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() => isLoading = true);
    final dbOrders = await DatabaseHelper().getOrders();
    setState(() {
      orders = dbOrders;
      isLoading = false;
    });
  }

  void _printAllVisibleOrders() async {
    final filteredOrders = _getFilteredOrders();
    if (filteredOrders.isEmpty) return;
    
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('ຢືນຢັນການພິມ'),
        content: Text('ທ່ານຕ້ອງການພິມບິນທັງໝົດ ${filteredOrders.length} ບິນ ຫຼື ບໍ່?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('ຍົກເລີກ'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('ຕົກລົງ'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('ກຳລັງພິມ ${filteredOrders.length} ບິນ...')),
      );
      for (var order in filteredOrders) {
        if (order['status'] != 'Cancelled') {
          await PrinterService.printReceipt(order);
          await Future.delayed(const Duration(milliseconds: 500));
        }
      }
    }
  }

  Future<void> _confirmCancelOrder(BuildContext context, String orderId) async {
    final TextEditingController remarkController = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('ຢືນຢັນການຍົກເລີກ', style: TextStyle(fontWeight: FontWeight.w900)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('ທ່ານແນ່ໃຈຫຼືບໍ່ວ່າຕ້ອງການຍົກເລີກລາຍການນີ້? ສະຕັອກສິນຄ້າຈະຖືກຄືນເຂົ້າລະບົບ.'),
            const SizedBox(height: 20),
            TextField(
              controller: remarkController,
              decoration: InputDecoration(
                hintText: 'ເຫດຜົນການຍົກເລີກ...',
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('ຍົກເລີກ')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
            child: const Text('ຢືນຢັນ'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await DatabaseHelper().cancelOrder(orderId, remark: remarkController.text.trim().isEmpty ? null : remarkController.text.trim());
      _loadOrders();
    }
  }

  Future<void> _syncOrders() async {
    final unsynced = await DatabaseHelper().getUnsyncedOrders();
    setState(() => isSyncing = true);

    try {
      if (unsynced.isNotEmpty) {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('user_token') ?? '';
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
        }
      }
      await _loadOrders();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('ຊິງຂໍ້ມູນສຳເລັດແລ້ວ!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('ເກີດຂໍ້ຜິດພາດໃນການຊິງ: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => isSyncing = false);
    }
  }

  List<Map<String, dynamic>> _getFilteredOrders() {
    return orders.where((o) {
      String statusLabel = o['status'] == 'Completed'
          ? 'ຊຳລະເງິນແລ້ວ'
          : (o['status'] == 'Cancelled' ? 'ຍົກເລີກແລ້ວ' : o['status']);
      bool matchesStatus = selectedFilter == 'ທັງໝົດ' || statusLabel == selectedFilter;

      bool matchesDate = true;
      if (selectedDateRange != null) {
        try {
          String orderDateStr = o['date'].toString().substring(0, 10);
          String startDateStr = selectedDateRange!.start.toIso8601String().substring(0, 10);
          String endDateStr = selectedDateRange!.end.toIso8601String().substring(0, 10);
          matchesDate = orderDateStr.compareTo(startDateStr) >= 0 && 
                        orderDateStr.compareTo(endDateStr) <= 0;
        } catch (e) {
          matchesDate = true;
        }
      }
      return matchesStatus && matchesDate;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final filteredOrders = _getFilteredOrders();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'ປະຫວັດການຂາຍ',
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
              Icons.filter_list_rounded,
              color: selectedDateRange != null ? primaryGreen : Colors.grey,
            ),
            onPressed: _selectDateRange,
          ),
          IconButton(
            icon: Icon(Icons.print_rounded, color: darkSlate),
            onPressed: _printAllVisibleOrders,
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Quick Date Filters
                Container(
                  height: 60,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      _buildShortcutChip('TODAY', DateTime.now(), DateTime.now()),
                      _buildShortcutChip('YESTERDAY', DateTime.now().subtract(const Duration(days: 1)), DateTime.now().subtract(const Duration(days: 1))),
                      _buildShortcutChip('THIS MONTH', DateTime(DateTime.now().year, DateTime.now().month, 1), DateTime.now()),
                    ],
                  ),
                ),

                // Status Filters
                Container(
                  height: 60,
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      _buildFilterChip('ທັງໝົດ'),
                      _buildFilterChip('ຊຳລະເງິນແລ້ວ'),
                      _buildFilterChip('ຍົກເລີກແລ້ວ'),
                    ],
                  ),
                ),

                if (selectedDateRange != null)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: primaryGreen.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.date_range_rounded, size: 14, color: primaryGreen),
                              const SizedBox(width: 6),
                              Text(
                                '${selectedDateRange!.start.toString().substring(0, 10)} - ${selectedDateRange!.end.toString().substring(0, 10)}',
                                style: TextStyle(fontSize: 11, color: primaryGreen, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(width: 6),
                              GestureDetector(
                                onTap: () => setState(() => selectedDateRange = null),
                                child: Icon(Icons.close_rounded, size: 14, color: primaryGreen),
                              ),
                            ],
                          ),
                        ),
                        const Spacer(),
                        Text(
                          '${filteredOrders.length} RESULTS',
                          style: TextStyle(color: Colors.grey.shade400, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
                        ),
                      ],
                    ),
                  ),

                Expanded(
                  child: filteredOrders.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.receipt_long_outlined, size: 64, color: Colors.grey.shade200),
                              const SizedBox(height: 16),
                              Text('No transactions recorded', style: TextStyle(color: Colors.grey.shade400, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: filteredOrders.length,
                          itemBuilder: (context, index) => OrderCard(
                            order: filteredOrders[index],
                            primaryGreen: primaryGreen,
                            darkSlate: darkSlate,
                            onCancel: _loadOrders,
                          ),
                        ),
                ),
              ],
            ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -5)),
          ],
        ),
        child: Container(
          height: 60,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: primaryGreen.withOpacity(0.2),
                blurRadius: 15,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ElevatedButton(
            onPressed: isSyncing ? null : _syncOrders,
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryGreen,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
            ),
            child: isSyncing 
                ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
                : const Text(
                    'FINALIZE & SYNC SESSIONS',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1),
                  ),
          ),
        ),
      ),
    );
  }

  Future<void> _selectDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      initialDateRange: selectedDateRange,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: primaryGreen,
              onPrimary: Colors.white,
              onSurface: darkSlate,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        selectedDateRange = picked;
      });
    }
  }

  Widget _buildFilterChip(String label) {
    final isSelected = selectedFilter == label;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (val) {
          setState(() {
            selectedFilter = label;
          });
        },
        backgroundColor: Colors.white,
        selectedColor: darkSlate,
        checkmarkColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: isSelected ? darkSlate : Colors.grey.shade200),
        ),
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : Colors.grey.shade600,
          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
          fontSize: 13,
        ),
      ),
    );
  }

  Widget _buildShortcutChip(String label, DateTime start, DateTime end) {
    bool isSelected = selectedDateRange?.start.day == start.day && 
                     selectedDateRange?.start.month == start.month &&
                     selectedDateRange?.end.day == end.day;

    return Padding(
      padding: const EdgeInsets.only(right: 12.0),
      child: ActionChip(
        label: Text(label),
        labelStyle: TextStyle(
          fontSize: 11, 
          fontWeight: FontWeight.w900, 
          color: isSelected ? Colors.white : Colors.grey.shade600
        ),
        backgroundColor: isSelected ? darkSlate : Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: isSelected ? darkSlate : Colors.grey.shade200),
        ),
        onPressed: () {
          setState(() {
            selectedDateRange = DateTimeRange(start: start, end: end);
          });
        },
      ),
    );
  }
}

class OrderCard extends StatelessWidget {
  final Map<String, dynamic> order;
  final Color primaryGreen;
  final Color darkSlate;
  final VoidCallback onCancel;

  const OrderCard({
    super.key,
    required this.order,
    required this.primaryGreen,
    required this.darkSlate,
    required this.onCancel,
  });

  String formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'TX-${(order['id'] ?? '').toString().substring(0, 8).toUpperCase()}',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                          color: darkSlate,
                        ),
                      ),
                      Text(
                        order['date'].toString().substring(0, 16).replaceAll('T', ' '),
                        style: TextStyle(color: Colors.grey.shade400, fontSize: 10, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
                _buildStatusBadge(
                  order['status'] ?? '',
                  order['synced'] == 1,
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            // Items Preview
            if (order['itemsJson'] != null)
              Builder(
                builder: (context) {
                  try {
                    final List<dynamic> items = json.decode(order['itemsJson'] as String);
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: items.map((item) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              Text(
                                '${item['quantity']}x',
                                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: primaryGreen),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  '${item['name']}',
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: darkSlate),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Text(
                                formatPrice(((item['quantity'] ?? 0) * (item['price'] ?? 0)).toDouble()),
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: darkSlate),
                              ),
                            ],
                          ),
                        )).toList(),
                      ),
                    );
                  } catch (e) { return const SizedBox.shrink(); }
                },
              ),
            
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      order['paymentMethod'] == 'bank' ? Icons.account_balance_rounded : Icons.payments_rounded,
                      size: 16,
                      color: Colors.grey.shade400,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      order['paymentMethod'] == 'bank' ? 'TRANSFER' : 'CASH',
                      style: TextStyle(color: Colors.grey.shade400, fontSize: 11, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'TOTAL REVENUE',
                      style: TextStyle(color: Colors.grey.shade400, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1),
                    ),
                    Text(
                      '${formatPrice((order['total'] as num? ?? 0).toDouble())} ${order['currency'] ?? 'LAK'}',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 22,
                        color: darkSlate,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            
            if (order['status'] != 'Cancelled')
              Padding(
                padding: const EdgeInsets.only(top: 16.0),
                child: Row(
                  children: [
                    const Spacer(),
                    TextButton.icon(
                      onPressed: () => _showCancelDialog(context, order['id']),
                      icon: const Icon(Icons.cancel_rounded, color: Colors.redAccent, size: 16),
                      label: const Text(
                        'ຍົກເລີກ',
                        style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.w900),
                      ),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        backgroundColor: Colors.redAccent.withOpacity(0.05),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _showCancelDialog(BuildContext context, String orderId) async {
    final TextEditingController remarkController = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('ຢືນຢັນການຍົກເລີກ', style: TextStyle(fontWeight: FontWeight.w900)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('ທ່ານແນ່ໃຈຫຼືບໍ່ວ່າຕ້ອງການຍົກເລີກລາຍການນີ້? ສະຕັອກສິນຄ້າຈະຖືກຄືນເຂົ້າລະບົບ.'),
            const SizedBox(height: 20),
            TextField(
              controller: remarkController,
              decoration: InputDecoration(
                hintText: 'ເຫດຜົນການຍົກເລີກ...',
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('ຍົກເລີກ')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
            child: const Text('ຢືນຢັນ'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final success = await DatabaseHelper().cancelOrder(
        orderId, 
        remark: remarkController.text.trim().isEmpty ? null : remarkController.text.trim()
      );
      if (success) {
        onCancel();
      }
    }
  }

  Widget _buildStatusBadge(String status, bool isSynced) {
    Color color = status == 'Completed'
        ? primaryGreen
        : (status == 'Cancelled' ? Colors.redAccent : Colors.orange);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(isSynced ? Icons.cloud_done_rounded : Icons.cloud_off_rounded, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            status.toUpperCase(),
            style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.5),
          ),
        ],
      ),
    );
  }
}
