import type { Lesson } from '../data/curriculum';
import type { LearningLanguage } from '../types';

interface LessonBriefingProps {
  lesson: Lesson;
  language: LearningLanguage;
  onStart: () => void;
}

export const LessonBriefing = ({ lesson, language, onStart }: LessonBriefingProps) => {
  const hindi = language === 'HINDI';
  const examples = lesson.teachingSections
    .filter((section) => section.exampleCode)
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/90 p-4 font-mono">
      <section className="w-full max-w-3xl space-y-6 rounded-2xl border border-red-700 bg-slate-950 p-6 shadow-[0_0_100px_rgba(220,38,38,0.28)] md:p-9">
        <div className="flex items-start justify-between gap-4 border-b border-red-950 pb-5">
          <div>
            <p className="text-[10px] font-black tracking-[0.25em] text-red-500">HELL LESSON // {lesson.stage}</p>
            <h2 className="mt-2 text-2xl font-black text-white">{lesson.title}</h2>
          </div>
          <span className="rounded border border-red-800 bg-red-950/40 px-2 py-1 text-[10px] font-bold text-red-300">{hindi ? 'HINDI MODE' : 'ENGLISH MODE'}</span>
        </div>

        <p className="rounded-lg border border-red-900/50 bg-black p-4 text-sm leading-relaxed text-red-100">
          {hindi
            ? `Sun BC: ${lesson.concept} koi boring textbook ka bhoot nahi hai. Pehle do examples dekh, phir keyboard pakad aur khud kar.`
            : `Listen up: ${lesson.concept} is not a boring textbook ghost. Look at two examples, then take the keyboard and prove you understood it.`}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {examples.map((section, index) => (
            <article key={section.title} className="rounded-xl border border-slate-800 bg-black p-4">
              <p className="text-[10px] font-black tracking-widest text-orange-400">EXAMPLE {index + 1}</p>
              <p className="mt-2 text-xs text-slate-300">{section.explanation}</p>
              <pre className="mt-3 overflow-x-auto rounded bg-slate-950 p-3 text-xs text-green-400">{section.exampleCode}</pre>
              {section.exampleOutput && <p className="mt-2 text-[11px] text-slate-500">Output: {section.exampleOutput}</p>}
            </article>
          ))}
        </div>

        <div className="rounded-lg border border-yellow-900/60 bg-yellow-950/20 p-4 text-xs leading-relaxed text-yellow-100">
          {hindi
            ? 'Rule yaad rakh: galti karna allowed hai, bina dekhe random code chipkana nahi. Error aaye toh last line padh — wahi tera asli villain hai.'
            : 'One rule: mistakes are allowed; random copy-paste is not. When an error appears, read its last line — that is the actual villain.'}
        </div>

        <button type="button" onClick={onStart} className="w-full rounded-xl bg-red-600 px-5 py-4 text-sm font-black tracking-wider text-white transition hover:bg-red-500">
          {hindi ? 'YE LE BC — AB TU TRY KAR →' : 'YOUR TURN — WRITE THE DAMN CODE →'}
        </button>
      </section>
    </div>
  );
};
