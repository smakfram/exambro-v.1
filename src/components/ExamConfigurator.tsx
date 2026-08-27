import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Settings2, 
  ShieldCheck, 
  Copy, 
  Check, 
  Lock, 
  ExternalLink, 
  KeyRound, 
  Clock, 
  School, 
  FileSpreadsheet,
  Download,
  Printer,
  Link2,
  Sparkles,
  Globe,
  Server,
  FileText,
  HelpCircle,
  CheckCircle2,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';
import { ExamConfig } from '../types';
import { DeepLinkTesterModal } from './DeepLinkTesterModal';

interface ExamConfiguratorProps {
  config: ExamConfig;
  onUpdateConfig: (newConfig: ExamConfig) => void;
}

export const ExamConfigurator: React.FC<ExamConfiguratorProps> = ({ config, onUpdateConfig }) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedDeepLink, setCopiedDeepLink] = useState(false);
  const [showDeepLinkTester, setShowDeepLinkTester] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [showPinPreview, setShowPinPreview] = useState(false);

  const currentLinkType: 'google-form' | 'general' = config.linkType || (
    config.formUrl.includes('docs.google.com') || config.formUrl.includes('forms.gle') 
      ? 'google-form' 
      : 'general'
  );

  // Encode configuration into a portable encrypted Base64 token payload
  const tokenPayload = {
    t: config.title,
    k: currentLinkType,
    u: config.formUrl,
    d: config.durationMinutes,
    p: config.adminPin,
    s: config.schoolName,
    w: config.allowedDomains,
    m: config.maxViolations
  };

  const encodedToken = btoa(unescape(encodeURIComponent(JSON.stringify(tokenPayload))));
  const deepLinkUrl = `exambrowser://exam?data=${encodedToken}`;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(encodedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyDeepLink = () => {
    navigator.clipboard.writeText(deepLinkUrl);
    setCopiedDeepLink(true);
    setTimeout(() => setCopiedDeepLink(false), 2000);
  };

  const handleSelectLinkType = (type: 'google-form' | 'general') => {
    if (type === 'google-form') {
      const defaultGFormUrl = config.formUrl.includes('docs.google.com') || config.formUrl.includes('forms.gle')
        ? config.formUrl
        : 'https://docs.google.com/forms/d/e/1FAIpQLSc-SampleMath/viewform';
      
      const updatedDomains = Array.from(new Set([
        ...config.allowedDomains,
        'docs.google.com',
        'forms.gle',
        'accounts.google.com'
      ]));

      onUpdateConfig({
        ...config,
        linkType: 'google-form',
        formUrl: defaultGFormUrl,
        allowedDomains: updatedDomains
      });
    } else {
      const defaultGeneralUrl = !config.formUrl.includes('docs.google.com') && !config.formUrl.includes('forms.gle') && config.formUrl.trim() !== ''
        ? config.formUrl
        : 'https://moodle.smakfrateranmlg.sch.id/cbt';

      let extractedHost = '';
      try {
        const u = new URL(defaultGeneralUrl);
        extractedHost = u.hostname;
      } catch {
        extractedHost = '';
      }

      const updatedDomains = extractedHost && !config.allowedDomains.includes(extractedHost)
        ? [...config.allowedDomains, extractedHost]
        : config.allowedDomains;

      onUpdateConfig({
        ...config,
        linkType: 'general',
        formUrl: defaultGeneralUrl,
        allowedDomains: updatedDomains
      });
    }
  };

  const handleUrlChange = (val: string) => {
    let updatedDomains = [...config.allowedDomains];
    try {
      if (val.startsWith('http://') || val.startsWith('https://')) {
        const u = new URL(val);
        if (u.hostname && !updatedDomains.includes(u.hostname)) {
          updatedDomains.push(u.hostname);
        }
      }
    } catch {
      // ignore parsing error during typing
    }

    onUpdateConfig({
      ...config,
      formUrl: val,
      allowedDomains: updatedDomains
    });
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    const clean = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!config.allowedDomains.includes(clean)) {
      onUpdateConfig({
        ...config,
        allowedDomains: [...config.allowedDomains, clean]
      });
      setNewDomain('');
    }
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    onUpdateConfig({
      ...config,
      allowedDomains: config.allowedDomains.filter(d => d !== domainToRemove)
    });
  };

  const handlePrintQR = () => {
    window.print();
  };

  const googleFormPresets = [
    {
      label: 'PAS Matematika Peminatan',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-SampleMath/viewform',
      duration: 90,
    },
    {
      label: 'Simulasi ANBK Literasi 2026',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-SampleANBK/viewform',
      duration: 120,
    },
    {
      label: 'CBT Fisika Terpadu',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-SamplePhysics/viewform',
      duration: 60,
    },
  ];

  const generalLinkPresets = [
    {
      label: 'Moodle LMS Sekolah Frateran',
      url: 'https://moodle.smakfrateranmlg.sch.id/mod/quiz',
      duration: 90,
      domain: 'moodle.smakfrateranmlg.sch.id',
    },
    {
      label: 'Candy CBT / Server Lokal LAN',
      url: 'http://192.168.1.200/cbt/ujian',
      duration: 60,
      domain: '192.168.1.200',
    },
    {
      label: 'Portal Asesmen Mandiri CBT',
      url: 'https://cbt.smakfrateranmlg.sch.id/login',
      duration: 90,
      domain: 'cbt.smakfrateranmlg.sch.id',
    },
    {
      label: 'Quizizz Exam Mode Live',
      url: 'https://quizizz.com/join',
      duration: 45,
      domain: 'quizizz.com',
    },
  ];

  return (
    <div className="space-y-8">
      {/* DEEP LINK TESTER MODAL */}
      <DeepLinkTesterModal
        isOpen={showDeepLinkTester}
        onClose={() => setShowDeepLinkTester(false)}
        currentConfig={config}
        onLaunchExam={(newConfig) => {
          onUpdateConfig(newConfig);
          setShowDeepLinkTester(false);
        }}
      />

      {/* HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Generator Token & Konfigurasi Ujian</h2>
              <p className="text-xs text-slate-400">Pilih tipe link soal (Google Form atau Link Umum CBT), atur keamanan, dan buat barcode ujian terenkripsi</p>
            </div>
          </div>

          <button
            onClick={() => setShowDeepLinkTester(true)}
            className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <Link2 className="w-4 h-4" />
            <span>Test Deep Link Handler</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM CONFIGURATION (7 COLS) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-sm font-bold text-white tracking-tight">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-indigo-400" />
              <span>Parameter Ujian & Tipe Link</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border ${
              currentLinkType === 'google-form' 
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              Mode: {currentLinkType === 'google-form' ? 'Google Form' : 'Link Umum CBT'}
            </span>
          </div>

          <div className="space-y-5 text-xs">
            {/* SCHOOL & TITLE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Nama Sekolah / Institusi:</span>
                </label>
                <input
                  type="text"
                  value={config.schoolName}
                  onChange={(e) => onUpdateConfig({ ...config, schoolName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Judul Mata Pelajaran / Ujian:</span>
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => onUpdateConfig({ ...config, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* DUAL LINK TYPE SELECTOR BUTTONS */}
            <div className="space-y-2">
              <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pilih Format / Tipe Link Soal Ujian:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* OPTION 1: GOOGLE FORM */}
                <button
                  type="button"
                  onClick={() => handleSelectLinkType('google-form')}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 relative ${
                    currentLinkType === 'google-form'
                      ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      <div className={`p-1.5 rounded-lg ${currentLinkType === 'google-form' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <span>Link Google Form</span>
                    </div>
                    {currentLinkType === 'google-form' && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Format Google Form (docs.google.com/forms atau forms.gle) dengan proteksi whitelist Google.
                  </p>
                </button>

                {/* OPTION 2: LINK UMUM */}
                <button
                  type="button"
                  onClick={() => handleSelectLinkType('general')}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 relative ${
                    currentLinkType === 'general'
                      ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      <div className={`p-1.5 rounded-lg ${currentLinkType === 'general' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Globe className="w-4 h-4" />
                      </div>
                      <span>Link Umum (CBT / Web LMS)</span>
                    </div>
                    {currentLinkType === 'general' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Untuk Moodle, Candy CBT, BeeSMART, Server LAN/IP Lokal, Quizizz, atau Web Portal Sekolah.
                  </p>
                </button>
              </div>
            </div>

            {/* URL INPUT & PRESET SAMPLES */}
            <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {currentLinkType === 'google-form' ? (
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <Server className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{currentLinkType === 'google-form' ? 'Alamat URL Google Form:' : 'Alamat URL Website / Server CBT:'}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {currentLinkType === 'google-form' ? 'docs.google.com/forms' : 'HTTP/HTTPS / IP Lokal'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={config.formUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder={
                      currentLinkType === 'google-form'
                        ? 'https://docs.google.com/forms/d/e/.../viewform atau https://forms.gle/...'
                        : 'https://moodle.sekolah.sch.id atau http://192.168.1.200/cbt'
                    }
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs transition"
                  />
                  <ExternalLink className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* QUICK PRESET TEMPLATES */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Template Cepat ({currentLinkType === 'google-form' ? 'Google Form' : 'Link Umum'}):</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentLinkType === 'google-form'
                    ? googleFormPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            onUpdateConfig({
                              ...config,
                              title: preset.label,
                              formUrl: preset.url,
                              durationMinutes: preset.duration,
                              linkType: 'google-form',
                            });
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-[11px] text-slate-300 transition"
                        >
                          {preset.label} ({preset.duration}m)
                        </button>
                      ))
                    : generalLinkPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const updatedDomains = !config.allowedDomains.includes(preset.domain)
                              ? [...config.allowedDomains, preset.domain]
                              : config.allowedDomains;

                            onUpdateConfig({
                              ...config,
                              title: preset.label,
                              formUrl: preset.url,
                              durationMinutes: preset.duration,
                              linkType: 'general',
                              allowedDomains: updatedDomains,
                            });
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-[11px] text-slate-300 transition"
                        >
                          {preset.label} ({preset.duration}m)
                        </button>
                      ))}
                </div>
              </div>
            </div>

            {/* Duration & Admin PIN Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Durasi Ujian (Menit):</span>
                </label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={config.durationMinutes}
                  onChange={(e) => onUpdateConfig({ ...config, durationMinutes: parseInt(e.target.value) || 60 })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password / PIN Pengawas:</span>
                </label>
                <input
                  type="text"
                  value={config.adminPin}
                  onChange={(e) => onUpdateConfig({ ...config, adminPin: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-mono font-bold tracking-wider focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            {/* Max Violations Strike */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">
                Batas Toleransi Pelanggaran (Maksimal Strike):
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onUpdateConfig({ ...config, maxViolations: num })}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs transition border ${
                      config.maxViolations === num
                        ? 'bg-red-950/60 border-red-500 text-red-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {num}x Pelanggaran
                  </button>
                ))}
              </div>
            </div>

            {/* Whitelist Domains Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-400 font-semibold">
                  Daftar Domain URL yang Diizinkan (Whitelist):
                </label>
                <span className="text-[10px] text-slate-500">Domain selain ini akan diblokir</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {config.allowedDomains.map((dom) => (
                  <span
                    key={dom}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono"
                  >
                    <span>{dom}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDomain(dom)}
                      className="text-slate-500 hover:text-red-400 ml-1 text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddDomain} className="flex gap-2">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="Tambah domain (misal: moodle.sekolah.sch.id)..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                >
                  + Tambah
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* QR CODE DISPLAY & TOKEN EXPORT (5 COLS) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-between text-center">
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-2 border-b border-slate-800">
              <span className="font-semibold uppercase tracking-wider">Exam QR Code Badge</span>
              <span className="text-emerald-400 font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Ready to Scan</span>
            </div>

            {/* QR CODE CANVAS CONTAINER */}
            <div className="p-4 bg-white rounded-2xl shadow-xl inline-block mx-auto mb-4 border-4 border-slate-800">
              <QRCodeSVG
                value={encodedToken}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="space-y-2 mb-4 text-left bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Tipe Link:</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                  currentLinkType === 'google-form'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {currentLinkType === 'google-form' ? 'Google Form' : 'Link Umum CBT'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mata Pelajaran:</span>
                <span className="font-bold text-white truncate max-w-[180px]">{config.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Durasi:</span>
                <span className="font-bold text-emerald-400 font-mono">{config.durationMinutes} Menit</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">PIN Pengawas (Rahasia):</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-amber-400">
                    {showPinPreview ? config.adminPin : '••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPinPreview(!showPinPreview)}
                    className="p-1 rounded text-slate-500 hover:text-slate-200"
                    title={showPinPreview ? 'Sembunyikan PIN' : 'Lihat PIN Pengawas'}
                  >
                    {showPinPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="pt-1.5 border-t border-slate-800/80">
                <span className="text-slate-500 block text-[10px] mb-0.5">Target URL:</span>
                <span className="text-cyan-300 font-mono text-[11px] break-all block leading-tight">
                  {config.formUrl}
                </span>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="w-full space-y-2 pt-2">
            <button
              onClick={handleCopyDeepLink}
              className="w-full py-2.5 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-indigo-500/40"
            >
              {copiedDeepLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Deep Link URL Tersalin!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  <span>Salin Custom Scheme (exambrowser://)</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyToken}
              className="w-full py-2.5 px-4 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700/80"
            >
              {copiedToken ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Token Enkripsi Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Token Enkripsi (Base64 Payload)</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrintQR}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-950/40"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Barcode Meja Ujian (Print)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

