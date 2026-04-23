import 'package:flutter/material.dart';
import 'package:ipos/login_screen.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'iPOS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF76A258)),
        useMaterial3: true,
        textTheme: GoogleFonts.notoSansLaoTextTheme(),
      ),
      home: const LoginScreen(),
    );
  }
}


