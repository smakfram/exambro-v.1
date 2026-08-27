import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/qr_scan_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set default preferred orientation
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  runApp(const SecureExamApp());
}

class SecureExamApp extends StatelessWidget {
  const SecureExamApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Secure ExamBrowser',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF020617),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6366F1),
          secondary: Color(0xFF10B981),
          surface: Color(0xFF0F172A),
        ),
        useMaterial3: true,
      ),
      home: const QRScanScreen(),
    );
  }
}
