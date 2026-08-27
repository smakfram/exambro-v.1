import React from 'react';
import { 
  ShieldCheck, 
  Play, 
  Code2, 
  Layers, 
  QrCode, 
  Terminal, 
  Lock,
  Smartphone,
  Monitor
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'simulator',
      label: 'Kiosk Simulator',
      icon: <Play className="w-4 h-4" />,
      badge: 'Live Test'
    },
    {
      id: 'flutter-code',
      label: 'Flutter & Native Code',
      icon: <Code2 className="w-4 h-4" />
    },
    {
      id: 'electron-code',
      label: 'Electron Desktop Code',
      icon: <Monitor className="w-4 h-4" />
    },
    {
      id: 'architecture',
      label: 'Arsitektur & Keamanan',
      icon: <Layers className="w-4 h-4" />
    },
    {
      id: 'qr-generator',
      label: 'QR Code & Token Generator',
      icon: <QrCode className="w-4 h-4" />
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO & TITLE */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 rounded-xl text-white shadow-md shadow-indigo-950/50 border border-indigo-400/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  Secure ExamBrowser
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Enterprise Kiosk
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Lockdown Engine for Google Forms & CBT Platforms
              </p>
            </div>
          </div>

          {/* NAV TABS */}
          <nav className="flex items-center gap-1.5 overflow-x-auto py-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-2 shrink-0 border ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-950/40 font-bold'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/80 hover:border-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
