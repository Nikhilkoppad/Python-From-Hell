import type {
  AdaptiveDecision,
  ChallengeType,
  LearningProfile,
  Skill,
} from "../types/learning";

/**
 * AdaptiveLearningEngine
 *
 * Decides what the learner should experience next.
 *
 * The important difference from the old system:
 *
 * PASS != automatically move forward.
 *
 * The engine considers:
 * - accuracy
 * - independent solving
 * - hint dependency
 * - repeated errors
 * - challenge variety
 * - mastery
 * - recent failures
 * - difficulty
 *
 * JARVIS uses this decision to control the learning experience.
 */
export class AdaptiveLearningEngine {
  /**
   * Decide what should happen after the learner finishes a challenge.
   */
  public static decideNextAction(
    profile: LearningProfile,
    skill: Skill,
    passed: boolean,
    challengeType: ChallengeType,
    difficulty: number,
    hintsUsedThisAttempt: number,
    errorType?: string
  ): AdaptiveDecision {
    const evidence = skill.evidence;

    /*
     * ---------------------------------------------------------
     * FAILURE ANALYSIS
     * ---------------------------------------------------------
     */

    if (!passed) {
      const recentSameErrors = this.countRecentSameErrors(
        evidence.recentErrors,
        errorType
      );

      // Repeatedly making the same mistake means another identical
      // challenge is probably useless.
      if (recentSameErrors >= 2) {
        return {
          action: "MICRO_LESSON",
          reason:
            "You are repeating the same mistake. Stop throwing new problems at the learner and reteach the missing concept.",
          skillId: skill.id,
          recommendedDifficulty: Math.max(1, difficulty - 1),
          removeHints: false,
        };
      }

      // Three or more failures on the skill means the learner
      // needs a debugging/diagnostic challenge.
      if (evidence.failures >= 3) {
        return {
          action: "DEBUG_CHALLENGE",
          reason:
            "Repeated failures detected. Switch from building code to diagnosing broken code.",
          skillId: skill.id,
          recommendedDifficulty: Math.max(1, difficulty - 1),
          removeHints: false,
        };
      }

      // If the learner is failing despite using hints, simplify.
      if (hintsUsedThisAttempt > 0) {
        return {
          action: "EASIER_CHALLENGE",
          reason:
            "The learner needed assistance and still failed. Reduce complexity before increasing difficulty.",
          skillId: skill.id,
          recommendedDifficulty: Math.max(1, difficulty - 1),
          removeHints: false,
        };
      }

      // First/early failure.
      return {
        action: "TEACH_AGAIN",
        reason:
          "First failure detected. Explain the underlying mistake before giving another coding task.",
        skillId: skill.id,
        recommendedDifficulty: Math.max(1, difficulty),
        removeHints: false,
      };
    }

    /*
     * ---------------------------------------------------------
     * SUCCESS ANALYSIS
     * ---------------------------------------------------------
     */

    const accuracy = this.calculateAccuracy(evidence);
    const independence = this.calculateIndependence(evidence);

    /*
     * Passing with heavy assistance does NOT mean mastery.
     */
    if (hintsUsedThisAttempt >= 2) {
      return {
        action: "INDEPENDENT_CHALLENGE",
        reason:
          "The learner succeeded with significant assistance. Require an independent proof before calling this skill mastered.",
        skillId: skill.id,
        recommendedDifficulty: Math.max(1, difficulty),
        removeHints: true,
      };
    }

    /*
     * ---------------------------------------------------------
     * CHALLENGE VARIETY
     * ---------------------------------------------------------
     *
     * If the learner only succeeds at BUILD challenges,
     * we test whether they actually understand the concept.
     */

    if (challengeType === "BUILD" && evidence.predictSuccesses === 0) {
      return {
        action: "CONTINUE",
        reason:
          "Build challenge passed. Test mental execution next with a prediction challenge.",
        skillId: skill.id,
        recommendedDifficulty: difficulty,
        removeHints: false,
      };
    }

    if (
      challengeType === "PREDICT" &&
      evidence.debugSuccesses === 0 &&
      evidence.attempts >= 2
    ) {
      return {
        action: "DEBUG_CHALLENGE",
        reason:
          "The learner can predict the code. Now test whether they can diagnose broken code.",
        skillId: skill.id,
        recommendedDifficulty: difficulty,
        removeHints: false,
      };
    }

    /*
     * ---------------------------------------------------------
     * MASTERY GATE
     * ---------------------------------------------------------
     *
     * Mastery requires:
     * - enough attempts
     * - strong accuracy
     * - independent solving
     * - more than one type of evidence
     */

    const evidenceTypes = this.countEvidenceTypes(evidence);

    if (
      evidence.attempts >= 4 &&
      accuracy >= 0.8 &&
      independence >= 0.75 &&
      evidenceTypes >= 2
    ) {
      return {
        action: "BOSS_CHALLENGE",
        reason:
          "The learner has demonstrated consistent, mostly independent performance across multiple challenge types. Time to prove it in a boss challenge.",
        skillId: skill.id,
        recommendedDifficulty: Math.min(5, difficulty + 1),
        removeHints: true,
      };
    }

    /*
     * Strong performance but not enough evidence yet.
     */
    if (accuracy >= 0.75 && independence >= 0.6) {
      return {
        action: "HARDER_CHALLENGE",
        reason:
          "Performance is strong. Increase difficulty to test whether the skill transfers to a harder problem.",
        skillId: skill.id,
        recommendedDifficulty: Math.min(5, difficulty + 1),
        removeHints: false,
      };
    }

    /*
     * ---------------------------------------------------------
     * DEPENDENCY DETECTION
     * ---------------------------------------------------------
     */

    if (
      evidence.hintsUsed >= 3 &&
      evidence.assistedSuccesses > evidence.independentSuccesses
    ) {
      return {
        action: "INDEPENDENT_CHALLENGE",
        reason:
          "Hint dependency is increasing. Remove scaffolding and require the learner to solve independently.",
        skillId: skill.id,
        recommendedDifficulty: difficulty,
        removeHints: true,
      };
    }

    /*
     * Normal progression.
     */
    return {
      action: "CONTINUE",
      reason:
        "Performance is developing normally. Continue with the learning sequence.",
      skillId: skill.id,
      recommendedDifficulty: difficulty,
      removeHints: false,
    };
  }

  /**
   * Determine whether the learner is ready for a boss challenge.
   */
  public static isBossReady(
    skill: Skill,
    profile: LearningProfile
  ): boolean {
    const evidence = skill.evidence;

    const accuracy = this.calculateAccuracy(evidence);
    const independence = this.calculateIndependence(evidence);

    const evidenceTypes = this.countEvidenceTypes(evidence);

    if (!skill.unlocked) {
      return false;
    }

    if (profile.weakSkills.includes(skill.id)) {
      return false;
    }

    return (
      evidence.attempts >= 4 &&
      accuracy >= 0.8 &&
      independence >= 0.75 &&
      evidenceTypes >= 2
    );
  }

  /**
   * Determine whether a skill should receive remediation.
   */
  public static needsRemediation(skill: Skill): boolean {
    const evidence = skill.evidence;

    if (evidence.attempts < 2) {
      return false;
    }

    const accuracy = this.calculateAccuracy(evidence);

    return (
      accuracy < 0.5 ||
      evidence.failures >= 3 ||
      evidence.recentErrors.length >= 3
    );
  }

  /**
   * Determine whether the learner is becoming dependent on hints.
   */
  public static hasHintDependency(skill: Skill): boolean {
    const evidence = skill.evidence;

    if (evidence.attempts < 3) {
      return false;
    }

    if (evidence.hintsUsed >= 5) {
      return true;
    }

    return (
      evidence.assistedSuccesses > evidence.independentSuccesses * 2 &&
      evidence.assistedSuccesses >= 3
    );
  }

  /**
   * Calculate basic accuracy.
   */
  private static calculateAccuracy(
    evidence: Skill["evidence"]
  ): number {
    if (evidence.attempts === 0) {
      return 0;
    }

    return evidence.successes / evidence.attempts;
  }

  /**
   * Calculate independent success rate.
   */
  private static calculateIndependence(
    evidence: Skill["evidence"]
  ): number {
    if (evidence.successes === 0) {
      return 0;
    }

    return evidence.independentSuccesses / evidence.successes;
  }

  /**
   * Count how many different types of evidence the learner has.
   *
   * This prevents:
   *
   * "I solved four print() exercises!"
   *
   * from being treated as complete mastery.
   */
  private static countEvidenceTypes(
    evidence: Skill["evidence"]
  ): number {
    let count = 0;

    if (evidence.predictSuccesses > 0) {
      count++;
    }

    if (evidence.debugSuccesses > 0) {
      count++;
    }

    if (evidence.buildSuccesses > 0) {
      count++;
    }

    if (evidence.explainSuccesses > 0) {
      count++;
    }

    return count;
  }

  /**
   * Count repeated occurrences of the same error.
   */
  private static countRecentSameErrors(
    errors: string[],
    errorType?: string
  ): number {
    if (!errorType || errors.length === 0) {
      return 0;
    }

    return errors.filter((error) => error === errorType).length;
  }
}