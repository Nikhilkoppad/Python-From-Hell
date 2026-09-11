export interface AchievementProgress {
  xp: number;
  streak: number;
  level: number;
  completedLessons: string[];
  topicMastery?: Record<string, number> | Record<string, unknown>;
  behavioralPatterns?: unknown;
  attemptHistory?: Array<{ challengeType?: string; passed?: boolean }>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  checkUnlocked: (progress: AchievementProgress) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: 'FIRST BLOOD',
    description: 'Survived and cleared your first Python challenge in Hell.',
    icon: '⚔️',
    checkUnlocked: (p) => p.completedLessons.length >= 1,
  },
  {
    id: 'independent_demon',
    title: 'INDEPENDENT DEMON',
    description: 'Solved 3 challenges without asking the AI for a single hint.',
    icon: '🛡️',
    checkUnlocked: (p) => {
      if (!p.behavioralPatterns || typeof p.behavioralPatterns !== 'object') return false;
      const count = (p.behavioralPatterns as { independentSuccessCount?: unknown }).independentSuccessCount;
      return Number(count ?? 0) >= 3;
    },
  },
  {
    id: 'streak_slayer',
    title: 'HELLFIRE STREAK',
    description: 'Maintained a 3-day coding streak in Hell.',
    icon: '🔥',
    checkUnlocked: (p) => p.streak >= 3,
  },
  {
    id: 'syntax_exorcist',
    title: 'SYNTAX EXORCIST',
    description: 'Achieved 80%+ mastery on Python Fundamentals.',
    icon: '⚡',
    checkUnlocked: (p) => Object.values(p.topicMastery ?? {}).some((score) => Number(score) >= 80),
  },
  {
    id: 'xp_hoarder',
    title: 'SOUL COLLECTOR',
    description: 'Amassed over 150 Hell XP from ruthless problem-solving.',
    icon: '💎',
    checkUnlocked: (p) => p.xp >= 150,
  },
  {
    id: 'boss_slayer',
    title: 'DEMON SLAYER',
    description: 'Defeated a high-stakes Level Boss in the Boss Arena.',
    icon: '👑',
    checkUnlocked: (p) => (p.attemptHistory ?? []).some((attempt) => attempt.challengeType === 'BOSS' && attempt.passed === true),
  },
];

export class AchievementSystem {
  public static evaluateAchievements(
    progress: AchievementProgress & { achievements?: unknown[] }
  ): { updated: boolean; unlockedIds: string[] } {
    const currentUnlocked = new Set(
      (progress.achievements ?? [])
        .map((achievement) =>
          typeof achievement === 'string'
            ? achievement
            : achievement && typeof achievement === 'object' && 'id' in achievement
              ? String((achievement as { id?: unknown }).id ?? '')
              : ''
        )
        .filter(Boolean)
    );

    const newUnlocked: string[] = [];
    for (const achievement of ACHIEVEMENTS) {
      if (!currentUnlocked.has(achievement.id) && achievement.checkUnlocked(progress)) {
        currentUnlocked.add(achievement.id);
        newUnlocked.push(achievement.id);
      }
    }

    return { updated: newUnlocked.length > 0, unlockedIds: Array.from(currentUnlocked) };
  }
}
