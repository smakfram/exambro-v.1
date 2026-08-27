import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import '../services/security_service.dart';
import '../widgets/admin_exit_dialog.dart';

class ExamWebViewScreen extends StatefulWidget {
  final String examUrl;
  final String examTitle;
  final int durationMinutes;
  final String adminPin;
  final List<String> allowedDomains;
  final int maxViolations;

  const ExamWebViewScreen({
    super.key,
    required this.examUrl,
    required this.examTitle,
    required this.durationMinutes,
    required this.adminPin,
    required this.allowedDomains,
    this.maxViolations = 3,
  });

  @override
  State<ExamWebViewScreen> createState() => _ExamWebViewScreenState();
}

class _ExamWebViewScreenState extends State<ExamWebViewScreen> with WidgetsBindingObserver {
  InAppWebViewController? _webViewController;
  final SecurityService _securityService = SecurityService();

  int _violationCount = 0;
  late int _remainingSeconds;
  Timer? _countdownTimer;
  bool _isTerminated = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _remainingSeconds = widget.durationMinutes * 60;
    
    // Aktifkan mode proteksi ketat Kiosk
    _securityService.enableExamSecurity();
    _startTimer();
  }

  void _startTimer() {
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() {
          _remainingSeconds--;
        });
      } else {
        _countdownTimer?.cancel();
        _handleTimeExpired();
      }
    });
  }

  void _handleTimeExpired() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        title: const Text('Waktu Ujian Habis', style: TextStyle(color: Colors.redAccent)),
        content: const Text(
          'Waktu pengerjaan telah berakhir. Silakan serahkan perangkat kepada pengawas ujian.',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => _showAdminExitDialog(),
            child: const Text('Buka Kunci (Pengawas)'),
          ),
        ],
      ),
    );
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_isTerminated) return;

    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      _handleViolation('Meninggalkan aplikasi / Membuka notifikasi / Split screen');
    }
  }

  void _handleViolation(String reason) {
    setState(() {
      _violationCount++;
    });

    if (_violationCount >= widget.maxViolations) {
      _terminateExamSession();
    } else {
      _showViolationWarning(reason);
    }
  }

  void _showViolationWarning(String reason) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1B4B),
        title: Row(
          children: const [
            Icon(Icons.warning_amber_rounded, color: Colors.amber),
            SizedBox(width: 8),
            Text('Peringatan Pelanggaran!', style: TextStyle(color: Colors.white, fontSize: 16)),
          ],
        ),
        content: Text(
          'Terdeteksi: $reason\n\nPelanggaran: $_violationCount dari ${widget.maxViolations}.\nJika mencapai batas, ujian akan otomatis TERKUNCI PERMANEN.',
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo),
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Saya Mengerti & Kembali Ujian'),
          ),
        ],
      ),
    );
  }

  void _terminateExamSession() {
    _isTerminated = true;
    _countdownTimer?.cancel();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF450A0A),
        title: const Text('SESI UJIAN DIBLOKIR!', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
        content: const Text(
          'Anda telah mencapai batas maksimal 3x pelanggaran keamanan.\n\nAplikasi terkunci. Panggil Pengawas Ruangan untuk membuka kunci dengan PIN Admin.',
          style: TextStyle(color: Colors.white),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () => _showAdminExitDialog(),
            child: const Text('Buka Kunci Pengawas'),
          ),
        ],
      ),
    );
  }

  void _showAdminExitDialog() async {
    final success = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AdminExitDialog(correctPin: widget.adminPin),
    );

    if (success == true) {
      await _securityService.disableExamSecurity();
      if (mounted) {
        Navigator.of(context).pop(); // Exit back to QR scan
      }
    }
  }

  bool _isDomainAllowed(String url) {
    final uri = Uri.tryParse(url);
    if (uri == null || uri.host.isEmpty) return false;

    for (final domain in widget.allowedDomains) {
      if (uri.host == domain || uri.host.endsWith('.$domain')) {
        return true;
      }
    }
    return false;
  }

  String _formatTime(int totalSecs) {
    final m = totalSecs ~/ 60;
    final s = totalSecs % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _countdownTimer?.cancel();
    _securityService.disableExamSecurity();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        _showAdminExitDialog();
        return false;
      },
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          backgroundColor: const Color(0xFF0F172A),
          title: Row(
            children: [
              const Icon(Icons.shield, color: Colors.greenAccent, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  widget.examTitle,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          actions: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              margin: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: Colors.indigo.withOpacity(0.3),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.indigoAccent.withOpacity(0.5)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.timer_outlined, size: 16, color: Colors.indigoAccent),
                  const SizedBox(width: 4),
                  Text(
                    _formatTime(_remainingSeconds),
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.lock_outline, color: Colors.amberAccent),
              tooltip: 'Keluar (Pengawas)',
              onPressed: _showAdminExitDialog,
            ),
          ],
        ),
        body: InAppWebView(
          initialUrlRequest: URLRequest(url: WebUri(widget.examUrl)),
          initialSettings: InAppWebViewSettings(
            javaScriptEnabled: true,
            supportZoom: true,
            builtInZoomControls: true,
            displayZoomControls: false,
            allowsBackForwardNavigationGestures: false,
            useShouldOverrideUrlLoading: true,
            cacheEnabled: true,
            safeBrowsingEnabled: true,
          ),
          onWebViewCreated: (controller) {
            _webViewController = controller;
          },
          shouldOverrideUrlLoading: (controller, navigationAction) async {
            final uri = navigationAction.request.url;
            if (uri != null) {
              if (!_isDomainAllowed(uri.toString())) {
                _handleViolation('Mencoba membuka link terlarang: \${uri.host}');
                return NavigationActionPolicy.CANCEL;
              }
            }
            return NavigationActionPolicy.ALLOW;
          },
        ),
      ),
    );
  }
}
