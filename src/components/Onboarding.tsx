import React, { useState } from 'react';
import type { RoastIntensity } from '../types';
import { Flame, ShieldAlert, Skull, Zap } from 'lucide-react';

interface OnboardingProps {
  onComplete: (intensity: RoastIntensity) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedIntensity, setSelectedIntensity] = useState<RoastIntensity>('SAVAGE');

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else onComplete(selectedIntensity);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 text-white font-mono">
      <div className="max-w-2xl w-full bg-slate-900 border border-red-600/40 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-red-500">
              <Skull className="w-10 h-10 animate-pulse" />
              <h1 className="text-3xl font-black tracking-widest">PYTHON FROM HELL</h1>
            </div>
            <p className="text-xl text-slate-300 font-bold">"Welcome, BSDK."</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              You have voluntarily entered a place where your Python skills will be tested, broken, mocked, repaired, and tested again.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              This is not another boring tutorial where a cartoon tells you to click 'Next' 47 times. You will write code. Your code will fail. And the system will roast every mistake until you learn.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
              <Zap className="w-6 h-6" /> WHAT YOU WILL LEARN
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="bg-slate-800 p-3 rounded border border-slate-700">✓ Variables & Data Types</div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700">✓ Conditionals & Boolean Logic</div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700">✓ Loops & Iteration</div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700">✓ Lists, Dicts & Data Structures</div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700">✓ Functions & Scope</div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700">✓ OOP & Class Architecture</div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-red-500 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6" /> RULES OF ENGAGEMENT
            </h2>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2"><span className="text-red-500 font-bold">RULE #1:</span> You WILL make mistakes.</li>
              <li className="flex items-center gap-2"><span className="text-red-500 font-bold">RULE #2:</span> The system WILL notice repeated patterns.</li>
              <li className="flex items-center gap-2"><span className="text-red-500 font-bold">RULE #3:</span> Execution failures equal immediate roasts.</li>
              <li className="flex items-center gap-2"><span className="text-red-500 font-bold">RULE #4:</span> You earn progression by passing automated tests.</li>
            </ul>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
              <Flame className="w-6 h-6" /> CHOOSE YOUR PAIN
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {(['SUPPORTIVE', 'SAVAGE', 'NIGHTMARE', 'APOCALYPSE'] as RoastIntensity[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedIntensity(mode)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedIntensity === mode
                      ? 'border-red-500 bg-red-950/40 text-white'
                      : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm">{mode}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {mode === 'SUPPORTIVE' && 'Mild sarcasm + helpful fixes.'}
                    {mode === 'SAVAGE' && 'Heavy insults + educational fixes.'}
                    {mode === 'NIGHTMARE' && 'Aggressive dark comedy.'}
                    {mode === 'APOCALYPSE' && 'Maximum verbal destruction.'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 text-center">
            <Skull className="w-16 h-16 text-red-500 mx-auto animate-bounce" />
            <h2 className="text-2xl font-black text-white">READY TO ENTER THE PIT?</h2>
            <p className="text-slate-400 text-sm">
              Your intensity is set to <span className="text-red-500 font-bold">{selectedIntensity}</span>.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-500">Step {step} of 5</span>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-sm transition-colors"
          >
            {step === 5 ? 'INITIALIZE SYSTEM' : 'CONTINUE →'}
          </button>
        </div>
      </div>
    </div>
  );
};