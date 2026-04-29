import 'dart:convert';
import 'dart:typed_data';
import 'package:intl/intl.dart';
import 'package:sunmi_printer_plus/sunmi_printer_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:image/image.dart' as img;
import 'package:ipos/api_config.dart';

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

      // Load Shop Info and Receipt Settings from SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final shopName = prefs.getString('shop_name') ?? 'iPOS PRO';
      final shopAddress = prefs.getString('shop_address') ?? '';
      final shopPhone = prefs.getString('shop_phone') ?? '';
      
      final settingsJson = prefs.getString('receipt_settings');
      Map<String, dynamic> settings = {};
      if (settingsJson != null && settingsJson != 'null') {
        try {
          final decoded = json.decode(settingsJson);
          if (decoded is Map<String, dynamic>) {
            settings = decoded;
          }
        } catch (e) {
          print('PrinterService: Error decoding receipt_settings: $e');
        }
      }
      
      bool _parseBool(dynamic value, {bool defaultValue = true}) {
        if (value == null) return defaultValue;
        if (value is bool) return value;
        if (value is int) return value == 1;
        if (value is String) {
          return value.toLowerCase() == 'true' || value == '1';
        }
        return defaultValue;
      }

      final headerText = settings['header_text']?.toString() ?? '';
      final footerText = settings['footer_text']?.toString() ?? 'ຂອບໃຈທີ່ໃຊ້ບໍລິການ';
      final showOrderNo = _parseBool(settings['show_order_id']);
      final showEmployee = _parseBool(settings['show_staff_name']);
      final showDate = _parseBool(settings['show_date']);
      final showPhone = _parseBool(settings['show_phone']);
      final showAddress = _parseBool(settings['show_address']);
      final logoEnabled = _parseBool(settings['logo_enabled']);
      final showQR = _parseBool(settings['show_qr'], defaultValue: false);
      final qrData = settings['qr_data']?.toString() ?? '';
      final logoPath = settings['logo_path']?.toString() ?? '';

      await SunmiPrinter.lineWrap(1);
      
      // 1. Print Logo if exists and enabled
      if (logoEnabled && logoPath.isNotEmpty) {
        try {
          String imageUrl = logoPath.startsWith('http') 
              ? logoPath 
              : '${ApiConfig.baseUrl}/$logoPath';
          
          print('PrinterService: Downloading logo from $imageUrl');
          final response = await http.get(Uri.parse(imageUrl)).timeout(const Duration(seconds: 5));
          if (response.statusCode == 200) {
            Uint8List bytes = response.bodyBytes;
            print('PrinterService: Logo downloaded successfully, size: ${bytes.length} bytes');
            
            // Process image to be centered on a 384-dot canvas (Standard 58mm)
            Uint8List centeredBytes = _processImageForCentering(bytes, targetWidth: 384);
            
            // ignore: deprecated_member_use
            await SunmiPrinter.setAlignment(SunmiPrintAlign.LEFT); // Print left because image is pre-centered
            await Future.delayed(const Duration(milliseconds: 200)); 
            
            await SunmiPrinter.printImage(centeredBytes);
            await SunmiPrinter.lineWrap(1);
            print('PrinterService: Logo print command sent to printer');
          } else {
            print('PrinterService: Failed to download logo, status code: ${response.statusCode}');
          }
        } catch (e) {
          print('PrinterService: Error printing logo: $e');
        }
      }

      // 2. Header & Shop Info (Always print Shop Name)
      // ignore: deprecated_member_use
      await SunmiPrinter.setAlignment(SunmiPrintAlign.CENTER);
      await Future.delayed(const Duration(milliseconds: 100));
      await SunmiPrinter.setCustomFontSize(24); // Compact shop name
      await SunmiPrinter.printText(_centerText(shopName, width: 30) + '\n'); 
      
      await SunmiPrinter.setCustomFontSize(18); // Smaller address/phone
      if (showAddress && shopAddress.isNotEmpty) {
        await SunmiPrinter.printText(_centerText(shopAddress, width: 30) + '\n');
      }
      if (showPhone && shopPhone.isNotEmpty) {
        await SunmiPrinter.printText(_centerText('Tel: $shopPhone', width: 30) + '\n');
      }
      
      await SunmiPrinter.setCustomFontSize(20); // Consistent small font
      await SunmiPrinter.printText('--------------------------------\n');

      if (headerText.isNotEmpty) {
        await SunmiPrinter.printText(_centerText(headerText, width: 30) + '\n');
        await SunmiPrinter.printText('--------------------------------\n');
      }
      
      print('PrinterService: Header and info printed');
      
      // 3. Items
      await SunmiPrinter.setCustomFontSize(20);
      if (order['itemsJson'] != null && order['itemsJson'].toString().isNotEmpty && order['itemsJson'] != 'null') {
        print('PrinterService: Parsing items...');
        final decodedItems = json.decode(order['itemsJson']);
        if (decodedItems is List) {
          final List<dynamic> items = decodedItems;
          for (var item in items) {
            String name = item['name'] ?? '';
            int qty = item['quantity'] ?? 0;
            double price = (item['price'] ?? 0.0).toDouble();
            double totalItem = price * qty;
            
            // ignore: deprecated_member_use
            await SunmiPrinter.setAlignment(SunmiPrintAlign.LEFT);
            await SunmiPrinter.printText('$name\n');
            
            String qtyStr = 'x$qty'.padRight(6);
            String priceStr = _formatPrice(totalItem).padLeft(12);
            
            await SunmiPrinter.printText('$qtyStr $priceStr\n');
          }
          print('PrinterService: Items printed');
        }
      }
      await SunmiPrinter.printText('--------------------------------\n');

      // Summary
      String currency = order['currency'] ?? 'LAK';
      double total = (order['total'] ?? 0.0).toDouble();
      
      String totalLabel = 'TOTAL ($currency):'.padRight(15);
      String totalVal = _formatPrice(total).padLeft(12);

      await SunmiPrinter.setCustomFontSize(22);
      // ignore: deprecated_member_use
      await SunmiPrinter.setAlignment(SunmiPrintAlign.RIGHT);
      await SunmiPrinter.printText('$totalLabel$totalVal\n');

      await SunmiPrinter.setCustomFontSize(18);
      if (order['paymentMethod'] == 'cash') {
        double received = (order['amountReceived'] ?? 0.0).toDouble();
        double change = (order['changeAmount'] ?? 0.0).toDouble();
        
        // ignore: deprecated_member_use
        await SunmiPrinter.setAlignment(SunmiPrintAlign.RIGHT);
        await SunmiPrinter.printText('RECEIVED: ${_formatPrice(received)} $currency\n');
        // ignore: deprecated_member_use
        await SunmiPrinter.setAlignment(SunmiPrintAlign.RIGHT);
        await SunmiPrinter.printText('CHANGE: ${_formatPrice(change)} $currency\n');
      } else {
        String methodVal = (order['paymentMethod'] == 'bank' ? 'BANK' : 'OTHER');
        // ignore: deprecated_member_use
        await SunmiPrinter.setAlignment(SunmiPrintAlign.RIGHT);
        await SunmiPrinter.printText('PAYMENT METHOD: $methodVal\n');
      }

      await SunmiPrinter.printText('--------------------------------\n');
      
      // 5. Order Meta Info (ID, Staff, Date)
      await SunmiPrinter.setCustomFontSize(18);
      // ignore: deprecated_member_use
      await SunmiPrinter.setAlignment(SunmiPrintAlign.LEFT);
      if (showOrderNo) {
        await SunmiPrinter.printText('ORDER: #${order['id'].toString().substring(0, 8).toUpperCase()}\n');
      }
      if (showEmployee && order['userName'] != null) {
        await SunmiPrinter.printText('STAFF: ${order['userName']}\n');
      }
      
      String dateStr = order['date'] ?? DateTime.now().toString();
      DateTime orderDate;
      try {
        orderDate = DateTime.parse(dateStr);
      } catch (e) {
        orderDate = DateTime.now();
      }
      String formattedDate = DateFormat('dd/MM/yyyy HH:mm:ss').format(orderDate);
      
      if (showDate) {
        await SunmiPrinter.printText('DATE: $formattedDate\n');
      }
      await SunmiPrinter.printText('--------------------------------\n');

      if (showQR && qrData.isNotEmpty) {
        // ignore: deprecated_member_use
        await SunmiPrinter.setAlignment(SunmiPrintAlign.CENTER);
        await SunmiPrinter.printQRCode(qrData);
        await SunmiPrinter.lineWrap(1);
      }

      await SunmiPrinter.setCustomFontSize(18);
      await SunmiPrinter.lineWrap(1);
      await SunmiPrinter.printText(_centerText(footerText, width: 30) + '\n');
      await SunmiPrinter.printText(_centerText('Powered by iPOS PRO', width: 32) + '\n');
      
      await SunmiPrinter.lineWrap(75); // More space at the bottom for easy tearing
      print('PrinterService: Print job completed');
      
    } catch (e, stack) {
      print('Printing error: $e');
      print('Stack trace: $stack');
    }
  }

  // Helper to manually center text by adding spaces
  static String _centerText(String text, {int width = 31}) {
    if (text.length >= width) return text;
    int padding = (width - text.length) ~/ 2;
    return (' ' * padding) + text;
  }

  // Helper to process image for centering by padding it with white space
  static Uint8List _processImageForCentering(Uint8List bytes, {int targetWidth = 384}) {
    try {
      img.Image? originalImage = img.decodeImage(bytes);
      if (originalImage == null) return bytes;

      // If already wide enough, just return
      if (originalImage.width >= targetWidth) return bytes;

      // Create a white background canvas
      img.Image canvas = img.Image(width: targetWidth, height: originalImage.height);
      img.fill(canvas, color: img.ColorRgb8(255, 255, 255)); // White background

      // Calculate center position
      int xOffset = (targetWidth - originalImage.width) ~/ 2;

      // Draw original image onto canvas
      img.compositeImage(canvas, originalImage, dstX: xOffset, dstY: 0);

      // Encode back to bytes
      return Uint8List.fromList(img.encodePng(canvas));
    } catch (e) {
      print('PrinterService: Error processing image: $e');
      return bytes;
    }
  }

  static String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }
}
