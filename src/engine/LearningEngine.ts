import type {
  LearningProfile,
  MasteryLevel,
  ChallengeEvaluation,
  AdaptiveDecision,
  LearningPhase,
} from '../types/learning';

export interface AttemptRecord {
  challengeId: string;
  lessonId: string;
  topicId: string;
  passed: boolean;
  hintsUsed: number;
  independent: boolean;
  runtimeError?: string;
  errorType?: string;
  code?: string;
  output?: string;
  timestamp: number;
}

export interface LearningEngineInput {
  profile: LearningProfile;
  challengeId: string;
  lessonId: string;
  topicId: string;
  passed: boolean;
  hintsUsed: number;
  runtimeError?: string;
  errorType?: string;
  code?: string;
  output?: string;
}

export interface LearningEngineResult {
  profile: LearningProfile;
  evaluation: ChallengeEvaluation;
  decision: AdaptiveDecision;
  attempt: AttemptRecord;
}

const MAX_RECENT_ATTEMPTS = 40;
const MAX_RECENT_MISTAKES = 20;

export class LearningEngine {
  /**
   * Record one challenge attempt and immediately update the learner model.
   *
   * The important distinction here is:
   *
   *   PASS != MASTERED
   *
   * A learner can pass a challenge while still depending heavily on hints.
   * Mastery therefore comes from repeated evidence across accuracy,
   * independence, consistency and challenge variety.
   */
  static recordAttempt(input: LearningEngineInput): LearningEngineResult {
    const now = Date.now();

    const independent = input.passed && input.hintsUsed === 0;

    const attempt: AttemptRecord = {
      challengeId: input.challengeId,
      lessonId: input.lessonId,
      topicId: input.topicId,
      passed: input.passed,
      hintsUsed: input.hintsUsed,
      independent,
      runtimeError: input.runtimeError,
      errorType: input.errorType,
      code: input.code,
      output: input.output,
      timestamp: now,
    };

    const previousAttempts = Array.isArray(input.profile.attemptHistory)
      ? input.profile.attemptHistory
      : [];

    const attempts = [...previousAttempts, attempt].slice(
      -MAX_RECENT_ATTEMPTS
    );

    const topicAttempts = attempts.filter(
      (item) => item.topicId === input.topicId
    );

    const evaluation = this.evaluateTopic(topicAttempts);

    const nextProfile = this.updateProfile(
      input.profile,
      attempt,
      evaluation
    );

    const decision = this.decideNextAction(
      nextProfile,
      input.topicId,
      topicAttempts
    );

    return {
      profile: nextProfile,
      evaluation,
      decision,
      attempt,
    };
  }

  /**
   * Evaluate current evidence for a topic.
   */
  static evaluateTopic(
    attempts: AttemptRecord[]
  ): ChallengeEvaluation {
    if (attempts.length === 0) {
      return {
        mastery: 0,
        masteryLevel: 'LOCKED',
        accuracy: 0,
        independence: 0,
        consistency: 0,
        challengeVariety: 0,
        hintDependency: 0,
        weak: false,
        readyForBoss: false,
      };
    }

    const passed = attempts.filter((attempt) => attempt.passed).length;

    const accuracy = (passed / attempts.length) * 100;

    const independentAttempts = attempts.filter(
      (attempt) => attempt.independent
    );

    const successfulAttempts = attempts.filter(
      (attempt) => attempt.passed
    );

    const independence =
      successfulAttempts.length === 0
        ? 0
        : (independentAttempts.length / successfulAttempts.length) * 100;

    const consistency = this.calculateConsistency(attempts);

    const challengeVariety = this.calculateChallengeVariety(attempts);

    const hintDependency =
      attempts.length === 0
        ? 0
        : Math.min(
            100,
            (attempts.reduce(
              (total, attempt) => total + attempt.hintsUsed,
              0
            ) /
              attempts.length /
              3) *
              100
          );

    const mastery = Math.max(
      0,
      Math.min(
        100,
        accuracy * 0.35 +
          independence * 0.3 +
          consistency * 0.15 +
          challengeVariety * 0.2 -
          hintDependency * 0.15
      )
    );

    const masteryLevel = this.getMasteryLevel(
      mastery,
      accuracy,
      independence,
      attempts
    );

    const failures = attempts.filter(
      (attempt) => !attempt.passed
    ).length;

    const weak =
      attempts.length >= 2 &&
      failures >= 2 &&
      accuracy < 60;

    const readyForBoss =
      masteryLevel === 'MASTERED' ||
      (mastery >= 82 &&
        accuracy >= 80 &&
        independence >= 65 &&
        attempts.length >= 4);

    return {
      mastery: Math.round(mastery),
      masteryLevel,
      accuracy: Math.round(accuracy),
      independence: Math.round(independence),
      consistency: Math.round(consistency),
      challengeVariety: Math.round(challengeVariety),
      hintDependency: Math.round(hintDependency),
      weak,
      readyForBoss,
    };
  }

  /**
   * Decide what the learner should experience next.
   *
   * This is the part that turns the application from a static course
   * into an adaptive training system.
   */
  static decideNextAction(
    profile: LearningProfile,
    topicId: string,
    topicAttempts: AttemptRecord[]
  ): AdaptiveDecision {
    const failures = topicAttempts.filter(
      (attempt) => !attempt.passed
    );

    const consecutiveFailures =
      this.getConsecutiveFailures(topicAttempts);

    const recentHints = topicAttempts
      .slice(-3)
      .reduce((sum, attempt) => sum + attempt.hintsUsed, 0);

    const evaluation = this.evaluateTopic(topicAttempts);

    const repeatedError = this.hasRepeatedError(topicAttempts);

    /*
     * 1. Three failures in a row means STOP THROWING EXERCISES.
     *
     * The learner needs a different teaching strategy.
     */
    if (consecutiveFailures >= 3) {
      return {
        action: 'MICRO_LESSON',
        phase: 'TEACH',
        reason:
          'Three consecutive failures detected. Teach the underlying concept again before another attempt.',
        topicId,
        confidence: 0.95,
      };
    }

    /*
     * 2. Repeated runtime mistakes should become debugging practice.
     */
    if (
      repeatedError &&
      failures.length >= 2
    ) {
      return {
        action: 'DEBUG',
        phase: 'DEBUG',
        reason:
          'The same mistake is appearing repeatedly. Switch from normal coding to guided debugging.',
        topicId,
        confidence: 0.9,
      };
    }

    /*
     * 3. Heavy hint dependency means we need to remove scaffolding,
     * not keep giving more hints.
     */
    if (
      recentHints >= 6 &&
      topicAttempts.length >= 3
    ) {
      return {
        action: 'INDEPENDENT_RETRY',
        phase: 'INDEPENDENT',
        reason:
          'Hint dependency is increasing. Remove scaffolding and require an independent attempt.',
        topicId,
        confidence: 0.88,
      };
    }

    /*
     * 4. Good performance means increase difficulty.
     */
    if (
      evaluation.mastery >= 80 &&
      evaluation.independence >= 65 &&
      topicAttempts.length >= 4
    ) {
      return {
        action: 'ADVANCE',
        phase: 'MASTERY',
        reason:
          'The learner has demonstrated strong independent performance. Increase difficulty or unlock the next lesson.',
        topicId,
        confidence: 0.92,
      };
    }

    /*
     * 5. Passing with low independence means:
     * "You survived, but you don't own this yet."
     */
    if (
      evaluation.accuracy >= 70 &&
      evaluation.independence < 50
    ) {
      return {
        action: 'INDEPENDENT_RETRY',
        phase: 'INDEPENDENT',
        reason:
          'Accuracy is acceptable but independent solving is weak. Require another attempt without hints.',
        topicId,
        confidence: 0.86,
      };
    }

    /*
     * 6. Fresh topic / early attempts:
     * teach -> check -> practice.
     */
    if (topicAttempts.length <= 1) {
      return {
        action: 'TEACH',
        phase: 'TEACH',
        reason:
          'Insufficient evidence. Establish conceptual understanding before increasing difficulty.',
        topicId,
        confidence: 0.8,
      };
    }

    /*
     * 7. Default: keep practicing while collecting evidence.
     */
    return {
      action: 'PRACTICE',
      phase: 'PRACTICE',
      reason:
        'Continue practice while collecting evidence of accuracy and independent solving.',
      topicId,
      confidence: 0.72,
    };
  }

  /**
   * Update the persistent learner profile.
   */
  private static updateProfile(
    profile: LearningProfile,
    attempt: AttemptRecord,
    evaluation: ChallengeEvaluation
  ): LearningProfile {
    const previousHistory = Array.isArray(profile.attemptHistory)
      ? profile.attemptHistory
      : [];

    const recentMistakes = Array.isArray(profile.recentMistakes)
      ? profile.recentMistakes
      : [];

    const updatedMistakes = attempt.passed
      ? recentMistakes
      : [
          ...recentMistakes,
          {
            challengeId: attempt.challengeId,
            topicId: attempt.topicId,
            errorType: attempt.errorType ?? 'unknown',
            error: attempt.runtimeError ?? 'Challenge failed',
            timestamp: attempt.timestamp,
          },
        ].slice(-MAX_RECENT_MISTAKES);

    const topicMastery = {
      ...(profile.topicMastery ?? {}),
      [attempt.topicId]: evaluation.mastery,
    };

    const weakTopics = new Set(profile.weakTopics ?? []);

    if (evaluation.weak) {
      weakTopics.add(attempt.topicId);
    } else if (evaluation.mastery >= 70) {
      weakTopics.delete(attempt.topicId);
    }

    const masteredTopics = new Set(
      profile.masteredTopics ?? []
    );

    if (evaluation.masteryLevel === 'MASTERED') {
      masteredTopics.add(attempt.topicId);
    }

    const xpGain = this.calculateXpGain(
      attempt,
      evaluation
    );

    const totalAttempts =
      (profile.totalAttempts ?? 0) + 1;

    const successfulAttempts =
      (profile.successfulAttempts ?? 0) +
      (attempt.passed ? 1 : 0);

    const independentSolves =
      (profile.independentSolves ?? 0) +
      (attempt.independent ? 1 : 0);

    const hintsUsed =
      (profile.totalHintsUsed ?? 0) +
      attempt.hintsUsed;

    return {
      ...profile,

      totalAttempts,
      successfulAttempts,
      independentSolves,
      totalHintsUsed: hintsUsed,

      xp: Math.max(
        0,
        (profile.xp ?? 0) + xpGain
      ),

      attemptHistory: [
        ...previousHistory,
        attempt,
      ].slice(-MAX_RECENT_ATTEMPTS),

      recentMistakes: updatedMistakes,

      topicMastery,

      weakTopics: Array.from(weakTopics),

      masteredTopics: Array.from(masteredTopics),

      lastActiveTimestamp: attempt.timestamp,

      currentTopicId: attempt.topicId,

      lastDecision: this.decideNextAction(
        profile,
        attempt.topicId,
        [
          ...previousHistory.filter(
            (item) => item.topicId === attempt.topicId
          ),
          attempt,
        ]
      ),
    };
  }

  /**
   * XP rewards evidence of actual learning rather than simply
   * clicking through lessons.
   */
  private static calculateXpGain(
    attempt: AttemptRecord,
    evaluation: ChallengeEvaluation
  ): number {
    if (!attempt.passed) {
      return 2;
    }

    let xp = 15;

    if (attempt.independent) {
      xp += 10;
    }

    if (attempt.hintsUsed === 0) {
      xp += 5;
    }

    if (evaluation.masteryLevel === 'MASTERED') {
      xp += 25;
    }

    return xp;
  }

  private static calculateConsistency(
    attempts: AttemptRecord[]
  ): number {
    if (attempts.length < 2) {
      return 50;
    }

    const windows: number[] = [];

    for (let i = 1; i < attempts.length; i += 1) {
      windows.push(
        attempts[i].passed ? 100 : 0
      );
    }

    const average =
      windows.reduce((a, b) => a + b, 0) /
      windows.length;

    return average;
  }

  private static calculateChallengeVariety(
    attempts: AttemptRecord[]
  ): number {
    if (attempts.length === 0) {
      return 0;
    }

    const types = new Set<string>();

    for (const attempt of attempts) {
      const code = attempt.code ?? '';

      if (
        /\bprint\s*\(/i.test(code)
      ) {
        types.add('output');
      }

      if (
        /\bif\b|\belif\b|\belse\b/.test(code)
      ) {
        types.add('conditional');
      }

      if (
        /\bfor\b|\bwhile\b/.test(code)
      ) {
        types.add('loop');
      }

      if (
        /\bdef\b/.test(code)
      ) {
        types.add('function');
      }

      if (
        /\bclass\b/.test(code)
      ) {
        types.add('class');
      }

      if (
        /\btry\b|\bexcept\b/.test(code)
      ) {
        types.add('exception');
      }

      if (
        /\[.*\]/s.test(code)
      ) {
        types.add('collection');
      }
    }

    return Math.min(
      100,
      (types.size / 6) * 100
    );
  }

  private static getMasteryLevel(
    mastery: number,
    accuracy: number,
    independence: number,
    attempts: AttemptRecord[]
  ): MasteryLevel {
    if (attempts.length === 0) {
      return 'LOCKED';
    }

    if (
      attempts.length >= 5 &&
      mastery >= 85 &&
      accuracy >= 85 &&
      independence >= 70
    ) {
      return 'MASTERED';
    }

    if (
      attempts.length >= 4 &&
      mastery >= 75 &&
      accuracy >= 75 &&
      independence >= 55
    ) {
      return 'STRONG';
    }

    if (
      attempts.length >= 3 &&
      mastery >= 60 &&
      accuracy >= 65
    ) {
      return 'COMPETENT';
    }

    if (
      mastery >= 40 ||
      accuracy >= 50
    ) {
      return 'DEVELOPING';
    }

    return 'BEGINNER';
  }

  private static getConsecutiveFailures(
    attempts: AttemptRecord[]
  ): number {
    let count = 0;

    for (
      let i = attempts.length - 1;
      i >= 0;
      i -= 1
    ) {
      if (attempts[i].passed) {
        break;
      }

      count += 1;
    }

    return count;
  }

  private static hasRepeatedError(
    attempts: AttemptRecord[]
  ): boolean {
    const recent = attempts
      .filter((attempt) => !attempt.passed)
      .slice(-4);

    if (recent.length < 2) {
      return false;
    }

    const errors = recent
      .map(
        (attempt) =>
          attempt.errorType ??
          attempt.runtimeError ??
          'unknown'
      )
      .map((error) =>
        error
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim()
      );

    return new Set(errors).size < errors.length;
  }

  /**
   * Useful when the UI wants to know whether to force a different
   * experience instead of simply loading another coding question.
   */
  static shouldTriggerMicroLesson(
    attempts: AttemptRecord[]
  ): boolean {
    return (
      this.getConsecutiveFailures(attempts) >= 3 ||
      this.hasRepeatedError(attempts)
    );
  }

  static shouldRemoveScaffolding(
    attempts: AttemptRecord[]
  ): boolean {
    if (attempts.length < 3) {
      return false;
    }

    const recent = attempts.slice(-3);

    const hintCount = recent.reduce(
      (sum, attempt) =>
        sum + attempt.hintsUsed,
      0
    );

    return hintCount >= 5;
  }

  static getRecommendedPhase(
    attempts: AttemptRecord[]
  ): LearningPhase {
    if (attempts.length === 0) {
      return 'TEACH';
    }

    if (
      this.getConsecutiveFailures(attempts) >= 3
    ) {
      return 'TEACH';
    }

    if (this.hasRepeatedError(attempts)) {
      return 'DEBUG';
    }

    const evaluation =
      this.evaluateTopic(attempts);

    if (
      evaluation.mastery >= 80 &&
      evaluation.independence >= 65
    ) {
      return 'MASTERY';
    }

    if (
      evaluation.accuracy >= 70 &&
      evaluation.independence < 50
    ) {
      return 'INDEPENDENT';
    }

    return 'PRACTICE';
  }
}

export default LearningEngine;