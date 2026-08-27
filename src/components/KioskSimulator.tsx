import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Maximize2, 
  Minimize2, 
  Wifi, 
  WifiOff, 
  Battery, 
  Clock, 
  LogOut, 
  AlertTriangle, 
  Terminal, 
  ExternalLink, 
  Copy, 
  Camera, 
  EyeOff, 
  RefreshCw,
  CheckCircle2,
  Send,
  Radio,
  Link2,
  QrCode,
  Users,
  Layers,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExamConfig, SecurityEvent } from '../types';
import { AdminPinModal } from './AdminPinModal';
import { ViolationAlertModal } from './ViolationAlertModal';
import { DeepLinkTesterModal } from './DeepLinkTesterModal';
import { QRScannerModal } from './QRScannerModal';
import { ProctorMonitorModal } from './ProctorMonitorModal';

interface KioskSimulatorProps {
  config: ExamConfig;
  onUpdateConfig: (newConfig: ExamConfig) => void;
}

export const KioskSimulator: React.FC<KioskSimulatorProps> = ({ config, onUpdateConfig }) => {
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(config.durationMinutes * 60);
  const [violations, setViolations] = useState(0);
  const [activeViolationReason, setActiveViolationReason] = useState('');
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [showDeepLinkModal, setShowDeepLinkModal] = useState(false);
  const [showQRScannerModal, setShowQRScannerModal] = useState(false);
  const [showProctorModal, setShowProctorModal] = useState(false);
  const [viewMode, setViewMode] = useState<'simulated' | 'live-url'>('simulated');
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [isScreenShielded, setIsScreenShielded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync remaining seconds when duration in config changes
  useEffect(() => {
    if (!isActive) {
      setRemainingSeconds(config.durationMinutes * 60);
    }
  }, [config.durationMinutes, isActive]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      logEvent('visibility', 'Koneksi internet kembali aktif.', 'low');
    };
    const handleOffline = () => {
      setIsOnline(false);
      logEvent('offline', 'Koneksi internet terputus! Periksa sinyal Wi-Fi/data.', 'high');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && remainingSeconds > 0 && !submitted && violations < config.maxViolations) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, remainingSeconds, submitted, violations, config.maxViolations]);

  const logEvent = (
    type: SecurityEvent['type'], 
    description: string, 
    severity: SecurityEvent['severity'] = 'medium'
  ) => {
    const newLog: SecurityEvent = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('id-ID'),
      type,
      description,
      severity
    };
    setSecurityLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const triggerViolation = (reason: string, type: SecurityEvent['type'] = 'blur') => {
    if (!isActive || submitted) return;

    setViolations((prev) => {
      const nextCount = prev + 1;
      logEvent(type, `Pelanggaran #${nextCount}: ${reason}`, nextCount >= config.maxViolations ? 'critical' : 'high');
      setActiveViolationReason(reason);
      setShowViolationModal(true);
      return nextCount;
    });
  };

  // Active Security Event Handlers when Kiosk is LIVE
  useEffect(() => {
    if (!isActive) return;

    // 1. Loss of focus detection (Blur & Tab switch)
    const handleWindowBlur = () => {
      triggerViolation('Aplikasi kehilangan fokus (Window Blur / Pindah Jendela)', 'blur');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Tab atau layar dialihkan ke latar belakang (Visibility Hidden)', 'visibility');
      }
    };

    // 2. Clipboard blocking (Copy, Cut, Paste)
    const handleCopy = (e: ClipboardEvent) => {
      if (config.blockClipboard) {
        e.preventDefault();
        logEvent('contextmenu', 'Upaya menyalin teks (COPY) diblokir oleh sistem.', 'medium');
        navigator.clipboard?.writeText?.('');
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (config.blockClipboard) {
        e.preventDefault();
        logEvent('contextmenu', 'Upaya menempel teks (PASTE) diblokir oleh sistem.', 'medium');
      }
    };

    // 3. Context Menu Blocking (Right click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logEvent('contextmenu', 'Klik kanan (Context Menu) dinonaktifkan.', 'low');
    };

    // 4. Keyboard Shortcuts Interception (F12, Alt+Tab sim, PrintScreen, Ctrl+U, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen / Screenshot attempt
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p')) {
        e.preventDefault();
        setIsScreenShielded(true);
        setTimeout(() => setIsScreenShielded(false), 2000);
        triggerViolation('Upaya Tangkapan Layar / Screenshot (PrintScreen) terdeteksi!', 'shortcut');
      }

      // DevTools & Inspect shortcuts
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        logEvent('shortcut', `Shortcut pengembang (${e.key}) diblokir.`, 'high');
      }

      // Refresh shortcut
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        logEvent('shortcut', 'Refresh halaman dinonaktifkan saat ujian.', 'low');
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, config.blockClipboard, config.maxViolations, submitted]);

  const handleStartExam = () => {
    setIsActive(true);
    setSubmitted(false);
    setViolations(0);
    setRemainingSeconds(config.durationMinutes * 60);
    setSecurityLogs([]);
    logEvent('admin_override', 'Sesi Ujian Aman dimulai. Kiosk Engine diaktifkan.', 'low');
    
    // Request fullscreen
    if (config.strictFullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      }
    }
  };

  const handleStopExamWithPin = () => {
    setIsActive(false);
    setShowAdminPinModal(false);
    setShowViolationModal(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
    logEvent('admin_override', 'Ujian dihentikan dan ditutup dengan verifikasi PIN Pengawas. Cache dan session dihapus.', 'low');
  };

  const handleTimeUp = () => {
    logEvent('visibility', 'Waktu ujian telah habis! Auto-submit jawaban diaktifkan.', 'high');
    handleFinalSubmit();
  };

  const handleFinalSubmit = () => {
    setSubmitted(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    logEvent('admin_override', 'Jawaban Google Form berhasil disubmit ke server.', 'low');
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Sample questions for the Google Form simulator
  const sampleQuestions = [
    {
      id: 'q1',
      question: '1. Apa fungsi utama dari FLAG_SECURE pada sistem operasi Android saat aplikasi Kiosk berjalan?',
      options: [
        'A. Mempercepat rendering grafis 3D WebView',
        'B. Mencegah tangkapan layar (screenshot), perekaman layar, dan visual buffer leakage',
        'C. Mengaktifkan izin kamera otomatis tanpa konfirmasi pengguna',
        'D. Mengabaikan kebijakan sertifikat SSL pada domain luar'
      ],
      answer: 'B'
    },
    {
      id: 'q2',
      question: '2. Mengapa event AppLifecycleState (paused/inactive) sangat krusial dalam arsitektur ExamBrowser?',
      options: [
        'A. Untuk mendeteksi ketika siswa membagi layar (split screen), membuka chat pop-up, atau menekan tombol Recent Apps',
        'B. Untuk menghemat baterai saat siswa sedang tidak mengetik',
        'C. Untuk membersihkan memori RAM perangkat secara otomatis',
        'D. Untuk mengirimkan email notifikasi ke orang tua siswa'
      ],
      answer: 'A'
    },
    {
      id: 'q3',
      question: '3. Bagaimana mekanisme pengamanan URL pada InAppWebView agar siswa tidak membuka ChatGPT atau website lain?',
      options: [
        'A. Mematikan koneksi internet sepenuhnya',
        'B. Menggunakan shouldOverrideUrlLoading dan mencocokkan hostname dengan daftar Whitelist (Google Forms & Auth)',
        'C. Mengubah DNS server perangkat ke alamat lokal',
        'D. Menghapus JavaScript dari seluruh halaman web'
      ],
      answer: 'B'
    }
  ];

  return (
    <div className="space-y-6" ref={containerRef}>
      {/* SCREEN SHIELD OVERLAY (Anti-Screenshot Simulator) */}
      {isScreenShielded && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white p-6 animate-pulse">
          <EyeOff className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold">ANTI-SCREENSHOT SHIELD ACTIVE</h2>
          <p className="text-sm text-slate-400 mt-2">Visual buffer dilindungi dari perekaman dan tangkapan layar.</p>
        </div>
      )}

      {/* ADMIN PIN MODAL */}
      <AdminPinModal
        isOpen={showAdminPinModal}
        correctPin={config.adminPin}
        onClose={() => setShowAdminPinModal(false)}
        onSuccess={handleStopExamWithPin}
      />

      {/* VIOLATION ALERT MODAL */}
      <ViolationAlertModal
        isOpen={showViolationModal}
        violationCount={violations}
        maxViolations={config.maxViolations}
        reason={activeViolationReason}
        onDismiss={() => setShowViolationModal(false)}
        onAdminUnlock={() => {
          setShowViolationModal(false);
          setShowAdminPinModal(true);
        }}
      />

      {/* DEEP LINK TESTER MODAL */}
      <DeepLinkTesterModal
        isOpen={showDeepLinkModal}
        onClose={() => setShowDeepLinkModal(false)}
        currentConfig={config}
        onLaunchExam={(newConfig) => {
          onUpdateConfig(newConfig);
          handleStartExam();
          logEvent('visibility', `Ujian diluncurkan via Deep Link: ${newConfig.title}`, 'low');
        }}
      />

      {/* QR SCANNER MODAL */}
      <QRScannerModal
        isOpen={showQRScannerModal}
        onClose={() => setShowQRScannerModal(false)}
        currentConfig={config}
        onScanComplete={(newConfig) => {
          onUpdateConfig(newConfig);
          handleStartExam();
          logEvent('visibility', `Token QR terverifikasi. Sesi dimulai untuk ${newConfig.title}`, 'low');
        }}
      />

      {/* PROCTOR MONITOR MODAL */}
      <ProctorMonitorModal
        isOpen={showProctorModal}
        onClose={() => setShowProctorModal(false)}
        config={config}
      />

      {/* TOP CONTROLS & TEST HARNESS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isActive ? 'Kiosk Mode Aktif (Live Testing)' : 'Interactive Kiosk Exam Simulator'}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                Google Form Security Guard
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Uji coba langsung seluruh fitur keamanan: deteksi blur, blokir shortcut, 3-strike violation, dan password pengawas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!isActive ? (
              <>
                <button
                  onClick={() => setShowDeepLinkModal(true)}
                  className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Uji Peluncuran via Custom Scheme exambrowser://"
                >
                  <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Deep Link Tester</span>
                </button>

                <button
                  onClick={() => setShowQRScannerModal(true)}
                  className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Simulasi Scan Barcode Kartu Meja"
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Scan QR Meja</span>
                </button>

                <button
                  onClick={() => setShowProctorModal(true)}
                  className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Dashboard Pemantauan Pengawas Ruangan"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Proctor Monitor</span>
                </button>

                <button
                  id="btn-start-exam"
                  onClick={handleStartExam}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md shadow-emerald-950/40 flex items-center gap-2 text-xs uppercase tracking-wider transition transform active:scale-95 border border-emerald-500/30"
                >
                  <Lock className="w-4 h-4" />
                  Mulai Ujian Aman
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowProctorModal(true)}
                  className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Proctor View</span>
                </button>

                <button
                  onClick={() => setShowAdminPinModal(true)}
                  className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 font-semibold rounded-xl text-xs flex items-center gap-2 transition"
                >
                  <Unlock className="w-4 h-4" />
                  Buka Kunci Pengawas (PIN)
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-slate-300 rounded-xl text-xs flex items-center gap-1 transition"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* VIEW MODE SELECTOR */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Mode Tampilan:</span>
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('simulated')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  viewMode === 'simulated'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Simulasi Responsif Google Form
              </button>
              <button
                onClick={() => setViewMode('live-url')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${
                  viewMode === 'live-url'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3 h-3" />
                Live URL Sandbox
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
            Target: {config.formUrl}
          </div>
        </div>

        {/* SIMULATOR ATTACK / TEST TRIGGERS (When Active) */}
        {isActive && (
          <div className="mt-5 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
              Simulator Trigger Serangan / Pelanggaran (Uji Mekanisme Pertahanan):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => triggerViolation('Siswa mencoba membuka aplikasi lain / Alt+Tab / Split Screen')}
                className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                Uji: Pindah Aplikasi (Blur / App Switch)
              </button>
              <button
                onClick={() => {
                  setIsScreenShielded(true);
                  setTimeout(() => setIsScreenShielded(false), 2000);
                  triggerViolation('Siswa menekan tombol Screenshot / Screen Recording!', 'shortcut');
                }}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                Uji: Tombol Screenshot / PrintScreen
              </button>
              <button
                onClick={() => {
                  logEvent('contextmenu', 'Upaya Copy/Paste diblokir. Clipboard dibersihkan.', 'medium');
                  alert('Sistem Kiosk: Fitur Copy-Paste dan Clipboard dinonaktifkan!');
                }}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5 text-blue-400" />
                Uji: Copy-Paste Block
              </button>
              <button
                onClick={() => {
                  logEvent('navigation_blocked', 'Percobaan navigasi ke https://chatgpt.com DIBLOKIR. Bukan domain Google Form.', 'high');
                  alert('BLOCKED: Domain luar tidak terdaftar di Whitelist Google Forms!');
                }}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                Uji: Buka Link Luar Whitelist
              </button>
              <button
                onClick={() => setRemainingSeconds(10)}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Uji: Waktu Kritis (Sisa 10 Detik)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MAIN BROWSER SHELL & GOOGLE FORM VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* EXAM SCREEN (2 COLS) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[620px]">
          {/* HEADER & CONTROL BAR */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">{config.schoolName}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{config.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* TIMER */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-sm font-bold border ${
                remainingSeconds < 120 
                  ? 'bg-red-950/60 border-red-700 text-red-400 animate-pulse' 
                  : 'bg-slate-900 border-slate-800 text-emerald-400'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(remainingSeconds)}</span>
              </div>

              {/* BATTERY & WIFI STATUS */}
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
                {isOnline ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-red-400" />
                )}
                <div className="flex items-center gap-1 font-mono">
                  <Battery className="w-3.5 h-3.5 text-slate-400" />
                  <span>{batteryLevel}%</span>
                </div>
              </div>

              {/* STRIKE VIOLATION BADGE */}
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                violations === 0 
                  ? 'bg-emerald-950/50 border border-emerald-800/50 text-emerald-300' 
                  : violations < config.maxViolations 
                    ? 'bg-amber-950/50 border border-amber-800/50 text-amber-300' 
                    : 'bg-red-950/80 border border-red-700 text-red-300'
              }`}>
                Strike: {violations}/{config.maxViolations}
              </div>

              {/* ADMIN EXIT BUTTON */}
              <button
                id="btn-admin-exit-header"
                onClick={() => setShowAdminPinModal(true)}
                className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 rounded-lg transition"
                title="Keluar Ujian (Khusus Pengawas)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SIMULATED WEBVIEW CONTENT */}
          <div className="flex-1 bg-slate-950 p-6 overflow-y-auto relative select-none">
            {!isActive ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-4">
                  <Lock className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Secure Kiosk Standby</h3>
                <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                  Layar saat ini belum terkunci. Klik tombol <strong>"Mulai Ujian Aman"</strong> di atas untuk mengaktifkan proteksi WebView, penguncian shortcut, anti-screenshot, dan pelacak fokus.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 text-left max-w-md w-full bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Domain Whitelisted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Anti-Alt+Tab & Blur</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Auto Clipboard Purge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>PIN Pengawas Keluar</span>
                  </div>
                </div>
              </div>
            ) : submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 mb-4">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Ujian Berhasil Diserahkan!</h3>
                <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                  Tanggapan Anda telah tersimpan dengan aman di server Google Form. Silakan panggil pengawas untuk membuka kunci dan keluar dari aplikasi.
                </p>
                <button
                  onClick={() => setShowAdminPinModal(true)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-950/40"
                >
                  Tutup Sesi (PIN Pengawas)
                </button>
              </div>
            ) : viewMode === 'live-url' ? (
              /* LIVE WEBVIEW / IFRAME SANDBOX WITH DOMAIN GUARD */
              <div className="h-full flex flex-col space-y-3">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono text-[11px] truncate max-w-md">{config.formUrl}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    Sandbox Active (CSP & Whitelist Guarded)
                  </span>
                </div>
                <div className="flex-1 bg-white rounded-xl overflow-hidden relative shadow-inner border border-slate-800">
                  <iframe
                    src={config.formUrl}
                    title="Live Google Form Frame"
                    className="w-full h-full border-0"
                    sandbox="allow-forms allow-scripts allow-same-origin allow-popups-to-escape-sandbox"
                  />
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 text-[11px]">
                    Setelah selesai mengerjakan di Google Form, klik tombol serahkan di bawah ini:
                  </span>
                  <button
                    onClick={handleFinalSubmit}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Konfirmasi Selesai & Serahkan
                  </button>
                </div>
              </div>
            ) : (
              /* SECURE QUESTIONNAIRE CONTAINER (ADAPTS TO GOOGLE FORM OR CBT/LMS) */
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Form / CBT Header Card */}
                <div className={`bg-slate-900 border-t-4 border-x border-b border-slate-800 rounded-xl p-5 shadow-lg ${
                  config.linkType === 'general' ? 'border-t-emerald-500' : 'border-t-indigo-500'
                }`}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className={config.linkType === 'general' ? 'text-emerald-400' : 'text-indigo-400'}>
                      {config.linkType === 'general' ? 'CBT / LMS PORTAL VERIFIED INSTANCE' : 'GOOGLE FORM VERIFIED SECURE INSTANCE'}
                    </span>
                    <span className="font-mono text-slate-500 truncate max-w-xs">{config.formUrl}</span>
                  </div>
                  <h1 className="text-xl font-bold text-white">{config.title}</h1>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Petunjuk: Bacalah soal dengan teliti. Dilarang menutup aplikasi, membagi layar, atau melakukan kecurangan. Setiap pelanggaran akan dicatat otomatis.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Sesi terenkripsi & diawasi secara real-time oleh Kiosk Engine.</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {config.linkType === 'general' ? 'Mode: Link Umum CBT' : 'Mode: Google Form'}
                    </span>
                  </div>
                </div>

                {/* Questions */}
                {sampleQuestions.map((q) => (
                  <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
                    <p className="text-sm font-semibold text-slate-100 mb-4">{q.question}</p>
                    <div className="space-y-2.5">
                      {q.options.map((opt, idx) => {
                        const optKey = opt.substring(0, 1);
                        const isSelected = answers[q.id] === optKey;
                        return (
                          <label
                            key={idx}
                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: optKey }))}
                            className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition ${
                              isSelected
                                ? config.linkType === 'general'
                                  ? 'bg-emerald-950/60 border-emerald-500 text-white font-medium shadow-sm'
                                  : 'bg-indigo-950/60 border-indigo-500 text-white font-medium shadow-sm'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={isSelected}
                              onChange={() => {}}
                              className={`mt-0.5 ${config.linkType === 'general' ? 'text-emerald-600 focus:ring-emerald-500' : 'text-indigo-600 focus:ring-indigo-500'}`}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Submit Action */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-slate-500 font-mono">
                    Terjawab: {Object.keys(answers).length} dari {sampleQuestions.length} Soal
                  </span>
                  <button
                    onClick={handleFinalSubmit}
                    className={`px-6 py-2.5 text-white font-bold rounded-xl text-sm transition flex items-center gap-2 shadow-lg ${
                      config.linkType === 'general'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/40'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    Kirim Jawaban (Submit)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: REALTIME SECURITY AUDIT LOG */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[620px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Security Event Log</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md font-mono border border-slate-700">
              Live Monitor
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 text-xs font-mono pr-1">
            {securityLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                <ShieldCheck className="w-8 h-8 mb-2 opacity-50 text-emerald-500" />
                <p>Belum ada event keamanan.</p>
                <p className="text-[11px] text-slate-600 mt-1">Sistem siap merekam aktivitas mencurigakan.</p>
              </div>
            ) : (
              securityLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-lg border leading-relaxed ${
                    log.severity === 'critical'
                      ? 'bg-red-950/50 border-red-800/80 text-red-200'
                      : log.severity === 'high'
                        ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                        : log.severity === 'medium'
                          ? 'bg-blue-950/30 border-blue-800/50 text-blue-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
                    <span className="font-semibold">{log.timestamp}</span>
                    <span className="uppercase tracking-wider">{log.type}</span>
                  </div>
                  <p className="text-[11px]">{log.description}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Whitelisted Domains:</span>
            <span className="text-indigo-400 font-semibold font-mono">{config.allowedDomains.length} Domains</span>
          </div>
        </div>
      </div>
    </div>
  );
};
