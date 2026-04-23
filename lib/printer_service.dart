import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:sunmi_printer_plus/sunmi_printer_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PrinterService {
  static Future<void> printReceipt(Map<String, dynamic> order) async {
    print('PrinterService: Starting print for order ${order['id']}');
    try {
      bool? isBound = await SunmiPrinter.bindingPrinter();
      print('PrinterService: isBound = $isBound');
      
      // Proceed if true or null (sometimes null is returned on certain devices)
      if (isBound == false) {
        print('PrinterService: Error - Printer binding failed (false)');
        return;
      }

      await SunmiPrinter.initPrinter();
      print('PrinterService: Printer initialized');
      await Future.delayed(const Duration(milliseconds: 500));

      // Load Shop Info from SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final shopName = prefs.getString('shop_name') ?? 'Namkhong Vientiane';
      final shopAddress = prefs.getString('shop_address') ?? 'Terminal POS System';
      final shopPhone = prefs.getString('shop_phone') ?? '';

      await SunmiPrinter.lineWrap(1);
      
      // Header
      await SunmiPrinter.setAlignment(SunmiPrintAlign.CENTER);
      await SunmiPrinter.printText('$shopName\n');
      if (shopAddress.isNotEmpty) {
        await SunmiPrinter.printText('$shopAddress\n');
      }
      if (shopPhone.isNotEmpty) {
        await SunmiPrinter.printText('Tel: $shopPhone\n');
      }
      await SunmiPrinter.setAlignment(SunmiPrintAlign.LEFT);
      await SunmiPrinter.printText('--------------------------------\n');

      // Order Info
      DateTime orderDate = DateTime.parse(order['date']);
      String formattedDate = DateFormat('dd/MM/yyyy HH:mm').format(orderDate);
      
      await SunmiPrinter.printText('ໃບບິນເລກທີ: ${order['id'].toString().substring(0, 8)}\n');
      await SunmiPrinter.printText('ວັນທີ: $formattedDate\n');
      if (order['userName'] != null) {
        await SunmiPrinter.printText('ພະນັກງານ: ${order['userName']}\n');
      }
      await SunmiPrinter.printText('--------------------------------\n');
      print('PrinterService: Header and info printed');

      // Items
      if (order['itemsJson'] != null && order['itemsJson'].toString().isNotEmpty) {
        print('PrinterService: Parsing items...');
        final List<dynamic> items = json.decode(order['itemsJson']);
        for (var item in items) {
          String name = item['name'] ?? '';
          int qty = item['quantity'] ?? 0;
          double price = (item['price'] as num).toDouble();
          double totalItem = price * qty;
          
          // Manual row alignment with printText
          String qtyStr = 'x$qty'.padRight(6);
          String priceStr = _formatPrice(totalItem).padLeft(12);
          
          await SunmiPrinter.printText('$name\n');
          await SunmiPrinter.printText('$qtyStr $priceStr\n');
        }
        print('PrinterService: Items printed');
      }
      await SunmiPrinter.printText('--------------------------------\n');

      // Summary
      String currency = order['currency'] == 'LAK' ? '₭' : order['currency'] == 'THB' ? '฿' : '\$';
      double total = (order['total'] as num).toDouble();
      
      String totalLabel = 'ລວມທັງໝົດ:'.padRight(15);
      String totalVal = '${_formatPrice(total)} $currency'.padLeft(15);
      await SunmiPrinter.printText('$totalLabel$totalVal\n');

      if (order['paymentMethod'] == 'cash') {
        double received = (order['amountReceived'] as num).toDouble();
        double change = (order['changeAmount'] as num).toDouble();
        
        String receivedLabel = 'ຮັບເງິນສົດ:'.padRight(15);
        String receivedVal = '${_formatPrice(received)} $currency'.padLeft(15);
        await SunmiPrinter.printText('$receivedLabel$receivedVal\n');

        String changeLabel = 'ເງິນທອນ:'.padRight(15);
        String changeVal = '${_formatPrice(change)} $currency'.padLeft(15);
        await SunmiPrinter.printText('$changeLabel$changeVal\n');
      } else {
        String methodLabel = 'ຊຳລະຜ່ານ:'.padRight(15);
        String methodVal = (order['paymentMethod'] == 'bank' ? 'ທະນາຄານ' : 'ອື່ນໆ').padLeft(15);
        await SunmiPrinter.printText('$methodLabel$methodVal\n');
      }

      await SunmiPrinter.printText('--------------------------------\n');
      await SunmiPrinter.printText('      ຂອບໃຈທີ່ໃຊ້ບໍລິການ\n');
      await SunmiPrinter.printText('      ສະບາຍດີ! ຂໍຂອບໃຈ!\n');
      
      // Reasonable margin to feed paper past the tear bar
      await SunmiPrinter.lineWrap(75);
      print('PrinterService: Print job completed');
      
    } catch (e, stack) {
      print('Printing error: $e');
      print('Stack trace: $stack');
    }
  }

  static String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }
}
