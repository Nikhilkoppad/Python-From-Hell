import type { AdaptiveDecision, AttemptHistoryEntry, ChallengeType, LearningProfile, Skill } from '../types/learning';
import { SkillMasteryEngine } from './SkillMasteryEngine';

type LegacyAttemptInput = {
  profile: LearningProfile;
  challengeId: string;
  lessonId: string;
  topicId: string;
  passed: boolean;
  hintsUsed: number;
  code?: string;
  output?: string;
  runtimeError?: string;
  errorType?: string;
  challengeType?: ChallengeType;
  difficulty?: number;
};

export class AdaptiveLearningEngine {
  public static recordAttempt(input: LegacyAttemptInput): { profile: LearningProfile; decision: any } {
    const profile = input.profile;
    const skills: Record<string, Skill> = { ...((profile.skills ?? {}) as Record<string, Skill>) };
    const existing = skills[input.topicId] ?? SkillMasteryEngine.createSkill(input.topicId, input.topicId, `Evidence tracked for ${input.topicId}`);
    const challengeType = input.challengeType ?? this.inferChallengeType(input.challengeId);
    const difficulty = Math.max(1, Math.min(5, Number(input.difficulty ?? 1)));
    const updatedSkill = SkillMasteryEngine.recordAttempt(existing, {
      passed: input.passed,
      challengeType,
      hintsUsed: input.hintsUsed,
      errorType: input.errorType,
      independent: input.hintsUsed === 0,
    });
    skills[input.topicId] = updatedSkill;

    const history = [
      ...((profile.attemptHistory ?? []) as Array<AttemptHistoryEntry & { challengeId?: string; lessonId?: string; independent?: boolean; challengeType?: ChallengeType }>),
      {
        challengeId: input.challengeId,
        lessonId: input.lessonId,
        topicId: input.topicId,
        skillId: input.topicId,
        passed: input.passed,
        hintsUsed: input.hintsUsed,
        errorType: input.errorType,
        timestamp: Date.now(),
        independent: input.hintsUsed === 0,
        challengeType,
      },
    ];

    const successes = history.filter((attempt) => attempt.passed).length;
    const nextProfile: LearningProfile = {
      ...profile,
      skills,
      attemptHistory: history,
      totalAttempts: history.length,
      totalSuccesses: successes,
      totalFailures: history.length - successes,
      successfulAttempts: successes,
      independentSolves: history.filter((attempt) => attempt.passed && attempt.independent).length,
      totalHintsUsed: history.reduce((sum, attempt) => sum + Number(attempt.hintsUsed ?? 0), 0),
      overallMastery: this.calculateOverallMastery(skills),
      currentPhase: input.passed ? 'PRACTICE' : 'DEBUG',
      topicMastery: { ...(profile.topicMastery ?? {}), [input.topicId]: updatedSkill.mastery },
      topicAccuracy: {
        ...(profile.topicAccuracy ?? {}),
        [input.topicId]: updatedSkill.evidence.attempts
          ? Math.round((updatedSkill.evidence.successes / updatedSkill.evidence.attempts) * 100)
          : 0,
      },
      hintDependency: {
        ...(profile.hintDependency ?? {}),
        [input.topicId]: updatedSkill.evidence.attempts
          ? updatedSkill.evidence.hintsUsed / updatedSkill.evidence.attempts
          : 0,
      },
      weakTopics: Object.values(skills).filter((skill: Skill) => skill.weak).map((skill: Skill) => skill.id),
      masteredTopics: Object.values(skills).filter((skill: Skill) => skill.masteryLevel === 'MASTERED').map((skill: Skill) => skill.id),
      currentTopicId: input.topicId,
      recentMistakes: input.passed
        ? (profile.recentMistakes ?? [])
        : [
            ...(profile.recentMistakes ?? []),
            {
              challengeId: input.challengeId,
              topicId: input.topicId,
              skillId: input.topicId,
              errorType: input.errorType,
              error: input.runtimeError,
              timestamp: Date.now(),
            },
          ].slice(-20),
    };

    const canonical = this.decideNextAction(
      nextProfile,
      updatedSkill,
      input.passed,
      challengeType,
      difficulty,
      input.hintsUsed,
      input.errorType,
    );

    let action = canonical.action as string;
    if (action === 'TEACH_AGAIN') action = 'MICRO_LESSON';
    if (action === 'DEBUG_CHALLENGE') action = 'DEBUG';
    if (action === 'INDEPENDENT_CHALLENGE') action = 'INDEPENDENT_RETRY';
    if (action === 'BOSS_CHALLENGE' || (input.passed && updatedSkill.masteryLevel === 'MASTERED')) action = 'ADVANCE';

    const decision = { ...canonical, action, topicId: input.topicId };
    nextProfile.lastDecision = decision;
    return { profile: nextProfile, decision };
  }

  public static decideNextAction(
    _profile: LearningProfile,
    skill: Skill,
    passed: boolean,
    challengeType: ChallengeType,
    difficulty: number,
    hintsUsedThisAttempt: number,
    errorType?: string,
  ): AdaptiveDecision {
    const evidence = skill.evidence;
    if (!passed) {
      if (this.countRecentSameErrors(evidence.recentErrors, errorType) >= 2) {
        return { action: 'MICRO_LESSON', reason: 'Repeated misconception detected. Reteach the concept.', skillId: skill.id, recommendedDifficulty: Math.max(1, difficulty - 1), removeHints: false };
      }
      if (evidence.failures >= 3) {
        return { action: 'DEBUG_CHALLENGE', reason: 'Repeated failures detected. Switch to diagnosis.', skillId: skill.id, recommendedDifficulty: Math.max(1, difficulty - 1), removeHints: false };
      }
      if (hintsUsedThisAttempt > 0) {
        return { action: 'EASIER_CHALLENGE', reason: 'Assistance did not produce a pass. Reduce complexity.', skillId: skill.id, recommendedDifficulty: Math.max(1, difficulty - 1), removeHints: false };
      }
      return { action: 'TEACH_AGAIN', reason: 'First failure detected. Explain the underlying mistake.', skillId: skill.id, recommendedDifficulty: difficulty, removeHints: false };
    }

    const accuracy = this.calculateAccuracy(evidence);
    const independence = this.calculateIndependence(evidence);
    if (hintsUsedThisAttempt >= 2) {
      return { action: 'INDEPENDENT_CHALLENGE', reason: 'Passed with significant assistance. Require independent proof.', skillId: skill.id, recommendedDifficulty: difficulty, removeHints: true };
    }
    if (challengeType === 'BUILD' && evidence.predictSuccesses === 0) {
      return { action: 'CONTINUE', reason: 'Build passed. Test mental execution next.', skillId: skill.id, recommendedDifficulty: difficulty, removeHints: false };
    }
    if (challengeType === 'PREDICT' && evidence.debugSuccesses === 0 && evidence.attempts >= 2) {
      return { action: 'DEBUG_CHALLENGE', reason: 'Prediction passed. Test diagnosis next.', skillId: skill.id, recommendedDifficulty: difficulty, removeHints: false };
    }
    if (evidence.attempts >= 4 && accuracy >= 0.8 && independence >= 0.75 && this.countEvidenceTypes(evidence) >= 2) {
      return { action: 'BOSS_CHALLENGE', reason: 'Consistent, independent, varied evidence is strong enough for a boss.', skillId: skill.id, recommendedDifficulty: Math.min(5, difficulty + 1), removeHints: true };
    }
    if (accuracy >= 0.75 && independence >= 0.6) {
      return { action: 'HARDER_CHALLENGE', reason: 'Performance is strong. Increase difficulty.', skillId: skill.id, recommendedDifficulty: Math.min(5, difficulty + 1), removeHints: false };
    }
    if (evidence.hintsUsed >= 3 && evidence.assistedSuccesses > evidence.independentSuccesses) {
      return { action: 'INDEPENDENT_CHALLENGE', reason: 'Hint dependency is increasing. Remove scaffolding.', skillId: skill.id, recommendedDifficulty: difficulty, removeHints: true };
    }
    return { action: 'CONTINUE', reason: 'Performance is developing normally. Continue the sequence.', skillId: skill.id, recommendedDifficulty: difficulty, removeHints: false };
  }

  public static isBossReady(skill: Skill, profile: LearningProfile): boolean {
    const e = skill.evidence;
    return skill.unlocked && !(profile.weakTopics ?? []).includes(skill.id) && e.attempts >= 4 && this.calculateAccuracy(e) >= 0.8 && this.calculateIndependence(e) >= 0.75 && this.countEvidenceTypes(e) >= 2;
  }

  public static needsRemediation(skill: Skill): boolean {
    const e = skill.evidence;
    return e.attempts >= 2 && (this.calculateAccuracy(e) < 0.5 || e.failures >= 3 || e.recentErrors.length >= 3);
  }

  public static hasHintDependency(skill: Skill): boolean {
    const e = skill.evidence;
    return e.attempts >= 3 && (e.hintsUsed >= 5 || (e.assistedSuccesses > e.independentSuccesses * 2 && e.assistedSuccesses >= 3));
  }

  private static inferChallengeType(challengeId: string): ChallengeType {
    const id = challengeId.toLowerCase();
    if (id.includes('predict')) return 'PREDICT';
    if (id.includes('trace')) return 'TRACE';
    if (id.includes('debug')) return 'DEBUG';
    if (id.includes('fix')) return 'FIX';
    if (id.includes('explain')) return 'EXPLAIN';
    if (id.includes('refactor')) return 'REFACTOR';
    if (id.includes('boss')) return 'BOSS';
    return 'BUILD';
  }

  private static calculateOverallMastery(skills: Record<string, Skill>): number {
    const values = Object.values(skills).map((skill) => skill.mastery);
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  }

  private static calculateAccuracy(e: Skill['evidence']): number { return e.attempts ? e.successes / e.attempts : 0; }
  private static calculateIndependence(e: Skill['evidence']): number { return e.successes ? e.independentSuccesses / e.successes : 0; }
  private static countEvidenceTypes(e: Skill['evidence']): number { return Number(e.predictSuccesses > 0) + Number(e.debugSuccesses > 0) + Number(e.buildSuccesses > 0) + Number(e.explainSuccesses > 0); }
  private static countRecentSameErrors(errors: string[], errorType?: string): number { return errorType ? errors.filter((error) => error === errorType).length : 0; }
}
