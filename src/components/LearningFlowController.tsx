import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Brain, CheckCircle2, Flame, LockKeyhole, Sparkles } from 'lucide-react';
import { CURRICULUM, findLesson } from '../data/curriculum';
import { loadProgress } from '../utils/progressPersistence';

interface LearningFlowControllerProps {
  children: React.ReactNode;
}

type FlowStage = 'BRIEFING' | 'CHECK' | 'READY' | 'ARENA';

const FLOW_KEY = 'python-from-hell-learning-flow';

function getCurrentLessonId(): string {
  const progress = loadProgress();
  return typeof progress.currentLessonId === 'string'
    ? progress.currentLessonId
    : CURRICULUM[0]?.lessons[0]?.id ?? '';
}

export function LearningFlowController({ children }: LearningFlowControllerProps) {
  const [lessonId, setLessonId] = useState(getCurrentLessonId);
  const [stage, setStage] = useState<FlowStage>(() => {
    const id = getCurrentLessonId();
    return sessionStorage.getItem(`${FLOW_KEY}:${id}`) === 'done'
      ? 'ARENA'
      : 'BRIEFING';
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const lesson = useMemo(() => findLesson(lessonId), [lessonId]);

  useEffect(() => {
    const sync = () => {
      const nextLessonId = getCurrentLessonId();
      if (!nextLessonId || nextLessonId === lessonId) return;

      setLessonId(nextLessonId);
      setSelectedAnswer(null);
      setAnswered(false);
      setStage(
        sessionStorage.getItem(`${FLOW_KEY}:${nextLessonId}`) === 'done'
          ? 'ARENA'
          : 'BRIEFING'
      );
    };

    const timer = window.setInterval(sync, 500);
    window.addEventListener('storage', sync);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', sync);
    };
  }, [lessonId]);

  if (!lesson || stage === 'ARENA') {
    return <>{children}</>;
  }

  const check = lesson.knowledgeCheck;
  const correct = selectedAnswer === check.correctAnswer;

  const chooseAnswer = (index: number) => {
    setSelectedAnswer(index);
    setAnswered(true);
  };

  const continueFromBriefing = () => {
    setStage('CHECK');
    setSelectedAnswer(null);
    setAnswered(false);
  };

  const continueFromCheck = () => {
    if (!correct) return;
    setStage('READY');
  };

  const enterArena = () => {
    sessionStorage.setItem(`${FLOW_KEY}:${lesson.id}`, 'done');
    setStage('ARENA');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05070a] text-slate-100">
      <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
              <Flame size={19} className="text-red-400" />
            </div>
            <div>
              <div className="text-xs font-black tracking-[0.22em] text-white">PYTHON FROM HELL</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-600">adaptive lesson briefing</div>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-[9px] uppercase tracking-widest text-slate-600">CURRENT TARGET</div>
            <div className="mt-1 text-xs font-bold text-slate-300">{lesson.title}</div>
          </div>
        </div>

        {stage === 'BRIEFING' && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/30 via-[#0b0e13] to-[#0b0e13] p-6 md:p-8">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                <Sparkles size={14} /> Lesson briefing
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{lesson.title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{lesson.brutalIntro}</p>
              <div className="mt-4 inline-flex rounded-full border border-slate-800 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-widest text-slate-500">
                Concept: {lesson.concept}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              {lesson.teachingSections.map((section, index) => (
                <article key={`${section.title}-${index}`} className="rounded-xl border border-slate-800 bg-[#0b0e13] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Concept {index + 1}</span>
                    <Brain size={14} className="text-purple-400" />
                  </div>
                  <h2 className="text-sm font-bold text-white">{section.title}</h2>
                  <p className="mt-2 text-xs leading-6 text-slate-400">{section.explanation}</p>
                  {section.exampleCode && (
                    <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-800 bg-[#07090d] p-3 text-[11px] leading-5 text-slate-300">{section.exampleCode}</pre>
                  )}
                  {section.exampleOutput && (
                    <div className="mt-2 text-[10px] text-emerald-400">→ {section.exampleOutput}</div>
                  )}
                </article>
              ))}
            </section>

            {lesson.terminology.length > 0 && (
              <section className="rounded-xl border border-slate-800 bg-[#0b0e13] p-5">
                <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Terms you must recognize</div>
                <div className="grid gap-3 md:grid-cols-3">
                  {lesson.terminology.map((term) => (
                    <div key={term.term} className="rounded-lg border border-slate-800 bg-[#080a0e] p-3">
                      <div className="font-mono text-xs font-bold text-red-300">{term.term}</div>
                      <div className="mt-2 text-[10px] leading-5 text-slate-500">{term.simpleDefinition}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <button type="button" onClick={continueFromBriefing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-red-500">
              I understand the concept — test me <ArrowRight size={15} />
            </button>
          </div>
        )}

        {stage === 'CHECK' && (
          <div className="mx-auto max-w-2xl">
            <section className="rounded-2xl border border-slate-800 bg-[#0b0e13] p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                  <Brain size={19} />
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-purple-400">Knowledge check</div>
                  <div className="mt-1 text-xs text-slate-500">Prove you understood before touching the code.</div>
                </div>
              </div>

              <h1 className="text-xl font-bold leading-8 text-white">{check.question}</h1>
              <div className="mt-6 space-y-3">
                {check.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = answered && index === check.correctAnswer;
                  const isWrong = answered && isSelected && !correct;
                  return (
                    <button
                      type="button"
                      key={option}
                      onClick={() => chooseAnswer(index)}
                      className={`w-full rounded-xl border p-4 text-left text-xs transition ${
                        isCorrect
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                          : isWrong
                            ? 'border-red-500/40 bg-red-500/10 text-red-300'
                            : isSelected
                              ? 'border-purple-500/40 bg-purple-500/10 text-white'
                              : 'border-slate-800 bg-[#080a0e] text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="mr-3 font-mono text-slate-600">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className={`mt-5 rounded-xl border p-4 text-xs leading-6 ${correct ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200' : 'border-red-500/20 bg-red-500/5 text-red-200'}`}>
                  {correct ? 'Correct. ' : 'Not yet. Read this carefully. '}{check.explanation}
                </div>
              )}

              <button type="button" disabled={!correct} onClick={continueFromCheck} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30">
                {correct ? 'Knowledge confirmed — continue' : 'Choose the correct answer'} <ArrowRight size={15} />
              </button>
            </section>
          </div>
        )}

        {stage === 'READY' && (
          <div className="mx-auto max-w-2xl">
            <section className="rounded-2xl border border-emerald-500/20 bg-[#0b0e13] p-8 text-center">
              <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
              <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Concept verified</div>
              <h1 className="mt-3 text-3xl font-black text-white">Now prove it with Python.</h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
                You have seen the concept, the examples, the terminology, and passed the knowledge check. The arena is next. Your code will be executed for real and judged against the challenge requirements.
              </p>
              <div className="mt-7 grid gap-3 text-left sm:grid-cols-3">
                {['Write the code', 'Run real Python', 'Learn from the verdict'].map((item, index) => (
                  <div key={item} className="rounded-lg border border-slate-800 bg-[#080a0e] p-3">
                    <div className="text-[9px] font-bold text-slate-600">0{index + 1}</div>
                    <div className="mt-2 text-xs font-bold text-slate-300">{item}</div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={enterArena} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-red-500">
                Enter the coding arena <LockKeyhole size={15} />
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
