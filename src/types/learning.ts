export type ChallengeType = 'PREDICT' | 'TRACE' | 'FIX' | 'DEBUG' | 'BUILD' | 'REFACTOR' | 'EXPLAIN' | 'BOSS';
export type MasteryLevel = 'LOCKED' | 'BEGINNER' | 'DEVELOPING' | 'COMPETENT' | 'STRONG' | 'MASTERED';
export type LearningPhase = 'DIAGNOSTIC' | 'TEACH' | 'KNOWLEDGE_CHECK' | 'PREDICT' | 'PRACTICE' | 'DEBUG' | 'INDEPENDENT' | 'MASTERY' | 'COMPLETE';
export type AIState = 'idle' | 'thinking' | 'teaching' | 'mocking' | 'angry' | 'celebrating' | 'warning' | 'boss_mode';
export interface SkillEvidence { attempts: number; successes: number; failures: number; independentSuccesses: number; assistedSuccesses: number; hintsUsed: number; predictSuccesses: number; debugSuccesses: number; buildSuccesses: number; explainSuccesses: number; recentErrors: string[]; lastAttemptAt?: number; }
export interface Skill { id: string; name: string; description: string; prerequisites: string[]; mastery: number; masteryLevel: MasteryLevel; evidence: SkillEvidence; weak: boolean; unlocked: boolean; }
export interface ChallengeEvaluation { passed: boolean; score: number; outputCorrect: boolean; conceptCorrect: boolean; errorType?: string; errorMessage?: string; feedback: string; fixHint?: string; roast?: string; skillImpact: { skillId: string; delta: number }[]; }
export interface HellChallenge { id: string; type: ChallengeType; title: string; instruction: string; concept: string; skillId: string; difficulty: 1 | 2 | 3 | 4 | 5; starterCode?: string; expectedOutput?: string; expectedAnswer?: string; requiredCodePatterns?: { pattern: string; explanation: string }[]; hints?: string[]; timeLimitSeconds?: number; boss?: boolean; }
export interface LearningSession { sessionId: string; startedAt: number; lessonId: string; skillId: string; phase: LearningPhase; challengeId?: string; attemptNumber: number; hintsThisAttempt: number; failuresThisAttempt: number; previousErrors: string[]; startedWithoutHint: boolean; completed: boolean; }
export interface AttemptHistoryEntry { topicId?: string; skillId?: string; passed: boolean; hintsUsed: number; errorType?: string; timestamp: number; timeSpentSeconds?: number; challengeId?: string; lessonId?: string; independent?: boolean; challengeType?: ChallengeType; code?: string; output?: string; }
export interface DiagnosticEvidence { questionId: string; topic: string; selectedAnswer: number; correctAnswer: number; correct: boolean; placedLevel: number; }
export interface BehavioralPatterns { independentSuccessCount: number; assistedSuccessCount: number; averageHintsPerSuccess: number; repeatedErrorTypes: string[]; preferredChallengeTypes: ChallengeType[]; [key: string]: unknown; }
export interface AITutorState { totalSessions?: number; totalHintsProvided?: number; learningStyleProfile?: 'VISUAL' | 'HANDS_ON' | 'THEORETICAL' | 'MIXED'; commonErrorPatterns?: string[]; streakStatus?: 'ACTIVE' | 'BREAK' | 'RENEWED'; lastInteractionAt?: string | number; proficiencyScore?: number; recommendedIntensity?: string; lastMode?: 'HINT' | 'DEBUG' | 'EXPLAIN' | 'ROAST' | 'CHAT'; hintsGiven?: number; sessions?: number; [key: string]: unknown; }
export interface LearningProfile {
  studentId?: string;
  overallMastery?: number;
  currentPhase?: LearningPhase;
  totalSuccesses?: number;
  totalFailures?: number;
  skills?: Record<string, Skill>;
  misconceptions: string[];
  behavioralPatterns?: BehavioralPatterns;
  attemptHistory?: AttemptHistoryEntry[];
  recentMistakes?: Array<{ challengeId: string; topicId?: string; skillId?: string; errorType?: string; error?: string; timestamp: number }>;
  recentErrors?: string[];
  weakTopics: string[];
  masteredTopics: string[];
  weakSkills?: string[];
  topicMastery: Record<string, number>;
  topicAccuracy?: Record<string, number>;
  topicRetention?: Record<string, number>;
  topicIndependentSolve?: Record<string, number>;
  hintDependency?: Record<string, number>;
  confidenceIndicators?: Record<string, number>;
  xp: number;
  level: number;
  streak: number;
  currentSkill?: string;
  assistedSolves?: number;
  totalAttempts?: number;
  successfulAttempts?: number;
  independentSolves?: number;
  totalHintsUsed?: number;
  currentTopicId?: string;
  currentChallengeIndex: number;
  currentLessonId: string;
  completedLessons: string[];
  roastIntensity: string;
  learningLanguage: string;
  diagnosticCompleted: boolean;
  incidents: import('../types').IncidentLog[];
  achievements: string[];
  interviewReadiness?: number;
  recommendations?: import('../types').Recommendation[];
  routingLogs?: import('../types').AIRoutingRecord[];
  topicStats?: Record<string, import('../types').TopicAssessment>;
  aiTutor?: AITutorState;
  lastActiveTimestamp?: number | string;
  lastDecision?: AdaptiveDecision;
  diagnosticEvidence?: DiagnosticEvidence[];
}
export interface AdaptiveDecision { action: 'CONTINUE' | 'TEACH_AGAIN' | 'MICRO_LESSON' | 'EASIER_CHALLENGE' | 'HARDER_CHALLENGE' | 'DEBUG_CHALLENGE' | 'INDEPENDENT_CHALLENGE' | 'BOSS_CHALLENGE'; reason: string; skillId: string; topicId?: string; phase?: LearningPhase; confidence?: number; recommendedDifficulty: number; removeHints: boolean; }
export type IncidentLog = import('../types').IncidentLog;
