import React from 'react';

export type RoastLanguage = 'HINDI' | 'ENGLISH' | 'MIXED';

interface RoastLanguageGateProps {
  onSelect: (language: RoastLanguage) => void;
}

export const RoastLanguageGate: React.FC<RoastLanguageGateProps> = ({ onSelect }) => {
  const options: Array<{ id: RoastLanguage; title: string; subtitle: string; example: string }> = [
    { id: 'HINDI', title: 'HINDI / HINGLISH', subtitle: 'Desi gaali mode. Full Hindi/Hinglish abuse + memes.', example: 'BC, MC, BSDK — seedha dil pe.' },
    { id: 'ENGLISH', title: 'ENGLISH', subtitle: 'English profanity, insults and developer memes.', example: 'What the fuck was that code?' },
    { id: 'MIXED', title: 'MIXED', subtitle: 'Hindi + English mixed. Maximum chaos.', example: 'BC, what the fuck is this code?' },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black p-4 font-mono">
      <div className="w-full max-w-3xl rounded-2xl border-2 border-red-700 bg-slate-950 p-7 shadow-[0_0_100px_rgba(220,38,38,0.28)] md:p-10">
        <div className="text-center">
          <div className="text-5xl">☠️</div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-red-500 md:text-4xl">FIRST, CHOOSE YOUR GAALI LANGUAGE</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Before Python starts beating your ass, choose the language for the fictional teacher&apos;s profanity, roasts and memes.
          </p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">This controls roast language — not Python syntax or lesson terminology.</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className="group rounded-xl border border-slate-800 bg-black p-5 text-left transition hover:-translate-y-1 hover:border-red-600 hover:bg-red-950/20"
            >
              <div className="text-lg font-black text-white group-hover:text-red-400">{option.title}</div>
              <div className="mt-3 text-xs leading-5 text-slate-400">{option.subtitle}</div>
              <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-3 text-[11px] font-bold text-red-300">“{option.example}”</div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center text-[10px] text-slate-600">You can change this later by clearing/resetting the learner session.</div>
      </div>
    </div>
  );
};
