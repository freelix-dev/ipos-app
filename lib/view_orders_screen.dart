import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:ipos/database_helper.dart';
import 'package:ipos/api_config.dart';

class ViewOrdersScreen extends StatefulWidget {
  const ViewOrdersScreen({super.key});

  @override
  State<ViewOrdersScreen> createState() => _ViewOrdersScreenState();
}

class _ViewOrdersScreenState extends State<ViewOrdersScreen> {
  final Color primaryGreen = const Color(0xFF76A258);
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

  Future<void> _syncOrders() async {
    final unsynced = await DatabaseHelper().getUnsyncedOrders();
    setState(() => isSyncing = true);

    try {
      // 1. Upload unsynced orders if any
      if (unsynced.isNotEmpty) {
        final url = Uri.parse(ApiConfig.ordersUrl);
        final response = await http
            .post(
              url,
              headers: {'Content-Type': 'application/json'},
              body: json.encode(unsynced),
            )
            .timeout(const Duration(seconds: 30));

        if (response.statusCode == 200 || response.statusCode == 201) {
          final data = json.decode(response.body);
          final ids = unsynced.map((o) => o['id'] as String).toList();
          await DatabaseHelper().markOrdersAsSynced(ids);
          
        }
      }

      
      await _loadOrders();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(unsynced.isEmpty 
              ? 'ອັບເດດຂໍ້ມູນຈາກເຊີເວີສຳເລັດ!' 
              : 'ຊິງຂໍ້ມູນສຳເລັດ! ອັບເດດເລກທີອໍເດີແລ້ວ'),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('ເກີດຂໍ້ຜິດພາດໃນການຊິງ: $e')));
    } finally {
      setState(() => isSyncing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filteredOrders = orders.where((o) {
      // Status Filter
      String statusLabel = o['status'] == 'Completed'
          ? 'ຊຳລະເງິນແລ້ວ'
          : (o['status'] == 'Cancelled' ? 'ຍົກເລີກແລ້ວ' : o['status']);
      bool matchesStatus = selectedFilter == 'ທັງໝົດ' || statusLabel == selectedFilter;

      // Date Range Filter
      bool matchesDate = true;
      if (selectedDateRange != null) {
        try {
          // Robust string comparison: YYYY-MM-DD
          String orderDateStr = o['date'].toString().substring(0, 10);
          String startDateStr = selectedDateRange!.start.toIso8601String().substring(0, 10);
          String endDateStr = selectedDateRange!.end.toIso8601String().substring(0, 10);
          
          matchesDate = orderDateStr.compareTo(startDateStr) >= 0 && 
                        orderDateStr.compareTo(endDateStr) <= 0;
          
          // Debugging
          // print('Order: $orderDateStr | Range: $startDateStr to $endDateStr | Matches: $matchesDate');
        } catch (e) {
          matchesDate = true;
        }
      }

      return matchesStatus && matchesDate;
    }).toList();

    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        backgroundColor: primaryGreen,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'ລາຍການຄຳສັ່ງຊື້',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: Icon(
              Icons.calendar_today,
              color: selectedDateRange != null ? Colors.amber : Colors.white,
            ),
            onPressed: _selectDateRange,
            tooltip: 'ກອງຕາມວັນທີ',
          ),
        ],
        centerTitle: true,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Container(
                  height: 50,
                  padding: const EdgeInsets.only(top: 8),
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    children: [
                      _buildShortcutChip('ມື້ນີ້', DateTime.now(), DateTime.now()),
                      _buildShortcutChip('ມື້ວານ', DateTime.now().subtract(const Duration(days: 1)), DateTime.now().subtract(const Duration(days: 1))),
                      _buildShortcutChip('ເດືອນນີ້', DateTime(DateTime.now().year, DateTime.now().month, 1), DateTime.now()),
                    ],
                  ),
                ),
                Container(
                  height: 60,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    children: [
                      _buildFilterChip('ທັງໝົດ'),
                      _buildFilterChip('ຊຳລະເງິນແລ້ວ'),
                      _buildFilterChip('ຍົກເລີກແລ້ວ'),
                    ],
                  ),
                ),
                if (selectedDateRange != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    child: Row(
                      children: [
                        Chip(
                          avatar: const Icon(Icons.date_range, size: 16, color: Colors.blue),
                          label: Text(
                            '${selectedDateRange!.start.toString().substring(0, 10)} - ${selectedDateRange!.end.toString().substring(0, 10)}',
                            style: const TextStyle(fontSize: 12),
                          ),
                          onDeleted: () {
                            setState(() {
                              selectedDateRange = null;
                            });
                          },
                          deleteIconColor: Colors.red,
                          backgroundColor: Colors.blue.withOpacity(0.05),
                          side: BorderSide(color: Colors.blue.withOpacity(0.1)),
                        ),
                        const Spacer(),
                        Text(
                          'ພົບ ${filteredOrders.length} ລາຍການ',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 12, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ),
                Expanded(
                  child: filteredOrders.isEmpty
                      ? const Center(child: Text('ຍັງບໍ່ມີລາຍການສັ່ງຊື້'))
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 4,
                          ),
                          itemCount: filteredOrders.length,
                          itemBuilder: (context, index) => OrderCard(
                            order: filteredOrders[index],
                            primaryGreen: primaryGreen,
                            onCancel: _loadOrders,
                          ),
                        ),
                ),
              ],
            ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: isSyncing ? null : _syncOrders,
          style: ElevatedButton.styleFrom(
            backgroundColor: primaryGreen,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: isSyncing 
              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text(
                  'ປິດຍອດຂາຍ',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
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
              onSurface: Colors.black87,
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
        selectedColor: primaryGreen.withOpacity(0.2),
        checkmarkColor: primaryGreen,
        labelStyle: TextStyle(
          color: isSelected ? primaryGreen : Colors.black87,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
    );
  }

  Widget _buildShortcutChip(String label, DateTime start, DateTime end) {
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: ActionChip(
        label: Text(
          label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        side: BorderSide(color: Colors.grey.shade300),
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
  final VoidCallback onCancel;

  const OrderCard({
    super.key,
    required this.order,
    required this.primaryGreen,
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
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'ເລກທີ: ${(order['id'] ?? '').toString().substring(0, 8).toUpperCase()}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: Color(0xFF2E7D32), // Darker green for visibility
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  _buildStatusBadge(
                    order['status'] ?? '',
                    order['synced'] == 1,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Items Container with light background
              if (order['itemsJson'] != null)
                Builder(
                  builder: (context) {
                    try {
                      final List<dynamic> items = json.decode(order['itemsJson'] as String);
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade50,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.grey.shade100),
                            ),
                            child: Column(
                              children: items.map((item) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        '${item['name']}',
                                        style: TextStyle(fontSize: 13, color: Colors.grey.shade800),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    SizedBox(
                                      width: 40,
                                      child: Text(
                                        'x${item['quantity']}',
                                        textAlign: TextAlign.right,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                      ),
                                    ),
                                    SizedBox(
                                      width: 80,
                                      child: Text(
                                        formatPrice(((item['quantity'] ?? 0) * (item['price'] ?? 0)).toDouble()),
                                        textAlign: TextAlign.right,
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                ),
                              )).toList(),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0, left: 4),
                            child: Text(
                              'ລວມ ${items.length} ລາຍການ',
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade500, fontWeight: FontWeight.w500),
                            ),
                          ),
                        ],
                      );
                    } catch (e) {
                      return const SizedBox.shrink();
                    }
                  },
                ),
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.access_time, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      order['date'].toString().substring(0, 16).replaceAll('T', ' '),
                      style: const TextStyle(color: Colors.grey, fontSize: 11),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Spacer(),
                  const SizedBox(width: 8),
                  Icon(
                    order['paymentMethod'] == 'bank' ? Icons.account_balance : Icons.money,
                    size: 14,
                    color: Colors.grey,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    order['paymentMethod'] == 'bank' ? 'ໂອນເງິນ' : 'ເງິນສົດ',
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              if (order['paymentMethod'] == 'cash')
                Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'ຍອດຮັບ:',
                          style: TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                        Text(
                          '${formatPrice((order['amountReceived'] as num? ?? 0).toDouble())} ${order['currency'] ?? 'LAK'}',
                          style: const TextStyle(color: Colors.black87, fontSize: 13),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'ເງິນທອນ:',
                          style: TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                        Text(
                          '${formatPrice((order['changeAmount'] as num? ?? 0).toDouble())} ${order['currency'] ?? 'LAK'}',
                          style: const TextStyle(color: Colors.black87, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8.0),
                      child: Divider(height: 1, color: Colors.black12),
                    ),
                  ],
                ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'ຍອດລວມທັງໝົດ:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '${formatPrice((order['total'] as num? ?? 0).toDouble())} ${order['currency'] ?? 'LAK'}',
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 22,
                            color: primaryGreen,
                            letterSpacing: 0.5,
                          ),
                          textAlign: TextAlign.right,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              if (order['status'] == 'Cancelled' && order['remark'] != null)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red.withOpacity(0.1)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.info_outline, size: 16, color: Colors.red),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'ໝາຍເຫດ: ${order['remark']}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.red,
                              fontStyle: FontStyle.italic,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              if (order['status'] != 'Cancelled')
                Padding(
                  padding: const EdgeInsets.only(top: 12.0),
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: OutlinedButton.icon(
                      onPressed: () => _confirmCancelOrder(context, order['id']),
                      icon: const Icon(Icons.delete_sweep_outlined, color: Colors.red, size: 16),
                      label: const Text(
                        'ຍົກເລີກອໍເດີ',
                        style: TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.red.withOpacity(0.3)),
                        backgroundColor: Colors.red.withOpacity(0.05),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        minimumSize: const Size(0, 36),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _confirmCancelOrder(BuildContext context, String orderId) async {
    final TextEditingController remarkController = TextEditingController();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('ຢືນຢັນການຍົກເລີກ'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('ທ່ານຕ້ອງການຍົກເລີກອໍເດີນີ້ ແລະ ຄືນສິນຄ້າເຂົ້າສາງແມ່ນບໍ່?'),
            const SizedBox(height: 16),
            TextField(
              controller: remarkController,
              decoration: const InputDecoration(
                labelText: 'ໝາຍເຫດ (ເຫດຜົນການຍົກເລີກ)',
                hintText: 'ລະບຸເຫດຜົນ...',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('ຍົກເລີກ'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text(
              'ຕົກລົງ',
              style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
            ),
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
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('ຍົກເລີກອໍເດີ ແລະ ຄືນສິນຄ້າສຳເລັດແລ້ວ'),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    }
  }

  Widget _buildStatusBadge(String status, bool isSynced) {
    Color color = status == 'Completed'
        ? Colors.green
        : (status == 'Cancelled' ? Colors.red : Colors.orange);
    String label = status == 'Completed'
        ? 'ຊຳລະເງິນແລ້ວ'
        : (status == 'Cancelled' ? 'ຍົກເລີກແລ້ວ' : status);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isSynced ? Icons.cloud_done : Icons.cloud_off,
            size: 14,
            color: isSynced ? Colors.green : Colors.grey,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
