export type RoastIntensity =
  | 'SUPPORTIVE'
  | 'SAVAGE'
  | 'NIGHTMARE'
  | 'APOCALYPSE'
  | 'DESI_SENIOR'
  | 'ACADEMIC';

export type LearningLanguage = 'ENGLISH' | 'HINDI';

export type SpecialistCategory =
  | 'CODING'
  | 'UI_UX'
  | 'ARCHITECTURE_REASONING'
  | 'DEBUGGING_TESTING'
  | 'FAST_SIMPLE'
  | 'GENERAL'
  | 'VISION'
  | 'VOICE';

export type QualitativeMasteryState =
  | 'NOT_ASSESSED'
  | 'BEGINNER'
  | 'DEVELOPING'
  | 'COMPETENT'
  | 'STRONG'
  | 'MASTERED';

export interface TopicAssessment {
  topicId: string;
  topicTitle: string;
  status: QualitativeMasteryState;
  attemptsCount: number;
  successCount: number;
  failureCount: number;
  hintsUsedCount: number;
  independentSuccessCount: number;
  accuracyPercent?: number;
  masteryScore?: number;
  lastAttemptAt?: string;
  evidenceSummary: string;
}

export type RecommendedAction =
  | 'CONTINUE'
  | 'REVISE'
  | 'REMEDIATE'
  | 'INCREASE_DIFFICULTY'
  | 'DECREASE_DIFFICULTY'
  | 'DEBUG'
  | 'PREDICT'
  | 'PRACTICE_INDEPENDENTLY'
  | 'TAKE_BOSS_CHALLENGE'
  | 'START_PROJECT'
  | 'ATTEMPT_INTERVIEW';

export interface Recommendation {
  action: RecommendedAction;
  topicId: string;
  reason: string;
  evidence: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ModelCapability {
  id: string;
  name: string;
  provider: string;
  category: SpecialistCategory;
  contextWindow?: number;
  maxTokens?: number;
  supportsStreaming?: boolean;
  supportsVision?: boolean;
  costTier: 'FREE' | 'LOW' | 'MEDIUM' | 'HIGH';
  healthy: boolean;
  latencyMs?: number;
  failureCount: number;
  cooldownUntil?: number;
}

export interface AIRoutingRecord {
  requestId: string;
  timestamp: string;
  category: SpecialistCategory;
  selectedProvider: string;
  selectedModel: string;
  fallbackChain: string[];
  latencyMs: number;
  success: boolean;
  errorReason?: string;
  promptTokens?: number;
  completionTokens?: number;
}

export interface IncidentLog {
  id: string;
  timestamp: string;
  errorType: string;
  errorMessage: string;
  codeSnippet: string;
  lessonId: string;
  roastMessage: string;
  persona: string;
  repeatCount: number;
  levelTitle?: string;
  status?: string;
}

export interface EvaluationResult {
  passed: boolean;
  userOutput: string;
  errorType?: string;
  errorMessage?: string;
  roastMessage: string;
  explanation: string;
  fixHint: string;
  personaUsed: string;
}

export interface UserProgress {
  id?: string;
  userId?: string;
  xp: number;
  streak: number;
  level: number;
  currentLessonId: string;
  currentChallengeIndex: number;
  completedLessons: string[];
  masteredTopics: string[];
  weakTopics: string[];
  roastIntensity: RoastIntensity;
  learningLanguage: LearningLanguage;
  diagnosticCompleted: boolean;
  incidents: IncidentLog[];
  achievements: any[];
  topicStats?: Record<string, TopicAssessment>;
  topicMastery: Record<string, number>;
  topicAccuracy: Record<string, number>;
  topicRetention: Record<string, number>;
  topicIndependentSolve: Record<string, number>;
  hintDependency: Record<string, number>;
  confidenceIndicators: Record<string, number>;
  lastActiveTimestamp: string;
  interviewReadiness: number;
  recommendations?: Recommendation[];
  routingLogs?: AIRoutingRecord[];
  aiTutor: {
    totalSessions: number;
    totalHintsProvided: number;
    learningStyleProfile: 'VISUAL' | 'HANDS_ON' | 'THEORETICAL' | 'MIXED';
    commonErrorPatterns: string[];
    streakStatus: 'ACTIVE' | 'BREAK' | 'RENEWED';
    lastInteractionAt: string;
    proficiencyScore: number;
    recommendedIntensity: RoastIntensity;
  };
  behavioralPatterns: {
    dependencyDetected: boolean;
    excessiveHints: boolean;
    repeatedMistakePatterns: string[];
    independentSuccessCount: number;
    assistedSuccessCount: number;
    lastIndependentAttempt: string;
  };
  misconceptions: {
    tracked: string[];
    lastDetected: string;
    detectionCount: number;
  };
}
