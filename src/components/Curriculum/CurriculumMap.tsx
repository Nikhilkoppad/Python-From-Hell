import React from 'react';
import type { UserProgress, LearningLanguage } from '../../types';
import { CURRICULUM } from '../../data/curriculum';
import { Map, CheckCircle2, Lock, Flame, ArrowRight } from 'lucide-react';

interface CurriculumMapProps {
  progress: UserProgress;
  language: LearningLanguage | string;
  onSelectLesson: (lessonId: string) => void;
  onOpenBoss: () => void;
  onClose: () => void;
}

export const CurriculumMap: React.FC<CurriculumMapProps> = ({
  progress,
  language,
  onSelectLesson,
  onOpenBoss,
  onClose,
}) => {
  const isHindi = language === 'HINDI';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
      <div className="max-w-5xl w-full bg-slate-950 border-2 border-red-600/70 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.4)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 border border-red-500 rounded-xl text-red-500">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-wider">HELL PROGRESSION MAP</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 font-bold uppercase">
                  {progress.completedLessons.length} / {CURRICULUM.flatMap(c => c.lessons).length} CONQUERED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isHindi ? 'Har level ek naya shaitan hai. Clear karo aur aage badho.' : 'Navigate through the circles of Python Hell. Unlock advanced arenas.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-all"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* WORLD MAP BODY */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {CURRICULUM.map((level, lvlIdx) => {
            const isUnlocked = lvlIdx === 0 || progress.completedLessons.length >= lvlIdx * 2 || progress.level > lvlIdx;
            const completedInLevel = level.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
            const levelPct = Math.round((completedInLevel / level.lessons.length) * 100);

            return (
              <div
                key={level.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'border-slate-800 bg-slate-900/80 shadow-xl'
                    : 'border-slate-900 bg-slate-950/60 opacity-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-red-500 uppercase tracking-widest">
                        TIER {lvlIdx + 1}
                      </span>
                      {isUnlocked ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold">
                          UNLOCKED
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> LOCKED
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-white">{level.title}</h3>
                    <p className="text-xs text-slate-400">{level.lessons.length} Hell Challenges in this sector</p>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                    <span className="text-xs text-slate-500 font-bold">PROGRESS</span>
                    <span className="text-sm font-black text-red-400">{levelPct}%</span>
                  </div>
                </div>

                {/* LESSON TILES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {level.lessons.map((lesson) => {
                    const isDone = progress.completedLessons.includes(lesson.id);
                    const isCurrent = progress.currentLessonId === lesson.id;

                    return (
                      <button
                        key={lesson.id}
                        disabled={!isUnlocked}
                        onClick={() => {
                          onSelectLesson(lesson.id);
                          onClose();
                        }}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                          isDone
                            ? 'border-emerald-900/50 bg-emerald-950/15 hover:border-emerald-700'
                            : isCurrent
                            ? 'border-red-600 bg-red-950/30'
                            : isUnlocked
                            ? 'border-slate-800 bg-black hover:border-slate-700'
                            : 'border-slate-900 bg-black/40 cursor-not-allowed'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {lesson.stage}
                          </div>
                          <div className="text-xs font-bold text-slate-200 group-hover:text-red-400 transition-colors">
                            {lesson.title}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">
                            {lesson.concept}
                          </div>
                        </div>

                        <div className="pl-3 flex-shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : isCurrent ? (
                            <span className="text-[10px] px-2 py-1 rounded bg-red-600 text-white font-black uppercase tracking-wider">
                              CURRENT
                            </span>
                          ) : isUnlocked ? (
                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors" />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-700" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* BOSS ARENA TRIGGER FOR LEVEL */}
                {lvlIdx === 0 && (
                  <div className="mt-4 p-3 bg-red-950/30 border border-red-800/50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-red-300 font-bold">
                      <Flame className="w-4 h-4 text-red-500" />
                      <span>Level 1 Boss: Cerberus the Syntax Demon</span>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenBoss();
                      }}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all"
                    >
                      CHALLENGE BOSS ⚔️
                    </button>
                  </div>
                )}

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
};
