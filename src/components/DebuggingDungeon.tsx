import React, { useState, useRef } from 'react';
import type { UserProgress, LearningLanguage } from '../types';
import { DEBUG_SCENARIOS, type DebugScenario } from '../data/debuggingScenarios';
import { PythonRuntime } from '../execution/PythonRuntime';
import { AITeacherService } from '../ai/AITeacherService';
import {
  Bug,
  ShieldCheck,
  Zap,
  Play,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Eye,
  Bot,
  RotateCcw,
} from 'lucide-react';

interface DebuggingDungeonProps {
  progress: UserProgress;
  language: LearningLanguage | string;
  onSolveScenario: (scenarioId: string, xpEarned: number, hintsUsed: number) => void;
  onClose: () => void;
}

export const DebuggingDungeon: React.FC<DebuggingDungeonProps> = ({
  progress,
  language,
  onSolveScenario,
  onClose,
}) => {
  const isHindi = language === 'HINDI';
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeScenario: DebugScenario = DEBUG_SCENARIOS[selectedIdx];

  const [code, setCode] = useState(activeScenario.buggyCode);
  const [prediction, setPrediction] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [coachClueLevel, setCoachClueLevel] = useState(0);
  const [aiCoachMsg, setAiCoachMsg] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    description: string;
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;
    isHidden: boolean;
  }> | null>(null);

  const runtimeRef = useRef<PythonRuntime | null>(null);

  const handleSelectScenario = (idx: number) => {
    setSelectedIdx(idx);
    const scen = DEBUG_SCENARIOS[idx];
    setCode(scen.buggyCode);
    setPrediction('');
    setCoachClueLevel(0);
    setAiCoachMsg(null);
    setTestResults(null);
  };

  const handleRequestClue = async () => {
    const nextLevel = Math.min(3, coachClueLevel + 1);
    setCoachClueLevel(nextLevel);
    setIsAiLoading(true);

    try {
      const response = await AITeacherService.requestGuidance({
        progress,
        lessonTitle: activeScenario.title,
        lessonConcept: activeScenario.category,
        userCode: code,
        runtimeError: activeScenario.symptom,
        expectedOutput: activeScenario.publicTests[0]?.expectedOutput,
        userQuery: `Provide debugging clue level ${nextLevel} for ${activeScenario.title}.`,
        mode: 'DEBUG',
      });
      setAiCoachMsg(response.message);
    } catch {
      setAiCoachMsg(activeScenario.clues[nextLevel - 1] || 'Inspect variable scopes and types carefully.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExecuteVerification = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setTestResults(null);

    try {
      runtimeRef.current ??= new PythonRuntime();
      const allTests = [...activeScenario.publicTests, ...activeScenario.hiddenTests];
      const results = [];
      let allPassed = true;

      for (const test of allTests) {
        const harness = `${code}\n\n${test.inputCode}`;
        const exec = await runtimeRef.current.execute(harness);
        const actual = (exec.stdout || exec.error || '').trim();
        const expected = test.expectedOutput.trim();
        const passed = !exec.error && actual === expected;

        if (!passed) allPassed = false;

        results.push({
          description: test.description,
          passed,
          actualOutput: actual || 'No output / Error',
          expectedOutput: expected,
          isHidden: Boolean(test.isHidden),
        });
      }

      setTestResults(results);

      if (allPassed) {
        const xp = coachClueLevel === 0 ? 45 : 25;
        onSolveScenario(activeScenario.id, xp, coachClueLevel);
      }
    } catch {
      setTestResults([
        {
          description: 'Runtime execution crashed',
          passed: false,
          actualOutput: 'Worker Crash',
          expectedOutput: 'Clean Execution',
          isHidden: false,
        },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    setCode(activeScenario.buggyCode);
    setTestResults(null);
    setAiCoachMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
      <div className="max-w-6xl w-full bg-slate-950 border-2 border-red-600/70 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.4)] flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 border border-red-500 rounded-xl text-red-500">
              <Bug className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-wider">DEBUGGING DUNGEON // FIND & FIX</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 font-bold uppercase">
                  REAL-TIME CODE EXORCISM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isHindi ? 'Tuta hua code theek karo. Predict karo, fix karo, aur test suites clear karo.' : 'Isolate subtle Python flaws, verify edge cases, and pass hidden test suites.'}
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

        {/* SCENARIO SELECTOR BAR */}
        <div className="px-6 py-3 bg-black/60 border-b border-slate-800 flex items-center gap-3 overflow-x-auto">
          {DEBUG_SCENARIOS.map((scen, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={scen.id}
                onClick={() => handleSelectScenario(idx)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'border-red-500 bg-red-950/50 text-white shadow-lg'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Bug className="w-3.5 h-3.5 text-red-400" />
                <span>{scen.title}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-black text-slate-400 uppercase">
                  {scen.difficulty}
                </span>
              </button>
            );
          })}
        </div>

        {/* WORKSPACE */}
        <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: BUG BRIEFING & AI COACH */}
          <div className="lg:col-span-5 space-y-4 flex flex-col">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  CATEGORY: {activeScenario.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ID: {activeScenario.id}</span>
              </div>
              <h3 className="text-base font-bold text-white">{activeScenario.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{activeScenario.lore}</p>
              
              <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-300 space-y-1">
                <div className="text-[10px] font-bold uppercase text-red-400 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> OBSERVED SYMPTOM
                </div>
                <div>{activeScenario.symptom}</div>
              </div>
            </div>

            {/* PREDICTION HYPOTHESIS INPUT */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                STEP 1: YOUR BUG HYPOTHESIS (PREDICTION)
              </label>
              <input
                type="text"
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                placeholder={isHindi ? 'Galti kya hai? Pehle predict kar...' : 'Describe what line/logic is causing this bug...'}
                className="w-full bg-black border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* AI DEBUGGING COACH */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI DEBUG COACH (LEVEL {coachClueLevel}/3)</span>
                </div>
                <button
                  onClick={handleRequestClue}
                  disabled={coachClueLevel >= 3 || isAiLoading}
                  className="px-3 py-1 bg-amber-600/20 border border-amber-500/50 hover:bg-amber-600/40 disabled:opacity-40 text-amber-300 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>{coachClueLevel >= 3 ? 'Max Clues' : (isHindi ? 'Clue Maang' : 'Request Clue')}</span>
                </button>
              </div>

              {isAiLoading ? (
                <div className="text-xs text-slate-400 animate-pulse py-2">Consulting AI Debugging Specialist...</div>
              ) : aiCoachMsg ? (
                <div className="text-xs text-slate-200 p-3 bg-black border border-slate-800 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {aiCoachMsg}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-2">
                  Try finding the bug independently first. Request a clue if you are stuck.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: CODE EDITOR & TEST RESULTS */}
          <div className="lg:col-span-7 space-y-4 flex flex-col">
            
            {/* EDITOR */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-bold">fix_solution.py</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black text-slate-500 uppercase font-bold">
                    Editable Buffer
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    title="Reset to initial broken state"
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleExecuteVerification}
                    disabled={isExecuting}
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black rounded-xl text-xs tracking-wider transition-all shadow-lg shadow-red-900/40 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isExecuting ? 'VERIFYING...' : (isHindi ? 'TEST SUITE CHALA' : 'RUN TEST SUITES')}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full flex-1 min-h-[260px] bg-black p-4 font-mono text-xs text-green-400 border border-slate-800 rounded-xl focus:outline-none focus:border-red-600 resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* TEST VERIFICATION RESULTS */}
            {testResults && (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> TEST RESULTS (PUBLIC & HIDDEN)
                </div>

                <div className="space-y-2">
                  {testResults.map((t, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        t.passed
                          ? 'border-emerald-900/60 bg-emerald-950/20 text-emerald-300'
                          : 'border-red-900/60 bg-red-950/20 text-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          {t.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                          <span>{t.isHidden ? '[HIDDEN TEST] ' : ''}{t.description}</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold">{t.passed ? 'PASSED' : 'FAILED'}</span>
                      </div>

                      {!t.passed && (
                        <div className="text-[10px] text-slate-400 pl-5 font-mono">
                          <div>Expected: {t.expectedOutput}</div>
                          <div>Actual: {t.actualOutput}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {testResults.every((t) => t.passed) && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-600 rounded-xl text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>BUG EXORCISED! ALL PUBLIC AND HIDDEN ASSERTIONS VERIFIED!</span>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
