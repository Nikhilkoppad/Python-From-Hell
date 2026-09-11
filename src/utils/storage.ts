import type { LearningLanguage, UserProgress } from '../types';

const STORAGE_KEY = 'python_hell_progress';

type StoredProgress = Partial<UserProgress> & { schemaVersion?: number };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const validIntensity = (value: unknown): UserProgress['roastIntensity'] =>
  value === 'SUPPORTIVE' || value === 'SAVAGE' || value === 'NIGHTMARE' ||
  value === 'APOCALYPSE' || value === 'DESI_SENIOR' || value === 'ACADEMIC'
    ? value
    : 'APOCALYPSE';

const validLanguage = (value: unknown): LearningLanguage =>
  value === 'HINDI' || value === 'ENGLISH' ? value : 'HINDI';

const sanitizeNumberRecord = (rec: unknown, fallback: Record<string, number>): Record<string, number> => {
  if (!isRecord(rec)) return fallback;
  return Object.fromEntries(
    Object.entries(rec).filter(([, val]) => typeof val === 'number')
  ) as Record<string, number>;
};

const migrateProgress = (
  stored: StoredProgress,
  fallback: UserProgress
): UserProgress => ({
  ...fallback,
  ...stored,
  xp: typeof stored.xp === 'number' ? stored.xp : fallback.xp,
  streak: typeof stored.streak === 'number' ? stored.streak : fallback.streak,
  level: typeof stored.level === 'number' ? stored.level : fallback.level,
  currentLessonId: typeof stored.currentLessonId === 'string'
    ? stored.currentLessonId
    : fallback.currentLessonId,
  currentChallengeIndex: typeof stored.currentChallengeIndex === 'number'
    ? stored.currentChallengeIndex
    : fallback.currentChallengeIndex,
  completedLessons: Array.isArray(stored.completedLessons)
    ? stored.completedLessons.filter((item): item is string => typeof item === 'string')
    : fallback.completedLessons,
  masteredTopics: Array.isArray(stored.masteredTopics)
    ? stored.masteredTopics.filter((item): item is string => typeof item === 'string')
    : fallback.masteredTopics,
  achievements: Array.isArray(stored.achievements) ? stored.achievements : fallback.achievements,
  incidents: Array.isArray(stored.incidents) ? stored.incidents : fallback.incidents,
  recommendations: Array.isArray(stored.recommendations) ? stored.recommendations : fallback.recommendations,
  routingLogs: Array.isArray(stored.routingLogs) ? stored.routingLogs : fallback.routingLogs,
  topicMastery: sanitizeNumberRecord(stored.topicMastery, fallback.topicMastery),
  topicAccuracy: sanitizeNumberRecord(stored.topicAccuracy, fallback.topicAccuracy),
  topicRetention: sanitizeNumberRecord(stored.topicRetention, fallback.topicRetention),
  topicIndependentSolve: sanitizeNumberRecord(stored.topicIndependentSolve, fallback.topicIndependentSolve),
  hintDependency: sanitizeNumberRecord(stored.hintDependency, fallback.hintDependency),
  confidenceIndicators: sanitizeNumberRecord(stored.confidenceIndicators, fallback.confidenceIndicators),
  roastIntensity: validIntensity(stored.roastIntensity),
  learningLanguage: validLanguage(stored.learningLanguage),
  behavioralPatterns: isRecord(stored.behavioralPatterns)
    ? { ...fallback.behavioralPatterns, ...stored.behavioralPatterns }
    : fallback.behavioralPatterns,
  misconceptions: isRecord(stored.misconceptions)
    ? { ...fallback.misconceptions, ...stored.misconceptions }
    : fallback.misconceptions,
  aiTutor: isRecord(stored.aiTutor)
    ? { ...fallback.aiTutor, ...stored.aiTutor }
    : fallback.aiTutor,
}) as UserProgress;

const DEFAULT_PROGRESS_FALLBACK: UserProgress = {
  xp: 0,
  streak: 1,
  level: 1,
  currentLessonId: 'l1_1_print',
  currentChallengeIndex: 0,
  completedLessons: [],
  masteredTopics: [],
  topicAccuracy: {},
  topicRetention: {},
  topicIndependentSolve: {},
  hintDependency: {},
  confidenceIndicators: {},
  topicMastery: {},
  roastIntensity: 'APOCALYPSE',
  learningLanguage: 'HINDI',
  diagnosticCompleted: false,
  incidents: [],
  achievements: [],
  behavioralPatterns: {
    dependencyDetected: false,
    excessiveHints: false,
    repeatedMistakePatterns: [],
    independentSuccessCount: 0,
    assistedSuccessCount: 0,
    lastIndependentAttempt: '',
  },
  misconceptions: {
    tracked: [],
    lastDetected: '',
    detectionCount: 0,
  },
  lastActiveTimestamp: new Date().toISOString(),
  interviewReadiness: 0,
  aiTutor: {
    totalSessions: 0,
    totalHintsProvided: 0,
    learningStyleProfile: 'MIXED',
    commonErrorPatterns: [],
    streakStatus: 'ACTIVE',
    lastInteractionAt: new Date().toISOString(),
    proficiencyScore: 0,
    recommendedIntensity: 'APOCALYPSE',
  },
};

const loadUserProgressFromStorage = (fallback: UserProgress = DEFAULT_PROGRESS_FALLBACK): UserProgress => {
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!stored) return migrateProgress(fallback, { ...DEFAULT_PROGRESS_FALLBACK });
    const parsed = JSON.parse(stored);
    return migrateProgress(parsed, { ...DEFAULT_PROGRESS_FALLBACK, ...fallback });
  } catch {
    return migrateProgress(fallback, { ...DEFAULT_PROGRESS_FALLBACK });
  }
};

const saveUserProgressToStorage = (progress: UserProgress) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  } catch {
    // ignore storage errors
  }
};

export const loadUserProgress = loadUserProgressFromStorage;
export const saveUserProgress = saveUserProgressToStorage;

export const loadProgress = loadUserProgressFromStorage;
export const saveProgress = saveUserProgressToStorage;
