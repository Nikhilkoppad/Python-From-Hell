import type { AIRoutingRecord, IncidentLog, Recommendation, TopicAssessment } from '../types';

export type { IncidentLog } from '../types';

export type ChallengeType = 'PREDICT' | 'TRACE' | 'FIX' | 'DEBUG' | 'BUILD' | 'REFACTOR' | 'EXPLAIN' | 'BOSS';
export type MasteryLevel = 'LOCKED' | 'BEGINNER' | 'DEVELOPING' | 'COMPETENT' | 'STRONG' | 'MASTERED';
export type LearningPhase = 'DIAGNOSTIC' | 'TEACH' | 'KNOWLEDGE_CHECK' | 'PREDICT' | 'PRACTICE' | 'DEBUG' | 'INDEPENDENT' | 'MASTERY' | 'COMPLETE';
export type AIState = 'idle' | 'thinking' | 'teaching' | 'mocking' | 'angry' | 'celebrating' | 'warning' | 'boss_mode';
export interface SkillEvidence { attempts: number; successes: number; failures: number; independentSuccesses: number; assistedSuccesses: number; hintsUsed: number; predictSuccesses: number; debugSuccesses: number; buildSuccesses: number; explainSuccesses: number; recentErrors: string[]; lastAttemptAt?: number; }
export interface Skill { id: string; name: string; description: string; prerequisites: string[]; mastery: number; masteryLevel: MasteryLevel; evidence: SkillEvidence; weak: boolean; unlocked: boolean; }
export interface ChallengeEvaluation { passed?: boolean; score?: number; outputCorrect?: boolean; conceptCorrect?: boolean; errorType?: string; errorMessage?: string; feedback?: string; fixHint?: string; roast?: string; skillImpact?: { skillId: string; delta: number }[]; mastery?: number; masteryLevel?: MasteryLevel; accuracy?: number; independence?: number; consistency?: number; challengeVariety?: number; hintDependency?: number; weak?: boolean; readyForBoss?: boolean; }
export interface HellChallenge { id: string; type: ChallengeType; title: string; instruction: string; concept: string; skillId: string; difficulty: 1 | 2 | 3 | 4 | 5; starterCode?: string; expectedOutput?: string; expectedAnswer?: string; requiredCodePatterns?: { pattern: string; explanation: string }[]; hints?: string[]; timeLimitSeconds?: number; boss?: boolean; }
export interface LearningSession { sessionId: string; startedAt: number; lessonId: string; skillId: string; phase: LearningPhase; challengeId?: string; attemptNumber: number; hintsThisAttempt: number; failuresThisAttempt: number; previousErrors: string[]; startedWithoutHint: boolean; completed: boolean; }
export interface AttemptHistoryEntry { challengeId: string; lessonId?: string; topicId: string; skillId?: string; challengeType?: ChallengeType; passed: boolean; hintsUsed: number; independent?: boolean; runtimeError?: string; errorType?: string; code?: string; output?: string; timestamp: number; timeSpentSeconds?: number; }
export interface DiagnosticEvidence { completed: boolean; score?: number; strengths: string[]; weaknesses: string[]; topicScores: Record<string, number>; completedAt?: number; }
export interface BehavioralPatterns { independentSuccessCount: number; assistedSuccessCount: number; averageHintsPerSuccess: number; repeatedErrorTypes: string[]; preferredChallengeTypes: ChallengeType[]; [key: string]: unknown; }
export interface AITutorState { lastMode?: 'HINT' | 'DEBUG' | 'EXPLAIN' | 'ROAST' | 'CHAT'; hintsGiven?: number; sessions?: number; lastInteractionAt?: number; [key: string]: unknown; }
export interface LearningProfile {
  studentId: string; clearedBosses?: string[]; overallMastery: number; currentPhase: LearningPhase; totalSuccesses: number; totalFailures: number; skills: Record<string, Skill>;
  misconceptions: { tracked: string[]; lastDetected: string; detectionCount: number };
  xp?: number; streak?: number; totalAttempts?: number; roastIntensity?: string; learningLanguage?: string; currentChallengeIndex?: number; completedLessons?: string[]; diagnosticCompleted?: boolean; incidents?: IncidentLog[]; achievements?: string[]; interviewReadiness?: number;
  recommendations?: Recommendation[]; routingLogs?: AIRoutingRecord[]; topicStats?: Record<string, TopicAssessment>; topicMastery?: Record<string, number>; topicAccuracy?: Record<string, number>; topicRetention?: Record<string, number>; topicIndependentSolve?: Record<string, number>; hintDependency?: Record<string, number>; confidenceIndicators?: Record<string, number>;
  attemptHistory?: AttemptHistoryEntry[]; recentMistakes?: Array<{ challengeId: string; topicId?: string; skillId?: string; errorType?: string; error?: string; timestamp: number }>; recentErrors?: string[]; currentTopicId?: string; lastActiveTimestamp?: number; successfulAttempts?: number; independentSolves?: number; totalHintsUsed?: number; masteredTopics?: string[]; weakTopics?: string[]; weakSkills?: string[];
  behavioralPatterns?: BehavioralPatterns; aiTutor?: AITutorState; lastDecision?: AdaptiveDecision; diagnosticEvidence?: DiagnosticEvidence;
}
export interface AdaptiveDecision {
  action: 'CONTINUE' | 'TEACH_AGAIN' | 'EASIER_CHALLENGE' | 'HARDER_CHALLENGE' | 'DEBUG_CHALLENGE' | 'INDEPENDENT_CHALLENGE' | 'BOSS_CHALLENGE';
  reason: string; skillId: string; topicId?: string; phase?: LearningPhase; confidence?: number; recommendedDifficulty: number; removeHints: boolean;
}
