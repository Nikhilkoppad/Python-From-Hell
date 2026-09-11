import React from 'react';
import type { LearningLanguage, RoastIntensity } from '../types';
import { Bot } from 'lucide-react';

export type AICharacterState =
  | 'idle'
  | 'thinking'
  | 'teaching'
  | 'mocking'
  | 'angry'
  | 'celebrating'
  | 'warning'
  | 'boss_mode';

interface AICharacterBannerProps {
  state: AICharacterState;
  language: LearningLanguage | string;
  intensity: RoastIntensity | string;
  customMessage?: string;
  onOpenTutor: () => void;
}

export const AICharacterBanner: React.FC<AICharacterBannerProps> = ({
  state,
  language,
  customMessage,
  onOpenTutor,
}) => {
  const isHindi = language === 'HINDI';

  const getStateConfig = () => {
    switch (state) {
      case 'thinking':
        return {
          avatar: '⏳',
          title: 'JARVIS // RUNNING TRACE',
          color: 'border-yellow-600/50 bg-yellow-950/20 text-yellow-300',
          defaultMsg: isHindi ? 'Tera code Python 3.11 engine me execute ho raha hai...' : 'Python runtime is executing your instructions...',
        };
      case 'celebrating':
        return {
          avatar: '🔥',
          title: 'JARVIS // CLEARED',
          color: 'border-emerald-600/50 bg-emerald-950/20 text-emerald-300',
          defaultMsg: isHindi ? 'Chalo, at least ek cheez sahi chali. Overconfidence mat dikha.' : 'Challenge cleared. Keep your momentum going.',
        };
      case 'angry':
        return {
          avatar: '🤬',
          title: 'JARVIS // DISAPPOINTED',
          color: 'border-red-600 bg-red-950/40 text-red-300',
          defaultMsg: isHindi ? 'BC, 4 baar wahi galti! Aankh khol ke traceback padh!' : 'Repeated failure pattern detected. Stop guessing and trace your logic!',
        };
      case 'mocking':
        return {
          avatar: '💀',
          title: 'JARVIS // WITNESS',
          color: 'border-red-900/60 bg-slate-900/90 text-red-200',
          defaultMsg: isHindi ? 'Python ne tera code reject maar diya. Check the error.' : 'Execution failed. Inspect the traceback and rectify the logic.',
        };
      case 'warning':
        return {
          avatar: '⚠️',
          title: 'JARVIS // DEPENDENCY WARNING',
          color: 'border-amber-600/60 bg-amber-950/20 text-amber-300',
          defaultMsg: isHindi ? 'Bohot saare hints le raha hai bhai. Thoda khud bhi soch.' : 'High AI hint usage detected. Try solving independently for higher mastery.',
        };
      case 'boss_mode':
        return {
          avatar: '👹',
          title: 'JARVIS // BOSS PROCTOR',
          color: 'border-red-500 bg-red-950/60 text-white animate-pulse',
          defaultMsg: isHindi ? 'BOSS BATTLE ACTIVE: Cerberus ko code se hara!' : 'High-stakes battle active. Prove your Python competence.',
        };
      default:
        return {
          avatar: '🤖',
          title: 'JARVIS // HELL PROCTOR',
          color: 'border-slate-800 bg-slate-900/60 text-slate-300',
          defaultMsg: isHindi ? 'Code likh aur execute kar. Galti hui toh main dekh raha hoon.' : 'Write your solution and execute. Every attempt is evaluated in real time.',
        };
    }
  };

  const config = getStateConfig();

  return (
    <div
      onClick={onOpenTutor}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:border-red-500 flex items-center justify-between gap-3 ${config.color}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-xl p-1 bg-black/40 rounded-lg border border-slate-800">
          {config.avatar}
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-1.5">
            <Bot className="w-3 h-3" />
            <span>{config.title}</span>
          </div>
          <p className="text-xs font-mono text-slate-200 mt-0.5 leading-tight">
            {customMessage || config.defaultMsg}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-800">
          {isHindi ? 'Ask AI →' : 'Consult AI →'}
        </span>
      </div>
    </div>
  );
};
