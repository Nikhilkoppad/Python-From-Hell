export type ChallengeType =
  | "PREDICT"
  | "TRACE"
  | "FIX"
  | "DEBUG"
  | "BUILD"
  | "REFACTOR"
  | "EXPLAIN"
  | "BOSS";

export type MasteryLevel =
  | "LOCKED"
  | "BEGINNER"
  | "DEVELOPING"
  | "COMPETENT"
  | "STRONG"
  | "MASTERED";

export type LearningPhase =
  | "DIAGNOSTIC"
  | "TEACH"
  | "KNOWLEDGE_CHECK"
  | "PREDICT"
  | "PRACTICE"
  | "DEBUG"
  | "INDEPENDENT"
  | "MASTERY"
  | "COMPLETE";

export type AIState =
  | "idle"
  | "thinking"
  | "teaching"
  | "mocking"
  | "angry"
  | "celebrating"
  | "warning"
  | "boss_mode";

export interface SkillEvidence {
  attempts: number;
  successes: number;
  failures: number;

  independentSuccesses: number;
  assistedSuccesses: number;

  hintsUsed: number;

  predictSuccesses: number;
  debugSuccesses: number;
  buildSuccesses: number;
  explainSuccesses: number;

  recentErrors: string[];

  lastAttemptAt?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;

  prerequisites: string[];

  mastery: number;
  masteryLevel: MasteryLevel;

  evidence: SkillEvidence;

  weak: boolean;
  unlocked: boolean;
}

export interface ChallengeEvaluation {
  passed: boolean;

  score: number;

  outputCorrect: boolean;
  conceptCorrect: boolean;

  errorType?: string;
  errorMessage?: string;

  feedback: string;
  fixHint?: string;

  roast?: string;

  skillImpact: {
    skillId: string;
    delta: number;
  }[];
}

export interface HellChallenge {
  id: string;

  type: ChallengeType;

  title: string;

  instruction: string;

  concept: string;

  skillId: string;

  difficulty: 1 | 2 | 3 | 4 | 5;

  starterCode?: string;

  expectedOutput?: string;

  expectedAnswer?: string;

  requiredCodePatterns?: {
    pattern: string;
    explanation: string;
  }[];

  hints?: string[];

  timeLimitSeconds?: number;

  boss?: boolean;
}

export interface LearningSession {
  sessionId: string;

  startedAt: number;

  lessonId: string;

  skillId: string;

  phase: LearningPhase;

  challengeId?: string;

  attemptNumber: number;

  hintsThisAttempt: number;

  failuresThisAttempt: number;

  previousErrors: string[];

  startedWithoutHint: boolean;

  completed: boolean;
}

export interface LearningProfile {
  level: number;

  xp: number;

  streak: number;

  totalAttempts: number;

  totalSuccesses: number;

  totalFailures: number;

  totalHints: number;

  independentSuccesses: number;

  skills: Record<string, Skill>;

  weakSkills: string[];

  masteredSkills: string[];

  misconceptions: string[];

  recentErrors: string[];

  currentLessonId?: string;

  currentChallengeId?: string;

  currentSkillId?: string;

  currentPhase: LearningPhase;

  lastActiveAt?: number;
}

export interface AdaptiveDecision {
  action:
    | "CONTINUE"
    | "TEACH_AGAIN"
    | "MICRO_LESSON"
    | "EASIER_CHALLENGE"
    | "HARDER_CHALLENGE"
    | "DEBUG_CHALLENGE"
    | "INDEPENDENT_CHALLENGE"
    | "BOSS_CHALLENGE";

  reason: string;

  skillId: string;

  recommendedDifficulty: number;

  removeHints: boolean;
}