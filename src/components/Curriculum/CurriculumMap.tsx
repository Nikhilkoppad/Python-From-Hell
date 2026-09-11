import React from 'react';
import type { UserProgress } from '../../types';
import { CURRICULUM, type Level } from '../../data/curriculum';
import { Map } from 'lucide-react';

interface CurriculumMapProps {
  progress?: UserProgress;
  curriculum?: Level[];
  currentLessonId?: string;
  completedLessons?: string[];
  language?: string;
  onSelectLesson: (lessonId: string) => void;
  onOpenBoss?: () => void;
  onClose: () => void;
}

export const CurriculumMap: React.FC<CurriculumMapProps> = ({ progress, curriculum = CURRICULUM, currentLessonId, completedLessons = [], language = 'ENGLISH', onSelectLesson, onOpenBoss, onClose }) => {
  const completed = progress?.completedLessons ?? completedLessons;
  const activeLesson = progress?.currentLessonId ?? currentLessonId;
  const isHindi = language === 'HINDI';
  const total = curriculum.flatMap((level) => level.lessons).length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 font-mono">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border-2 border-red-600/70 bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-3"><Map className="text-red-500" /><div><h2 className="text-lg font-black text-white">HELL PROGRESSION MAP</h2><p className="text-xs text-slate-500">{completed.length} / {total} CONQUERED</p></div></div>
          <button type="button" onClick={onClose} className="text-xs text-slate-400">✕ CLOSE</button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {curriculum.map((level, levelIndex) => <section key={level.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"><div className="mb-4 text-xs font-black uppercase tracking-widest text-red-400">LEVEL {levelIndex + 1} // {level.title}</div><div className="grid gap-3 md:grid-cols-2">{level.lessons.map((lesson) => { const done = completed.includes(lesson.id); const active = activeLesson === lesson.id; return <button type="button" key={lesson.id} onClick={() => onSelectLesson(lesson.id)} className={`rounded-xl border p-4 text-left ${active ? 'border-red-500 bg-red-500/10' : done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-950'}`}><div className="text-xs font-bold text-white">{lesson.title}</div><div className="mt-1 text-[10px] text-slate-500">{lesson.concept}</div><div className="mt-2 text-[9px] uppercase tracking-widest text-slate-600">{done ? 'CLEARED' : active ? (isHindi ? 'CURRENT' : 'CURRENT') : 'AVAILABLE'}</div></button>; })}</div></section>)}
        </div>
        {onOpenBoss && <div className="border-t border-slate-800 p-4"><button type="button" onClick={onOpenBoss} className="w-full rounded-xl border border-red-700/40 py-3 text-xs font-black uppercase tracking-widest text-red-300">Open Boss Arena</button></div>}
      </div>
    </div>
  );
};
