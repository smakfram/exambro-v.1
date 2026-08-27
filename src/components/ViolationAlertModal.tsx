import React from 'react';
import { ShieldAlert, AlertOctagon, RotateCcw, Lock, UserCheck } from 'lucide-react';

interface ViolationAlertModalProps {
  isOpen: boolean;
  violationCount: number;
  maxViolations: number;
  reason: string;
  onDismiss: () => void;
  onAdminUnlock: () => void;
}

export const ViolationAlertModal: React.FC<ViolationAlertModalProps> = ({
  isOpen,
  violationCount,
  maxViolations,
  reason,
  onDismiss,
  onAdminUnlock
}) => {
  if (!isOpen) return null;

  const isLockedOut = violationCount >= maxViolations;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
        isLockedOut
          ? 'bg-slate-900 border-red-500/80 text-white'
          : 'bg-slate-900 border-amber-500/50 text-slate-100'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl border ${
            isLockedOut 
              ? 'bg-red-500/20 text-red-400 border-red-500/30' 
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}>
            {isLockedOut ? <Lock className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              {isLockedOut ? 'UJIAN TERKUNCI OTOMATIS' : 'PERINGATAN PELANGGARAN KEAMANAN'}
            </h3>
            <p className="text-xs text-slate-400">Anti-Cheating Security Guard Active</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 mb-5 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-red-300">Penyebab Terdeteksi: </span>
              <span className="text-slate-300">{reason}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400">Status Pelanggaran:</span>
            <span className={`font-bold font-mono px-2.5 py-0.5 rounded-md ${
              isLockedOut ? 'bg-red-600/30 border border-red-500/40 text-red-200' : 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
            }`}>
              {violationCount} dari {maxViolations} Batas Maksimal
            </span>
          </div>
        </div>

        {isLockedOut ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Anda telah melebihi batas toleransi pelanggaran sistem keamanan ujian. Akses pengerjaan soal dihentikan sementara. Silakan hubungi <strong>Pengawas / Proktor Ruangan</strong> untuk verifikasi pembukaan kunci.
            </p>
            <button
              onClick={onAdminUnlock}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md"
            >
              <UserCheck className="w-4 h-4" />
              Panggil Pengawas (Masukkan PIN Pembuka)
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Dilarang berpindah jendela, membuka aplikasi lain, mengambil screenshot, atau membagi layar saat ujian berlangsung. Setiap aktivitas mencurigakan dicatat dalam log pengawas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onDismiss}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md shadow-amber-950/40"
              >
                <RotateCcw className="w-4 h-4" />
                Saya Mengerti & Lanjutkan Ujian
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
