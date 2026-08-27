import React, { useState } from 'react';
import { Users, Shield, AlertTriangle, CheckCircle, RotateCcw, X, Lock, Unlock, Wifi, Battery, Clock, Search } from 'lucide-react';
import { ExamConfig } from '../types';

interface StudentDevice {
  id: string;
  name: string;
  nis: string;
  deskNumber: string;
  platform: 'Android' | 'iOS' | 'Windows' | 'macOS';
  battery: number;
  isOnline: boolean;
  isLocked: boolean;
  strikes: number;
  status: 'active' | 'warning' | 'locked' | 'submitted';
  lastActivity: string;
}

interface ProctorMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ExamConfig;
}

export const ProctorMonitorModal: React.FC<ProctorMonitorModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [devices, setDevices] = useState<StudentDevice[]>([
    {
      id: 'dev-1',
      name: 'Aditya Pratama',
      nis: '2026101',
      deskNumber: 'LAB-01',
      platform: 'Windows',
      battery: 100,
      isOnline: true,
      isLocked: true,
      strikes: 0,
      status: 'active',
      lastActivity: 'Mengerjakan Soal 12',
    },
    {
      id: 'dev-2',
      name: 'Bernadetta Michelle',
      nis: '2026102',
      deskNumber: 'LAB-02',
      platform: 'Android',
      battery: 84,
      isOnline: true,
      isLocked: true,
      strikes: 1,
      status: 'warning',
      lastActivity: 'Peringatan: Upaya Split Screen',
    },
    {
      id: 'dev-3',
      name: 'Christian Wijaya',
      nis: '2026103',
      deskNumber: 'LAB-03',
      platform: 'iOS',
      battery: 92,
      isOnline: true,
      isLocked: false,
      strikes: 3,
      status: 'locked',
      lastActivity: 'Terkunci: Melampaui 3x Strike',
    },
    {
      id: 'dev-4',
      name: 'Devina Aurelia',
      nis: '2026104',
      deskNumber: 'LAB-04',
      platform: 'Android',
      battery: 68,
      isOnline: true,
      isLocked: true,
      strikes: 0,
      status: 'submitted',
      lastActivity: 'Jawaban Terkirim (100%)',
    },
    {
      id: 'dev-5',
      name: 'Ezekiel Bryan',
      nis: '2026105',
      deskNumber: 'LAB-05',
      platform: 'macOS',
      battery: 79,
      isOnline: true,
      isLocked: true,
      strikes: 0,
      status: 'active',
      lastActivity: 'Mengerjakan Soal 8',
    },
  ]);

  if (!isOpen) return null;

  const handleResetStrikes = (id: string) => {
    setDevices(prev =>
      prev.map(d => (d.id === id ? { ...d, strikes: 0, status: 'active', isLocked: true } : d))
    );
  };

  const handleForceLock = (id: string) => {
    setDevices(prev =>
      prev.map(d => (d.id === id ? { ...d, isLocked: !d.isLocked, status: !d.isLocked ? 'active' : 'locked' } : d))
    );
  };

  const filteredDevices = devices.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.deskNumber.toLowerCase().includes(searchTerm.toLowerCase()) || d.nis.includes(searchTerm);
    if (filterStatus === 'all') return matchSearch;
    return matchSearch && d.status === filterStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Proctor Live Monitoring Dashboard</h3>
              <p className="text-xs text-slate-400">Pemantauan real-time status perangkat siswa di ruang ujian</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Metric Bar */}
        <div className="grid grid-cols-4 gap-3 my-4">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Total Peserta</span>
            <span className="text-lg font-bold font-mono text-white">{devices.length}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Sedang Mengerjakan</span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {devices.filter(d => d.status === 'active').length}
            </span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Terindikasi Strike</span>
            <span className="text-lg font-bold font-mono text-amber-400">
              {devices.filter(d => d.status === 'warning').length}
            </span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Terkunci / Lockout</span>
            <span className="text-lg font-bold font-mono text-red-400">
              {devices.filter(d => d.status === 'locked').length}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, NIS, atau meja..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', 'active', 'warning', 'locked', 'submitted'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table List */}
        <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Meja / Siswa</th>
                <th className="py-2.5 px-3">Perangkat</th>
                <th className="py-2.5 px-3">Status Layar</th>
                <th className="py-2.5 px-3">Pelanggaran</th>
                <th className="py-2.5 px-3">Aktivitas Terakhir</th>
                <th className="py-2.5 px-3 text-right">Tindakan Pengawas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredDevices.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{d.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{d.deskNumber} • NIS: {d.nis}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {d.platform}
                    </span>
                    <span className="ml-2 text-slate-400">⚡{d.battery}%</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                      d.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      d.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      d.status === 'submitted' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={d.strikes > 0 ? 'text-red-400' : 'text-slate-400'}>
                      {d.strikes} / {config.maxViolations}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 text-[11px]">
                    {d.lastActivity}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {d.strikes > 0 && (
                        <button
                          onClick={() => handleResetStrikes(d.id)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs transition"
                          title="Reset Strike & Buka Kunci"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleForceLock(d.id)}
                        className={`p-1.5 rounded-lg text-xs transition ${
                          d.isLocked
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                        title={d.isLocked ? 'Buka Kunci' : 'Kunci Paksa'}
                      >
                        {d.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Emergency Admin PIN: <strong className="font-mono text-amber-400">{config.adminPin}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
          >
            Tutup Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
