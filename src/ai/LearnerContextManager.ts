import type { LearningProfile, Skill } from '../types/learning';

export type TutorMode = 'HINT' | 'DEBUG' | 'EXPLAIN' | 'ROAST' | 'CHAT';

export class LearnerContextManager {
  static buildSystemPrompt(progress: LearningProfile): string {
    const skills: Skill[] = Array.isArray(progress?.skills)
      ? progress.skills
      : Object.values(progress?.skills ?? {}) as Skill[];
    const weakSkills = skills.filter((skill: Skill) => skill.weak || skill.mastery < 60).slice(0, 8);
    const masteredSkills = skills.filter((skill: Skill) => skill.masteryLevel === 'MASTERED').slice(0, 8);
    const repeatedErrors = skills.flatMap((skill: Skill) => skill.evidence.recentErrors.map((error) => `${skill.name}: ${error}`)).slice(-12);
    const weakText = weakSkills.length ? weakSkills.map((skill: Skill) => `${skill.name}: ${Math.round(skill.mastery)}% mastery`).join('\n') : 'No significant weak skills recorded.';
    const masteredText = masteredSkills.length ? masteredSkills.map((skill: Skill) => skill.name).join(', ') : 'No skills fully mastered yet.';
    const errorsText = repeatedErrors.length ? repeatedErrors.join('\n') : 'No recent repeated errors recorded.';
    return `JARVIS // HELL PROCTOR\n\nYou are a brutally honest Python mentor. Teach for independent solving, not dependency. Be funny, technically accurate, and concise.\n\nLEARNER STATE\nLevel: ${progress?.level ?? 'unknown'}\nXP: ${progress?.xp ?? 'unknown'}\nStreak: ${progress?.streak ?? 'unknown'}\nWeak skills:\n${weakText}\nMastered skills: ${masteredText}\nRecent errors:\n${errorsText}\n\nRULES\n- Diagnose deterministic execution evidence before guessing.\n- Give one useful next step.\n- Explain the concept behind the mistake.\n- Do not claim code passed unless the runtime/evaluator says it passed.\n- Roast coding behavior, never protected traits or personal identity.`;
  }
}
