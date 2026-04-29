import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:ipos/api_config.dart';
import 'package:ipos/login_screen.dart';
// import 'package:package_info_plus/package_info_plus.dart'; // Temporarily disabled

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  String statusMessage = "Initializing system...";
  bool hasError = false;

  @override
  void initState() {
    super.initState();
    _checkAppStatus();
  }

  Future<void> _checkAppStatus() async {
    try {
      final response = await http.get(Uri.parse(ApiConfig.appConfigUrl));
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> config = jsonDecode(response.body);
        
        // 1. Check Maintenance Mode
        if (config['maintenance_mode'] == 'true') {
          _showMaintenanceDialog(config['maintenance_message'] ?? "System is under maintenance.");
          return;
        }

        // 2. Check Force Update
        // Note: Using hardcoded current version for now since I can't run flutter pub get easily here
        const String currentAppVersion = "1.0.0"; 
        final String minVersion = config['app_min_version'] ?? "1.0.0";
        final bool forceUpdate = config['force_update'] == 'true';

        if (_isVersionOlder(currentAppVersion, minVersion) && forceUpdate) {
          _showUpdateDialog();
          return;
        }

        // All good, proceed to Login
        _navigateToLogin();
      } else {
        setState(() {
          hasError = true;
          statusMessage = "Unable to reach server. Please check connection.";
        });
      }
    } catch (e) {
      setState(() {
        hasError = true;
        statusMessage = "Connection Error: $e";
      });
    }
  }

  bool _isVersionOlder(String current, String minimum) {
    List<int> currentParts = current.split('.').map(int.parse).toList();
    List<int> minParts = minimum.split('.').map(int.parse).toList();
    
    for (int i = 0; i < 3; i++) {
      if (currentParts[i] < minParts[i]) return true;
      if (currentParts[i] > minParts[i]) return false;
    }
    return false;
  }

  void _showMaintenanceDialog(String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.engineering, color: Colors.orange),
            SizedBox(width: 10),
            Text("Maintenance Mode"),
          ],
        ),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => _checkAppStatus(),
            child: const Text("RETRY"),
          )
        ],
      ),
    );
  }

  void _showUpdateDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.system_update, color: Colors.blue),
            SizedBox(width: 10),
            Text("Update Required"),
          ],
        ),
        content: const Text("A newer version of iPOS PRO is available. Please update to continue using the app."),
        actions: [
          TextButton(
            onPressed: () {
              // Normally launch App Store / Play Store URL
            },
            child: const Text("UPDATE NOW"),
          )
        ],
      ),
    );
  }

  void _navigateToLogin() {
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const LoginScreen()),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF10B981),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.shopping_cart_rounded, size: 80, color: Colors.white),
            const SizedBox(height: 24),
            const Text(
              "iPOS PRO",
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 48),
            if (!hasError)
              const CircularProgressIndicator(color: Colors.white)
            else
              const Icon(Icons.cloud_off, color: Colors.white, size: 48),
            const SizedBox(height: 24),
            Text(
              statusMessage,
              style: const TextStyle(color: Colors.white70, fontSize: 16),
            ),
            if (hasError)
              Padding(
                padding: const EdgeInsets.only(top: 20),
                child: ElevatedButton(
                  onPressed: () {
                    setState(() {
                      hasError = false;
                      statusMessage = "Retrying connection...";
                    });
                    _checkAppStatus();
                  },
                  child: const Text("RETRY CONNECTION"),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
