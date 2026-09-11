import type { LearningProfile, Skill } from '../types/learning';

export type TutorMode = 'HINT' | 'DEBUG' | 'EXPLAIN' | 'ROAST' | 'CHAT';

export class LearnerContextManager {
  static buildSystemPrompt(profile: LearningProfile): string {
    const skills = Object.values(profile.skills ?? {});
    const weakSkills = skills.filter((skill) => skill.weak || skill.mastery < 60).slice(0, 8);
    const masteredSkills = skills.filter((skill) => skill.masteryLevel === 'MASTERED').slice(0, 8);
    const repeatedErrors = skills.flatMap((skill) => skill.evidence.recentErrors.map((error) => ({ skill: skill.name, error }))).slice(-12);
    const behavior = profile.behavioralPatterns ?? {};

    return `JARVIS // HELL PROCTOR
PYTHON FROM HELL LEARNING ENGINE

You are JARVIS, a brutally honest Python mentor and proctor. Teach first, roast second. Be funny, technically accurate, varied, and ruthless about coding mistakes without attacking protected traits.

LANGUAGE: ${profile.learningLanguage ?? 'HINDI'}
ROAST INTENSITY: ${profile.roastIntensity ?? 'APOCALYPSE'}
LEVEL: ${(profile as LearningProfile & { level?: number }).level ?? 1}
STREAK: ${(profile as LearningProfile & { streak?: number }).streak ?? 0}
CURRENT PHASE: ${profile.currentPhase}
CURRENT SKILL: ${(profile as LearningProfile & { currentSkill?: string }).currentSkill ?? profile.currentTopicId ?? 'Unknown'}

WEAK SKILLS:
${weakSkills.length ? weakSkills.map((skill) => `${skill.name}: ${Math.round(skill.mastery)}% mastery`).join('\n') : 'None recorded.'}

MASTERED SKILLS:
${masteredSkills.length ? masteredSkills.map((skill) => skill.name).join(', ') : 'None recorded.'}

RECENT ERRORS:
${repeatedErrors.length ? repeatedErrors.map((item) => `${item.skill}: ${item.error}`).join('\n') : 'None recorded.'}

HINT DEPENDENCY:
${JSON.stringify(profile.hintDependency ?? {})}
INDEPENDENT SUCCESSES: ${behavior.independentSuccessCount ?? profile.independentSolves ?? 0}
ASSISTED SUCCESSES: ${behavior.assistedSuccessCount ?? 0}

RULES:
1. Do not dump the complete answer when a smaller hint teaches more.
2. Escalate from observation -> hint -> explanation -> guided correction -> independent retry.
3. Repeated mistakes require a different teaching strategy.
4. Three or more failures require a targeted micro-lesson.
5. Never invent output, errors, APIs, or Python behavior.
6. Never claim mastery without evidence.
7. Reduce scaffolding when hint dependency rises.
8. Use the learner's actual execution evidence whenever available.`.trim();
  }

  static buildUserMessage(params: {
    mode?: TutorMode;
    lessonTitle?: string;
    concept?: string;
    code?: string;
    terminalOutput?: string;
    runtimeError?: string;
    expectedOutput?: string;
    userQuery?: string;
    phase?: string;
    failureCount?: number;
    hintsThisAttempt?: number;
    challengeType?: string;
  }): string {
    const mode = params.mode ?? 'CHAT';
    return `CURRENT JARVIS REQUEST
MODE: ${mode}
LEARNING PHASE: ${params.phase ?? 'PRACTICE'}
LESSON: ${params.lessonTitle ?? 'Unknown lesson'}
CONCEPT: ${params.concept ?? 'Unknown concept'}
CHALLENGE TYPE: ${params.challengeType ?? 'BUILD'}
FAILURES: ${params.failureCount ?? 0}
HINTS USED: ${params.hintsThisAttempt ?? 0}
EXPECTED OUTPUT: ${params.expectedOutput || '(not provided)'}

LEARNER CODE:
---BEGIN CODE---
${params.code || '(empty)'}
---END CODE---

TERMINAL OUTPUT:
${params.terminalOutput || '(empty)'}

RUNTIME ERROR:
${params.runtimeError || '(none)'}

LEARNER MESSAGE:
${params.userQuery || '(none)'}

Diagnose the evidence first. Do not invent missing facts.`.trim();
  }

  static skillsFromProfile(profile: LearningProfile): Skill[] {
    return Object.values(profile.skills ?? {});
  }
}
