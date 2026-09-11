import React, { useState } from 'react';
import { DIAGNOSTIC_QUESTIONS, type DiagnosticQuestion } from '../data/diagnosticQuestions';
import { Sparkles } from 'lucide-react';

interface DiagnosticProps {
  onComplete: (placedLevel: number) => void;
  onSkip?: () => void;
  onClose?: () => void;
  isHindi?: boolean;
}

export const Diagnostic: React.FC<DiagnosticProps> = ({ onComplete, onSkip, onClose, isHindi = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const currentQ: DiagnosticQuestion | undefined = DIAGNOSTIC_QUESTIONS[currentIndex];

  const calculatePlacement = () => {
    const correct = DIAGNOSTIC_QUESTIONS.reduce((count, q, idx) => count + (selectedAnswers[idx] === q.correctAnswer ? 1 : 0), 0);
    return correct >= 3 ? 3 : correct >= 1 ? 2 : 1;
  };

  if (!currentQ) return null;
  const finalLevel = calculatePlacement();

  if (showResult) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 font-mono">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border-2 border-red-600 bg-slate-950 p-8 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-red-400" />
        <h2 className="text-2xl font-black text-white">{isHindi ? 'DIAGNOSTIC KA SACH' : 'ASSESSMENT COMPLETE'}</h2>
        <p className="text-xs text-slate-400">{isHindi ? `Hell Proctor ne tujhe Level ${finalLevel} par place kiya hai.` : `You have been placed at Level ${finalLevel}.`}</p>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-xl font-black text-white">LEVEL {finalLevel}</div>
        <button type="button" onClick={() => onComplete(finalLevel)} className="w-full rounded-xl bg-red-600 py-4 text-xs font-black uppercase tracking-widest text-white">{isHindi ? 'HELL ME ENTER KARO →' : 'ENTER THE ARENA →'}</button>
      </div>
    </div>
  );

  const selected = selectedAnswers[currentIndex];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 font-mono">
      <div className="w-full max-w-2xl rounded-2xl border border-red-700/60 bg-slate-950 p-6">
        <div className="mb-6 flex items-center justify-between"><div><div className="text-[10px] font-bold tracking-widest text-red-400">HELL PROCTOR DIAGNOSTIC</div><div className="mt-1 text-xs text-slate-500">Question {currentIndex + 1} / {DIAGNOSTIC_QUESTIONS.length}</div></div><button type="button" onClick={onClose ?? onSkip} className="text-xs text-slate-500">CLOSE</button></div>
        <h2 className="text-lg font-bold text-white">{currentQ.question}</h2>
        {currentQ.codeSnippet && <pre className="mt-5 overflow-x-auto rounded-xl border border-slate-800 bg-black p-4 text-xs text-slate-300">{currentQ.codeSnippet}</pre>}
        <div className="mt-5 space-y-3">{currentQ.options.map((option, index) => <button type="button" key={option} onClick={() => setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: index }))} className={`w-full rounded-xl border p-4 text-left text-xs ${selected === index ? 'border-red-500 bg-red-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'}`}>{String.fromCharCode(65 + index)}. {option}</button>)}</div>
        <button type="button" disabled={selected === undefined} onClick={() => currentIndex < DIAGNOSTIC_QUESTIONS.length - 1 ? setCurrentIndex((value) => value + 1) : setShowResult(true)} className="mt-6 w-full rounded-xl bg-red-600 py-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-30">{currentIndex < DIAGNOSTIC_QUESTIONS.length - 1 ? 'NEXT' : 'CALCULATE PLACEMENT'}</button>
      </div>
    </div>
  );
};
