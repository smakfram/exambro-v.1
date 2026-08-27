import { CodeSnippetItem } from '../types';

export const CODE_SNIPPETS: CodeSnippetItem[] = [
  // ==========================================
  // FLUTTER MOBILE
  // ==========================================
  {
    id: 'flutter-security-service',
    filename: 'lib/services/security_service.dart',
    language: 'dart',
    platform: 'Flutter (Android/iOS)',
    category: 'Security Core',
    description: 'Service utama untuk mengunci layar, mengaktifkan FLAG_SECURE (anti-screenshot/recording), memantau siklus hidup aplikasi (loss of focus), dan membersihkan clipboard berkala.',
    code: `import 'dart:async';
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
      
      // Request Android Lock Task Mode (Kiosk Mode)
      try {
        await _kioskChannel.invokeMethod('startLockTask');
      } catch (e) {
        print('Kiosk Mode Error: \$e');
      }
    }

    // 3. Masuk Fullscreen Immersive Mode (Sembunyikan Nav Bar & Status Bar)
    await SystemChrome.setEnabledSystemUIMode(
      SystemUiMode.immersiveSticky,
      overlays: [],
    );

    // 4. Kunci orientasi layar ke Portrait (atau Landscape sesuai kebutuhan)
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    // 5. Background Clipboard Purge (Menghapus isi clipboard tiap 2 detik)
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
        print('Stop Kiosk Error: \$e');
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
}`
  },
  {
    id: 'flutter-exam-screen',
    filename: 'lib/screens/exam_webview_screen.dart',
    language: 'dart',
    platform: 'Flutter (Android/iOS)',
    category: 'WebView & Anti-Cheating',
    description: 'Implementasi InAppWebView dengan whitelist Google Form & Google Accounts, pelindung navigasi, dan penghitung pelanggaran (3-strike system).',
    code: `import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import '../services/security_service.dart';
import '../widgets/admin_exit_dialog.dart';

class ExamWebViewScreen extends StatefulWidget {
  final String examUrl;
  final int durationMinutes;
  final String adminPin;

  const ExamWebViewScreen({
    Key? key,
    required this.examUrl,
    required this.durationMinutes,
    required this.adminPin,
  }) : super(key: key);

  @override
  State<ExamWebViewScreen> createState() => _ExamWebViewScreenState();
}

class _ExamWebViewScreenState extends State<ExamWebViewScreen> with WidgetsBindingObserver {
  InAppWebViewController? _webViewController;
  final SecurityService _securityService = SecurityService();

  int _violationCount = 0;
  static const int _maxViolations = 3;
  late int _remainingSeconds;
  Timer? _countdownTimer;
  bool _isTerminated = false;

  // Daftar domain yang diizinkan (Whitelist Google Form & Google Login)
  final List<String> _allowedDomains = [
    'docs.google.com',
    'forms.gle',
    'accounts.google.com',
    'accounts.youtube.com',
    'ssl.gstatic.com',
    'apis.google.com',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _remainingSeconds = widget.durationMinutes * 60;
    _securityService.enableExamSecurity();
    _startTimer();
  }

  void _startTimer() {
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() => _remainingSeconds--);
      } else {
        _countdownTimer?.cancel();
        _handleTimeUpAutoSubmit();
      }
    });
  }

  /// DETEKSI KEHILANGAN FOKUS (Aplikasi di-minimize / pindah aplikasi / split screen)
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_isTerminated) return;

    if (state == AppLifecycleState.paused || 
        state == AppLifecycleState.inactive || 
        state == AppLifecycleState.hidden) {
      _handleSecurityViolation("Aplikasi kehilangan fokus atau dialihkan.");
    }
  }

  void _handleSecurityViolation(String reason) {
    setState(() {
      _violationCount++;
    });

    if (_violationCount >= _maxViolations) {
      _isTerminated = true;
      _countdownTimer?.cancel();
      _showLockoutDialog();
    } else {
      _showViolationWarning(reason);
    }
  }

  void _showViolationWarning(String reason) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.red.shade900,
        title: const Text('⚠️ PERINGATAN KECURANGAN', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          '\$reason\\n\\nPelanggaran ke-\$_violationCount dari \$_maxViolations batas maksimal.\\n'
          'Jika mencapai \$_maxViolations kali, ujian Anda akan otomatis dikunci & disubmit!',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber),
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Saya Mengerti & Kembali Ujian', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showLockoutDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.black87,
        title: const Text('⛔ UJIAN DIKUNCI', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
        content: const Text(
          'Anda telah melanggar aturan ujian sebanyak 3 kali.\\n'
          'Sistem telah mengunci pengerjaan. Hubungi Pengawas Ruang untuk membuka kunci.',
          style: TextStyle(color: Colors.white),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => _openAdminUnlock(),
            child: const Text('Buka Kunci Pengawas'),
          ),
        ],
      ),
    );
  }

  void _openAdminUnlock() async {
    final success = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AdminExitDialog(correctPin: widget.adminPin),
    );

    if (success == true) {
      await _securityService.disableExamSecurity();
      // Bersihkan cache dan cookies sebelum keluar
      await InAppWebViewController.clearAllCache();
      CookieManager.instance().deleteAllCookies();
      if (mounted) Navigator.of(context).pop();
    }
  }

  void _handleTimeUpAutoSubmit() {
    // Injeksi submit form jika waktu habis
    _webViewController?.evaluateJavascript(source: """
      const submitBtn = document.querySelector('div[role="button"][jsname="M2UYVb"]');
      if (submitBtn) submitBtn.click();
    """);
  }

  bool _isUrlAllowed(String url) {
    try {
      final uri = Uri.parse(url);
      return _allowedDomains.any((domain) => uri.host == domain || uri.host.endsWith('.\$domain'));
    } catch (_) {
      return false;
    }
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
    final minutes = (_remainingSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (_remainingSeconds % 60).toString().padLeft(2, '0');

    return WillPopScope(
      onWillPop: () async => false, // Blokir tombol Back fisik
      child: Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              // Header Status Bar
              Container(
                color: Colors.indigo.shade900,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.lock, color: Colors.greenAccent, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          'Sisa Waktu: \$minutes:\$seconds',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _violationCount == 0 ? Colors.green.shade700 : Colors.red.shade700,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'Pelanggaran: \$_violationCount/\$_maxViolations',
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.exit_to_app, color: Colors.amber),
                      tooltip: 'Keluar Ujian (Pengawas)',
                      onPressed: _openAdminUnlock,
                    ),
                  ],
                ),
              ),

              // Embedded Secure WebView
              Expanded(
                child: InAppWebView(
                  initialUrlRequest: URLRequest(url: WebUri(widget.examUrl)),
                  initialSettings: InAppWebViewSettings(
                    useShouldOverrideUrlLoading: true,
                    javaScriptEnabled: true,
                    disableContextMenu: true, // Nonaktifkan klik kanan/long press
                    supportZoom: true,
                    clearCache: true,
                    cacheEnabled: false,
                    allowsBackForwardNavigationGestures: false,
                  ),
                  onWebViewCreated: (controller) {
                    _webViewController = controller;
                  },
                  shouldOverrideUrlLoading: (controller, navigationAction) async {
                    final uri = navigationAction.request.url;
                    if (uri != null && _isUrlAllowed(uri.toString())) {
                      return NavigationActionPolicy.ALLOW;
                    }
                    // Blokir jika mencoba membuka situs di luar whitelist
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Akses situs web luar diblokir demi keamanan ujian!'),
                        backgroundColor: Colors.red,
                      ),
                    );
                    return NavigationActionPolicy.CANCEL;
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`
  },
  {
    id: 'android-native-main-activity',
    filename: 'android/app/src/main/kotlin/.../MainActivity.kt',
    language: 'kotlin',
    platform: 'Android Native',
    category: 'Native Security Bridge',
    description: 'Kotlin bridge untuk menerapkan FLAG_SECURE di window Android & mengaktifkan Lock Task Mode.',
    code: `package com.school.exambrowser

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.school.exambrowser/kiosk"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Kunci FLAG_SECURE sejak aktivitas pertama kali dibuka
        window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "startLockTask" -> {
                    try {
                        startLockTask() // Kiosk Pinning Mode
                        result.success(true)
                    } catch (e: Exception) {
                        result.error("LOCK_TASK_FAILED", e.message, null)
                    }
                }
                "stopLockTask" -> {
                    try {
                        stopLockTask()
                        result.success(true)
                    } catch (e: Exception) {
                        result.error("STOP_LOCK_FAILED", e.message, null)
                    }
                }
                else -> result.notImplemented()
            }
        }
    }
}`
  },
  {
    id: 'android-manifest-config',
    filename: 'android/app/src/main/AndroidManifest.xml',
    language: 'xml',
    platform: 'Android Native',
    category: 'Manifest Configuration',
    description: 'Konfigurasi AndroidManifest untuk Lock Task Mode (Kiosk), penonaktifkan multi-window, dan pencegahan overlay screenshot.',
    code: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.school.exambrowser">

    <!-- Izin Internet dan Kamera (untuk Scan QR Code Token Ujian) -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.REORDER_TASKS" />

    <application
        android:label="Secure ExamBrowser"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:hardwareAccelerated="true"
        android:allowBackup="false">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize"
            
            <!-- PENTING: Mencegah Split Screen & Multi-Window -->
            android:resizeableActivity="false"
            
            <!-- PENTING: Mengunci aplikasi ke Lock Task Mode otomatis jika Device Owner diset -->
            android:lockTaskMode="always"
            android:screenOrientation="portrait">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
                <!-- Jadikan Home Kiosk Launcher jika diperlukan -->
                <category android:name="android.intent.category.HOME" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>

        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>`
  },

  // ==========================================
  // ELECTRON DESKTOP (WINDOWS & MACOS)
  // ==========================================
  {
    id: 'electron-main-js',
    filename: 'desktop/src/main.js',
    language: 'javascript',
    platform: 'Electron (Desktop)',
    category: 'Kiosk & OS Interception',
    description: 'Core Electron Main Process: Kiosk mode, memblokir Alt+Tab, Windows Key, Task Manager, DevTools, dan membatasi akses URL hanya ke Google Forms.',
    code: `const { app, BrowserWindow, globalShortcut, ipcMain, session, Menu } = require('electron');
const path = require('path');

let mainWindow = null;
const ALLOWED_DOMAINS = [
  'docs.google.com',
  'forms.gle',
  'accounts.google.com',
  'accounts.youtube.com',
  'ssl.gstatic.com',
  'apis.google.com'
];

function isUrlAllowed(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return ALLOWED_DOMAINS.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d));
  } catch (e) {
    return false;
  }
}

function createKioskWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: true,
    kiosk: true, // Mengunci Window ke Kiosk Mode bawaan OS
    alwaysOnTop: true, // Selalu di atas window lain
    frame: false, // Hilangkan title bar & border
    skipTaskbar: true, // Jangan tampilkan di taskbar
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: false, // Cegah Alt+F4 default
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: false, // Matikan Inspect Element
      spellcheck: false,
    }
  });

  // Hapus menu navigasi atas (File, Edit, View, Help)
  Menu.setApplicationMenu(null);

  // Load UI Launcher / Exam Container
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 1. Blokir DevTools & Inspect Element
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });

  // 2. Blokir Klik Kanan (Context Menu)
  mainWindow.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  // 3. Batasi Navigasi URL (HANYA Google Form & Google Auth)
  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    if (!isUrlAllowed(targetUrl)) {
      event.preventDefault();
      mainWindow.webContents.send('security-alert', 'Navigasi diblokir: Akses keluar Google Form dilarang.');
    }
  });

  // 4. Cegah pembukaan Window Baru (target="_blank" / window.open)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isUrlAllowed(url)) {
      mainWindow.loadURL(url); // Buka di window yang sama
    }
    return { action: 'deny' };
  });

  // 5. Pantau jika Window kehilangan fokus (Blur Event)
  mainWindow.on('blur', () => {
    mainWindow.webContents.send('window-blur-detected');
    mainWindow.focus(); // Paksa kembali fokus
  });
}

// Registrasi pemblokiran Shortcut Keyboard Berbahaya
function registerSecurityShortcuts() {
  const blockedKeys = [
    'Alt+Tab',
    'Alt+F4',
    'CommandOrControl+R',
    'CommandOrControl+Shift+R',
    'F5',
    'F11',
    'F12',
    'CommandOrControl+Shift+I', // DevTools
    'CommandOrControl+Shift+J',
    'CommandOrControl+U',       // View Source
    'CommandOrControl+N',       // New Window
    'CommandOrControl+T',       // New Tab
    'CommandOrControl+W',       // Close Tab
    'CommandOrControl+P',       // Print
    'CommandOrControl+S',       // Save Page
    'CommandOrControl+H',       // macOS Hide
    'CommandOrControl+M',       // macOS Minimize
    'CommandOrControl+Q',       // macOS Quit
  ];

  blockedKeys.forEach((shortcut) => {
    try {
      globalShortcut.register(shortcut, () => {
        mainWindow?.webContents.send('security-alert', \`Tombol Shortcut \${shortcut} dinonaktifkan!\`);
      });
    } catch (e) {
      console.warn(\`Failed to register \${shortcut}\`, e);
    }
  });
}

app.whenReady().then(() => {
  createKioskWindow();
  registerSecurityShortcuts();
});

// IPC Handler untuk Verifikasi Keluar oleh Pengawas
ipcMain.handle('verify-admin-exit', async (event, enteredPin) => {
  const ADMIN_PIN = "FRATERAN2026"; // Sesuaikan dengan config terenkripsi sekolah
  if (enteredPin === ADMIN_PIN) {
    // 1. Bersihkan seluruh Cache, Cookies, dan Session Storage
    await session.defaultSession.clearStorageData();
    await session.defaultSession.clearCache();
    await session.defaultSession.clearAuthCache();

    // 2. Lepaskan semua shortcut lock
    globalShortcut.unregisterAll();

    // 3. Keluar dari aplikasi
    app.exit(0);
    return true;
  }
  return false;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});`
  },
  {
    id: 'electron-preload-js',
    filename: 'desktop/src/preload.js',
    language: 'javascript',
    platform: 'Electron (Desktop)',
    category: 'Secure IPC Bridge',
    description: 'Preload script dengan contextBridge aman untuk menghubungkan Renderer UI dengan Node Process tanpa membocorkan akses OS.',
    code: `const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('secureExamAPI', {
  // Verifikasi PIN pengawas untuk keluar aplikasi
  verifyAdminExit: (pin) => ipcRenderer.invoke('verify-admin-exit', pin),

  // Listener event keamanan dari Main Process
  onWindowBlur: (callback) => ipcRenderer.on('window-blur-detected', () => callback()),
  onSecurityAlert: (callback) => ipcRenderer.on('security-alert', (event, msg) => callback(msg)),

  // Request pembersihan listener
  removeListeners: () => {
    ipcRenderer.removeAllListeners('window-blur-detected');
    ipcRenderer.removeAllListeners('security-alert');
  }
});`
  },
  {
    id: 'windows-registry-lockdown',
    filename: 'scripts/windows_lockdown_kiosk.bat',
    language: 'batch',
    platform: 'System Config',
    category: 'Windows Group Policy',
    description: 'Script Batch / Registry Windows untuk memblokir Task Manager (Ctrl+Alt+Del), Lock Workstation, dan Switch User saat ujian lab komputer.',
    code: `@echo off
:: ==========================================================
:: SECURE EXAMBROWSER - WINDOWS DESKTOP LOCKDOWN SCRIPT
:: Jalankan sebagai Administrator pada PC Lab Sekolah
:: ==========================================================

echo [1/3] Memblokir Task Manager (Disable Ctrl+Alt+Del TaskMgr)...
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v "DisableTaskMgr" /t REG_DWORD /d 1 /f

echo [2/3] Memblokir Lock Workstation (Disable Windows+L)...
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v "DisableLockWorkstation" /t REG_DWORD /d 1 /f

echo [3/3] Memblokir Switch User & Logout Options...
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v "NoLogoff" /t REG_DWORD /d 1 /f
reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v "NoClose" /t REG_DWORD /d 1 /f

echo [INFO] Registry Berhasil Diterapkan. Sistem Siap Menjalankan Secure ExamBrowser!
pause`
  },
  {
    id: 'ios-guided-access-config',
    filename: 'ios/Runner/AppDelegate.swift',
    language: 'swift',
    platform: 'iOS Native',
    category: 'iOS Guided Access & Screen Blur',
    description: 'Swift delegate untuk mendeteksi Screen Recording/AirPlay Mirroring pada iOS & mengaburkan tampilan secara instan.',
    code: `import UIKit
import Flutter

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  private var blurEffectView: UIVisualEffectView?

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GeneratedPluginRegistrant.register(with: self)

    // 1. Pantau Screen Recording & Screen Mirroring (AirPlay)
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(screenCaptureChanged),
      name: UIScreen.capturedDidChangeNotification,
      object: nil
    )

    // 2. Pantau saat aplikasi berpindah ke background (App Switcher)
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(appWillResignActive),
      name: UIApplication.willResignActiveNotification,
      object: nil
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(appDidBecomeActive),
      name: UIApplication.didBecomeActiveNotification,
      object: nil
    )

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  @objc func screenCaptureChanged() {
    if UIScreen.main.isCaptured {
      // Jika terdeteksi screen record atau kabel HDMI/AirPlay, tampilkan layar hitam/blur
      applyScreenShield()
    } else {
      removeScreenShield()
    }
  }

  @objc func appWillResignActive() {
    applyScreenShield()
  }

  @objc func appDidBecomeActive() {
    if !UIScreen.main.isCaptured {
      removeScreenShield()
    }
  }

  private func applyScreenShield() {
    guard blurEffectView == null, let window = self.window else { return }
    let blurEffect = UIBlurEffect(style: .extraDark)
    let blurView = UIVisualEffectView(effect: blurEffect)
    blurView.frame = window.bounds
    blurView.tag = 999
    window.addSubview(blurView)
    self.blurEffectView = blurView
  }

  private func removeScreenShield() {
    self.window?.viewWithTag(999)?.removeFromSuperview()
    self.blurEffectView = nil
  }
}`
  }
];
