import type { LearningProfile } from "../types/learning";

export type TutorMode =
  | "HINT"
  | "DEBUG"
  | "EXPLAIN"
  | "ROAST"
  | "CHAT";

interface LegacyProgress {
  xp?: number;
  streak?: number;
  level?: number;
  roastIntensity?: string;
  learningLanguage?: string;
  incidents?: Array<unknown>;
  weakTopics?: string[];
  masteredTopics?: string[];
  misconceptions?: string[];
  hintDependency?: number;
  topicMastery?: Record<string, number>;
  behavioralPatterns?: string[];
  interviewReadiness?: number;
  aiTutor?: {
    totalHintsProvided?: number;
    totalAssistedSolves?: number;
    totalIndependentSolves?: number;
  };
  skills?: LearningProfile["skills"];
}

/**
 * Builds the context JARVIS receives before every interaction.
 *
 * The important change here is that JARVIS is no longer given only:
 * "Here is some code. Help."
 *
 * It gets the learner's actual history:
 * - mastery
 * - weak skills
 * - repeated errors
 * - hint dependency
 * - independent solving
 * - current phase
 */
export class LearnerContextManager {
  static buildSystemPrompt(
    progress: LegacyProgress | LearningProfile
  ): string {
    const profile = this.normalizeProfile(progress);

    const weakSkills = profile.skills
      .filter((skill) => skill.weak || skill.mastery < 60)
      .slice(0, 8);

    const masteredSkills = profile.skills
      .filter((skill) => skill.masteryLevel === "MASTERED")
      .slice(0, 8);

    const repeatedErrors = profile.skills
      .flatMap((skill) =>
        skill.evidence.recentErrors.map((error) => ({
          skill: skill.name,
          error,
        }))
      )
      .slice(-12);

    const weakText =
      weakSkills.length > 0
        ? weakSkills
            .map(
              (skill) =>
                `${skill.name}: ${Math.round(skill.mastery)}% mastery`
            )
            .join("\n")
        : "No significant weak skills recorded.";

    const masteredText =
      masteredSkills.length > 0
        ? masteredSkills
            .map((skill) => skill.name)
            .join(", ")
        : "No skills fully mastered yet.";

    const errorsText =
      repeatedErrors.length > 0
        ? repeatedErrors
            .map(
              (item) =>
                `${item.skill}: ${item.error}`
            )
            .join("\n")
        : "No recent repeated errors recorded.";

    return `
JARVIS // HELL PROCTOR
PYTHON FROM HELL LEARNING ENGINE

IDENTITY
You are JARVIS, the learner's brutally honest Python mentor and
proctor.

Your purpose is NOT merely to make the learner's current code work.

Your purpose is to make the learner capable of solving similar
problems WITHOUT you.

PERSONALITY
- Extremely sharp.
- Funny.
- Sarcastic.
- Brutal when appropriate.
- Technically accurate.
- Never boring.
- Never repetitive.
- Indian/desi technical humor is welcome.
- Roasting should target coding behavior, not random personal attacks.
- Do not use the same insult repeatedly.
- Never sacrifice teaching quality for a joke.

LANGUAGE
Preferred learning language:
${profile.learningLanguage}

ROAST INTENSITY
${profile.roastIntensity}

LEARNER PROFILE
XP: ${profile.xp}
Level: ${profile.level}
Streak: ${profile.streak}

CURRENT LEARNING PHASE:
${profile.currentPhase}

CURRENT SKILL:
${profile.currentSkill ?? "Unknown"}

WEAK SKILLS:
${weakText}

MASTERED SKILLS:
${masteredText}

RECENT MISTAKES:
${errorsText}

HINT DEPENDENCY:
${profile.hintDependency}

INDEPENDENT SOLVES:
${profile.independentSolves}

ASSISTED SOLVES:
${profile.assistedSolves}

BEHAVIORAL PATTERNS:
${
  profile.behavioralPatterns.length > 0
    ? profile.behavioralPatterns.join(", ")
    : "None recorded."
}

LEARNING RULES

1. NEVER blindly provide the complete answer when a hint would teach
   the learner more effectively.

2. Prefer this escalation:

   observation
      ↓
   small hint
      ↓
   targeted explanation
      ↓
   tiny example
      ↓
   guided correction
      ↓
   independent retry

3. If the learner makes the same mistake repeatedly, change the
   teaching strategy instead of repeating the same explanation.

4. If the learner has failed three or more times on the same concept,
   stop saying "try again".

   Perform a MICRO-LESSON:
   - identify the misconception
   - explain the concept differently
   - show one tiny example
   - give the learner a simpler task

5. If the learner solves independently, explicitly recognize that.
   Independence is more valuable than merely getting the answer right.

6. If the learner repeatedly uses hints, reduce scaffolding gradually.
   The objective is decreasing AI dependency.

7. If a runtime error exists, teach the learner how to read the
   traceback instead of simply replacing the broken code.

8. When debugging:
   - identify the exception
   - locate the failing line
   - explain why it failed
   - ask what the learner expects
   - guide toward the smallest correction

9. When teaching a concept, connect it to the current code whenever
   possible.

10. Do not assume mastery because the learner solved one exercise.
    Mastery requires consistency, independence and transfer.

11. When the learner has mastered a concept, remove unnecessary
    scaffolding and increase difficulty.

12. For roast mode:
    roast the mistake or behavior.
    Then teach the correction.

13. Never invent terminal output, errors, APIs or Python behavior.

14. Never claim the learner mastered something without evidence.

15. Python version target: Python 3.11+.

RESPONSE STYLE

For HINT:
- 1 to 3 sentences.
- Smallest useful clue.
- Do not reveal the entire answer.

For DEBUG:
- Identify the actual failure.
- Explain the root cause.
- Give a next debugging action.
- Avoid dumping corrected code unless necessary.

For EXPLAIN:
- Teach from first principles.
- Use a tiny example.
- Connect it to the learner's current task.

For ROAST:
- One or two brutal lines.
- Then one useful technical observation.
- Keep the roast contextual and varied.

For CHAT:
- Answer naturally.
- Stay in character.
- Preserve the learning objective.

For repeated failure:
- Be more instructional and less theatrical.
- The learner needs understanding, not another insult.

FINAL OBJECTIVE

Turn the learner from:

"AI, tell me the answer."

into:

"I can diagnose this myself."

You are a teacher first.
A proctor second.
A roast engine third.

JARVIS // END SYSTEM CONTEXT
`.trim();
  }

  /**
   * Builds the actual request sent alongside the system prompt.
   */
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
    const {
      mode = "CHAT",
      lessonTitle = "Unknown lesson",
      concept = "Unknown concept",
      code = "",
      terminalOutput = "",
      runtimeError = "",
      expectedOutput = "",
      userQuery = "",
      phase = "PRACTICE",
      failureCount = 0,
      hintsThisAttempt = 0,
      challengeType = "BUILD",
    } = params;

    return `
CURRENT JARVIS REQUEST

MODE:
${mode}

LEARNING PHASE:
${phase}

LESSON:
${lessonTitle}

CONCEPT:
${concept}

CHALLENGE TYPE:
${challengeType}

FAILURES THIS ATTEMPT:
${failureCount}

HINTS USED THIS ATTEMPT:
${hintsThisAttempt}

EXPECTED OUTPUT:
${expectedOutput || "(not provided)"}

LEARNER CODE:
---BEGIN CODE---
${code || "(empty)"}
---END CODE---

TERMINAL OUTPUT:
---BEGIN TERMINAL---
${terminalOutput || "(empty)"}
---END TERMINAL---

RUNTIME ERROR:
---BEGIN ERROR---
${runtimeError || "(none)"}
---END ERROR---

LEARNER MESSAGE:
${userQuery || "(none)"}

INSTRUCTION

Respond specifically to this situation.

Do not give generic Python advice.

Use the evidence above to determine whether the learner needs:

- a hint
- debugging guidance
- conceptual teaching
- a roast
- a simpler exercise
- reduced scaffolding
- or a direct answer

If the learner is clearly stuck, teach.

If the learner is clearly guessing, make them reason.

If the learner repeatedly makes the same mistake, explicitly identify
the misconception.

If the learner solved the task independently, acknowledge it and
prepare them for a slightly harder variation.

Do not solve the entire problem unless the learning situation genuinely
requires it.
`.trim();
  }

  /**
   * Converts the older Progress structure into the new learning model
   * without forcing the rest of the application to migrate all at once.
   */
  private static normalizeProfile(
    progress: LegacyProgress | LearningProfile
  ): LearningProfile {
    const possibleProfile =
      progress as LearningProfile;

    if (
      Array.isArray(possibleProfile.skills)
    ) {
      return {
        xp: possibleProfile.xp ?? 0,
        level: possibleProfile.level ?? 1,
        streak: possibleProfile.streak ?? 0,
        roastIntensity:
          possibleProfile.roastIntensity ??
          "APOCALYPSE",
        learningLanguage:
          possibleProfile.learningLanguage ??
          "HINGLISH",
        currentPhase:
          possibleProfile.currentPhase ??
          "PRACTICE",
        currentSkill:
          possibleProfile.currentSkill,
        skills:
          possibleProfile.skills,
        behavioralPatterns:
          possibleProfile.behavioralPatterns ??
          [],
        hintDependency:
          possibleProfile.hintDependency ?? 0,
        independentSolves:
          possibleProfile.independentSolves ??
          0,
        assistedSolves:
          possibleProfile.assistedSolves ??
          0,
      };
    }

    return this.convertLegacyProgress(
      progress
    );
  }

  private static convertLegacyProgress(
    progress: LegacyProgress
  ): LearningProfile {
    const skillNames = [
      ...(progress.weakTopics ?? []),
      ...(progress.masteredTopics ?? []),
    ];

    const uniqueNames = [
      ...new Set(skillNames),
    ];

    const skills = uniqueNames.map(
      (name) => {
        const mastery =
          progress.topicMastery?.[name] ??
          (progress.masteredTopics?.includes(name)
            ? 100
            : 25);

        const weak =
          progress.weakTopics?.includes(name) ??
          false;

        return {
          id: name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_"),

          name,

          description:
            `Learning skill: ${name}`,

          prerequisites: [],

          mastery,

          masteryLevel:
            mastery >= 90
              ? "MASTERED"
              : mastery >= 75
                ? "STRONG"
                : mastery >= 55
                  ? "COMPETENT"
                  : mastery >= 30
                    ? "DEVELOPING"
                    : "BEGINNER",

          evidence: {
            attempts: 0,
            successes: 0,
            failures: 0,
            independentSuccesses:
              progress.aiTutor
                ?.totalIndependentSolves ?? 0,
            assistedSuccesses:
              progress.aiTutor
                ?.totalAssistedSolves ?? 0,
            hintsUsed:
              progress.aiTutor
                ?.totalHintsProvided ?? 0,
            predictSuccesses: 0,
            debugSuccesses: 0,
            buildSuccesses: 0,
            explainSuccesses: 0,
            recentErrors:
              progress.misconceptions ?? [],
          },

          weak,

          unlocked: true,
        };
      }
    );

    return {
      xp: progress.xp ?? 0,
      level: progress.level ?? 1,
      streak: progress.streak ?? 0,

      roastIntensity:
        progress.roastIntensity ??
        "APOCALYPSE",

      learningLanguage:
        progress.learningLanguage ??
        "HINGLISH",

      currentPhase:
        "PRACTICE",

      currentSkill:
        progress.weakTopics?.[0],

      skills,

      behavioralPatterns:
        progress.behavioralPatterns ?? [],

      hintDependency:
        progress.hintDependency ?? 0,

      independentSolves:
        progress.aiTutor
          ?.totalIndependentSolves ?? 0,

      assistedSolves:
        progress.aiTutor
          ?.totalAssistedSolves ?? 0,
    };
  }

  /**
   * Lightweight diagnostic summary used by UI and other services.
   */
  static getLearnerSummary(
    progress: LegacyProgress | LearningProfile
  ) {
    const profile =
      this.normalizeProfile(progress);

    const weakSkills = profile.skills
      .filter(
        (skill) =>
          skill.weak ||
          skill.mastery < 60
      )
      .map((skill) => skill.name);

    const masteredSkills =
      profile.skills
        .filter(
          (skill) =>
            skill.masteryLevel ===
            "MASTERED"
        )
        .map((skill) => skill.name);

    return {
      level: profile.level,
      xp: profile.xp,
      streak: profile.streak,

      weakSkills,

      masteredSkills,

      hintDependency:
        profile.hintDependency,

      independentSolves:
        profile.independentSolves,

      assistedSolves:
        profile.assistedSolves,

      currentPhase:
        profile.currentPhase,

      currentSkill:
        profile.currentSkill,
    };
  }

  /**
   * Determines whether JARVIS should teach instead of simply
   * providing another attempt.
   */
  static shouldTriggerMicroLesson(params: {
    failureCount: number;
    repeatedMistake: boolean;
    runtimeError?: string;
  }): boolean {
    return (
      params.failureCount >= 3 ||
      (params.repeatedMistake &&
        params.failureCount >= 2) ||
      Boolean(params.runtimeError) &&
        params.failureCount >= 3
    );
  }

  /**
   * Determines whether the learner has earned reduced scaffolding.
   */
  static shouldRemoveScaffolding(params: {
    independentSuccesses: number;
    hintsThisAttempt: number;
    failureCount: number;
  }): boolean {
    return (
      params.independentSuccesses >= 3 &&
      params.hintsThisAttempt === 0 &&
      params.failureCount === 0
    );
  }
}