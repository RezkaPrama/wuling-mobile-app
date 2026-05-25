import { Database, Globe, Info, LogOut, RotateCcw, Wifi } from 'lucide-react';
import React, { useState } from 'react';
import { Badge, Button, Card } from './UI';

interface SettingsTabProps {
  onLogout: () => void;
}

export default function SettingsTab({ onLogout }: SettingsTabProps) {
  const [offlineMode, setOfflineMode] = useState(false);
  const [language, setLanguage] = useState<'ID' | 'EN'>('ID');
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    'Shift started on 07:00 AM UTC',
    'Database initialized with 4 PM tasks',
    'Session storage caching configured successfully'
  ]);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLogs(prev => [
        `Inspection cache synced at ${new Date().toLocaleTimeString()} WIB`,
        ...prev
      ]);
    }, 1500);
  };

  const clearCache = () => {
    alert('Local system database reset success!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-[#D91E1E] px-6 pt-16 pb-12 rounded-b-[32px] shadow-lg shadow-red-900/10 flex flex-col items-center">
        <div className="w-20 h-20 bg-white/25 rounded-3xl border border-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-extrabold text-white tracking-wider mb-3 shadow-lg">
          RP
        </div>
        <h1 className="text-xl font-bold text-white leading-tight">Rezka Pratama</h1>
        <p className="text-red-100 text-xs font-semibold uppercase tracking-widest mt-0.5">Wuling Senior Technician</p>
        <div className="mt-2 text-gray-900 border-none font-bold">
          <Badge variant="yellow">
            ID: WUL-10293
          </Badge>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* Achievements / Credentials Card */}
        <Card className="p-4 border border-gray-100 bg-white shadow-sm flex justify-around">
          <div className="text-center">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">PM Ticked</p>
            <p className="text-xl font-extrabold text-gray-900">42</p>
          </div>
          <div className="h-10 w-px bg-gray-100 self-center" />
          <div className="text-center">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">accuracy</p>
            <p className="text-xl font-extrabold text-green-600">98.5%</p>
          </div>
          <div className="h-10 w-px bg-gray-100 self-center" />
          <div className="text-center">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">Shift Hrs</p>
            <p className="text-xl font-extrabold text-gray-900">7.5 hr</p>
          </div>
        </Card>

        {/* Industrial settings toggle list */}
        <div>
          <h3 className="font-bold text-gray-900 text-sm mb-3 ml-1">Device & System Config</h3>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {/* Offline Mode Sync */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-gray-800">Cache Offline Mode</p>
                  <p className="text-[10px] text-gray-400">Store completed sheets in memory</p>
                </div>
              </div>
              <button
                onClick={() => setOfflineMode(!offlineMode)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  offlineMode ? 'bg-[#D91E1E]' : 'bg-gray-200'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  offlineMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Language Selection */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-gray-800">System Language</p>
                  <p className="text-[10px] text-gray-400">Localization target translation</p>
                </div>
              </div>
              <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button
                  onClick={() => setLanguage('ID')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                    language === 'ID' ? 'bg-white text-[#D91E1E] shadow-sm' : 'text-gray-400'
                  }`}
                >
                  ID
                </button>
                <button
                  onClick={() => setLanguage('EN')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                    language === 'EN' ? 'bg-white text-[#D91E1E] shadow-sm' : 'text-gray-400'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Sync Cache Database manually */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleSync}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-50 text-green-600 border border-green-100">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-gray-800">Manual Database Sync</p>
                  <p className="text-[10px] text-gray-400">Push inspection checklists to server</p>
                </div>
              </div>
              <button disabled={syncing} className="text-xs font-bold text-[#D91E1E] hover:underline">
                {syncing ? 'Syncing...' : 'Sync'}
              </button>
            </div>
          </div>
        </div>

        {/* Console logs view */}
        <Card className="p-4 border border-gray-100 bg-[#1E1E1E]">
          <div className="flex justify-between items-center mb-2.5 border-b border-white/10 pb-2">
            <span className="text-[9px] text-yellow-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3 h-3" /> System Console Logs
            </span>
            <RotateCcw className="w-3 h-3 text-gray-500 hover:text-white cursor-pointer" onClick={() => setLogs(['Local state cleared'])} />
          </div>
          <div className="font-mono text-[9px] text-green-400 space-y-1.5 h-20 overflow-y-auto pr-1">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-1">
                <span className="text-gray-500 font-bold">&gt;</span>
                <span className="break-all">{log}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Sign Out Action Button */}
        <div className="pt-2">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full border-gray-200 text-gray-500 flex items-center justify-center gap-2.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sistem (Log Out)</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
