import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { KioskSimulator } from './components/KioskSimulator';
import { CodeViewer } from './components/CodeViewer';
import { ArchitectureViewer } from './components/ArchitectureViewer';
import { ExamConfigurator } from './components/ExamConfigurator';
import { GitHubApkBuilder } from './components/GitHubApkBuilder';
import { ActiveTab, ExamConfig } from './types';
import { ShieldCheck, ShieldAlert, Sparkles, BookOpen, Lock } from 'lucide-react';

const DEFAULT_CONFIG: ExamConfig = {
  title: 'Penilaian Akhir Semester (PAS) - Biologi XII MIPA',
  schoolName: 'SMA Katolik Frateran Malang',
  formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfD_ExampleGoogleFormLink/viewform',
  durationMinutes: 90,
  adminPin: 'FRATERAN2026',
  allowedDomains: [
    'docs.google.com',
    'forms.gle',
    'accounts.google.com',
    'accounts.youtube.com',
    'ssl.gstatic.com',
    'apis.google.com'
  ],
  maxViolations: 3,
  strictFullscreen: true,
  blockClipboard: true,
  blockScreenCapture: true,
  enableTimer: true
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [examConfig, setExamConfig] = useState<ExamConfig>(DEFAULT_CONFIG);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* NAVBAR */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'simulator' && (
          <KioskSimulator
            config={examConfig}
            onUpdateConfig={setExamConfig}
          />
        )}

        {activeTab === 'github-apk' && (
          <GitHubApkBuilder />
        )}

        {(activeTab === 'flutter-code' || activeTab === 'electron-code' || activeTab === 'native-configs') && (
          <CodeViewer />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureViewer />
        )}

        {activeTab === 'qr-generator' && (
          <ExamConfigurator
            config={examConfig}
            onUpdateConfig={setExamConfig}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-slate-400">Secure ExamBrowser Engine & Kiosk Framework • Enterprise Cybersecurity Standard</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Android (LockTask)</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">iOS (Guided Access)</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Desktop (Electron)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
