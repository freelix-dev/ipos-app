import 'dart:convert';
import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
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
      if (isBound == false) {
        print('PrinterService: Error - Printer binding failed');
        return;
      }

      await SunmiPrinter.initPrinter();
      await Future.delayed(const Duration(milliseconds: 500));

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
          print('PrinterService: Error decoding settings: $e');
        }
      }

      bool _parseBool(dynamic value, {bool defaultValue = true}) {
        if (value == null) return defaultValue;
        if (value is bool) return value;
        if (value is int) return value == 1;
        if (value is String) return value.toLowerCase() == 'true' || value == '1';
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
      final qrImageUrl = settings['qr_image_url']?.toString() ?? '';
      final logoPath = settings['logo_path']?.toString() ?? '';
      final baseFontSize = double.tryParse(settings['font_size']?.toString() ?? '24') ?? 24.0;

      String _fixUrl(String url) {
        if (url.isEmpty) return '';
        if (url.startsWith('http')) {
          if (url.contains('localhost') || url.contains('127.0.0.1')) {
            Uri baseUri = Uri.parse(ApiConfig.baseUrl);
            Uri imageUri = Uri.parse(url);
            return imageUri.replace(host: baseUri.host, port: baseUri.port).toString();
          }
          return url;
        }
        return '${ApiConfig.baseUrl}/${url.startsWith('/') ? url.substring(1) : url}';
      }

      await SunmiPrinter.lineWrap(1);

      // 1. Logo (Print as normal image)
      if (logoEnabled && logoPath.isNotEmpty) {
        try {
          String imageUrl = _fixUrl(logoPath);
          final res = await http.get(Uri.parse(imageUrl)).timeout(const Duration(seconds: 5));
          if (res.statusCode == 200) {
            Uint8List centered = _processImageForCentering(res.bodyBytes, targetWidth: 384);
            await SunmiPrinter.setAlignment(SunmiPrintAlign.LEFT);
            await SunmiPrinter.printImage(centered);
          }
        } catch (e) {
          print('Logo error: $e');
        }
      }

      // 2. Generate Receipt Content as Image (to overcome font size limitations)
      // We will build a list of text parts to draw
      final recorder = ui.PictureRecorder();
      final canvas = ui.Canvas(recorder);
      const double width = 384.0; // Standard 58mm printer width in pixels
      double currentY = 0.0;

      void drawText(String text, {double? fontSize, bool bold = false, ui.TextAlign align = ui.TextAlign.center}) {
        final textStyle = TextStyle(
          color: Colors.black,
          fontSize: fontSize ?? baseFontSize,
          fontWeight: bold ? FontWeight.bold : FontWeight.normal,
          fontFamily: 'NotoSansLao', // Ensuring Lao support if available
        );
        final textSpan = TextSpan(text: text, style: textStyle);
        final textPainter = TextPainter(
          text: textSpan,
          textAlign: align,
          textDirection: ui.TextDirection.ltr,
        );
        textPainter.layout(minWidth: width, maxWidth: width);
        textPainter.paint(canvas, Offset(0, currentY));
        currentY += textPainter.height + 2;
      }

      void drawDivider() {
        final paint = Paint()
          ..color = Colors.black
          ..strokeWidth = 1.0;
        canvas.drawLine(Offset(0, currentY + 5), Offset(width, currentY + 5), paint);
        currentY += 15;
      }

      // Build Canvas Content
      drawText(shopName, fontSize: baseFontSize, bold: true);
      if (showAddress && shopAddress.isNotEmpty) drawText(shopAddress, fontSize: baseFontSize);
      if (showPhone && shopPhone.isNotEmpty) drawText('ໂທ: $shopPhone', fontSize: baseFontSize);
      drawDivider();

      if (headerText.isNotEmpty) {
        drawText(headerText);
        drawDivider();
      }

      // Items
      String currency = order['currency'] ?? 'LAK';
      if (order['itemsJson'] != null && order['itemsJson'].toString().isNotEmpty && order['itemsJson'] != 'null') {
        final decodedItems = json.decode(order['itemsJson']);
        if (decodedItems is List) {
          for (var item in decodedItems) {
            String name = item['name'] ?? '';
            int qty = item['quantity'] ?? 0;
            double price = (item['price'] ?? 0.0).toDouble();
            double totalItem = price * qty;
            
            drawText(name, align: ui.TextAlign.left, bold: true);
            drawText('x$qty   ${_formatPrice(totalItem)} $currency', align: ui.TextAlign.right);
            currentY += 5;
          }
        }
      }
      drawDivider();

      // Summary
      double total = (order['total'] ?? 0.0).toDouble();
      double vatAmount = (order['vat_amount'] ?? 0.0).toDouble();
      double vatRate = (order['vat_rate'] ?? 0.0).toDouble();
      double subtotal = total - vatAmount;

      if (vatAmount > 0) {
        drawText('ລວມ: ${_formatPrice(subtotal)} $currency', align: ui.TextAlign.left);
        drawText('ອາກອນ ($vatRate%): ${_formatPrice(vatAmount)} $currency', align: ui.TextAlign.left);
      }
      drawText('ລວມທັງໝົດ: ${_formatPrice(total)} $currency', fontSize: baseFontSize, bold: true, align: ui.TextAlign.left);
      currentY += 10;

      if (order['paymentMethod'] == 'cash') {
        double received = (order['amountReceived'] ?? 0.0).toDouble();
        double change = (order['changeAmount'] ?? 0.0).toDouble();
        drawText('ຮັບເງິນ: ${_formatPrice(received)} $currency', align: ui.TextAlign.left);
        drawText('ເງິນທອນ: ${_formatPrice(change)} $currency', align: ui.TextAlign.left);
      } else {
        String methodVal = (order['paymentMethod'] == 'bank' ? 'ໂອນເງິນ' : 'ອື່ນໆ');
        drawText('ວິທີຊໍາລະ: $methodVal', align: ui.TextAlign.left);
      }
      drawDivider();

      // Meta
      if (showOrderNo) drawText('ເລກທີບິນ: #${order['id'].toString().substring(0, 8).toUpperCase()}', align: ui.TextAlign.left, fontSize: baseFontSize);
      if (showEmployee && order['userName'] != null) drawText('ພະນັກງານ: ${order['userName']}', align: ui.TextAlign.left, fontSize: baseFontSize);
      if (showDate) {
        String dateStr = order['date'] ?? DateTime.now().toString();
        DateTime orderDate = DateTime.tryParse(dateStr) ?? DateTime.now();
        String formattedDate = DateFormat('dd/MM/yyyy HH:mm:ss').format(orderDate);
        drawText('ວັນທີ: $formattedDate', align: ui.TextAlign.left, fontSize: baseFontSize);
      }
      currentY += 20;

      // Convert Canvas to Image
      final picture = recorder.endRecording();
      final imgUi = await picture.toImage(width.toInt(), currentY.toInt());
      final byteData = await imgUi.toByteData(format: ui.ImageByteFormat.png);
      if (byteData != null) {
        final receiptBytes = byteData.buffer.asUint8List();
        await SunmiPrinter.setAlignment(SunmiPrintAlign.LEFT);
        await SunmiPrinter.printImage(receiptBytes);
      }

      // 6. QR (Printed separately to keep quality)
      if (showQR && qrImageUrl.isNotEmpty) {
        try {
          String fullQrUrl = _fixUrl(qrImageUrl);
          final res = await http.get(Uri.parse(fullQrUrl)).timeout(const Duration(seconds: 5));
          if (res.statusCode == 200) {
            Uint8List centered = _processImageForCentering(res.bodyBytes, targetWidth: 384);
            await SunmiPrinter.printImage(centered);
          }
        } catch (e) {
          print('QR error: $e');
        }
      }

      // 7. Footer
      await SunmiPrinter.lineWrap(1);
      final footerRecorder = ui.PictureRecorder();
      final footerCanvas = ui.Canvas(footerRecorder);
      double footerY = 0.0;
      
      final footerTextPainter = TextPainter(
        text: TextSpan(text: footerText.trim().isEmpty ? 'ຂອບໃຈທີ່ໃຊ້ບໍລິການ' : footerText, style: TextStyle(color: Colors.black, fontSize: baseFontSize)),
        textAlign: ui.TextAlign.center,
        textDirection: ui.TextDirection.ltr,
      );
      footerTextPainter.layout(minWidth: width, maxWidth: width);
      footerTextPainter.paint(footerCanvas, Offset(0, footerY));
      footerY += footerTextPainter.height + 10;
      
      final iposPainter = TextPainter(
        text: TextSpan(text: 'ສ້າງໂດຍ iPOS PRO', style: TextStyle(color: Colors.black, fontSize: baseFontSize)),
        textAlign: ui.TextAlign.center,
        textDirection: ui.TextDirection.ltr,
      );
      iposPainter.layout(minWidth: width, maxWidth: width);
      iposPainter.paint(footerCanvas, Offset(0, footerY));
      footerY += iposPainter.height + 10;

      final footerImg = await footerRecorder.endRecording().toImage(width.toInt(), footerY.toInt());
      final footerData = await footerImg.toByteData(format: ui.ImageByteFormat.png);
      if (footerData != null) {
        await SunmiPrinter.printImage(footerData.buffer.asUint8List());
      }

      await SunmiPrinter.lineWrap(80);
      print('PrinterService: Image Print completed');
    } catch (e, stack) {
      print('Printing error: $e');
      print('Stack trace: $stack');
    }
  }

  static Uint8List _processImageForCentering(Uint8List bytes, {int targetWidth = 384}) {
    try {
      img.Image? originalImage = img.decodeImage(bytes);
      if (originalImage == null) return bytes;
      if (originalImage.width >= targetWidth) return bytes;
      img.Image canvas = img.Image(width: targetWidth, height: originalImage.height);
      img.fill(canvas, color: img.ColorRgb8(255, 255, 255));
      int xOffset = (targetWidth - originalImage.width) ~/ 2;
      img.compositeImage(canvas, originalImage, dstX: xOffset, dstY: 0);
      return Uint8List.fromList(img.encodeJpg(canvas, quality: 100));
    } catch (e) {
      print('Image process error: $e');
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
