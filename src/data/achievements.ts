import type { UserProgress } from '../types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  checkUnlocked: (progress: UserProgress) => boolean;
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
    checkUnlocked: (p) => (p.behavioralPatterns?.independentSuccessCount ?? 0) >= 3,
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
    checkUnlocked: (p) => Object.values(p.topicMastery || {}).some((score) => score >= 80),
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
    checkUnlocked: (p) => (p.level ?? 1) >= 2 || (p.completedLessons.length >= 5),
  },
];

export class AchievementSystem {
  public static evaluateAchievements(progress: UserProgress): { updated: boolean; unlockedIds: string[] } {
    const currentUnlocked = new Set((progress.achievements || []).map((a: any) => (typeof a === 'string' ? a : a.id)));
    const newUnlocked: string[] = [];

    for (const ach of ACHIEVEMENTS) {
      if (!currentUnlocked.has(ach.id) && ach.checkUnlocked(progress)) {
        currentUnlocked.add(ach.id);
        newUnlocked.push(ach.id);
      }
    }

    return {
      updated: newUnlocked.length > 0,
      unlockedIds: Array.from(currentUnlocked),
    };
  }
}
