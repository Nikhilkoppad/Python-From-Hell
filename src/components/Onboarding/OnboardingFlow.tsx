import React, { useState } from 'react';
import type { RoastIntensity } from '../../types';

interface OnboardingFlowProps {
  onComplete: (intensity: RoastIntensity, diagnosticResult: { level: string; weakTopics: string[] }) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedIntensity, setSelectedIntensity] = useState<RoastIntensity>('SAVAGE');

  // Diagnostic state
  const [diagIndex, setDiagIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const DIAGNOSTIC_QUESTIONS = [
    {
      q: '1. What is the output of print(type("42"))?',
      options: ["<class 'int'>", "<class 'str'>", "42", "SyntaxError"],
      correct: "<class 'str'>",
      topic: 'types',
    },
    {
      q: '2. What does range(1, 5) produce when iterated over?',
      options: ['1, 2, 3, 4, 5', '1, 2, 3, 4', '0, 1, 2, 3, 4', '5, 5, 5, 5'],
      correct: '1, 2, 3, 4',
      topic: 'loops',
    },
  ];

  const handleAnswer = (option: string) => {
    const nextAnswers = [...answers, option];
    setAnswers(nextAnswers);

    if (diagIndex + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setDiagIndex(diagIndex + 1);
    } else {
      // Process Diagnostic Results
      const weak: string[] = [];
      nextAnswers.forEach((ans, idx) => {
        if (ans !== DIAGNOSTIC_QUESTIONS[idx].correct) {
          weak.push(DIAGNOSTIC_QUESTIONS[idx].topic);
        }
      });
      onComplete(selectedIntensity, {
        level: weak.length === 0 ? 'INTERMEDIATE' : 'BEGINNER',
        weakTopics: weak,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 font-mono text-slate-100">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        {step === 1 && (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-black text-red-500 tracking-wider">☠ PYTHON FROM HELL ☠</h1>
            <p className="text-lg font-bold">WELCOME, BSDK.</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              You've voluntarily entered a place where your Python skills will be:
              <br />
              <span className="text-red-400 font-bold">LEARNED. TESTED. BROKEN. DEBUGGED. ROASTED. REBUILT.</span>
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black tracking-widest uppercase rounded-lg transition-colors"
            >
              [ ENTER THE HELL ]
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-yellow-500">☠ WARNING</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Before continuing, understand what you signed up for:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
              <li>You WILL make mistakes.</li>
              <li>You WILL see Python errors.</li>
              <li>The system WILL notice and roast you.</li>
            </ul>
            <p className="text-sm font-bold text-green-400">
              Survive the curriculum and you won't just know Python syntax—you'll actually know how to THINK like a programmer.
            </p>
            <button
              onClick={() => setStep(3)}
              className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-black font-bold uppercase rounded-lg"
            >
              [ I ACCEPT MY FATE ]
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-red-400">🔥 WHAT YOU WILL LEARN</h2>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="p-2 bg-slate-800 rounded">L1: Fundamentals</div>
              <div className="p-2 bg-slate-800 rounded">L2: Logic & Control</div>
              <div className="p-2 bg-slate-800 rounded">L3: Loop Hell</div>
              <div className="p-2 bg-slate-800 rounded">L4: Data Structures</div>
              <div className="p-2 bg-slate-800 rounded">L5: Functions</div>
              <div className="p-2 bg-slate-800 rounded">L6: OOP Hell</div>
            </div>
            <button
              onClick={() => setStep(4)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase rounded-lg"
            >
              CONTINUE TO DIFFICULTY SELECTION
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-purple-400">CHOOSE YOUR SUFFERING</h2>
            <div className="grid grid-cols-2 gap-4">
              {(['SUPPORTIVE', 'SAVAGE', 'NIGHTMARE', 'APOCALYPSE'] as RoastIntensity[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedIntensity(mode)}
                  className={`p-4 rounded-lg border text-left ${
                    selectedIntensity === mode
                      ? 'border-red-500 bg-red-950/40 text-white'
                      : 'border-slate-700 bg-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-sm">{mode}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(5)}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase rounded-lg"
            >
              START DIAGNOSTIC TEST
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-cyan-400">DIAGNOSTIC TEST ({diagIndex + 1}/{DIAGNOSTIC_QUESTIONS.length})</h2>
            <p className="text-sm text-slate-200">{DIAGNOSTIC_QUESTIONS[diagIndex].q}</p>
            <div className="space-y-2">
              {DIAGNOSTIC_QUESTIONS[diagIndex].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-left text-xs font-mono rounded border border-slate-700"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};