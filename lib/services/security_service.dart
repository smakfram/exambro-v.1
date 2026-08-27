import 'dart:async';
import 'dart:io';
import 'package:flutter/services.dart';
import 'package:flutter_windowmanager/flutter_windowmanager.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

class SecurityService {
  static final SecurityService _instance = SecurityService._internal();
  factory SecurityService() => _instance;
  SecurityService._internal();

  static const MethodChannel _kioskChannel = MethodChannel('com.school.exambrowser/kiosk');
  Timer? _clipboardClearTimer;

  /// Inisialisasi proteksi perangkat saat ujian dimulai
  Future<void> enableExamSecurity() async {
    // 1. Mencegah layar mati saat ujian berlangsung
    await WakelockPlus.enable();

    // 2. Android: Aktifkan FLAG_SECURE (Blokir Screenshot, Screen Record, Mirroring)
    if (Platform.isAndroid) {
      await FlutterWindowManager.addFlags(FlutterWindowManager.FLAG_SECURE);
      await FlutterWindowManager.addFlags(FlutterWindowManager.FLAG_KEEP_SCREEN_ON);
      
      try {
        await _kioskChannel.invokeMethod('startLockTask');
      } catch (e) {
        // Fallback jika device bukan Device Owner
      }
    }

    // 3. Masuk Fullscreen Immersive Mode (Sembunyikan Nav Bar & Status Bar)
    await SystemChrome.setEnabledSystemUIMode(
      SystemUiMode.immersiveSticky,
      overlays: [],
    );

    // 4. Kunci orientasi layar ke Portrait
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    // 5. Background Clipboard Purge (Menghapus isi clipboard berkala)
    _startClipboardPurge();
  }

  /// Menonaktifkan proteksi saat ujian diselesaikan dengan Password Admin
  Future<void> disableExamSecurity() async {
    _clipboardClearTimer?.cancel();
    await WakelockPlus.disable();

    if (Platform.isAndroid) {
      await FlutterWindowManager.clearFlags(FlutterWindowManager.FLAG_SECURE);
      try {
        await _kioskChannel.invokeMethod('stopLockTask');
      } catch (e) {
        // Ignore
      }
    }

    // Kembalikan UI System normal
    await SystemChrome.setEnabledSystemUIMode(
      SystemUiMode.manual,
      overlays: SystemUiOverlay.values,
    );

    await SystemChrome.setPreferredOrientations(DeviceOrientation.values);
    await Clipboard.setData(const ClipboardData(text: ''));
  }

  void _startClipboardPurge() {
    _clipboardClearTimer?.cancel();
    _clipboardClearTimer = Timer.periodic(const Duration(seconds: 2), (timer) async {
      final data = await Clipboard.getData(Clipboard.kTextPlain);
      if (data?.text != null && data!.text!.isNotEmpty) {
        await Clipboard.setData(const ClipboardData(text: ''));
      }
    });
  }
}
