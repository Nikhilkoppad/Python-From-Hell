import type {
  MasteryLevel,
  Skill,
  SkillEvidence,
} from "../types/learning";

export class SkillMasteryEngine {
  /**
   * Create an empty skill.
   */
  public static createSkill(
    id: string,
    name: string,
    description: string,
    prerequisites: string[] = []
  ): Skill {
    return {
      id,
      name,
      description,
      prerequisites,

      mastery: 0,
      masteryLevel: "BEGINNER",

      evidence: this.createEmptyEvidence(),

      weak: false,
      unlocked: prerequisites.length === 0,
    };
  }

  /**
   * Create empty evidence for a skill.
   */
  public static createEmptyEvidence(): SkillEvidence {
    return {
      attempts: 0,
      successes: 0,
      failures: 0,

      independentSuccesses: 0,
      assistedSuccesses: 0,

      hintsUsed: 0,

      predictSuccesses: 0,
      debugSuccesses: 0,
      buildSuccesses: 0,
      explainSuccesses: 0,

      recentErrors: [],

      lastAttemptAt: undefined,
    };
  }

  /**
   * Record the result of a challenge.
   *
   * IMPORTANT:
   * hintsUsed is for THIS attempt only.
   * We never mix lifetime hint usage into one attempt.
   */
  public static recordAttempt(
    skill: Skill,
    params: {
      passed: boolean;
      challengeType:
        | "PREDICT"
        | "TRACE"
        | "FIX"
        | "DEBUG"
        | "BUILD"
        | "REFACTOR"
        | "EXPLAIN"
        | "BOSS";

      hintsUsed: number;

      errorType?: string;

      independent?: boolean;
    }
  ): Skill {
    const evidence: SkillEvidence = {
      ...skill.evidence,

      recentErrors: [...skill.evidence.recentErrors],
    };

    evidence.attempts += 1;
    evidence.lastAttemptAt = Date.now();

    evidence.hintsUsed += params.hintsUsed;

    if (params.passed) {
      evidence.successes += 1;

      if (params.independent && params.hintsUsed === 0) {
        evidence.independentSuccesses += 1;
      } else {
        evidence.assistedSuccesses += 1;
      }
    } else {
      evidence.failures += 1;

      if (params.errorType) {
        evidence.recentErrors.push(params.errorType);

        // Keep the history useful instead of allowing it to grow forever.
        if (evidence.recentErrors.length > 10) {
          evidence.recentErrors.shift();
        }
      }
    }

    switch (params.challengeType) {
      case "PREDICT":
      case "TRACE":
        if (params.passed) {
          evidence.predictSuccesses += 1;
        }
        break;

      case "DEBUG":
      case "FIX":
        if (params.passed) {
          evidence.debugSuccesses += 1;
        }
        break;

      case "BUILD":
      case "BOSS":
        if (params.passed) {
          evidence.buildSuccesses += 1;
        }
        break;

      case "EXPLAIN":
        if (params.passed) {
          evidence.explainSuccesses += 1;
        }
        break;

      case "REFACTOR":
        if (params.passed) {
          evidence.buildSuccesses += 1;
        }
        break;
    }

    const mastery = this.calculateMastery(evidence);
    const masteryLevel = this.getMasteryLevel(evidence, mastery);

    const weak =
      evidence.attempts >= 2 &&
      (mastery < 45 || evidence.failures >= 3);

    return {
      ...skill,

      evidence,

      mastery,
      masteryLevel,

      weak,

      unlocked: skill.unlocked,
    };
  }

  /**
   * Calculate mastery from actual evidence.
   *
   * Mastery is NOT simply:
   *
   *     passed = 100%
   *
   * Instead we combine:
   *
   * - accuracy
   * - independence
   * - consistency
   * - conceptual variety
   * - hint dependency
   */
  public static calculateMastery(
    evidence: SkillEvidence
  ): number {
    if (evidence.attempts === 0) {
      return 0;
    }

    const accuracy =
      evidence.successes / evidence.attempts;

    const independence =
      evidence.successes > 0
        ? evidence.independentSuccesses / evidence.successes
        : 0;

    const consistency =
      evidence.attempts >= 5
        ? this.calculateConsistency(evidence)
        : Math.min(1, evidence.attempts / 5);

    const variety =
      this.calculateChallengeVariety(evidence);

    const hintDependency =
      this.calculateHintDependency(evidence);

    /*
     * Weighting:
     *
     * Accuracy       35%
     * Independence   30%
     * Consistency    15%
     * Variety        20%
     */
    let score =
      accuracy * 35 +
      independence * 30 +
      consistency * 15 +
      variety * 20;

    /*
     * Hint dependency can reduce the final mastery.
     */
    score -= hintDependency * 15;

    return Math.round(
      Math.max(0, Math.min(100, score))
    );
  }

  /**
   * Convert numerical mastery into a meaningful state.
   */
  public static getMasteryLevel(
    evidence: SkillEvidence,
    mastery: number
  ): MasteryLevel {
    if (evidence.attempts === 0) {
      return "BEGINNER";
    }

    if (
      mastery >= 85 &&
      evidence.independentSuccesses >= 3 &&
      this.calculateChallengeVariety(evidence) >= 0.5
    ) {
      return "MASTERED";
    }

    if (mastery >= 70) {
      return "STRONG";
    }

    if (mastery >= 55) {
      return "COMPETENT";
    }

    if (mastery >= 35) {
      return "DEVELOPING";
    }

    return "BEGINNER";
  }

  /**
   * Determine whether a skill has enough evidence to advance.
   */
  public static isMastered(skill: Skill): boolean {
    return skill.masteryLevel === "MASTERED";
  }

  /**
   * Determine whether a skill is weak.
   */
  public static isWeak(skill: Skill): boolean {
    return skill.weak;
  }

  /**
   * Calculate consistency using recent attempts.
   *
   * A learner who passes once and fails five times should not
   * receive the same mastery score as someone who consistently
   * succeeds.
   */
  private static calculateConsistency(
    evidence: SkillEvidence
  ): number {
    if (evidence.attempts === 0) {
      return 0;
    }

    const recentFailures =
      evidence.recentErrors.length;

    const recentWindow =
      Math.min(5, evidence.attempts);

    const estimatedRecentSuccesses =
      Math.max(
        0,
        recentWindow - recentFailures
      );

    return Math.max(
      0,
      Math.min(
        1,
        estimatedRecentSuccesses / recentWindow
      )
    );
  }

  /**
   * Measure how many different forms of understanding
   * the learner has demonstrated.
   */
  private static calculateChallengeVariety(
    evidence: SkillEvidence
  ): number {
    let types = 0;

    if (evidence.predictSuccesses > 0) {
      types++;
    }

    if (evidence.debugSuccesses > 0) {
      types++;
    }

    if (evidence.buildSuccesses > 0) {
      types++;
    }

    if (evidence.explainSuccesses > 0) {
      types++;
    }

    /*
     * Four different evidence categories = full variety.
     */
    return Math.min(1, types / 4);
  }

  /**
   * Measure hint dependency.
   */
  private static calculateHintDependency(
    evidence: SkillEvidence
  ): number {
    if (evidence.attempts === 0) {
      return 0;
    }

    const averageHints =
      evidence.hintsUsed / evidence.attempts;

    const assistedRatio =
      evidence.successes > 0
        ? evidence.assistedSuccesses /
          evidence.successes
        : 0;

    const hintPressure =
      Math.min(1, averageHints / 3);

    const assistancePressure =
      Math.min(1, assistedRatio);

    return (
      hintPressure * 0.5 +
      assistancePressure * 0.5
    );
  }

  /**
   * Get a readable mastery label for the UI.
   */
  public static getMasteryLabel(
    skill: Skill
  ): string {
    switch (skill.masteryLevel) {
      case "MASTERED":
        return "MASTERED";

      case "STRONG":
        return "STRONG";

      case "COMPETENT":
        return "COMPETENT";

      case "DEVELOPING":
        return "DEVELOPING";

      case "BEGINNER":
        return "BEGINNER";

      case "LOCKED":
        return "LOCKED";

      default:
        return "UNKNOWN";
    }
  }

  /**
   * Return a short diagnostic message for JARVIS.
   */
  public static getDiagnostic(
    skill: Skill
  ): string {
    const evidence = skill.evidence;

    if (evidence.attempts === 0) {
      return `${skill.name}: no evidence yet.`;
    }

    if (skill.weak) {
      return `${skill.name}: weak. More guided practice required.`;
    }

    if (
      evidence.hintsUsed >= 3 &&
      evidence.assistedSuccesses >
        evidence.independentSuccesses
    ) {
      return `${skill.name}: performance acceptable, but hint dependency detected.`;
    }

    if (skill.masteryLevel === "MASTERED") {
      return `${skill.name}: independently demonstrated across multiple challenge types.`;
    }

    if (skill.masteryLevel === "STRONG") {
      return `${skill.name}: strong performance. Increase difficulty.`;
    }

    return `${skill.name}: still developing. Continue varied practice.`;
  }
}