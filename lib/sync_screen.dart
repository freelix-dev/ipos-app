import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:ipos/database_helper.dart';
import 'package:ipos/api_config.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SyncScreen extends StatefulWidget {
  const SyncScreen({super.key});

  @override
  State<SyncScreen> createState() => _SyncScreenState();
}

class _SyncScreenState extends State<SyncScreen> {
  final Color primaryGreen = const Color(0xFF76A258);
  bool _isLoading = false;
  String _status = 'ກຽມພ້ອມຊິງຂໍ້ມູນ';
  double _progress = 0;

  Future<void> _syncProducts() async {
    setState(() {
      _isLoading = true;
      _status = 'ກຳລັງເຊື່ອມຕໍ່ Backend...';
      _progress = 0.1;
    });

    try {
      // 1. Sync Products
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('user_token') ?? '';

      final productUrl = Uri.parse(ApiConfig.productsUrl);
      final productRes = await http.get(
        productUrl,
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 30));

      if (productRes.statusCode == 200) {
        List<dynamic> productData = json.decode(productRes.body);
        List<Map<String, dynamic>> productsArr = productData
            .map(
              (item) => {
                'id': item['id']?.toString() ?? '',
                'name': item['name']?.toString() ?? '',
                'imagePath': item['imagePath']?.toString() ?? '',
                'price': double.tryParse(item['price'].toString()) ?? 0.0,
                'stock': int.tryParse(item['stock'].toString()) ?? 0,
                'unit': item['unit']?.toString() ?? '',
              },
            )
            .toList();
        await DatabaseHelper().insertProducts(productsArr);
      }

      setState(() {
        _status = 'ຊິງອັດຕາແລກປ່ຽນ...';
        _progress = 0.5;
      });

      // 2. Sync Exchange Rates
      final shopId = prefs.getString('shop_id') ?? '';
      final rateUrl = Uri.parse('${ApiConfig.ratesUrl}?shopId=$shopId');
      final rateRes = await http.get(
        rateUrl,
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 30));

      if (rateRes.statusCode == 200) {
        Map<String, dynamic> rateData = json.decode(rateRes.body);
        await DatabaseHelper().updateExchangeRates(rateData);
      }

      setState(() {
        _status = 'ສຳເລັດແລ້ວ!';
        _progress = 1.0;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ຊິງຂໍ້ມູນສິນຄ້າ ແລະ ອັດຕາແລກປ່ຽນສຳເລັດແລ້ວ!')),
      );
    } catch (e) {
      setState(() {
        _status = 'ຂໍ້ຜິດພາດ: ບໍ່ສາມາດເຊື່ອມຕໍ່ໄດ້';
        _isLoading = false;
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('ຂໍ້ຜິດພາດ: $e')));
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _syncOrders() async {
    setState(() {
      _isLoading = true;
      _status = 'ກຳລັງອັບໂຫລດລາຍການຂາຍ...';
      _progress = 0.1;
    });

    try {
      final unsynced = await DatabaseHelper().getUnsyncedOrders();
      if (unsynced.isEmpty) {
        setState(() {
          _status = 'ບໍ່ມີລາຍການໃໝ່ທີ່ຕ້ອງສົ່ງ';
          _progress = 1.0;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('ບໍ່ມີລາຍການໃໝ່ທີ່ຕ້ອງສົ່ງ')),
        );
        return;
      }

      setState(() {
        _status = 'ກຳລັງສົ່ງ ${unsynced.length} ລາຍການ...';
        _progress = 0.5;
      });

      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('user_token') ?? '';

      final orderUrl = Uri.parse(ApiConfig.ordersUrl);
      final res = await http.post(
        orderUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token'
        },
        body: json.encode(unsynced),
      ).timeout(const Duration(seconds: 30));

      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = json.decode(res.body);
        final ids = unsynced.map((o) => o['id'] as String).toList();
        await DatabaseHelper().markOrdersAsSynced(ids);
        

        setState(() {
          _status = 'ສົ່ງ ${ids.length} ລາຍການສຳເລັດແລ້ວ!';
          _progress = 1.0;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('ອັບໂຫລດ ${ids.length} ລາຍການຂາຍສຳເລັດ!')),
        );
      } else {
        setState(() => _status = 'ສົ່ງຂໍ້ມູນລົ້ມເຫລວ: ${res.statusCode}');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('ຜິດພາດ: server ຕອບ ${res.statusCode}')),
        );
      }
    } catch (e) {
      setState(() {
        _status = 'ຂໍ້ຜິດພາດ: ບໍ່ສາມາດເຊື່ອມຕໍ່ໄດ້';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('ຂໍ້ຜິດພາດ: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _syncAll() async {
    setState(() {
      _isLoading = true;
      _status = 'ກຳລັງເລີ່ມການຊິງທັງໝົດ...';
      _progress = 0.1;
    });

    try {
      // 1. Upload unsynced orders
      setState(() {
        _status = '1/2 ອັບໂຫລດລາຍການຂາຍ...';
        _progress = 0.2;
      });

      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('user_token') ?? '';

      final unsynced = await DatabaseHelper().getUnsyncedOrders();
      if (unsynced.isNotEmpty) {
        final orderUrl = Uri.parse(ApiConfig.ordersUrl);
        final res = await http.post(
          orderUrl,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token'
          },
          body: json.encode(unsynced),
        ).timeout(const Duration(seconds: 30));

        if (res.statusCode == 200 || res.statusCode == 201) {
          final data = json.decode(res.body);
          final ids = unsynced.map((o) => o['id'] as String).toList();
          await DatabaseHelper().markOrdersAsSynced(ids);

        }
      }

      // 2. Download Products
      setState(() {
        _status = '2/2 ດາວໂຫລດຂໍ້ມູນສິນຄ້າ...';
        _progress = 0.6;
      });

      final productUrl = Uri.parse(ApiConfig.productsUrl);
      final productRes = await http.get(
        productUrl,
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 30));
      if (productRes.statusCode == 200) {
        List<dynamic> productData = json.decode(productRes.body);
        List<Map<String, dynamic>> productsArr = productData.map((item) => {
          'id': item['id']?.toString() ?? '',
          'name': item['name']?.toString() ?? '',
          'imagePath': item['imagePath']?.toString() ?? '',
          'price': double.tryParse(item['price'].toString()) ?? 0.0,
          'stock': int.tryParse(item['stock'].toString()) ?? 0,
          'unit': item['unit']?.toString() ?? '',
        }).toList();
        await DatabaseHelper().insertProducts(productsArr);
      }

      // 3. Download Exchange Rates
      setState(() {
        _status = 'ດາວໂຫລດ ອັດຕາແລກປ່ຽນ...';
        _progress = 0.85;
      });

      final shopId = prefs.getString('shop_id') ?? '';
      final rateUrl = Uri.parse('${ApiConfig.ratesUrl}?shopId=$shopId');
      final rateRes = await http.get(
        rateUrl,
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 30));
      if (rateRes.statusCode == 200) {
        Map<String, dynamic> rateData = json.decode(rateRes.body);
        await DatabaseHelper().updateExchangeRates(rateData);
      }

      setState(() {
        _status = 'ຊິງຂໍ້ມູນທັງໝົດສຳເລັດແລ້ວ!';
        _progress = 1.0;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ຊິງຂໍ້ມູນທັງໝົດສຳເລັດແລ້ວ!')),
      );
    } catch (e) {
      setState(() {
        _status = 'ຂໍ້ຜິດພາດ: $e';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('ຂໍ້ຜິດພາດ: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: primaryGreen,
        title: const Text(
          'ຈັດການຂໍ້ມູນ (Sync Dashboard)',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.sync_alt, size: 80, color: primaryGreen),
              const SizedBox(height: 24),
              Text(
                'ລະບົບຈັດການຂໍ້ມູນຊິງ',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: primaryGreen,
                ),
              ),
              const SizedBox(height: 40),
              if (_isLoading)
                Column(
                  children: [
                    LinearProgressIndicator(
                      value: _progress,
                      color: primaryGreen,
                      backgroundColor: Colors.grey.shade200,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _status,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                )
              else ...[
                // Option 1: Sync All (New)
                _buildSyncOption(
                  title: 'ຊິງຂໍ້ມູນທັງໝົດ',
                  subtitle: 'ສົ່ງອໍເດີຂຶ້ນ ແລະ ດຶງສະຕັອກລ່າສຸດກັບມາ',
                  icon: Icons.sync,
                  onPressed: _syncAll,
                  color: Colors.orange,
                ),
                const SizedBox(height: 20),
                // Option 2: Download Products
                _buildSyncOption(
                  title: 'ດາວໂຫລດຂໍ້ມູນສິນຄ້າ',
                  subtitle: 'ດຶງຂໍ້ມູນສິນຄ້າ ແລະ ລາຄາຈາກ Server',
                  icon: Icons.cloud_download,
                  onPressed: _syncProducts,
                  color: primaryGreen,
                ),
                const SizedBox(height: 20),
                // Option 3: Upload Orders
                _buildSyncOption(
                  title: 'ອັບໂຫລດລາຍການຂາຍ',
                  subtitle: 'ສົ່ງລາຍງານການຂາຍຕົວລ່າສຸດຂຶ້ນ Server',
                  icon: Icons.cloud_upload,
                  onPressed: _syncOrders,
                  color: Colors.blue,
                ),
                const SizedBox(height: 32),
                Text(
                  _status,
                  style: const TextStyle(color: Colors.blueGrey, fontSize: 13),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSyncOption({
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onPressed,
    required Color color,
  }) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon,
                    color: color,
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
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        subtitle,
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right, color: Colors.grey.shade400),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
