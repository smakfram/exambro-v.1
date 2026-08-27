import React, { useState } from 'react';
import { Link2, ShieldCheck, ArrowRight, X, AlertTriangle, Key, FileJson, CheckCircle2, Lock, Globe, FileSpreadsheet, Server, Eye, EyeOff } from 'lucide-react';
import { ExamConfig } from '../types';

interface DeepLinkTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: ExamConfig;
  onLaunchExam: (config: ExamConfig) => void;
}

export const DeepLinkTesterModal: React.FC<DeepLinkTesterModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onLaunchExam,
}) => {
  // Generate sample encrypted base64 payload from config
  const createPayload = (cfg: Partial<ExamConfig>) => {
    const isGForm = cfg.linkType === 'google-form' || (cfg.formUrl && (cfg.formUrl.includes('docs.google.com') || cfg.formUrl.includes('forms.gle')));
    const rawObj = {
      t: cfg.title || currentConfig.title,
      k: cfg.linkType || (isGForm ? 'google-form' : 'general'),
      u: cfg.formUrl || currentConfig.formUrl,
      d: cfg.durationMinutes || currentConfig.durationMinutes,
      p: cfg.adminPin || currentConfig.adminPin,
      s: cfg.schoolName || currentConfig.schoolName,
      w: cfg.allowedDomains || currentConfig.allowedDomains,
      m: cfg.maxViolations || currentConfig.maxViolations,
      timestamp: Date.now(),
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(rawObj))));
  };

  const initialPayload = createPayload(currentConfig);
  const [deepLinkInput, setDeepLinkInput] = useState<string>(`exambrowser://exam?data=${initialPayload}`);
  const [parsedData, setParsedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPin, setShowPin] = useState(false);

  if (!isOpen) return null;

  const handleParse = (link: string) => {
    setErrorMsg(null);
    try {
      if (!link.startsWith('exambrowser://') && !link.startsWith('https://')) {
        throw new Error('Skema URL tidak valid. Harus diawali dengan exambrowser:// atau https://');
      }

      const urlObj = new URL(link.replace('exambrowser://', 'https://placeholder.school/'));
      const dataParam = urlObj.searchParams.get('data');

      if (!dataParam) {
        throw new Error('Parameter ?data= tidak ditemukan di dalam URL deep link.');
      }

      const decodedString = decodeURIComponent(escape(atob(dataParam)));
      const json = JSON.parse(decodedString);

      // Support both short keys (t, k, u, d, p, s, w, m) and full keys
      const url = json.u || json.url;
      const pin = json.p || json.pin;
      const title = json.t || json.title;
      const duration = json.d || json.duration;
      const linkType = json.k || json.linkType || (url && (url.includes('docs.google.com') || url.includes('forms.gle')) ? 'google-form' : 'general');
      const school = json.s || json.school;
      const allowedDomains = json.w || json.allowedDomains;
      const maxViolations = json.m || json.maxViolations;

      if (!url || !pin) {
        throw new Error('Payload korup atau tidak memiliki parameter wajib (url, pin).');
      }

      setParsedData({
        url,
        pin,
        title: title || 'Ujian Terjadwal',
        duration: duration || 60,
        linkType,
        school: school || 'SMAK Frateran Malang',
        allowedDomains: allowedDomains || [],
        maxViolations: maxViolations || 3,
      });
    } catch (err: any) {
      setParsedData(null);
      setErrorMsg(err.message || 'Gagal mendekripsi payload token.');
    }
  };

  const handleLaunchWithDecryptedData = () => {
    if (!parsedData) return;
    const newConfig: ExamConfig = {
      ...currentConfig,
      title: parsedData.title || currentConfig.title,
      linkType: parsedData.linkType || currentConfig.linkType,
      formUrl: parsedData.url || currentConfig.formUrl,
      durationMinutes: parsedData.duration || currentConfig.durationMinutes,
      adminPin: parsedData.pin || currentConfig.adminPin,
      schoolName: parsedData.school || currentConfig.schoolName,
      allowedDomains: parsedData.allowedDomains && parsedData.allowedDomains.length > 0 ? parsedData.allowedDomains : currentConfig.allowedDomains,
      maxViolations: parsedData.maxViolations || currentConfig.maxViolations,
    };
    onLaunchExam(newConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Deep Link Protocol & Payload Tester</h3>
              <p className="text-xs text-slate-400">Simulasikan pembukaan aplikasi via Custom URL Scheme (exambrowser://exam)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Input URL Deep Link Siswa (Custom Scheme):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={deepLinkInput}
                onChange={(e) => {
                  setDeepLinkInput(e.target.value);
                  handleParse(e.target.value);
                }}
                placeholder="exambrowser://exam?data=..."
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleParse(deepLinkInput)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition shrink-0"
              >
                Uji Parse
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Validasi Deep Link Gagal:</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Quick Preset Generators */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block">
              Gunakan Template Token Instan:
            </span>
            <div className="flex flex-wrap gap-2">
              {/* Google Form Template */}
              <button
                onClick={() => {
                  const p = createPayload({
                    title: 'PAS Matematika Wajib (Google Form)',
                    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-SampleMath/viewform',
                    durationMinutes: 90,
                    linkType: 'google-form',
                    allowedDomains: ['docs.google.com', 'forms.gle', 'accounts.google.com'],
                  });
                  const link = `exambrowser://exam?data=${p}`;
                  setDeepLinkInput(link);
                  handleParse(link);
                }}
                className="px-2.5 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/40 text-indigo-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                <span>Google Form: PAS Math (90m)</span>
              </button>

              {/* Moodle LMS Template */}
              <button
                onClick={() => {
                  const p = createPayload({
                    title: 'CBT Moodle LMS Semester Ganjil',
                    formUrl: 'https://moodle.smakfrateranmlg.sch.id/mod/quiz',
                    durationMinutes: 90,
                    linkType: 'general',
                    allowedDomains: ['moodle.smakfrateranmlg.sch.id'],
                  });
                  const link = `exambrowser://exam?data=${p}`;
                  setDeepLinkInput(link);
                  handleParse(link);
                }}
                className="px-2.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Umum: Moodle LMS (90m)</span>
              </button>

              {/* Local Server LAN Template */}
              <button
                onClick={() => {
                  const p = createPayload({
                    title: 'Candy CBT Server Lokal LAN',
                    formUrl: 'http://192.168.1.200/cbt/ujian',
                    durationMinutes: 60,
                    linkType: 'general',
                    allowedDomains: ['192.168.1.200'],
                  });
                  const link = `exambrowser://exam?data=${p}`;
                  setDeepLinkInput(link);
                  handleParse(link);
                }}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>Link Umum: LAN Server CBT (60m)</span>
              </button>
            </div>
          </div>

          {/* Decrypted Payload Breakdown */}
          {parsedData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Payload Terverifikasi & Didekripsi:
                </span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                  parsedData.linkType === 'google-form'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {parsedData.linkType === 'google-form' ? 'Tipe: Google Form' : 'Tipe: Link Umum CBT'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Judul Ujian:</span>
                  <span className="font-bold text-white truncate block">{parsedData.title}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Durasi Ujian:</span>
                  <span className="font-bold text-emerald-400">{parsedData.duration} Menit</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mb-0.5">
                    <span>PIN Pengawas (Admin):</span>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPin ? 'Sembunyikan' : 'Buka'}</span>
                    </button>
                  </div>
                  <span className="font-mono font-bold text-amber-400">
                    {showPin ? parsedData.pin : '•••• (Tersimpan Terenkripsi)'}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Maksimal Pelanggaran:</span>
                  <span className="font-bold text-red-400">{parsedData.maxViolations || 3}x Strike</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-500 block text-[11px] mb-1">
                  {parsedData.linkType === 'google-form' ? 'Target URL Google Form:' : 'Target URL CBT / LMS:'}
                </span>
                <span className="font-mono text-cyan-300 break-all">{parsedData.url}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Tutup
          </button>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(deepLinkInput);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700"
            >
              {copied ? 'Tersalin!' : 'Salin Link'}
            </button>

            <button
              type="button"
              onClick={handleLaunchWithDecryptedData}
              disabled={!parsedData}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
                parsedData
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Buka & Kunci Kios Otomatis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

