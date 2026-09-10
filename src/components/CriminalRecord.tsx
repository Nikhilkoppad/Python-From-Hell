import React from 'react';
import type { IncidentLog } from '../types';
import { ShieldAlert, Terminal } from 'lucide-react';

interface CriminalRecordProps {
  incidents: IncidentLog[];
  onClose: () => void;
}

export const CriminalRecord: React.FC<CriminalRecordProps> = ({ incidents, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 font-mono">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="w-6 h-6" />
            <h2 className="text-xl font-bold tracking-wider">YOUR CRIMINAL RECORD</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold">
            ✕ CLOSE
          </button>
        </div>

        <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-2">
          {incidents.length === 0 ? (
            <div className="text-center text-slate-500 py-12 text-sm">
              No criminal infractions recorded yet. Keep coding...
            </div>
          ) : (
            incidents.map((item) => (
              <div key={item.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-bold text-red-400">{item.id} — {item.levelTitle}</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">{item.timestamp}</span>
                </div>
                <div className="text-slate-200 font-semibold">{item.roastMessage}</div>
                <div className="bg-black/50 p-2 rounded text-emerald-400 flex items-center gap-2 overflow-x-auto">
                  <Terminal className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <code>{item.codeSnippet}</code>
                </div>
                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-slate-500">Error: {item.errorType}</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    item.status === 'Public Safety Hazard' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-amber-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};