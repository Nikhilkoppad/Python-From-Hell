import React, { useState, useEffect, useRef } from 'react';
import type { UserProgress, LearningLanguage } from '../types';
import { PythonRuntime } from '../execution/PythonRuntime';
import { Skull, Zap, Shield, Play, RotateCcw, Award } from 'lucide-react';
import { AdaptiveLearningEngine } from '../engine/AdaptiveLearningEngine';
import { AchievementSystem } from '../data/achievements';
import type { LearningProfile } from '../types/learning';

interface BossFightProps { progress: UserProgress; language: LearningLanguage | string; onVictory: (xpEarned: number) => void; onClose: () => void; }
interface BossChallenge { id: string; bossName: string; bossTitle: string; bossAvatar: string; maxHp: number; timeLimitSeconds: number; lore: string; instruction: string; starterCode: string; tests: Array<{ inputCode: string; expectedOutput: string; description: string }>; }
const BOSS_CHALLENGES: BossChallenge[] = [{
  id: 'boss_cerberus', bossName: 'CERBERUS THE SYNTAX DEMON', bossTitle: 'GUARDIAN OF THE FIRST GATE', bossAvatar: '👹', maxHp: 100, timeLimitSeconds: 120,
  lore: 'Cerberus devours every coder who forgets string parsing and edge-case validation. Slay him by writing a robust sanitization function.',
  instruction: 'Write a Python function `sanitize_command(cmd_str)` that strips whitespace, converts the command to uppercase, and returns "DENIED" if the string is empty or contains "DROP", otherwise returns the formatted command.',
  starterCode: `def sanitize_command(cmd_str):
    # Fix this to slay Cerberus
    if not cmd_str or "DROP" in cmd_str.upper():
        return "DENIED"
    return cmd_str.strip().upper()

print(sanitize_command("  start engine  "))
print(sanitize_command("drop table users"))
print(sanitize_command(""))`,
  tests: [
    { inputCode: 'print(sanitize_command("  start engine  "))', expectedOutput: 'START ENGINE', description: 'Strip and uppercase valid command' },
    { inputCode: 'print(sanitize_command("drop database"))', expectedOutput: 'DENIED', description: 'Block dangerous DROP commands' },
    { inputCode: 'print(sanitize_command(""))', expectedOutput: 'DENIED', description: 'Reject empty inputs safely' },
  ],
}];

export const BossFight: React.FC<BossFightProps> = ({ progress, language, onVictory, onClose }) => {
  const isHindi = language === 'HINDI'; const boss = BOSS_CHALLENGES[0];
  const profile = progress as unknown as LearningProfile;
  const [bossHp, setBossHp] = useState(boss.maxHp); const [timeLeft, setTimeLeft] = useState(boss.timeLimitSeconds); const [code, setCode] = useState(boss.starterCode); const [isExecuting, setIsExecuting] = useState(false); const [combatLog, setCombatLog] = useState<string[]>([]); const [battleState, setBattleState] = useState<'READY' | 'ACTIVE' | 'VICTORY' | 'DEFEAT'>('READY');
  const runtimeRef = useRef<PythonRuntime | null>(null);

  useEffect(() => { if (battleState !== 'ACTIVE') return; const timer = setInterval(() => setTimeLeft(prev => { if (prev <= 1) { clearInterval(timer); setBattleState('DEFEAT'); return 0; } return prev - 1; }), 1000); return () => clearInterval(timer); }, [battleState]);
  useEffect(() => () => { runtimeRef.current?.dispose(); runtimeRef.current = null; }, []);
  const startBattle = () => { setBattleState('ACTIVE'); setBossHp(boss.maxHp); setTimeLeft(boss.timeLimitSeconds); setCombatLog([isHindi ? '🔥 BATTLE START: Cerberus jaag chuka hai! Code likh ke attack kar!' : '🔥 BATTLE INITIATED: Cerberus awakened. Slay the demon before the timer expires!']); };

  const handleExecuteAttack = async () => {
    if (isExecuting || battleState !== 'ACTIVE') return; setIsExecuting(true);
    try {
      runtimeRef.current ??= new PythonRuntime(); let allPassed = true; const logs: string[] = []; let finalOutput = ''; let finalError = '';
      for (let i = 0; i < boss.tests.length; i++) {
        const test = boss.tests[i]; const exec = await runtimeRef.current.execute(`${code}\n\n${test.inputCode}`); const actualOut = (exec.stdout || '').trim(); const expected = test.expectedOutput.trim(); finalOutput = actualOut; finalError = exec.error || '';
        if (finalError || actualOut !== expected) { allPassed = false; logs.push(`❌ Test ${i + 1} Failed: ${test.description} (Expected "${expected}", Got "${actualOut || finalError}")`); break; }
        logs.push(`⚔️ Test ${i + 1} Cleared: ${test.description}`);
      }
      if (allPassed) {
        setBossHp(0); setCombatLog(prev => [...logs, isHindi ? '💀 CRITICAL STRIKE! Cerberus dhool chaat gaya!' : '💀 CRITICAL HIT! Cerberus has been obliterated!', ...prev]); setBattleState('VICTORY');
        const learningResult = AdaptiveLearningEngine.recordAttempt({ profile, challengeId: boss.id, lessonId: progress.currentLessonId, topicId: profile.currentTopicId || progress.currentLessonId, passed: true, hintsUsed: 0, code, output: finalOutput, runtimeError: finalError || undefined, errorType: undefined, challengeType: 'BOSS', difficulty: 5 });
        const achievementResult = AchievementSystem.evaluateAchievements(learningResult.profile);
        const mergedAchievements = Array.from(new Set([...(progress.achievements ?? []), ...(achievementResult.unlockedIds ?? [])]));
        Object.assign(progress, learningResult.profile, { achievements: mergedAchievements, lastActiveTimestamp: new Date().toISOString() });
        onVictory(150);
      } else {
        setBossHp(prev => Math.max(20, prev - 35)); setCombatLog(prev => [...logs, isHindi ? '⚠️ Boss ne attack block kiya! Logic theek kar!' : '⚠️ Boss parried your flawed logic! Refine your solution.', ...prev]);
      }
    } catch { setCombatLog(prev => ['❌ Execution crashed in the runtime.', ...prev]); }
    finally { setIsExecuting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
      <div className="max-w-4xl w-full bg-slate-950 border-2 border-red-600 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.5)] flex flex-col max-h-[92vh] overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-red-950 via-slate-950 to-black border-b border-red-900/80 flex items-center justify-between"><div className="flex items-center gap-4"><div className="text-4xl p-2 bg-red-900/30 border border-red-600 rounded-xl animate-pulse">{boss.bossAvatar}</div><div><div className="flex items-center gap-2"><h2 className="text-xl font-black text-white tracking-wider">{boss.bossName}</h2><span className="text-[10px] px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-400 font-bold uppercase">BOSS ARENA</span></div><p className="text-xs text-red-400 font-bold">{boss.bossTitle}</p></div></div><div className="text-right"><div className="text-xs text-slate-400 font-bold">TIME REMAINING</div><div className={`text-2xl font-black ${timeLeft < 30 ? 'text-red-500 animate-ping' : 'text-amber-400'}`}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div></div></div>
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 space-y-1.5"><div className="flex justify-between text-xs font-bold"><span className="text-red-400 flex items-center gap-1.5"><Skull className="w-3.5 h-3.5" /> BOSS HP</span><span className="text-slate-300">{bossHp} / {boss.maxHp} HP</span></div><div className="h-3 bg-black rounded-full overflow-hidden border border-red-900"><div className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 transition-all duration-500" style={{ width: `${(bossHp / boss.maxHp) * 100}%` }} /></div></div>
        <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-4 flex flex-col"><div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2"><div className="text-[10px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> MISSION OBJECTIVE</div><p className="text-xs text-slate-300 leading-relaxed">{boss.instruction}</p></div><div className="flex-1 bg-black border border-slate-800 rounded-xl p-4 flex flex-col space-y-2"><div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> COMBAT FEED</div><div className="flex-1 overflow-y-auto space-y-1 text-xs font-mono text-slate-300 max-h-[160px]">{combatLog.map((log, idx) => <div key={idx} className="leading-snug">{log}</div>)}</div></div></div><div className="flex flex-col space-y-3"><div className="flex justify-between items-center text-xs text-slate-400 font-bold"><span>solution.py</span><span className="text-[10px] text-slate-500">Python 3.11</span></div><textarea value={code} onChange={e => setCode(e.target.value)} disabled={battleState !== 'ACTIVE'} className="flex-1 min-h-[220px] bg-black border border-slate-800 rounded-xl p-4 font-mono text-xs text-green-400 focus:outline-none focus:border-red-600 resize-none leading-relaxed" spellCheck={false} /></div></div>
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex justify-between items-center"><button onClick={onClose} className="px-4 py-2.5 text-xs text-slate-400 hover:text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">← RETREAT</button>{battleState === 'READY' && <button onClick={startBattle} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-900/40 flex items-center gap-2"><Play className="w-4 h-4" /><span>{isHindi ? 'BATTLE SHURU KAR →' : 'ENGAGE BOSS →'}</span></button>}{battleState === 'ACTIVE' && <button onClick={handleExecuteAttack} disabled={isExecuting} className="px-8 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-900/40 flex items-center gap-2"><Zap className="w-4 h-4" /><span>{isExecuting ? 'CASTING STRIKE...' : (isHindi ? '⚔️ ATTACK LAUNCH KAR' : '⚔️ LAUNCH ATTACK')}</span></button>}{battleState === 'VICTORY' && <div className="flex items-center gap-4"><span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5"><Award className="w-4 h-4" /> VICTORY! +150 XP EARNED</span><button onClick={onClose} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all">CLAIM SPOILS & RETURN →</button></div>}{battleState === 'DEFEAT' && <div className="flex items-center gap-3"><span className="text-xs text-red-500 font-bold">DEFEATED BY TIME</span><button onClick={startBattle} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> RETRY</button></div>}</div>
      </div>
    </div>
  );
};