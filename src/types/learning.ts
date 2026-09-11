export type ChallengeType = 'PREDICT' | 'TRACE' | 'FIX' | 'DEBUG' | 'BUILD' | 'REFACTOR' | 'EXPLAIN' | 'BOSS';
export type MasteryLevel = 'LOCKED' | 'BEGINNER' | 'DEVELOPING' | 'COMPETENT' | 'STRONG' | 'MASTERED';
export type LearningPhase = 'DIAGNOSTIC' | 'TEACH' | 'KNOWLEDGE_CHECK' | 'PREDICT' | 'PRACTICE' | 'DEBUG' | 'INDEPENDENT' | 'MASTERY' | 'COMPLETE';
export type AIState = 'idle' | 'thinking' | 'teaching' | 'mocking' | 'angry' | 'celebrating' | 'warning' | 'boss_mode';

export interface SkillEvidence {
  attempts: number; successes: number; failures: number;
  independentSuccesses: number; assistedSuccesses: number; hintsUsed: number;
  predictSuccesses: number; debugSuccesses: number; buildSuccesses: number; explainSuccesses: number;
  recentErrors: string[]; lastAttemptAt?: number;
}

export interface Skill {
  id: string; name: string; description: string; prerequisites: string[];
  mastery: number; masteryLevel: MasteryLevel; evidence: SkillEvidence; weak: boolean; unlocked: boolean;
}

export interface ChallengeEvaluation {
  passed: boolean; score: number; outputCorrect: boolean; conceptCorrect: boolean;
  errorType?: string; errorMessage?: string; feedback: string; fixHint?: string; roast?: string;
  skillImpact: { skillId: string; delta: number }[];
  /** Legacy mastery fields retained while the new SkillMasteryEngine is adopted. */
  mastery?: number;
  masteryLevel?: MasteryLevel;
  accuracy?: number;
  independence?: number;
  consistency?: number;
  challengeVariety?: number;
  hintDependency?: number;
  weak?: boolean;
  readyForBoss?: boolean;
}

export interface HellChallenge {
  id: string; type: ChallengeType; title: string; instruction: string; concept: string; skillId: string;
  difficulty: 1 | 2 | 3 | 4 | 5; starterCode?: string; expectedOutput?: string; expectedAnswer?: string;
  requiredCodePatterns?: { pattern: string; explanation: string }[]; hints?: string[]; timeLimitSeconds?: number; boss?: boolean;
}

export interface LearningSession {
  sessionId: string; startedAt: number; lessonId: string; skillId: string; phase: LearningPhase;
  challengeId?: string; attemptNumber: number; hintsThisAttempt: number; failuresThisAttempt: number;
  previousErrors: string[]; startedWithoutHint: boolean; completed: boolean;
}

export interface AttemptHistoryEntry {
  challengeId: string;
  lessonId?: string;
  topicId: string;
  skillId?: string;
  passed: boolean;
  hintsUsed: number;
  independent?: boolean;
  runtimeError?: string;
  errorType?: string;
  code?: string;
  output?: string;
  timestamp: number;
  timeSpentSeconds?: number;
}

export interface AdaptiveDecision {
  action:
    | 'CONTINUE' | 'TEACH_AGAIN' | 'MICRO_LESSON' | 'EASIER_CHALLENGE' | 'HARDER_CHALLENGE'
    | 'DEBUG_CHALLENGE' | 'INDEPENDENT_CHALLENGE' | 'BOSS_CHALLENGE'
    | 'DEBUG' | 'INDEPENDENT_RETRY' | 'ADVANCE' | 'TEACH' | 'PRACTICE';
  reason: string;
  skillId: string;
  topicId?: string;
  phase?: LearningPhase;
  confidence?: number;
  recommendedDifficulty: number;
  removeHints: boolean;
}

export interface LearningProfile {
  studentId: string;
  overallMastery: number;
  currentPhase: LearningPhase;
  totalSuccesses: number;
  totalFailures: number;
  skills: Record<string, Skill>;
  misconceptions: { tracked: string[]; lastDetected: string; detectionCount: number };
  xp?: number;
  totalAttempts?: number;
  roastIntensity?: string;
  learningLanguage?: string;
  currentChallengeIndex?: number;
  completedLessons?: string[];
  diagnosticCompleted?: boolean;
  incidents?: unknown[];
  achievements?: unknown[];
  interviewReadiness?: number;
  recommendations?: unknown[];
  routingLogs?: unknown[];
  topicStats?: Record<string, unknown>;
  topicMastery?: Record<string, number>;
  topicAccuracy?: Record<string, number>;
  topicRetention?: Record<string, number>;
  topicIndependentSolve?: Record<string, number>;
  hintDependency?: Record<string, number>;
  confidenceIndicators?: Record<string, number>;
  attemptHistory?: AttemptHistoryEntry[];
  recentMistakes?: Array<{ challengeId: string; topicId?: string; skillId?: string; errorType?: string; error?: string; timestamp: number }>;
  recentErrors?: string[];
  currentTopicId?: string;
  lastActiveTimestamp?: number;
  successfulAttempts?: number;
  independentSolves?: number;
  totalHintsUsed?: number;
  masteredTopics?: string[];
  weakTopics?: string[];
  weakSkills?: string[];
  behavioralPatterns?: { dependencyDetected?: boolean; excessiveHints?: boolean; repeatedMistakePatterns?: string[]; independentSuccessCount?: number; assistedSuccessCount?: number; lastIndependentAttempt?: string };
  aiTutor?: { totalSessions?: number; totalHintsProvided?: number; explanationsGiven?: number; streakStatus?: string };
  lastDecision?: AdaptiveDecision;
}
