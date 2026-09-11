import type {
  AIState,
  ChallengeType,
  LearningPhase,
  LearningProfile,
  LearningSession,
  Skill,
} from "../types/learning";

export interface ProctorObservation {
  phase: LearningPhase;

  challengeType?: ChallengeType;

  passed?: boolean;

  errorType?: string;

  runtimeError?: string;

  hintsUsedThisAttempt: number;

  attemptNumber: number;

  failuresThisAttempt: number;

  independent: boolean;

  skill: Skill;

  profile: LearningProfile;
}

export interface ProctorResponse {
  state: AIState;

  message: string;

  shouldTeach: boolean;

  shouldRoast: boolean;

  shouldOfferHint: boolean;

  shouldForceDebugging: boolean;

  shouldRemoveScaffolding: boolean;

  shouldCelebrate: boolean;
}

/**
 * JARVIS PROCTOR
 *
 * This is the behavioral brain sitting between the learner
 * and the AI teacher.
 *
 * JARVIS does NOT simply answer every question.
 *
 * It observes:
 *
 * - what the learner is doing
 * - how many times they failed
 * - whether they used hints
 * - whether the mistake is repeated
 * - whether they solved independently
 * - whether they are ready for harder work
 *
 * Then it decides how JARVIS should behave.
 */
export class JarvisProctorEngine {
  /**
   * Create a fresh learning session.
   */
  public static createSession(
    lessonId: string,
    skillId: string,
    phase: LearningPhase = "TEACH",
    challengeId?: string
  ): LearningSession {
    return {
      sessionId: this.createSessionId(),

      startedAt: Date.now(),

      lessonId,
      skillId,

      phase,

      challengeId,

      attemptNumber: 0,

      hintsThisAttempt: 0,

      failuresThisAttempt: 0,

      previousErrors: [],

      startedWithoutHint: true,

      completed: false,
    };
  }

  /**
   * Start a new challenge attempt.
   *
   * This is deliberately separate from lifetime statistics.
   */
  public static startAttempt(
    session: LearningSession
  ): LearningSession {
    return {
      ...session,

      attemptNumber: session.attemptNumber + 1,

      hintsThisAttempt: 0,

      failuresThisAttempt: 0,

      startedWithoutHint: true,
    };
  }

  /**
   * Register that the learner requested a hint.
   */
  public static registerHint(
    session: LearningSession
  ): LearningSession {
    return {
      ...session,

      hintsThisAttempt:
        session.hintsThisAttempt + 1,

      startedWithoutHint: false,
    };
  }

  /**
   * Register a failed attempt.
   */
  public static registerFailure(
    session: LearningSession,
    errorType?: string
  ): LearningSession {
    const previousErrors = [
      ...session.previousErrors,
    ];

    if (errorType) {
      previousErrors.push(errorType);
    }

    return {
      ...session,

      failuresThisAttempt:
        session.failuresThisAttempt + 1,

      previousErrors: previousErrors.slice(-10),
    };
  }

  /**
   * Register successful completion.
   */
  public static completeSession(
    session: LearningSession
  ): LearningSession {
    return {
      ...session,

      phase: "COMPLETE",

      completed: true,
    };
  }

  /**
   * Decide how JARVIS should behave after an observation.
   */
  public static observe(
    observation: ProctorObservation
  ): ProctorResponse {
    const {
      passed,
      errorType,
      runtimeError,
      hintsUsedThisAttempt,
      failuresThisAttempt,
      independent,
      skill,
      profile,
    } = observation;

    /*
     * ---------------------------------------------------------
     * BOSS MODE
     * ---------------------------------------------------------
     */

    if (observation.phase === "MASTERY") {
      return {
        state: "boss_mode",

        message:
          "Enough training. No hints. No hand-holding. Show me whether you actually learned this shit.",

        shouldTeach: false,

        shouldRoast: true,

        shouldOfferHint: false,

        shouldForceDebugging: false,

        shouldRemoveScaffolding: true,

        shouldCelebrate: false,
      };
    }

    /*
     * ---------------------------------------------------------
     * SUCCESS
     * ---------------------------------------------------------
     */

    if (passed) {
      /*
       * Independent success is much more valuable.
       */
      if (
        independent &&
        hintsUsedThisAttempt === 0
      ) {
        return {
          state: "celebrating",

          message:
            "Well fucking done. You solved it without me dragging your brain across the finish line.",

          shouldTeach: false,

          shouldRoast: false,

          shouldOfferHint: false,

          shouldForceDebugging: false,

          shouldRemoveScaffolding:
            skill.mastery >= 70,

          shouldCelebrate: true,
        };
      }

      /*
       * Successful but assisted.
       */
      if (hintsUsedThisAttempt > 0) {
        return {
          state: "warning",

          message:
            "You passed. Cute. But you needed help, so I'm not calling this mastery yet.",

          shouldTeach: false,

          shouldRoast: true,

          shouldOfferHint: false,

          shouldForceDebugging: false,

          shouldRemoveScaffolding: false,

          shouldCelebrate: false,
        };
      }

      /*
       * Normal success.
       */
      return {
        state: "celebrating",

        message:
          "Clean execution. Don't celebrate too early — the next problem gets uglier.",

        shouldTeach: false,

        shouldRoast: false,

        shouldOfferHint: false,

        shouldForceDebugging: false,

        shouldRemoveScaffolding:
          skill.mastery >= 70,

        shouldCelebrate: true,
      };
    }

    /*
     * ---------------------------------------------------------
     * REPEATED FAILURE
     * ---------------------------------------------------------
     */

    if (failuresThisAttempt >= 3) {
      return {
        state: "angry",

        message:
          "Three failures on the same problem. Stop smashing Run like it's a fucking slot machine. We're debugging the actual misconception now.",

        shouldTeach: true,

        shouldRoast: true,

        shouldOfferHint: false,

        shouldForceDebugging: true,

        shouldRemoveScaffolding: false,

        shouldCelebrate: false,
      };
    }

    /*
     * ---------------------------------------------------------
     * REPEATED ERROR TYPE
     * ---------------------------------------------------------
     */

    if (
      errorType &&
      this.hasRepeatedError(
        profile.recentErrors,
        errorType
      )
    ) {
      return {
        state: "mocking",

        message:
          "Oh look. The same mistake again. Apparently Python wasn't the problem — pattern recognition was.",

        shouldTeach: true,

        shouldRoast: true,

        shouldOfferHint: true,

        shouldForceDebugging: true,

        shouldRemoveScaffolding: false,

        shouldCelebrate: false,
      };
    }

    /*
     * ---------------------------------------------------------
     * RUNTIME ERROR
     * ---------------------------------------------------------
     */

    if (runtimeError) {
      return {
        state: "thinking",

        message:
          "The interpreter just told us exactly where you screwed up. Let's read the traceback instead of panicking.",

        shouldTeach: true,

        shouldRoast: false,

        shouldOfferHint: true,

        shouldForceDebugging: true,

        shouldRemoveScaffolding: false,

        shouldCelebrate: false,
      };
    }

    /*
     * ---------------------------------------------------------
     * HINT DEPENDENCY
     * ---------------------------------------------------------
     */

    if (hintsUsedThisAttempt >= 2) {
      return {
        state: "warning",

        message:
          "That's enough rescue ropes. The next attempt is going to make you think before I help.",

        shouldTeach: false,

        shouldRoast: true,

        shouldOfferHint: false,

        shouldForceDebugging: false,

        shouldRemoveScaffolding: true,

        shouldCelebrate: false,
      };
    }

    /*
     * ---------------------------------------------------------
     * FIRST FAILURE
     * ---------------------------------------------------------
     */

    if (!passed) {
      return {
        state: "mocking",

        message:
          "Interesting approach. Unfortunately Python has rejected your application for employment.",

        shouldTeach: true,

        shouldRoast: true,

        shouldOfferHint: true,

        shouldForceDebugging: false,

        shouldRemoveScaffolding: false,

        shouldCelebrate: false,
      };
    }

    /*
     * ---------------------------------------------------------
     * DEFAULT
     * ---------------------------------------------------------
     */

    return {
      state: "idle",

      message:
        "I'm watching. Write the code. Then we'll see what your brain actually understood.",

      shouldTeach: false,

      shouldRoast: false,

      shouldOfferHint: true,

      shouldForceDebugging: false,

      shouldRemoveScaffolding: false,

      shouldCelebrate: false,
    };
  }

  /**
   * Determine whether the same error has appeared recently.
   */
  private static hasRepeatedError(
    errors: string[],
    currentError: string
  ): boolean {
    if (errors.length === 0) {
      return false;
    }

    return errors.filter(
      (error) => error === currentError
    ).length >= 2;
  }

  /**
   * Generate a unique session ID.
   */
  private static createSessionId(): string {
    return `hell-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  }
}