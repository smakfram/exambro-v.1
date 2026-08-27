import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  FileCode, 
  Layers, 
  Smartphone, 
  Monitor, 
  Shield, 
  Cpu,
  Download
} from 'lucide-react';
import { CODE_SNIPPETS } from '../data/codeSnippets';
import { CodeSnippetItem } from '../types';

export const CodeViewer: React.FC = () => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(CODE_SNIPPETS[0].id);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const platforms = ['All', 'Flutter (Android/iOS)', 'Electron (Desktop)', 'Android Native', 'iOS Native', 'System Config'];

  const filteredSnippets = selectedPlatform === 'All'
    ? CODE_SNIPPETS
    : CODE_SNIPPETS.filter((s) => s.platform === selectedPlatform);

  const currentSnippet = CODE_SNIPPETS.find((s) => s.id === selectedSnippetId) || CODE_SNIPPETS[0];

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (filename: string, code: string) => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.split('/').pop() || 'snippet.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & FILTER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Production-Ready Source Code Hub</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Kode sumber lengkap, teruji, dan siap diimplementasikan untuk Flutter (Mobile), Electron (Desktop), dan Native Manifests.
            </p>
          </div>

          {/* PLATFORM FILTER CHIPS */}
          <div className="flex flex-wrap gap-1.5">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setSelectedPlatform(p);
                  const firstMatch = p === 'All' ? CODE_SNIPPETS[0] : CODE_SNIPPETS.find(s => s.platform === p);
                  if (firstMatch) setSelectedSnippetId(firstMatch.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedPlatform === p
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-950/40'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CODE EXPLORER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FILE LIST (4 COLS) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-2 flex items-center justify-between">
            <span>Daftar File ({filteredSnippets.length})</span>
            <span className="text-[10px] text-slate-500 font-mono">Pilih File</span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredSnippets.map((snippet) => {
              const isSelected = snippet.id === currentSnippet.id;
              return (
                <button
                  key={snippet.id}
                  onClick={() => setSelectedSnippetId(snippet.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 border ${
                    snippet.platform.includes('Flutter') ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                    snippet.platform.includes('Electron') ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' :
                    snippet.platform.includes('Android') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    snippet.platform.includes('iOS') ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                    'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {snippet.platform.includes('Flutter') || snippet.platform.includes('Android') || snippet.platform.includes('iOS') ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Monitor className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">{snippet.filename}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700/60">
                        {snippet.language}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-1">{snippet.category}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CODE DISPLAY (8 COLS) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[620px]">
          {/* Top Info Bar */}
          <div className="bg-slate-950 border-b border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-sm font-bold font-mono text-white truncate">{currentSnippet.filename}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{currentSnippet.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleDownload(currentSnippet.filename, currentSnippet.code)}
                className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition"
                title="Download Source File"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Simpan</span>
              </button>

              <button
                onClick={() => handleCopy(currentSnippet.code, currentSnippet.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  copiedId === currentSnippet.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                }`}
              >
                {copiedId === currentSnippet.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CODE CONTENT */}
          <div className="flex-1 bg-slate-950 p-4 overflow-auto text-xs font-mono leading-relaxed text-slate-200">
            <pre className="selection:bg-indigo-600 selection:text-white">
              <code>{currentSnippet.code}</code>
            </pre>
          </div>

          {/* FOOTER ANNOTATION */}
          <div className="bg-slate-950 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target: {currentSnippet.platform}</span>
            </span>
            <span className="font-mono text-slate-500">{currentSnippet.code.split('\n').length} baris kode</span>
          </div>
        </div>
      </div>
    </div>
  );
};
