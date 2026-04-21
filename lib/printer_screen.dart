import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sunmi_printer_plus/sunmi_printer_plus.dart';

class PrinterScreen extends StatefulWidget {
  const PrinterScreen({super.key});

  @override
  State<PrinterScreen> createState() => _PrinterScreenState();
}

class _PrinterScreenState extends State<PrinterScreen> {
  final Color primaryGreen = const Color(0xFF76A258);
  
  String _paperSize = '55/57/58mm';
  String _newLines = '0';
  bool _autoPrint = true;
  String _printerType = 'Network';
  
  final List<Map<String, String>> _connectedPrinters = [];

  @override
  void initState() {
    super.initState();
    _loadSavedPrinters();
    _initPrinter();
  }

  Future<void> _initPrinter() async {
    try {
      bool? isBound = await SunmiPrinter.bindingPrinter();
      if (isBound == true) {
        await SunmiPrinter.initPrinter();
      }
    } catch (e) {
      debugPrint('Sunmi Printer init error: $e');
    }
  }

  Future<void> _loadSavedPrinters() async {
    final prefs = await SharedPreferences.getInstance();
    final String? printersJson = prefs.getString('saved_printers');
    if (printersJson != null) {
      final List<dynamic> decoded = json.decode(printersJson);
      setState(() {
        _connectedPrinters.clear();
        for (var item in decoded) {
          _connectedPrinters.add(Map<String, String>.from(item));
        }
      });
    }
  }

  Future<void> _savePrintersToPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final String printersJson = json.encode(_connectedPrinters);
    await prefs.setString('saved_printers', printersJson);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: primaryGreen,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'ເຄື່ອງພິມ',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w500, fontSize: 20),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Settings Cards
            _buildDropdownCard(
              label: 'ຂະໜາດເຈ້ຍ',
              value: _paperSize,
              items: ['55/57/58mm', '80mm'],
              onChanged: (val) {
                if (val != null) setState(() => _paperSize = val);
              },
            ),
            const SizedBox(height: 10),
            _buildDropdownCard(
              label: 'ແຖວໃໝ່ຫຼັງຈາກພິມ',
              value: _newLines,
              items: ['0', '1', '2', '3', '4', '5'],
              onChanged: (val) {
                if (val != null) setState(() => _newLines = val);
              },
            ),
            const SizedBox(height: 10),
            _buildSwitchCard(
              label: 'ພິມແບບອັດຕະໂນມັດ',
              value: _autoPrint,
              onChanged: (val) {
                setState(() => _autoPrint = val);
              },
            ),
            
            const SizedBox(height: 20),
            
            // Connected Printers
            const Text('ເຄື່ອງພິມທີ່ເຊື່ອມຕໍ່ແລ້ວ:', style: TextStyle(fontSize: 16, color: Colors.black87)),
            const SizedBox(height: 10),
            if (_connectedPrinters.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 10),
                  child: Text('ບໍ່ມີຂໍ້ມູນ', style: TextStyle(fontSize: 16, color: Colors.black54)),
                ),
              )
            else
              ..._connectedPrinters.map((p) => _buildConnectedPrinterItem(p['name']!, p['details']!)).toList(),
            
            const SizedBox(height: 20),
            
            // Search Printers
            const Text('ຊອກຫາເຄື່ອງພິມ:', style: TextStyle(fontSize: 16, color: Colors.black87)),
            const SizedBox(height: 10),
            _buildDropdownCard(
              label: 'ປະເພດເຄື່ອງພິມ',
              value: _printerType,
              items: ['Network', 'Bluetooth', 'USB'],
              onChanged: (val) {
                if (val != null) setState(() => _printerType = val);
              },
            ),
            
            const SizedBox(height: 20),
            
            // Available Printers
            const Text('ເຄື່ອງພິມທີ່ສາມາດນໍາໃຊ້ໄດ້:', style: TextStyle(fontSize: 16, color: Colors.black87)),
            const SizedBox(height: 20),
            ..._buildMockPrinters(),
            
            const SizedBox(height: 30),
            
            // Add Printer Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _savePrinterSettings,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryGreen,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'ເພີ່ມເຄື່ອງພິມ',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w500),
                ),
              ),
            ),
            const SizedBox(height: 30), // Padding at the bottom
          ],
        ),
      ),
    );
  }

  void _savePrinterSettings() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('ບັນທຶກການຕັ້ງຄ່າເຄື່ອງພິມສຳເລັດແລ້ວ'),
        backgroundColor: Colors.green,
      ),
    );
    Navigator.pop(context);
  }

  void _handleConnectPrinter(String name, String details) async {
    if (_connectedPrinters.any((p) => p['name'] == name)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ເຄື່ອງພິມນີ້ເຊື່ອມຕໍ່ແລ້ວ'), backgroundColor: Colors.orange),
      );
      return;
    }
    
    setState(() {
      _connectedPrinters.add({'name': name, 'details': details});
    });
    
    await _savePrintersToPrefs();
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ເຊື່ອມຕໍ່ເຄື່ອງພິມສຳເລັດແລ້ວ'), backgroundColor: Colors.green),
      );
    }
  }

  Widget _buildDropdownCard({
    required String label,
    required String value,
    required List<String> items,
    required void Function(String?) onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
          DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              icon: const Icon(Icons.arrow_drop_down, color: Colors.black87),
              style: const TextStyle(fontSize: 16, color: Colors.black87),
              onChanged: onChanged,
              items: items.map<DropdownMenuItem<String>>((String val) {
                return DropdownMenuItem<String>(
                  value: val,
                  child: Text(val),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSwitchCard({
    required String label,
    required bool value,
    required void Function(bool) onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
          Transform.scale(
            scale: 0.9,
            child: Switch(
              value: value,
              onChanged: onChanged,
              activeColor: Colors.white,
              activeTrackColor: primaryGreen,
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: Colors.grey.shade300,
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildMockPrinters() {
    if (_printerType == 'Network') {
      return [
        _buildPrinterListItem('Sunmi Cloud Printer', '192.168.1.100', () => _handleConnectPrinter('Sunmi Cloud Printer', '192.168.1.100')),
        const SizedBox(height: 10),
        _buildPrinterListItem('Epson TM-T88VI', '192.168.1.105', () => _handleConnectPrinter('Epson TM-T88VI', '192.168.1.105')),
      ];
    } else if (_printerType == 'Bluetooth') {
      return [
        _buildPrinterListItem('Sunmi V2s Built-in', 'Bluetooth - Paired', () => _handleConnectPrinter('Sunmi V2s Built-in', 'Bluetooth - Paired')),
        const SizedBox(height: 10),
        _buildPrinterListItem('Portable Printer 58mm', 'Bluetooth - Not Paired', () => _handleConnectPrinter('Portable Printer 58mm', 'Bluetooth - Not Paired')),
      ];
    } else {
      return [
        _buildPrinterListItem('USB POS Printer', 'USB - Connected', () => _handleConnectPrinter('USB POS Printer', 'USB - Connected')),
      ];
    }
  }

  Widget _buildPrinterListItem(String name, String details, VoidCallback onConnect) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: primaryGreen.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              _printerType == 'Network' ? Icons.wifi : _printerType == 'Bluetooth' ? Icons.bluetooth : Icons.usb,
              color: primaryGreen,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 16)),
                const SizedBox(height: 4),
                Text(details, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: onConnect,
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryGreen,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
            ),
            child: const Text('ເຊື່ອມຕໍ່', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w500)), // Connect
          ),
        ],
      ),
    );
  }

  void _testPrint(String printerName) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      if (printerName.contains('Sunmi')) {
        // Actual Sunmi Print Command
        await SunmiPrinter.initPrinter();
        await SunmiPrinter.printText('--- TEST PRINT ---\n');
        await SunmiPrinter.printText('Printer: $printerName\n');
        await SunmiPrinter.printText('------------------\n');
        await SunmiPrinter.printText('ສະບາຍດີປີໃໝ່\n');
        await SunmiPrinter.printText('IPOS by freelix.la\n');
        
        // Feed paper at the bottom (padding bottom) so it can be torn off
        int extraLines = int.tryParse(_newLines) ?? 0;
        await SunmiPrinter.lineWrap(110 + extraLines);
      } else {
        // Fallback for non-Sunmi printers
        await Future.delayed(const Duration(seconds: 1));
      }

      if (mounted) {
        Navigator.pop(context); // close loading dialog
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('ທົດສອບພິມໄປທີ່ "$printerName" ສຳເລັດແລ້ວ'),
            backgroundColor: Colors.blue,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // close loading dialog
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('ເກີດຂໍ້ຜິດພາດ: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildConnectedPrinterItem(String name, String details) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: primaryGreen.withOpacity(0.5)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: primaryGreen.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.print, color: primaryGreen),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 16)),
                const SizedBox(height: 4),
                Text(details, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
              ],
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.print_outlined, color: Colors.blue),
                tooltip: 'ທົດສອບພິມ',
                onPressed: () => _testPrint(name),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Colors.red),
                tooltip: 'ລຶບ',
                onPressed: () async {
                  setState(() {
                    _connectedPrinters.removeWhere((p) => p['name'] == name);
                  });
                  await _savePrintersToPrefs();
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
