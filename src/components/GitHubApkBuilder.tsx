import React, { useState } from 'react';
import { 
  GitBranch, 
  Download, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Play, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  Sparkles,
  FileCode,
  Github,
  Zap,
  Globe,
  Share2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const GitHubApkBuilder: React.FC = () => {
  const [githubUser, setGithubUser] = useState('smakfrateranmlg');
  const [githubRepo, setGithubRepo] = useState('exambrowser');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const directDownloadUrl = `https://github.com/${githubUser || 'smakfrateranmlg'}/${githubRepo || 'exambrowser'}/releases/latest/download/app-release.apk`;
  const githubActionsUrl = `https://github.com/${githubUser || 'smakfrateranmlg'}/${githubRepo || 'exambrowser'}/actions`;
  const githubReleasesUrl = `https://github.com/${githubUser || 'smakfrateranmlg'}/${githubRepo || 'exambrowser'}/releases`;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const workflowYaml = `name: Build & Release ExamBrowser APK

on:
  push:
    branches: [ main, master ]
    tags:
      - 'v*'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build-apk:
    name: Build Android Release APK
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout Repository Code
        uses: actions/checkout@v4

      - name: ☕ Setup Java (JDK 17)
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: 🐦 Setup Flutter SDK
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.22.x'
          channel: 'stable'
          cache: true

      - name: 📦 Install Flutter Dependencies
        run: flutter pub get

      - name: 🔨 Build Universal Release APK
        run: flutter build apk --release

      - name: 📤 Upload Artifact
        uses: actions/upload-artifact@v4
        with:
          name: Secure-ExamBrowser-Android-APK
          path: build/app/outputs/flutter-apk/app-release.apk
          retention-days: 30

      - name: 🚀 Publish Public Online Release
        if: startsWith(github.ref, 'refs/tags/') || github.event_name == 'workflow_dispatch'
        uses: softprops/action-gh-release@v2
        with:
          name: Secure ExamBrowser Release \${{ github.ref_name || 'v1.0.0' }}
          tag_name: \${{ github.ref_name || 'v1.0.0' }}
          files: build/app/outputs/flutter-apk/app-release.apk
          generate_release_notes: true
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;

  const gitPushScript = `# 1. Inisialisasi Git di Komputer / Terminal Anda
git init
git add .
git commit -m "feat: setup secure exambrowser android and github actions pipeline"

# 2. Hubungkan ke Repositori GitHub Anda
git branch -M main
git remote add origin https://github.com/${githubUser}/${githubRepo}.git

# 3. Unggah ke GitHub (Akan Otomatis Memicu Build APK)
git push -u origin main`;

  return (
    <div className="space-y-8">
      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Github className="w-3.5 h-3.5" />
              <span>Automated GitHub Actions CI/CD Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Build & Distribusi APK Android via GitHub
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Repositori ini telah dikonfigurasi dengan skrip **GitHub Actions (`.github/workflows/build-apk.yml`)**. Anda dapat mengompilasi APK rilis secara otomatis di cloud GitHub dan membagikan link download langsung ke siswa tanpa perlu menginstal Android Studio di komputer.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <a
              href={githubActionsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 transition border border-indigo-400/30"
            >
              <Play className="w-4 h-4" />
              <span>Buka GitHub Actions ({githubRepo})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={githubReleasesUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Halaman GitHub Releases</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* GITHUB REPO CONFIGURATOR & DIRECT DOWNLOAD LINK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CONFIG BOX (7 COLS) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Github className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Pengaturan Repositori GitHub Anda</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Username / Organisasi GitHub:
              </label>
              <input
                type="text"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                placeholder="smakfrateranmlg"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Nama Repositori (Repository Name):
              </label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="exambrowser"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* GENERATED DIRECT DOWNLOAD LINK BOX */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Link Download Publik untuk Siswa (Direct APK Link):</span>
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                Auto-Updated
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={directDownloadUrl}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-300 font-mono text-xs select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={() => copyText(directDownloadUrl, 'direct-link')}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
              >
                {copiedKey === 'direct-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'direct-link' ? 'Tersalin' : 'Salin Link'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Bagikan link di atas ke grup WhatsApp kelas, Linktree sekolah, atau website resmi sekolah. Siswa dapat langsung mengklik link tersebut di Android untuk mengunduh versi APK terbaru.
            </p>
          </div>

          {/* 3-STEP PIPELINE INSTRUCTIONS */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3 Langkah Menjalankan Build di GitHub:
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1 flex-1">
                  <p className="font-bold text-white">Push Kode ke GitHub</p>
                  <p className="text-slate-400 text-[11px]">
                    Unggah seluruh folder proyek ini ke repositori GitHub Anda. File <code className="text-indigo-300">.github/workflows/build-apk.yml</code> sudah tersedia di dalam proyek.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1 flex-1">
                  <p className="font-bold text-white">Jalankan Build di Tab "Actions"</p>
                  <p className="text-slate-400 text-[11px]">
                    Buka tab <strong>Actions</strong> di GitHub ➔ Pilih <strong>Build & Release ExamBrowser APK</strong> ➔ Klik <strong>Run workflow</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1 flex-1">
                  <p className="font-bold text-white">Unduh APK / Rilis Publik Otomatis</p>
                  <p className="text-slate-400 text-[11px]">
                    GitHub Actions akan mengompilasi rilis APK universal dan mempublikasikannya ke menu <strong>Releases</strong> secara otomatis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR CODE FOR DIRECT APK DOWNLOAD (5 COLS) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between items-center text-center space-y-5">
          <div className="w-full">
            <div className="flex items-center justify-center gap-2 mb-1">
              <QrCode className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">QR Code Download APK Siswa</h3>
            </div>
            <p className="text-xs text-slate-400">
              Tampilkan di proyektor kelas atau cetak di papan pengumuman agar siswa dapat langsung scan untuk instalasi APK.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-slate-800 inline-block">
            <QRCodeSVG
              value={directDownloadUrl}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="w-full space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">File Output:</span>
              <span className="font-mono font-bold text-white">app-release.apk</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Platform:</span>
              <span className="font-mono text-emerald-400">Android 5.0 - 15 (API 21-34)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Arsitektur:</span>
              <span className="font-mono text-indigo-300">Universal (arm64-v8a, armeabi-v7a, x86_64)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => copyText(directDownloadUrl, 'qr-url')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-slate-700"
          >
            {copiedKey === 'qr-url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedKey === 'qr-url' ? 'Link Download Disalin!' : 'Bagikan Link APK ke Siswa'}</span>
          </button>
        </div>
      </div>

      {/* CODE VIEWERS FOR WORKFLOW & GIT COMMANDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WORKFLOW YAML */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>.github/workflows/build-apk.yml (Telah Tersimpan)</span>
            </div>
            <button
              onClick={() => copyText(workflowYaml, 'yaml')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition flex items-center gap-1"
            >
              {copiedKey === 'yaml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'yaml' ? 'Tersalin' : 'Salin YAML'}</span>
            </button>
          </div>
          <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[300px] leading-relaxed">
            {workflowYaml}
          </pre>
        </div>

        {/* GIT COMMANDS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Perintah Git Terminal untuk Upload ke GitHub</span>
            </div>
            <button
              onClick={() => copyText(gitPushScript, 'git')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition flex items-center gap-1"
            >
              {copiedKey === 'git' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'git' ? 'Tersalin' : 'Salin Perintah'}</span>
            </button>
          </div>
          <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-[300px] leading-relaxed">
            {gitPushScript}
          </pre>
        </div>
      </div>
    </div>
  );
};
