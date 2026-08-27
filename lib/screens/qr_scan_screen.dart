import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'exam_webview_screen.dart';

class QRScanScreen extends StatefulWidget {
  const QRScanScreen({super.key});

  @override
  State<QRScanScreen> createState() => _QRScanScreenState();
}

class _QRScanScreenState extends State<QRScanScreen> {
  final MobileScannerController _scannerController = MobileScannerController();
  bool _isProcessing = false;

  void _handleBarcode(BarcodeCapture capture) {
    if (_isProcessing) return;
    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      if (barcode.rawValue != null && barcode.rawValue!.isNotEmpty) {
        _processScannedToken(barcode.rawValue!);
        break;
      }
    }
  }

  void _processScannedToken(String raw) {
    setState(() {
      _isProcessing = true;
    });

    try {
      String dataStr = raw;
      if (raw.startsWith('exambrowser://exam?data=')) {
        dataStr = raw.replaceFirst('exambrowser://exam?data=', '');
      }

      final decodedJsonStr = utf8.decode(base64.decode(dataStr));
      final Map<String, dynamic> data = json.decode(decodedJsonStr);

      final String url = data['u'] ?? data['url'] ?? '';
      final String title = data['t'] ?? data['title'] ?? 'Ujian Siswa';
      final int duration = data['d'] ?? data['duration'] ?? 90;
      final String pin = data['p'] ?? data['pin'] ?? '1234';
      final List<String> allowedDomains = (data['w'] ?? data['allowedDomains'] ?? [
        'docs.google.com',
        'forms.gle',
        'accounts.google.com'
      ]).cast<String>();
      final int maxViolations = data['m'] ?? data['maxViolations'] ?? 3;

      if (url.isEmpty) {
        throw Exception('URL Ujian tidak ditemukan dalam token.');
      }

      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => ExamWebViewScreen(
            examUrl: url,
            examTitle: title,
            durationMinutes: duration,
            adminPin: pin,
            allowedDomains: allowedDomains,
            maxViolations: maxViolations,
          ),
        ),
      ).then((_) {
        setState(() {
          _isProcessing = false;
        });
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: Colors.redAccent,
          content: Text('Format Barcode / Token Tidak Valid: \$e'),
        ),
      );
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() {
            _isProcessing = false;
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: const Text(
          'Scan Kartu Meja Ujian',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on),
            onPressed: () => _scannerController.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.flip_camera_android),
            onPressed: () => _scannerController.switchCamera(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _scannerController,
            onDetect: _handleBarcode,
          ),
          Center(
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFF6366F1), width: 3),
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A).withOpacity(0.9),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white12),
              ),
              child: const Text(
                'Arahkan kamera ke QR Code pada kartu peserta atau meja ujian untuk memulai sesi.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
