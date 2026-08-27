export interface SecurityLayer {
  title: string;
  category: 'Mobile' | 'Desktop' | 'Network/Web' | 'Operational';
  threat: string;
  defenseMechanism: string;
  implementationTech: string;
  status: 'Critical' | 'Essential' | 'High';
}

export const SECURITY_LAYERS: SecurityLayer[] = [
  {
    title: 'Screen Pinning / Lock Task Mode',
    category: 'Mobile',
    threat: 'Siswa menekan tombol Home / Recent Apps / Back untuk membuka WhatsApp, Google Chrome, atau kalkulator.',
    defenseMechanism: 'Mengunci OS ke mode single-app dengan Android LockTaskMode & iOS Guided Access.',
    implementationTech: 'Activity.startLockTask() + lockTaskMode="always" & iOS UIAccessibility.requestGuidedAccessSession',
    status: 'Critical'
  },
  {
    title: 'Anti-Screenshot & Screen Capture Blackout',
    category: 'Mobile',
    threat: 'Siswa mengambil tangkapan layar (screenshot) soal ujian untuk disebarkan ke grup atau merekam layar.',
    defenseMechanism: 'Melarang render visual pada buffer OS saat screenshot atau recording berlangsung.',
    implementationTech: 'Android WindowManager.LayoutParams.FLAG_SECURE + iOS UIScreen.capturedDidChangeNotification',
    status: 'Critical'
  },
  {
    title: 'Global OS Shortcut Interception',
    category: 'Desktop',
    threat: 'Siswa menggunakan Alt+Tab, Windows Key, Ctrl+Esc, Alt+F4, Cmd+Tab untuk berpindah jendela di laptop/PC.',
    defenseMechanism: 'Mendaftarkan low-level keyboard hook dan globalShortcut di Electron main process + Windows Group Policy.',
    implementationTech: 'Electron globalShortcut.register + Windows Registry DisableTaskMgr / DisableLockWorkstation',
    status: 'Critical'
  },
  {
    title: 'Strict Domain & URL Whitelisting',
    category: 'Network/Web',
    threat: 'Siswa mengklik tautan eksternal di dalam Google Form untuk browsing materi atau ChatGPT.',
    defenseMechanism: 'Memeriksa setiap URL sebelum navigasi (`will-navigate` / `shouldOverrideUrlLoading`). Hanya mengizinkan domain Google Form & Auth.',
    implementationTech: 'InAppWebView.shouldOverrideUrlLoading + Electron webContents.on("will-navigate")',
    status: 'Critical'
  },
  {
    title: 'Loss of Focus (Blur / Inactive) 3-Strike Rule',
    category: 'Mobile',
    threat: 'Floating apps, split screen, pop-up chat notification, atau multi-window overlay.',
    defenseMechanism: 'Memantau `AppLifecycleState` dan `window.onblur`. Menghitung strike pelanggaran: 1x & 2x peringatan, 3x otomatis terkunci.',
    implementationTech: 'WidgetsBindingObserver.didChangeAppLifecycleState + Browser blur event',
    status: 'Essential'
  },
  {
    title: 'Periodic Clipboard Purge & Event Blocking',
    category: 'Network/Web',
    threat: 'Siswa menyalin teks soal ke AI tool atau menempelkan kunci jawaban dari contekan sebelumnya.',
    defenseMechanism: 'Memblokir event copy/cut/paste di WebView dan menjalankan background loop yang otomatis mengosongkan clipboard.',
    implementationTech: 'Timer periodic Clipboard.setData("") + DOM preventDefault pada copy/paste/contextmenu',
    status: 'Essential'
  },
  {
    title: 'Supervisor PIN Lock & Automatic Cache Cleanup',
    category: 'Operational',
    threat: 'Siswa menutup ujian sendiri tanpa menyerahkan jawaban atau data login akun Google tersimpan di komputer bersama.',
    defenseMechanism: 'Tombol keluar dilindungi PIN enkripsi pengawas. Saat keluar, seluruh cookies, token OAuth, dan cache dihapus bersih.',
    implementationTech: 'InAppWebViewController.clearAllCache() + Electron session.defaultSession.clearStorageData()',
    status: 'Critical'
  }
];

export const TECH_STACK_RECOMMENDATION = {
  mobile: {
    recommended: 'Flutter (Dart)',
    why: 'Flutter menyediakan akses native komprehensif ke WindowManager (FLAG_SECURE), MethodChannel untuk LockTask Android, dukungan InAppWebView generasi terbaru, dan performa 60fps tanpa lag.',
    plugins: [
      { name: 'flutter_inappwebview', desc: 'WebView aman dengan kontrol penuh URL whitelisting, disable context menu, dan cache clearing' },
      { name: 'flutter_windowmanager', desc: 'Mengontrol flag window native Android (FLAG_SECURE, FLAG_KEEP_SCREEN_ON)' },
      { name: 'wakelock_plus', desc: 'Menjaga layar tetap menyala selama durasi ujian' },
      { name: 'qr_code_scanner / mobile_scanner', desc: 'Scan QR token ujian langsung dari kertas pengawas' }
    ]
  },
  desktop: {
    recommended: 'Electron (Node.js + Chromium)',
    why: 'Electron memungkinkan kontrol tingkat rendah (low-level) pada OS Windows dan macOS, kontrol full screen borderless kios, global keyboard shortcut suppression, dan proteksi window blur.',
    plugins: [
      { name: 'electron-builder', desc: 'Packaging installer .exe (Windows) dan .dmg (macOS) dengan konfigurasi Kiosk registry' },
      { name: 'node-global-key-listener (opsional)', desc: 'Low-level keyboard hook untuk menangkal Alt+Tab & Windows Key jika diperlukan di level driver' }
    ]
  }
};
