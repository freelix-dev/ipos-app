import 'package:flutter/material.dart';
import 'package:ipos/database_helper.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final Color primaryGreen = const Color(0xFF76A258);
  String _userRole = 'Staff';
  bool _vatEnabled = false;
  String _taxRate = '0';

  @override
  void initState() {
    super.initState();
    _loadUserRole();
  }

  Future<void> _loadUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    if (mounted) {
      setState(() {
        _userRole = prefs.getString('user_role') ?? 'Staff';
        _vatEnabled = prefs.getBool('vat_enabled') ?? false;
        _taxRate = prefs.getString('system_tax_rate') ?? '0';
      });
    }
  }

  Future<void> _toggleVat(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('vat_enabled', value);
    setState(() {
      _vatEnabled = value;
    });
  }

  bool get _isAdmin => _userRole == 'Admin' || _userRole == 'System Owner';

  Future<void> _handleClearData() async {
    if (!_isAdmin) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('ທ່ານບໍ່ມີสิทธิ์ໃນການເຂົ້າເຖິງສ່ວນນີ້'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('ຢືນຢັນການລຶບຂໍ້ມູນ'),
        content: const Text(
          'ທ່ານຕ້ອງການລຶບຂໍ້ມູນທັງໝົດ (ສິນຄ້າ, ອໍເດີ, ອັດຕາແລກປ່ຽນ) ອອກຈາກເຄື່ອງແມ່ນບໍ່?\n\n*ການລຶບນີ້ບໍ່ສາມາດເອົາຄືນໄດ້*',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('ຍົກເລີກ'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text(
              'ຢືນຢັນການລຶບ',
              style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      if (!mounted) return;
      
      // Show loading overlay
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      try {
        await DatabaseHelper().clearAllData();
        
        if (mounted) {
          // Navigate to Login Screen and clear all routes to refresh the app state
          // Assuming /login is the route for login_screen.dart
          Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
          
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('ລຶບຂໍ້ມູນທັງໝົດ ແລະ ລ້າງໜ້າຈໍສຳເລັດແລ້ວ'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          Navigator.pop(context); // Remove loading
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('ເກີດຂໍ້ຜິດພາດ: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        backgroundColor: primaryGreen,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'ການຕັ້ງຄ່າ',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionHeader('ການຈັດການຂໍ້ມູນ (Database)'),
          _buildSettingsCard(
            icon: _isAdmin ? Icons.delete_forever : Icons.lock_outline,
            iconColor: _isAdmin ? Colors.red : Colors.grey,
            title: 'ລ້າງຂໍ້ມູນທັງໝົດ',
            subtitle: _isAdmin 
                ? 'ລຶບສິນຄ້າ, ອໍເດີ ແລະ ອັດຕາແລກປ່ຽນທັງໝົດໃນເຄື່ອງ'
                : 'ສະເພາะ Admin ເທົ່ານັ້ນ',
            onTap: _isAdmin ? _handleClearData : () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('ສະເພາະ Admin ເທົ່ານັ້ນ'))
              );
            },
          ),
          const SizedBox(height: 24),
          _buildSectionHeader('ຂໍ້ມູນລະບົບ'),
          _buildSettingsCard(
            icon: Icons.info_outline,
            iconColor: primaryGreen,
            title: 'ເວີຊັນແອັບ',
            subtitle: 'Version 1.7.0+59',
            onTap: () {},
          ),
          _buildSettingsCard(
            icon: Icons.api,
            iconColor: Colors.blue,
            title: 'API Endpoint',
            subtitle: 'ເຊື່ອມຕໍ່ກັບເຊີບເວີຫຼັກ',
            onTap: () {},
          ),
          const SizedBox(height: 24),
          _buildSectionHeader('ການເງິນ (Financial)'),
          _buildSwitchCard(
            icon: Icons.receipt_long,
            iconColor: Colors.orange,
            title: 'ເປີดການນຳໃຊ້ VAT',
            subtitle: 'ຄິດໄລ່ภาษีອາກອນໃສ່ໃນບິນ (ปัจจุบัน: $_taxRate%)',
            value: _vatEnabled,
            onChanged: _toggleVat,
          ),
        ],
      ),
    );
  }

  Widget _buildSwitchCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.only(bottom: 12),
      child: SwitchListTile(
        secondary: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: iconColor),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
        ),
        value: value,
        onChanged: onChanged,
        activeColor: primaryGreen,
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Colors.grey.shade700,
        ),
      ),
    );
  }

  Widget _buildSettingsCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: iconColor),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 14),
        onTap: onTap,
      ),
    );
  }
}
