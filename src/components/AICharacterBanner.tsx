import React from 'react';
import type { LearningLanguage, RoastIntensity } from '../types';
import { Bot } from 'lucide-react';

export type AICharacterState = 'idle' | 'thinking' | 'teaching' | 'mocking' | 'angry' | 'celebrating' | 'warning' | 'boss_mode';

interface AICharacterBannerProps {
  state: AICharacterState;
  language?: LearningLanguage | string;
  intensity?: RoastIntensity | string;
  customMessage?: string;
  message?: string;
  onOpenTutor?: () => void;
}

export const AICharacterBanner: React.FC<AICharacterBannerProps> = ({ state, language = 'ENGLISH', customMessage, message, onOpenTutor }) => {
  const isHindi = language === 'HINDI';
  const config: Record<AICharacterState, { avatar: string; title: string; defaultMsg: string }> = {
    idle: { avatar: '🤖', title: 'JARVIS // WATCHING', defaultMsg: isHindi ? 'Code likh. Main dekh raha hoon.' : 'Write the code. I am watching.' },
    thinking: { avatar: '⏳', title: 'JARVIS // RUNNING TRACE', defaultMsg: isHindi ? 'Python tera code execute kar raha hai...' : 'Python is executing your instructions...' },
    teaching: { avatar: '🧠', title: 'JARVIS // TEACHING', defaultMsg: 'Stop guessing. Understand the concept.' },
    celebrating: { avatar: '🔥', title: 'JARVIS // CLEARED', defaultMsg: isHindi ? 'Chalo, ek cheez toh sahi chali.' : 'Challenge cleared. Keep going.' },
    angry: { avatar: '🤬', title: 'JARVIS // DISAPPOINTED', defaultMsg: isHindi ? 'Wahi galti phir se. Traceback padh!' : 'Repeated failure detected. Read the traceback.' },
    mocking: { avatar: '💀', title: 'JARVIS // WITNESS', defaultMsg: isHindi ? 'Python ne reject maar diya.' : 'Execution failed. Inspect the evidence.' },
    warning: { avatar: '⚠️', title: 'JARVIS // WARNING', defaultMsg: 'You passed, but I am not calling that mastery yet.' },
    boss_mode: { avatar: '☠️', title: 'JARVIS // BOSS MODE', defaultMsg: 'No hints. Prove you actually learned it.' },
  };
  const current = config[state] ?? config.idle;
  const displayMessage = message ?? customMessage ?? current.defaultMsg;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-xl">{current.avatar}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-red-400"><Bot size={13} /> {current.title}</div>
          <p className="mt-2 text-xs leading-5 text-slate-300">{displayMessage}</p>
        </div>
        {onOpenTutor && <button type="button" onClick={onOpenTutor} className="rounded-lg border border-slate-700 px-3 py-2 text-[10px] font-bold text-slate-300 hover:bg-slate-800">AI TUTOR</button>}
      </div>
    </div>
  );
};
