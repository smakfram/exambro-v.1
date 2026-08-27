import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Activity, 
  Terminal, 
  AlertOctagon, 
  Lock, 
  Smartphone, 
  Monitor, 
  Globe, 
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { SECURITY_LAYERS, TECH_STACK_RECOMMENDATION } from '../data/architectureDocs';

export const ArchitectureViewer: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* OVERVIEW HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Arsitektur Keamanan & Sistem Kios Multi-Platform</h2>
            <p className="text-xs text-slate-400">Comprehensive Threat Modeling, Event Flowcharts, & Native Hardening</p>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mt-3">
          Sistem Exambrowser ini dirancang menggunakan pendekatan <strong>Defense-in-Depth (Pertahanan Berlapis)</strong> yang mengamankan 4 tingkatan sekaligus: <em>Operating System Layer</em> (Kiosk/LockTask), <em>Window/UI Layer</em> (FLAG_SECURE, Fullscreen), <em>Application Lifecycle Layer</em> (AppLifecycleState blur detection), dan <em>Network/Web Layer</em> (Strict Domain Whitelisting).
        </p>
      </div>

      {/* TECH STACK RECOMMENDATION (Output #1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MOBILE STACK */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Mobile Stack (Android & iOS)</h3>
            <span className="ml-auto text-xs px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold font-mono">
              Flutter 3.x
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {TECH_STACK_RECOMMENDATION.mobile.why}
          </p>
          <div className="space-y-2.5">
            {TECH_STACK_RECOMMENDATION.mobile.plugins.map((plugin, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xs font-mono font-bold text-cyan-300">{plugin.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{plugin.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP STACK */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Desktop Stack (Windows & macOS)</h3>
            <span className="ml-auto text-xs px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold font-mono">
              Electron + Node
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {TECH_STACK_RECOMMENDATION.desktop.why}
          </p>
          <div className="space-y-2.5">
            {TECH_STACK_RECOMMENDATION.desktop.plugins.map((plugin, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xs font-mono font-bold text-sky-300">{plugin.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{plugin.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EVENT LIFECYCLE & 3-STRIKE ALGORITHM (Output #2) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Algoritma Deteksi Kehilangan Fokus & 3-Strike Rule</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-2">
              <span className="w-5 h-5 rounded-md bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-[10px] font-mono">1</span>
              <span>State Transition Tracking</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mobile mendengarkan <code>AppLifecycleState.paused</code> & <code>inactive</code>. Desktop mendengarkan <code>mainWindow.on('blur')</code>. Setiap transisi keluar diidentifikasi sebagai potensi split-screen atau app-switch.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-2">
              <span className="w-5 h-5 rounded-md bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-[10px] font-mono">2</span>
              <span>Strike Counter & Warning Dialog</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pelanggaran ke-1 dan ke-2 memicu <em>blocking alert</em> merah. Aplikasi memaksa diri kembali ke foreground (<code>focus()</code>) dan mengosongkan clipboard buffer.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-2">
              <span className="w-5 h-5 rounded-md bg-red-400/20 border border-red-400/30 flex items-center justify-center text-[10px] font-mono">3</span>
              <span>Auto-Lockout & Auto-Submit</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pelanggaran ke-3 langsung membekukan akses formulir Google Form, menghentikan timer, dan meminta verifikasi fisik master PIN Pengawas Ruangan.
            </p>
          </div>
        </div>
      </div>

      {/* THREAT MODELING MATRIX */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Matriks Pertahanan Ancaman Keamanan (Threat Mitigation Matrix)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-3 px-4">Fitur Keamanan</th>
                <th className="py-3 px-4">Vektor Ancaman</th>
                <th className="py-3 px-4">Mekanisme Pertahanan</th>
                <th className="py-3 px-4">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {SECURITY_LAYERS.map((layer, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    {layer.title}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {layer.threat}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-300 font-medium">{layer.defenseMechanism}</span>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{layer.implementationTech}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono bg-red-500/10 text-red-400 border border-red-500/20">
                      {layer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NATIVE CONFIGURATION GUIDANCE (Output #4) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Panduan Konfigurasi Native OS (ADB, MDM, Registry)</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ANDROID DEVICE OWNER ADB */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-emerald-400 mb-2">1. Android Device Owner (Kiosk Penuh)</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Untuk mencegah siswa keluar paksa tanpa dialog konfirmasi sama sekali, jadikan aplikasi sebagai <em>Device Owner</em> via ADB saat setup tablet sekolah:
              </p>
              <div className="p-3 bg-black/70 rounded-lg font-mono text-[11px] text-emerald-300 select-all overflow-x-auto border border-emerald-950">
                adb shell dpm set-device-owner com.school.exambrowser/.MyDeviceAdminReceiver
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Menonaktifkan tombol Home, Status Bar, & Safe Boot</span>
            </div>
          </div>

          {/* IOS GUIDED ACCESS */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-orange-400 mb-2">2. iOS Guided Access / Apple Configurator</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Pada iPad/iPhone sekolah, aktifkan <strong>Single App Mode</strong> melalui profil MDM (.mobileconfig) atau Guided Access di <em>Settings &gt; Accessibility &gt; Guided Access</em>.
              </p>
              <div className="p-3 bg-black/70 rounded-lg font-mono text-[11px] text-orange-300 select-all overflow-x-auto border border-orange-950">
                Triple-Click Power Button &gt; Start Guided Access (Passcode Protected)
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Mematikan gesture swipe bar bawah & tombol hardware</span>
            </div>
          </div>

          {/* WINDOWS LAB REGISTRY */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-sky-400 mb-2">3. Windows Lab Computer Group Policy</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Nonaktifkan akses Task Manager dan tombol Windows Key pada PC Lab menggunakan script registry otomatis sebelum ujian:
              </p>
              <div className="p-3 bg-black/70 rounded-lg font-mono text-[11px] text-sky-300 select-all overflow-x-auto border border-sky-950">
                reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v "DisableTaskMgr" /t REG_DWORD /d 1 /f
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Mencegah Ctrl+Alt+Del & Task Manager kill</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
