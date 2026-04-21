import 'package:flutter/material.dart';
import 'package:ipos/login_screen.dart';
import 'package:ipos/view_orders_screen.dart';
import 'package:ipos/sync_screen.dart';
import 'package:ipos/sales_report_screen.dart';
import 'package:ipos/settings_screen.dart';
import 'package:ipos/printer_screen.dart';

class MainDrawer extends StatelessWidget {
  final Color primaryGreen;
  final VoidCallback? onSyncComplete;
  
  const MainDrawer({super.key, required this.primaryGreen, this.onSyncComplete});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          // Drawer Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(top: 50, left: 20, right: 20, bottom: 20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  primaryGreen.withOpacity(0.8),
                  primaryGreen,
                ],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Text(
                      'B.POS',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(width: 8),
                    Text(
                      'by ບັນຊີ.la',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'eh.dev9917@gmail.com',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                  ),
                ),
                Text(
                  'Version: 1.7.0+59',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          
          // Menu Items
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _buildMenuItem(
                  icon: Icons.sync,
                  label: 'ໂຫລດຂໍ້ມູນຈາກລະບົບ',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const SyncScreen()),
                    ).then((_) {
                      // Reload data in POS screen after returning from sync
                      if (onSyncComplete != null) onSyncComplete!();
                    });
                  },
                ),
                _buildMenuItem(
                  icon: Icons.print,
                  label: 'ເຊື່ອມຕໍ່ເຄື່ອງພິມ',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const PrinterScreen()),
                    );
                  },
                ),
                _buildMenuItem(
                  icon: Icons.assignment,
                  label: 'ການຂາຍ',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const SalesReportScreen()),
                    );
                  },
                ),
                _buildMenuItem(
                  icon: Icons.history,
                  label: 'ງວດການຂາຍ',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ViewOrdersScreen()),
                    );
                  },
                ),
                _buildMenuItem(
                  icon: Icons.storefront,
                  label: 'ສາງ',
                  onTap: () {
                    Navigator.pop(context);
                    // Warehouse logic
                  },
                ),
                _buildMenuItem(
                  icon: Icons.settings,
                  label: 'ການຕັ້ງຄ່າ',
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const SettingsScreen()),
                    );
                  },
                ),
                const Divider(),
                _buildMenuItem(
                  icon: Icons.logout,
                  label: 'ອອກຈາກລະບົບ',
                  onTap: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (context) => const LoginScreen()),
                      (route) => false,
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.grey.shade700),
      title: Text(
        label,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
      onTap: onTap,
    );
  }
}
