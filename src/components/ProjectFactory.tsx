import React, { useState, useRef } from 'react';
import type { UserProgress, LearningLanguage } from '../types';
import { REAL_PROJECTS, type PythonProject, type ProjectMilestone } from '../data/projectsData';
import { PythonRuntime } from '../execution/PythonRuntime';
import { AITeacherService } from '../ai/AITeacherService';
import { AdaptiveLearningEngine } from '../engine/AdaptiveLearningEngine';
import { AchievementSystem } from '../data/achievements';
import type { LearningProfile } from '../types/learning';
import { FolderTree, FileCode, CheckCircle2, XCircle, Play, Bot, Zap, Award, Sparkles } from 'lucide-react';

interface ProjectFactoryProps { progress: UserProgress; language: LearningLanguage | string; onCompleteProject: (projectId: string, xpEarned: number) => void; onClose: () => void; }

export const ProjectFactory: React.FC<ProjectFactoryProps> = ({ progress, language, onCompleteProject, onClose }) => {
  const isHindi = language === 'HINDI';
  const project: PythonProject = REAL_PROJECTS[0];
  const profile = progress as unknown as LearningProfile;
  const [fileContents, setFileContents] = useState<Record<string, string>>(() => Object.fromEntries(project.files.map((f) => [f.name, f.initialContent])));
  const [activeFileName, setActiveFileName] = useState<string>(project.files[0].name);
  const [currentMilestoneIdx, setCurrentMilestoneIdx] = useState(0);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [directorFeedback, setDirectorFeedback] = useState<{ passed: boolean; message: string; actualOutput?: string } | null>(null);
  const [aiCritique, setAiCritique] = useState<string | null>(null);
  const [isAiConsulting, setIsAiConsulting] = useState(false);
  const [projectAwarded, setProjectAwarded] = useState(false);
  const runtimeRef = useRef<PythonRuntime | null>(null);
  const activeMilestone: ProjectMilestone = project.milestones[currentMilestoneIdx];

  const handleConsultDirector = async () => {
    setIsAiConsulting(true);
    try {
      const response = await AITeacherService.requestGuidance({ progress, lessonTitle: project.title, lessonConcept: activeMilestone.title, userCode: fileContents[activeFileName] || '', userQuery: `As the AI Project Director, review my implementation of ${activeMilestone.title} in project ${project.title}. Give concise engineering critique.`, mode: 'EXPLAIN' });
      setAiCritique(response.message);
    } catch { setAiCritique(isHindi ? 'Director: Code structure ko clean rakh aur requirements follow kar.' : 'Director: Ensure strict type validation and clean modular structure before verifying.'); }
    finally { setIsAiConsulting(false); }
  };

  const handleVerifyMilestone = async () => {
    if (isVerifying || projectAwarded) return;
    setIsVerifying(true); setDirectorFeedback(null);
    try {
      runtimeRef.current ??= new PythonRuntime();
      let bundledExecutionScript = '';
      if (fileContents['models.py']) bundledExecutionScript += `# --- models.py ---\n${fileContents['models.py']}\n\n`;
      if (fileContents['ledger.py']) {
        const cleanLedger = fileContents['ledger.py'].replace(/from models import Expense/g, '# (imported above)');
        bundledExecutionScript += `# --- ledger.py ---\n${cleanLedger}\n\n`;
      }
      if (fileContents['main.py']) {
        const cleanMain = fileContents['main.py'].replace(/from ledger import ExpenseLedger/g, '# (imported above)').replace(/from models import Expense/g, '# (imported above)');
        bundledExecutionScript += `# --- main.py ---\n${cleanMain}\n\n`;
      }
      const cleanTestHarness = activeMilestone.testHarness.replace(/from models import Expense/g, '# (imported above)').replace(/from ledger import ExpenseLedger/g, '# (imported above)');
      const fullTestScript = `${bundledExecutionScript}\n# --- TEST HARNESS ---\n${cleanTestHarness}`;
      const execResult = await runtimeRef.current.execute(fullTestScript);
      const actualOutput = (execResult.stdout || execResult.error || '').trim();
      const expectedOutput = activeMilestone.expectedOutput.trim();
      const isPassed = !execResult.error && actualOutput === expectedOutput;

      if (isPassed) {
        const updatedDone = [...new Set([...completedMilestones, activeMilestone.id])];
        setCompletedMilestones(updatedDone);
        setDirectorFeedback({ passed: true, message: activeMilestone.directorFeedbackOnSuccess, actualOutput });
        if (currentMilestoneIdx === project.milestones.length - 1 && !projectAwarded) {
          const learningResult = AdaptiveLearningEngine.recordAttempt({
            profile,
            challengeId: project.id,
            lessonId: progress.currentLessonId,
            topicId: profile.currentTopicId || progress.currentLessonId,
            passed: true,
            hintsUsed: 0,
            code: Object.entries(fileContents).map(([name, content]) => `# --- ${name} ---\n${content}`).join('\n\n'),
            output: actualOutput,
            challengeType: 'BUILD',
            difficulty: 5,
          });
          const achievementResult = AchievementSystem.evaluateAchievements(learningResult.profile);
          const mergedAchievements = Array.from(new Set([...(progress.achievements ?? []), ...(achievementResult.unlockedIds ?? [])]));
          Object.assign(progress, learningResult.profile, { achievements: mergedAchievements, lastActiveTimestamp: new Date().toISOString() });
          setProjectAwarded(true);
          onCompleteProject(project.id, 100);
        } else if (currentMilestoneIdx < project.milestones.length - 1) {
          setTimeout(() => { setCurrentMilestoneIdx((prev) => prev + 1); setDirectorFeedback(null); }, 1200);
        }
      } else {
        setDirectorFeedback({ passed: false, message: activeMilestone.directorFeedbackOnFailure, actualOutput: actualOutput || 'No output generated / Runtime error' });
      }
    } catch { setDirectorFeedback({ passed: false, message: 'Runtime failed to execute project bundle.' }); }
    finally { setIsVerifying(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
      <div className="max-w-6xl w-full bg-slate-950 border-2 border-red-600/70 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.4)] flex flex-col max-h-[94vh] overflow-hidden">
        <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between"><div className="flex items-center gap-3"><div className="p-2.5 bg-red-600/20 border border-red-500 rounded-xl text-red-500"><FolderTree className="w-6 h-6" /></div><div><div className="flex items-center gap-2"><h2 className="text-lg font-black text-white tracking-wider">PROJECT DIRECTOR // FACTORY</h2><span className="text-[10px] px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 font-bold uppercase">MULTI-FILE ARCHITECTURE</span></div><p className="text-xs text-slate-400">{isHindi ? 'Real-world multi-file Python architecture build karo aur progressive milestones verify karo.' : 'Real-world software engineering with milestone validation.'}</p></div></div><button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-all">✕ CLOSE</button></div>
        <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4 flex flex-col">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2"><div className="text-[10px] font-black uppercase text-red-400 tracking-wider">{project.category} // {project.difficulty}</div><h3 className="text-base font-bold text-white">{project.title}</h3><p className="text-xs text-slate-300 leading-relaxed">{project.overview}</p></div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3"><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between"><span>PROJECT MILESTONES</span><span className="text-emerald-400">{completedMilestones.length} / {project.milestones.length} CLEARED</span></div><div className="space-y-2">{project.milestones.map((m, idx) => { const isDone = completedMilestones.includes(m.id); const isCurrent = currentMilestoneIdx === idx; return <div key={m.id} className={`p-3 rounded-lg border text-xs transition-all flex items-start gap-2.5 ${isDone ? 'border-emerald-900/60 bg-emerald-950/20 text-emerald-300' : isCurrent ? 'border-red-600 bg-red-950/30 text-white font-bold' : 'border-slate-800 bg-black/40 text-slate-500'}`}>{isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> : isCurrent ? <Zap className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> : <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{idx + 1}</span>}<div><div>{m.title}</div>{isCurrent && <div className="text-[10px] text-slate-400 font-normal mt-1">{m.objective}</div>}</div></div>; })}</div></div>
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3 flex-1"><div className="flex items-center justify-between"><div className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /> PROJECT DIRECTOR CONSULTATION</div><button onClick={handleConsultDirector} disabled={isAiConsulting} className="px-3 py-1 bg-red-600/20 border border-red-500/50 hover:bg-red-600/40 text-red-300 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"><Sparkles className="w-3 h-3" /><span>{isHindi ? 'Director Feedback' : 'Request Architecture Review'}</span></button></div>{isAiConsulting ? <div className="text-xs text-slate-400 animate-pulse py-2">Director is reviewing code structure...</div> : aiCritique ? <div className="text-xs text-slate-200 p-3 bg-black border border-slate-800 rounded-lg leading-relaxed whitespace-pre-wrap">{aiCritique}</div> : <div className="text-xs text-slate-500 py-2">Follow the milestone requirements in the file tabs and run verification when ready.</div>}</div>
          </div>
          <div className="lg:col-span-7 space-y-4 flex flex-col">
            <div className="flex items-center justify-between bg-slate-900 px-4 pt-3 rounded-t-xl border-t border-x border-slate-800"><div className="flex items-center gap-1.5 overflow-x-auto">{project.files.map((file) => { const isActive = activeFileName === file.name; return <button key={file.name} onClick={() => setActiveFileName(file.name)} className={`px-4 py-2 rounded-t-lg text-xs font-bold transition-all flex items-center gap-2 border-t border-x ${isActive ? 'border-red-600 bg-black text-white' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'}`}><FileCode className="w-3.5 h-3.5 text-red-400" /><span>{file.name}</span></button>; })}</div><button onClick={handleVerifyMilestone} disabled={isVerifying || projectAwarded} className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black rounded-xl text-xs tracking-wider transition-all shadow-lg shadow-red-900/40 flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /><span>{isVerifying ? 'VERIFYING...' : projectAwarded ? 'PROJECT SHIPPED' : (isHindi ? 'MILESTONE TEST KAR' : 'VERIFY MILESTONE')}</span></button></div>
            <div className="flex-1 bg-black border-x border-b border-slate-800 rounded-b-xl p-4 flex flex-col space-y-2"><textarea value={fileContents[activeFileName] || ''} onChange={(e) => setFileContents((prev) => ({ ...prev, [activeFileName]: e.target.value }))} className="w-full flex-1 min-h-[300px] bg-black font-mono text-xs text-green-400 focus:outline-none resize-none leading-relaxed" spellCheck={false} /></div>
            {directorFeedback && <div className={`p-4 rounded-xl border text-xs space-y-2 ${directorFeedback.passed ? 'border-emerald-700 bg-emerald-950/40 text-emerald-200' : 'border-red-700 bg-red-950/40 text-red-200'}`}><div className="flex items-center justify-between font-bold"><span className="flex items-center gap-1.5">{directorFeedback.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}<span>{directorFeedback.passed ? 'MILESTONE PASSED & APPROVED' : 'MILESTONE REJECTED'}</span></span></div><p className="leading-relaxed">{directorFeedback.message}</p>{directorFeedback.actualOutput && <div className="text-[10px] text-slate-400 font-mono mt-1">Output: {directorFeedback.actualOutput}</div>}</div>}
            {completedMilestones.length === project.milestones.length && <div className="p-4 bg-emerald-950/60 border border-emerald-600 rounded-xl text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2"><Award className="w-5 h-5 text-yellow-400" /><span>PROJECT COMPLETE: HADES EXPENSE LEDGER SHIPPED! (+135 XP TOTAL)</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
};