import React, { useState } from 'react';
import { QrCode, Camera, X, CheckCircle2, AlertCircle, RefreshCw, Lock, Sparkles } from 'lucide-react';
import { ExamConfig } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: ExamConfig;
  onScanComplete: (config: ExamConfig) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onScanComplete,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [scanMode, setScanMode] = useState<'preset' | 'camera'>('preset');

  if (!isOpen) return null;

  const sampleQRPresets = [
    {
      id: 'gform-mat',
      label: 'QR Meja 01 - [Google Form] PAS Matematika (90m)',
      type: 'google-form',
      data: {
        title: 'PAS Matematika Peminatan Kelas XII',
        linkType: 'google-form' as const,
        formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-SampleMath/viewform',
        durationMinutes: 90,
        adminPin: '8899',
        schoolName: 'SMAK Frateran Malang',
        allowedDomains: ['docs.google.com', 'forms.gle', 'accounts.google.com'],
        maxViolations: 3,
      },
    },
    {
      id: 'moodle-lms',
      label: 'QR Meja 02 - [Link Umum] Moodle LMS CBT Frateran (90m)',
      type: 'general',
      data: {
        title: 'Asesmen Sumatif Akhir Jenjang (Moodle LMS)',
        linkType: 'general' as const,
        formUrl: 'https://moodle.smakfrateranmlg.sch.id/mod/quiz',
        durationMinutes: 90,
        adminPin: '4321',
        schoolName: 'SMAK Frateran Malang',
        allowedDomains: ['moodle.smakfrateranmlg.sch.id'],
        maxViolations: 3,
      },
    },
    {
      id: 'lan-cbt',
      label: 'QR Meja 03 - [Link Umum] Server Lokal Candy CBT (60m)',
      type: 'general',
      data: {
        title: 'CBT Fisika Terpadu Server LAN 192.168.1.200',
        linkType: 'general' as const,
        formUrl: 'http://192.168.1.200/cbt/ujian',
        durationMinutes: 60,
        adminPin: '7788',
        schoolName: 'SMAK Frateran Malang',
        allowedDomains: ['192.168.1.200'],
        maxViolations: 2,
      },
    },
    {
      id: 'anbk-literasi',
      label: 'QR Meja 04 - [Google Form] Simulasi ANBK 2026 (120m)',
      type: 'google-form',
      data: {
        title: 'Simulasi ANBK Literasi & Numerasi 2026',
        linkType: 'google-form' as const,
        formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-SampleANBK/viewform',
        durationMinutes: 120,
        adminPin: '9900',
        schoolName: 'SMAK Frateran Malang',
        allowedDomains: ['docs.google.com', 'forms.gle', 'accounts.google.com'],
        maxViolations: 3,
      },
    },
  ];

  const handleSimulateScan = (presetData: any) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedResult(presetData);
    }, 800);
  };

  const handleAcceptScan = () => {
    if (!scannedResult) return;
    const newConfig: ExamConfig = {
      ...currentConfig,
      ...scannedResult,
    };
    onScanComplete(newConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">QR Code Scanner Ujian</h3>
              <p className="text-xs text-slate-400">Pindai token QR terenkripsi di kartu meja peserta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport Simulation */}
        <div className="py-4 space-y-4">
          <div className="relative h-48 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center">
            {/* Viewfinder Overlay */}
            <div className="absolute inset-8 border-2 border-dashed border-cyan-500/40 rounded-xl flex items-center justify-center">
              {isScanning ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  <span className="text-xs font-mono text-cyan-300">Membaca Barcode & Mendekripsi AES...</span>
                </div>
              ) : scannedResult ? (
                <div className="flex flex-col items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                  <span className="text-xs font-bold font-mono">Token Berhasil Terbaca!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-500">
                  <Camera className="w-8 h-8 opacity-60" />
                  <span className="text-[11px]">Arahkan Kamera ke QR Code Meja</span>
                </div>
              )}
            </div>

            {/* Scanning line animation */}
            {isScanning && (
              <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse top-1/2" />
            )}
          </div>

          {/* Preset Selection */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Pilih Barcode Meja Ujian (Simulasi Scan):
            </span>
            <div className="space-y-2">
              {sampleQRPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSimulateScan(preset.data)}
                  className="w-full text-left p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">{preset.label}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{preset.data.formUrl}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20 shrink-0">
                    Scan Ini
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scanned Result Card */}
          {scannedResult && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300">{scannedResult.title}</span>
                <span className="font-mono text-emerald-400">{scannedResult.durationMinutes} Menit</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>PIN Pengawas: <strong className="text-emerald-400 font-mono">•••• (Terenkripsi Aman)</strong></span>
                <span>Max Strike: <strong className="text-red-400">{scannedResult.maxViolations}x</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Batal
          </button>
          
          <button
            type="button"
            onClick={handleAcceptScan}
            disabled={!scannedResult}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
              scannedResult
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Mulai Ujian dengan Barcode Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
};
