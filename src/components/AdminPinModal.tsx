import React, { useState } from 'react';
import { ShieldAlert, KeyRound, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  correctPin: string;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  correctPin,
  onClose,
  onSuccess,
  title = 'Verifikasi Pengawas Ujian',
  description = 'Masukkan PIN / Password Pengawas untuk membuka kunci atau menghentikan ujian.'
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === correctPin.trim()) {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-slate-400">Otoritas Khusus Pengawas Ruang</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-5 leading-relaxed">
          {description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password / Master PIN Pengawas
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="Masukkan PIN..."
              autoFocus
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg tracking-widest font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>PIN Salah! Hanya pengawas ruangan yang berwenang memasukkan kode ini.</span>
            </div>
          )}

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="leading-tight text-[11px]">
              PIN Pembuka bersifat <strong>rahasia</strong> dan hanya diketahui oleh Pengawas Ruangan / Proktor. Peserta tidak diizinkan keluar selama ujian berlangsung.
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-slate-300 rounded-xl text-sm font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md shadow-amber-950/40"
            >
              <CheckCircle className="w-4 h-4" />
              Verifikasi & Keluar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
