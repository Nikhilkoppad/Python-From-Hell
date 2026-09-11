import React, { useState } from 'react';
import { DIAGNOSTIC_QUESTIONS, type DiagnosticQuestion } from '../data/diagnosticQuestions';
import { ShieldAlert, CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';

interface DiagnosticProps {
  onComplete: (placedLevel: number) => void;
  onSkip: () => void;
  isHindi: boolean;
}

export const Diagnostic: React.FC<DiagnosticProps> = ({ onComplete, onSkip, isHindi }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const currentQ: DiagnosticQuestion = DIAGNOSTIC_QUESTIONS[currentIndex];
  const isSelected = selectedAnswers[currentIndex] !== undefined;

  const handleSelect = (optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionIdx }));
  };

  const handleNext = () => {
    if (currentIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculatePlacement = (): number => {
    let correctCount = 0;
    DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    if (correctCount >= 3) return 3;
    if (correctCount >= 1) return 2;
    return 1;
  };

  const finalLevel = calculatePlacement();

  if (showResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
        <div className="max-w-lg w-full bg-slate-950 border-2 border-red-600 rounded-2xl p-6 md:p-8 shadow-[0_0_80px_rgba(220,38,38,0.4)] text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-500">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
              {isHindi ? 'DIAGNOSTIC KA SACH' : 'ASSESSMENT COMPLETE'}
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              {isHindi
                ? `Tere answers test karne ke baad, Hell Proctor ne tujhe Level ${finalLevel} par place kiya hai.`
                : `Based on your diagnostic accuracy, you have been placed at Level ${finalLevel}.`}
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">ASSIGNED STARTING TIER</div>
            <div className="text-2xl font-black text-white mt-1">LEVEL {finalLevel} // {finalLevel === 1 ? 'BEGINNER PIT' : finalLevel === 2 ? 'INTERMEDIATE CAVERN' : 'ADVANCED ABYSS'}</div>
          </div>

          <button
            onClick={() => onComplete(finalLevel)}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-900/40"
          >
            {isHindi ? 'HELL ME ENTER KARO →' : 'ENTER THE ARENA →'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
      <div className="max-w-2xl w-full bg-slate-950 border-2 border-red-700/60 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-red-500 font-black text-sm tracking-wider">
            <ShieldAlert className="w-5 h-5" />
            <span>DIAGNOSTIC TEST // QUESTION {currentIndex + 1} OF {DIAGNOSTIC_QUESTIONS.length}</span>
          </div>
          <button
            onClick={onSkip}
            className="text-xs text-slate-500 hover:text-slate-300 font-bold transition-colors"
          >
            {isHindi ? 'Skip Kar (Start at Lvl 1) →' : 'Skip Placement →'}
          </button>
        </div>

        {/* QUESTION TEXT */}
        <div>
          <h3 className="text-base font-bold text-slate-100">{currentQ.question}</h3>
          {currentQ.codeSnippet && (
            <pre className="mt-3 p-4 bg-black border border-slate-800 rounded-xl text-xs text-green-400 font-mono overflow-x-auto">
              {currentQ.codeSnippet}
            </pre>
          )}
        </div>

        {/* OPTIONS */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt, idx) => {
            const isChosen = selectedAnswers[currentIndex] === idx;
            return (
              <button
                key={opt}
                onClick={() => handleSelect(idx)}
                className={`w-full p-4 text-left text-xs font-mono rounded-xl border transition-all flex items-center justify-between ${
                  isChosen
                    ? 'border-red-500 bg-red-950/40 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span>{opt}</span>
                {isChosen ? (
                  <CheckCircle2 className="w-4 h-4 text-red-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-700 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-500">
            {isHindi ? 'Imandari se jawab de, shortcut nahi chalega.' : 'No guessing. Accurate diagnosis ensures the right difficulty.'}
          </span>
          <button
            onClick={handleNext}
            disabled={!isSelected}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
          >
            <span>{currentIndex === DIAGNOSTIC_QUESTIONS.length - 1 ? (isHindi ? 'Submit Kar' : 'Finish') : (isHindi ? 'Agla Sawaal' : 'Next Question')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
