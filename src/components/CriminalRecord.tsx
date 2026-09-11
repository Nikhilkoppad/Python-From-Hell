import React from 'react';
import type { IncidentLog } from '../types';
import { ShieldAlert, Terminal } from 'lucide-react';

interface CriminalRecordProps {
  incidents?: IncidentLog[];
  progress?: { incidents?: IncidentLog[] };
  onClose: () => void;
}

export const CriminalRecord: React.FC<CriminalRecordProps> = ({ incidents = [], progress, onClose }) => {
  const records = incidents.length ? incidents : (progress?.incidents ?? []);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 font-mono"><div className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-xl border border-slate-800 bg-slate-900 p-6"><div className="flex items-center justify-between border-b border-slate-800 pb-4"><div className="flex items-center gap-2 text-red-500"><ShieldAlert /><h2 className="text-xl font-bold tracking-wider">YOUR CRIMINAL RECORD</h2></div><button type="button" onClick={onClose} className="text-sm font-bold text-slate-400">✕ CLOSE</button></div><div className="my-4 flex-1 space-y-3 overflow-y-auto pr-2">{records.length === 0 ? <div className="py-12 text-center text-sm text-slate-500">No criminal infractions recorded yet. Keep coding...</div> : records.map((item) => <div key={item.id} className="space-y-2 rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs"><div className="flex items-center justify-between text-slate-400"><span className="font-bold text-red-400">{item.id} — {item.levelTitle}</span><span>{item.timestamp}</span></div><div className="font-semibold text-slate-200">{item.roastMessage}</div><div className="flex items-center gap-2 overflow-x-auto rounded bg-black/50 p-2 text-emerald-400"><Terminal className="h-3 w-3 shrink-0 text-slate-500" /><code>{item.codeSnippet}</code></div><div className="text-slate-500">Error: {item.errorType}</div></div>)}</div></div></div>;
};
