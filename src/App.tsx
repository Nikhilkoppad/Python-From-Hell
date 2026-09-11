import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Brain,
  Bug,
  ChevronRight,
  CircleCheck,
  CircleX,
  Code2,
  Flame,
  GraduationCap,
  HelpCircle,
  Play,
  RotateCcw,
  Settings,
  Shield,
  Sparkles,
  Terminal,
  Trophy,
  Zap,
} from 'lucide-react';

import { CURRICULUM, findChallenge, findLesson } from './data/curriculum';
import type { Challenge, Lesson } from './data/curriculum';

import { PythonRuntime } from './execution/PythonRuntime';

import { JudgmentEngine } from './engine/JudgmentEngine';
import { SkillMasteryEngine } from './engine/SkillMasteryEngine';
import { AdaptiveLearningEngine } from './engine/AdaptiveLearningEngine';
import { AIRouter } from './ai/AIRouter';
import { AITeacherService } from './ai/AITeacherService';
import { JarvisProctorEngine } from './ai/JarvisProctorEngine';

import {
  loadProgress,
  saveProgress,
} from './utils/progressPersistence';

import type {
  AIState,
  LearningPhase,
  LearningProfile,
} from './types/learning';

import { AITutor } from './components/AITutor';
import { AICharacterBanner } from './components/AICharacterBanner';
import { CurriculumMap } from './components/Curriculum/CurriculumMap';
import { BossFight } from './components/BossFight';
import { LearnerDashboard } from './components/LearnerDashboard';
import { CriminalRecord } from './components/CriminalRecord';
import { Diagnostic } from './components/Diagnostic';
import { DebuggingDungeon } from './components/DebuggingDungeon';
import { ProjectFactory } from './components/ProjectFactory';
import { AudioSettingsModal } from './components/AudioSettingsModal';

import { AchievementSystem } from './data/achievements';

const pythonRuntime = new PythonRuntime();

type ArenaPhase =
  | 'TEACH'
  | 'PREDICT'
  | 'CHECK'
  | 'CODE'
  | 'DEBUG'
  | 'INDEPENDENT'
  | 'MASTERY';

type Modal =
  | 'map'
  | 'dashboard'
  | 'record'
  | 'diagnostic'
  | 'dungeon'
  | 'projects'
  | 'boss'
  | 'audio'
  | 'tutor'
  | null;

type TutorMode =
  | 'HINT'
  | 'DEBUG'
  | 'EXPLAIN'
  | 'ROAST'
  | 'CHAT';

interface AppProgress extends LearningProfile {
  xp: number;
  streak: number;
  level: number;
  currentLessonId: string;
  currentChallengeIndex: number;
  completedLessons: string[];
  roastIntensity: string;
  learningLanguage: string;
  diagnosticCompleted: boolean;
  incidents: any[];
  achievements: any[];
  behavioralPatterns: any[];
  misconceptions: any[];
  interviewReadiness: number;
  aiTutor: any;
}

const DEFAULT_PROGRESS: AppProgress = {
  xp: 0,
  streak: 1,
  level: 1,

  currentLessonId: 'l1_1_print',
  currentChallengeIndex: 0,

  completedLessons: [],
  masteredTopics: [],
  weakTopics: [],
  topicAccuracy: {},
  topicRetention: {},
  topicIndependentSolve: {},
  hintDependency: {},

  confidenceIndicators: {},
  roastIntensity: 'APOCALYPSE',
  learningLanguage: 'HINDI',

  diagnosticCompleted: false,

  incidents: [],
  achievements: [],
  behavioralPatterns: [],
  misconceptions: [],

  topicMastery: {},

  lastActiveTimestamp: Date.now(),
  interviewReadiness: 0,

  aiTutor: {},

  totalAttempts: 0,
  successfulAttempts: 0,
  independentSolves: 0,
  totalHintsUsed: 0,

  attemptHistory: [],
  recentMistakes: [],
  currentTopicId: 'l1_1_print',
  lastDecision: undefined,
};

function phaseForChallenge(
  challenge: Challenge,
  failures: number,
  decision?: string
): ArenaPhase {
  if (decision === 'MICRO_LESSON') {
    return 'TEACH';
  }

  if (decision === 'DEBUG') {
    return 'DEBUG';
  }

  if (decision === 'INDEPENDENT_RETRY') {
    return 'INDEPENDENT';
  }

  if (decision === 'ADVANCE') {
    return 'MASTERY';
  }

  if (failures >= 3) {
    return 'DEBUG';
  }

  switch (challenge.type) {
    case 'PREDICT':
    case 'TRACE':
      return 'PREDICT';

    case 'EXPLAIN':
      return 'CHECK';

    case 'DEBUG':
    case 'FIX':
      return 'DEBUG';

    default:
      return failures === 0 ? 'CODE' : 'INDEPENDENT';
  }
}

function getPhaseLabel(phase: ArenaPhase): string {
  switch (phase) {
    case 'TEACH':
      return 'CONCEPT';
    case 'PREDICT':
      return 'PREDICT';
    case 'CHECK':
      return 'KNOWLEDGE CHECK';
    case 'CODE':
      return 'PRACTICE';
    case 'DEBUG':
      return 'DEBUGGING';
    case 'INDEPENDENT':
      return 'INDEPENDENT';
    case 'MASTERY':
      return 'MASTERY';
  }
}

function getPhaseColor(phase: ArenaPhase): string {
  switch (phase) {
    case 'TEACH':
      return 'border-purple-500/30 bg-purple-500/10 text-purple-300';

    case 'PREDICT':
      return 'border-blue-500/30 bg-blue-500/10 text-blue-300';

    case 'CHECK':
      return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300';

    case 'CODE':
      return 'border-red-500/30 bg-red-500/10 text-red-300';

    case 'DEBUG':
      return 'border-orange-500/30 bg-orange-500/10 text-orange-300';

    case 'INDEPENDENT':
      return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300';

    case 'MASTERY':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  }
}

function getNextLevelXp(level: number): number {
  return 100 + Math.max(0, level - 1) * 75;
}

function getCurrentFailures(
  progress: AppProgress,
  challengeId: string
): number {
  const attempts = Array.isArray(progress.attemptHistory)
    ? progress.attemptHistory
    : [];

  return attempts.filter(
    (attempt: any) =>
      attempt.challengeId === challengeId &&
      !attempt.passed
  ).length;
}

function getCurrentHints(
  progress: AppProgress,
  challengeId: string
): number {
  const attempts = Array.isArray(progress.attemptHistory)
    ? progress.attemptHistory
    : [];

  return attempts
    .filter(
      (attempt: any) =>
        attempt.challengeId === challengeId
    )
    .slice(-1)
    .reduce(
      (sum: number, attempt: any) =>
        sum + Number(attempt.hintsUsed ?? 0),
      0
    );
}

export default function App() {
  const [progress, setProgress] =
    useState<AppProgress>(() => {
      const stored = loadProgress();

      return {
        ...DEFAULT_PROGRESS,
        ...(stored ?? {}),
        lastActiveTimestamp: Date.now(),
      } as AppProgress;
    });

  const [code, setCode] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [runtimeError, setRuntimeError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [verdict, setVerdict] = useState<
    'idle' | 'passed' | 'failed'
  >('idle');

  const [aiState, setAiState] =
    useState<AIState>('idle');

  const [jarvisMessage, setJarvisMessage] =
    useState(
      'Welcome back, criminal. Let us find out what your brain forgot.'
    );

  const [gatewayOnline, setGatewayOnline] =
    useState(false);

  const [modal, setModal] =
    useState<Modal>(null);

  const [tutorMode, setTutorMode] =
    useState<TutorMode>('HINT');

  const [failureCount, setFailureCount] =
    useState(0);

  const [hintsThisAttempt, setHintsThisAttempt] =
    useState(0);

  const [showTeaching, setShowTeaching] =
    useState(true);

  const [isTransitioning, setIsTransitioning] =
    useState(false);

  const [sessionId] =
    useState(() =>
      JarvisProctorEngine.createSession()
    );

  const currentLesson: Lesson =
    findLesson(progress.currentLessonId) ??
    CURRICULUM[0].lessons[0];

  const currentChallenge: Challenge =
    currentLesson.challenges[
      Math.min(
        progress.currentChallengeIndex,
        currentLesson.challenges.length - 1
      )
    ];

  const currentChallengeId =
    currentChallenge?.id ?? '';

  const currentFailures =
    getCurrentFailures(
      progress,
      currentChallengeId
    );

  const currentHints =
    getCurrentHints(
      progress,
      currentChallengeId
    );

  const currentEvaluation = useMemo(() => {
    const attempts =
      (progress.attemptHistory ?? []).filter(
        (attempt: any) =>
          attempt.topicId === currentLesson.id
      );

    return SkillMasteryEngine.evaluateTopic(
      attempts as any
    );
  }, [progress.attemptHistory, currentLesson.id]);

  const adaptiveDecision =
    progress.lastDecision?.topicId === currentLesson.id
      ? progress.lastDecision
      : undefined;

  const phase = phaseForChallenge(
    currentChallenge,
    Math.max(
      failureCount,
      currentFailures
    ),
    adaptiveDecision?.action
  );

  const xpForLevel =
    getNextLevelXp(progress.level);

  const xpIntoLevel =
    progress.xp % xpForLevel;

  const xpPercent =
    Math.min(
      100,
      Math.round(
        (xpIntoLevel / xpForLevel) * 100
      )
    );

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    setCode(
      currentChallenge?.starterCode ?? ''
    );

    setTerminalOutput('');
    setRuntimeError('');
    setVerdict('idle');
    setFailureCount(currentFailures);
    setHintsThisAttempt(0);
    setShowTeaching(true);
    setAiState('idle');

    setJarvisMessage(
      adaptiveDecision?.reason ??
        currentLesson.brutalIntro ??
        'New victim detected. Begin.'
    );
  }, [
    currentLesson.id,
    currentChallenge?.id,
    currentChallenge?.starterCode,
  ]);

  useEffect(() => {
    let active = true;

    const checkAI = async () => {
      try {
        const online =
          await AIRouter.getClient().checkHealth();

        if (active) {
          setGatewayOnline(Boolean(online));
        }
      } catch {
        if (active) {
          setGatewayOnline(false);
        }
      }
    };

    checkAI();

    const timer = window.setInterval(
      checkAI,
      20000
    );

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    return () => {
      pythonRuntime.dispose();
    };
  }, []);

  const updateProgress = useCallback(
    (next: AppProgress) => {
      setProgress(next);
      saveProgress(next);
    },
    []
  );

  const moveToNextChallenge = useCallback(
    (profile: AppProgress) => {
      const nextIndex =
        progress.currentChallengeIndex + 1;

      if (
        nextIndex <
        currentLesson.challenges.length
      ) {
        updateProgress({
          ...profile,
          currentChallengeIndex: nextIndex,
          currentTopicId: currentLesson.id,
        });

        return;
      }

      const currentLevelIndex =
        CURRICULUM.findIndex(
          (level) =>
            level.lessons.some(
              (lesson) =>
                lesson.id === currentLesson.id
            )
        );

      const currentLevel =
        CURRICULUM[currentLevelIndex];

      const lessonIndex =
        currentLevel?.lessons.findIndex(
          (lesson) =>
            lesson.id === currentLesson.id
        ) ?? -1;

      const nextLesson =
        currentLevel?.lessons[
          lessonIndex + 1
        ];

      if (nextLesson) {
        updateProgress({
          ...profile,
          currentLessonId: nextLesson.id,
          currentChallengeIndex: 0,
          currentTopicId: nextLesson.id,
          completedLessons: Array.from(
            new Set([
              ...(profile.completedLessons ?? []),
              currentLesson.id,
            ])
          ),
        });

        return;
      }

      const nextLevel =
        CURRICULUM[currentLevelIndex + 1];

      if (nextLevel?.lessons?.[0]) {
        updateProgress({
          ...profile,
          level: Math.max(
            profile.level,
            currentLevelIndex + 2
          ),
          currentLessonId:
            nextLevel.lessons[0].id,
          currentChallengeIndex: 0,
          currentTopicId:
            nextLevel.lessons[0].id,
          completedLessons: Array.from(
            new Set([
              ...(profile.completedLessons ?? []),
              currentLesson.id,
            ])
          ),
        });

        return;
      }

      updateProgress({
        ...profile,
        completedLessons: Array.from(
          new Set([
            ...(profile.completedLessons ?? []),
            currentLesson.id,
          ])
        ),
      });
    },
    [
      currentLesson,
      progress.currentChallengeIndex,
      updateProgress,
    ]
  );

  const handleRunCode = async () => {
    if (isRunning || !currentChallenge) {
      return;
    }

    setIsRunning(true);
    setVerdict('idle');
    setTerminalOutput('');
    setRuntimeError('');
    setAiState('thinking');

    const attemptStarted =
      JarvisProctorEngine.startAttempt(
        sessionId
      );

    void attemptStarted;

    try {
      const result =
        await pythonRuntime.execute(code);

      const output =
        typeof result === 'string'
          ? result
          : result?.stdout ?? '';

      const error =
        typeof result === 'object'
          ? result?.error ??
            result?.stderr ??
            ''
          : '';

      setTerminalOutput(output);
      setRuntimeError(error);

      const judgment =
        JudgmentEngine.evaluate(
          currentChallenge,
          code,
          output,
          error
        );

      const passed =
        Boolean(
          (judgment as any)?.passed ??
            (judgment as any)?.success
        );

      const errorType =
        (judgment as any)?.errorType ??
        (error ? 'runtime_error' : 'output_mismatch');

      setVerdict(
        passed ? 'passed' : 'failed'
      );

      if (passed) {
        setAiState('celebrating');

        const learningResult =
          AdaptiveLearningEngine.recordAttempt({
            profile: progress,
            challengeId: currentChallenge.id,
            lessonId: currentLesson.id,
            topicId: currentLesson.id,
            passed: true,
            hintsUsed: hintsThisAttempt,
            code,
            output,
            runtimeError: undefined,
            errorType: undefined,
          });

        const achievementResult =
          AchievementSystem.evaluateAchievements(
            learningResult.profile
          );

        const completedAchievements =
          achievementResult.unlockedIds;

        const nextProfile: AppProgress = {
          ...progress,
          ...learningResult.profile,
          achievements:
            completedAchievements ??
            progress.achievements ??
            [],
          lastActiveTimestamp: Date.now(),
        };

        updateProgress(nextProfile);

        const observation =
          JarvisProctorEngine.observe({
            phase: phase as LearningPhase,
            passed: true,
            failureCount,
            hintsThisAttempt,
            runtimeError: '',
          });

        setJarvisMessage(
          observation.message ??
            'Against all available evidence, you actually did it.'
        );

        if (
          learningResult.decision.action ===
          'ADVANCE'
        ) {
          setJarvisMessage(
            'Fine. You have earned the right to face something harder.'
          );
        }

        window.setTimeout(() => {
          if (!isTransitioning) {
            setIsTransitioning(true);

            window.setTimeout(() => {
              moveToNextChallenge(
                nextProfile
              );
              setIsTransitioning(false);
            }, 500);
          }
        }, 900);
      } else {
        const nextFailures =
          failureCount + 1;

        setFailureCount(nextFailures);

        setAiState(
          nextFailures >= 3
            ? 'angry'
            : 'mocking'
        );

        const learningResult =
          AdaptiveLearningEngine.recordAttempt({
            profile: progress,
            challengeId: currentChallenge.id,
            lessonId: currentLesson.id,
            topicId: currentLesson.id,
            passed: false,
            hintsUsed: hintsThisAttempt,
            runtimeError: error,
            errorType,
            code,
            output,
          });

        const nextProfile: AppProgress = {
          ...progress,
          ...learningResult.profile,
          lastActiveTimestamp: Date.now(),
        };

        updateProgress(nextProfile);

        const observation =
          JarvisProctorEngine.observe({
            phase:
              nextFailures >= 3
                ? 'DEBUG'
                : (phase as LearningPhase),
            passed: false,
            failureCount: nextFailures,
            hintsThisAttempt,
            runtimeError: error,
          });

        if (
          learningResult.decision.action ===
          'MICRO_LESSON'
        ) {
          setShowTeaching(true);
          setJarvisMessage(
            'Three failures. Stop hammering RUN like a confused monkey. We are going back to the concept.'
          );
        } else if (
          learningResult.decision.action ===
          'DEBUG'
        ) {
          setJarvisMessage(
            'You are repeating the same mistake. Congratulations: you have discovered debugging.'
          );
        } else if (
          learningResult.decision.action ===
          'INDEPENDENT_RETRY'
        ) {
          setJarvisMessage(
            'You are becoming addicted to hints. No more training wheels. Solve it yourself.'
          );
        } else {
          setJarvisMessage(
            observation.message ??
              (judgment as any)?.explanation ??
              'Nope. That code belongs in the evidence locker.'
          );
        }
      }
    } catch (error: any) {
      const message =
        error?.message ??
        'Python execution failed.';

      setRuntimeError(message);
      setTerminalOutput('');
      setVerdict('failed');

      const nextFailures =
        failureCount + 1;

      setFailureCount(nextFailures);
      setAiState('angry');

      const learningResult =
        AdaptiveLearningEngine.recordAttempt({
          profile: progress,
          challengeId: currentChallenge.id,
          lessonId: currentLesson.id,
          topicId: currentLesson.id,
          passed: false,
          hintsUsed: hintsThisAttempt,
          runtimeError: message,
          errorType: 'runtime_error',
          code,
          output: '',
        });

      updateProgress({
        ...progress,
        ...learningResult.profile,
        lastActiveTimestamp: Date.now(),
      });

      setJarvisMessage(
        nextFailures >= 3
          ? 'The interpreter has joined me in judging you. DEBUG MODE.'
          : `Runtime failure: ${message}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const askJarvis = async (
    mode: TutorMode
  ) => {
    setTutorMode(mode);
    setAiState(
      mode === 'ROAST'
        ? 'mocking'
        : 'thinking'
    );

    try {
      const response =
        await AITeacherService.requestGuidance({
          mode,
          lessonTitle: currentLesson.title,
          concept: currentLesson.concept,
          code,
          terminalOutput,
          runtimeError,
          expectedOutput:
            currentChallenge.expectedOutput,
          profile: progress,
          failureCount,
          hintsThisAttempt,
          userQuery: '',
        });

      setJarvisMessage(
        response.message ??
          response.text ??
          'JARVIS has nothing useful to say. Impressive.'
      );

      setAiState(
        mode === 'ROAST'
          ? 'mocking'
          : 'teaching'
      );

      if (mode === 'HINT') {
        setHintsThisAttempt(
          (count) => count + 1
        );
      }
    } catch (error: any) {
      setAiState('warning');

      setJarvisMessage(
        error?.message ??
          'Local AI is unavailable. Fallback brain engaged.'
      );
    }
  };

  const resetChallenge = () => {
    setCode(
      currentChallenge.starterCode ?? ''
    );
    setTerminalOutput('');
    setRuntimeError('');
    setVerdict('idle');
    setFailureCount(0);
    setHintsThisAttempt(0);
    setAiState('idle');

    setJarvisMessage(
      'Fresh attempt. Same battlefield. Try not to embarrass yourself twice.'
    );
  };

  const jumpToLesson = (
    lessonId: string
  ) => {
    const lesson = findLesson(lessonId);

    if (!lesson) {
      return;
    }

    updateProgress({
      ...progress,
      currentLessonId: lesson.id,
      currentChallengeIndex: 0,
      currentTopicId: lesson.id,
      lastActiveTimestamp: Date.now(),
    });

    setModal(null);
  };

  const openTutor = (mode: TutorMode) => {
    setTutorMode(mode);
    setModal('tutor');
  };

  const navButton = (
    label: string,
    icon: any,
    action: () => void,
    active = false
  ) => {
    const Icon = icon;

    return (
      <button
        type="button"
        onClick={action}
        className={[
          'group flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-xs transition',
          active
            ? 'border-red-500/30 bg-red-500/10 text-red-300'
            : 'border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900 hover:text-slate-200',
        ].join(' ')}
      >
        <Icon size={15} />
        <span>{label}</span>
        <ChevronRight
          size={13}
          className="ml-auto opacity-30 transition group-hover:opacity-100"
        />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#07090d]/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10">
              <Flame
                size={19}
                className="text-red-400"
              />
            </div>

            <div>
              <div className="text-sm font-black tracking-[0.2em] text-white">
                PYTHON FROM HELL
              </div>

              <div className="text-[10px] uppercase tracking-widest text-slate-600">
                adaptive coding arena
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-widest text-slate-600">
                LEVEL
              </div>

              <div className="text-sm font-bold text-white">
                {progress.level}
              </div>
            </div>

            <div className="w-28">
              <div className="mb-1 flex justify-between text-[9px] uppercase tracking-widest">
                <span className="text-slate-600">
                  XP
                </span>

                <span className="text-slate-400">
                  {progress.xp}
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-slate-900">
                <div
                  className="h-full rounded-full bg-red-500 transition-all"
                  style={{
                    width: `${xpPercent}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-orange-400">
              <Flame size={15} />

              <span className="text-sm font-bold">
                {progress.streak}
              </span>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-800 pl-5">
              <span
                className={[
                  'h-2 w-2 rounded-full',
                  gatewayOnline
                    ? 'bg-emerald-400'
                    : 'bg-slate-600',
                ].join(' ')}
              />

              <span className="text-[10px] uppercase tracking-widest text-slate-500">
                {gatewayOnline
                  ? 'GEMMA // ONLINE'
                  : 'LOCAL AI // STANDBY'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 xl:grid-cols-[230px_minmax(0,1fr)_330px]">
        <aside className="hidden border-r border-slate-800/70 bg-[#090b10] xl:block">
          <div className="sticky top-16 p-4">
            <div className="mb-4 px-2">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                Arena
              </div>
            </div>

            <div className="space-y-1">
              {navButton(
                'Hell Map',
                Activity,
                () => setModal('map'),
                modal === 'map'
              )}

              {navButton(
                'Player Dossier',
                Brain,
                () => setModal('dashboard'),
                modal === 'dashboard'
              )}

              {navButton(
                'Criminal Record',
                Shield,
                () => setModal('record'),
                modal === 'record'
              )}

              {navButton(
                'Debugging Dungeon',
                Bug,
                () => setModal('dungeon'),
                modal === 'dungeon'
              )}

              {navButton(
                'Project Factory',
                Code2,
                () => setModal('projects'),
                modal === 'projects'
              )}

              {navButton(
                'Boss Fight',
                Trophy,
                () => setModal('boss'),
                modal === 'boss'
              )}

              {navButton(
                'Diagnostic',
                GraduationCap,
                () => setModal('diagnostic'),
                modal === 'diagnostic'
              )}

              {navButton(
                'Audio',
                Settings,
                () => setModal('audio'),
                modal === 'audio'
              )}
            </div>

            <div className="mt-8 rounded-xl border border-slate-800 bg-[#0c0f14] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Zap
                  size={14}
                  className="text-yellow-400"
                />

                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Current Target
                </span>
              </div>

              <div className="text-xs font-bold text-white">
                {currentLesson.title}
              </div>

              <div className="mt-2 text-[10px] leading-5 text-slate-600">
                {currentLesson.concept}
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 p-4 md:p-6">
          <div className="mx-auto max-w-5xl">
            <section className="mb-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-red-400">
                  LEVEL {progress.level}
                </span>

                <span
                  className={[
                    'rounded border px-2 py-1 text-[9px] font-bold uppercase tracking-widest',
                    getPhaseColor(phase),
                  ].join(' ')}
                >
                  {getPhaseLabel(phase)}
                </span>

                {currentEvaluation.masteryLevel && (
                  <span className="rounded border border-slate-800 bg-slate-900/50 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    {currentEvaluation.masteryLevel}
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                    {currentLesson.stage}
                  </div>

                  <h1 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">
                    {currentLesson.title}
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {currentLesson.concept}
                  </p>
                </div>

                <div className="hidden text-right sm:block">
                  <div className="text-[9px] uppercase tracking-widest text-slate-700">
                    MISSION
                  </div>

                  <div className="mt-1 text-xs font-bold text-slate-500">
                    {progress.currentChallengeIndex + 1}
                    {' / '}
                    {currentLesson.challenges.length}
                  </div>
                </div>
              </div>
            </section>

            {showTeaching && (
              <section className="mb-5 rounded-xl border border-slate-800 bg-[#0b0e13]">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={15}
                      className="text-purple-400"
                    />

                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      JARVIS // CONCEPT BRIEF
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowTeaching(false)
                    }
                    className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-slate-300"
                  >
                    Collapse
                  </button>
                </div>

                <div className="p-4">
                  <div className="text-sm leading-7 text-slate-300">
                    {currentLesson.brutalIntro}
                  </div>

                  {currentLesson.teachingSections?.length >
                    0 && (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {currentLesson.teachingSections
                        .slice(0, 2)
                        .map((section: any) => (
                          <div
                            key={section.title}
                            className="rounded-lg border border-slate-800 bg-[#080a0e] p-3"
                          >
                            <div className="mb-1 text-xs font-bold text-slate-300">
                              {section.title}
                            </div>

                            <div className="text-[11px] leading-5 text-slate-600">
                              {section.content}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="mb-5 rounded-xl border border-slate-800 bg-[#0b0e13]">
              <div className="border-b border-slate-800 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-red-500/10 text-red-400">
                    <Terminal size={14} />
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white">
                      {currentChallenge?.title ??
                        `Challenge ${progress.currentChallengeIndex + 1}`}
                    </div>

                    <div className="text-[10px] text-slate-600">
                      {currentChallenge?.type ??
                        'BUILD'}{' '}
                      · difficulty{' '}
                      {currentChallenge?.difficulty ?? 1}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs leading-6 text-slate-300">
                  {currentChallenge?.instruction ??
                    'Complete the assignment.'}
                </p>

                {currentChallenge?.expectedOutput && (
                  <div className="mt-3 rounded border border-slate-800 bg-[#07090d] p-3 font-mono text-[11px]">
                    <span className="text-slate-600">Expected Output:</span>
                    <pre className="mt-1 text-slate-300">
                      {currentChallenge.expectedOutput}
                    </pre>
                  </div>
                )}
              </div>
            </section>

            <section className="mb-5 rounded-xl border border-slate-800 bg-[#0b0e13] overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 bg-[#090b10]">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Code2 size={14} />
                  <span>solution.py</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetChallenge}
                    className="flex items-center gap-1.5 rounded border border-slate-800 px-2.5 py-1 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 rounded bg-red-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-red-500 disabled:opacity-50 transition"
                  >
                    <Play size={12} />
                    <span>{isRunning ? 'RUNNING...' : 'RUN CODE'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-64 bg-[#07090d] p-4 font-mono text-xs text-slate-200 focus:outline-none resize-y"
              />
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#0b0e13] p-4 font-mono text-xs">
              <div className="mb-2 flex items-center justify-between text-[10px] text-slate-600 uppercase tracking-widest">
                <span>Terminal Output</span>
                {verdict === 'passed' && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CircleCheck size={12} /> PASSED
                  </span>
                )}
                {verdict === 'failed' && (
                  <span className="flex items-center gap-1 text-red-400">
                    <CircleX size={12} /> FAILED
                  </span>
                )}
              </div>

              <div className="min-h-[80px] rounded bg-[#07090d] p-3 text-slate-300">
                {runtimeError ? (
                  <pre className="text-red-400">{runtimeError}</pre>
                ) : terminalOutput ? (
                  <pre>{terminalOutput}</pre>
                ) : (
                  <span className="text-slate-700">// Execution output will appear here</span>
                )}
              </div>
            </section>
          </div>
        </main>

        <aside className="hidden border-l border-slate-800/70 bg-[#090b10] xl:block">
          <div className="sticky top-16 p-4 space-y-4">
            <AICharacterBanner
              state={aiState}
              message={jarvisMessage}
            />

            <div className="rounded-xl border border-slate-800 bg-[#0c0f14] p-3 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                AI Assistance
              </div>

              <button
                type="button"
                onClick={() => askJarvis('HINT')}
                className="w-full flex items-center justify-between rounded border border-slate-800 bg-slate-900/50 p-2 text-xs text-slate-300 hover:border-slate-700 transition"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle size={14} className="text-yellow-400" />
                  Get Hint
                </span>
                <span className="text-[10px] text-slate-600">({hintsThisAttempt} used)</span>
              </button>

              <button
                type="button"
                onClick={() => askJarvis('ROAST')}
                className="w-full flex items-center justify-between rounded border border-slate-800 bg-slate-900/50 p-2 text-xs text-slate-300 hover:border-slate-700 transition"
              >
                <span className="flex items-center gap-2">
                  <Flame size={14} className="text-red-400" />
                  Roast Code
                </span>
              </button>

              <button
                type="button"
                onClick={() => openTutor('CHAT')}
                className="w-full flex items-center justify-between rounded border border-slate-800 bg-slate-900/50 p-2 text-xs text-slate-300 hover:border-slate-700 transition"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400" />
                  Open Tutor
                </span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {modal === 'map' && (
        <CurriculumMap
          curriculum={CURRICULUM}
          currentLessonId={progress.currentLessonId}
          completedLessons={progress.completedLessons}
          onSelectLesson={jumpToLesson}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'dashboard' && (
        <LearnerDashboard
          progress={progress}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'record' && (
        <CriminalRecord
          progress={progress}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'diagnostic' && (
        <Diagnostic
          onComplete={(result) => {
            updateProgress({
              ...progress,
              diagnosticCompleted: true,
              ...result,
            });
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'dungeon' && (
        <DebuggingDungeon
          progress={progress}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'projects' && (
        <ProjectFactory
          progress={progress}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'boss' && (
        <BossFight
          progress={progress}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'audio' && (
        <AudioSettingsModal
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'tutor' && (
        <AITutor
          mode={tutorMode}
          lesson={currentLesson}
          challenge={currentChallenge}
          code={code}
          terminalOutput={terminalOutput}
          runtimeError={runtimeError}
          progress={progress}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}