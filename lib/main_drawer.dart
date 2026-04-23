import 'package:flutter/material.dart';
import 'package:ipos/login_screen.dart';
import 'package:ipos/view_orders_screen.dart';
import 'package:ipos/sync_screen.dart';
import 'package:ipos/sales_report_screen.dart';
import 'package:ipos/settings_screen.dart';
import 'package:ipos/printer_screen.dart';
import 'package:ipos/exchange_rate_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MainDrawer extends StatefulWidget {
  final Color primaryGreen;
  final VoidCallback? onSyncComplete;
  
  const MainDrawer({super.key, required this.primaryGreen, this.onSyncComplete});

  @override
  State<MainDrawer> createState() => _MainDrawerState();
}

class _MainDrawerState extends State<MainDrawer> {
  String userName = 'Admin Operator';
  String userRole = 'System Owner';

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
  }

  Future<void> _loadUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userName = prefs.getString('user_name') ?? 'Admin Operator';
      userRole = prefs.getString('user_role') ?? 'System Owner';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topRight: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
      ),
      child: Column(
        children: [
          // Premium Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 30),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  const Color(0xFF0F172A),
                  const Color(0xFF1E293B),
                ],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: widget.primaryGreen,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: widget.primaryGreen.withOpacity(0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.layers, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 15),
                    const Text(
                      'iPOS PRO',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -1,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 30),
                Text(
                  userName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  userRole.toUpperCase(),
                  style: TextStyle(
                    color: widget.primaryGreen,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
          ),
          
          // Menu Items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 10),
              children: [
                _buildGroupHeader('ລະບົບຂາຍ'),
                _buildMenuItem(
                  icon: Icons.sync,
                  label: 'ຊິງຂໍ້ມູນ (Sync)',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const SyncScreen()),
                    ).then((_) {
                      if (widget.onSyncComplete != null) widget.onSyncComplete!();
                    });
                  },
                ),
                _buildMenuItem(
                  icon: Icons.print_rounded,
                  label: 'ຕັ້ງຄ່າເຄື່ອງພິມ',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const PrinterScreen()),
                    );
                  },
                ),
                const SizedBox(height: 15),
                _buildGroupHeader('ລາຍງານ'),
                _buildMenuItem(
                  icon: Icons.analytics_rounded,
                  label: 'ຍອດຂາຍ',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const SalesReportScreen()),
                    );
                  },
                ),
                _buildMenuItem(
                  icon: Icons.history_edu_rounded,
                  label: 'ປະຫວັດການຂາຍ',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ViewOrdersScreen()),
                    );
                  },
                ),
                const SizedBox(height: 15),
                _buildGroupHeader('ຕັ້ງຄ່າລະບົບ'),
                _buildMenuItem(
                  icon: Icons.settings_suggest_rounded,
                  label: 'ກຳນົດຄ່າຕ່າງໆ',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const SettingsScreen()),
                    );
                  },
                ),
                _buildMenuItem(
                  icon: Icons.currency_exchange_rounded,
                  label: 'ອັດຕາແລກປ່ຽນ',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ExchangeRateScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
          
          // Bottom Actions
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.05),
                borderRadius: BorderRadius.circular(16),
              ),
              child: ListTile(
                onTap: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                    (route) => false,
                  );
                },
                leading: const Icon(Icons.logout_rounded, color: Colors.redAccent),
                title: const Text(
                  'ອອກຈາກລະບົບ',
                  style: TextStyle(
                    color: Colors.redAccent,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGroupHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 15, bottom: 10, top: 10),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w900,
          color: Colors.grey.withOpacity(0.5),
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 2),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: const Color(0xFF1E293B), size: 20),
        ),
        title: Text(
          label,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: Color(0xFF1E293B),
          ),
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        onTap: onTap,
      ),
    );
  }
}
