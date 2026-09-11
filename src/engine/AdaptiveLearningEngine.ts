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
};

export class AdaptiveLearningEngine {
  /** Bridge for the current arena. Evidence is stored through SkillMasteryEngine. */
  public static recordAttempt(input: LegacyAttemptInput): { profile: LearningProfile; decision: any } {
    const profile = input.profile;
    const skills = { ...(profile.skills ?? {}) };
    const existing = skills[input.topicId] ?? SkillMasteryEngine.createSkill(input.topicId, input.topicId, `Evidence tracked for ${input.topicId}`);
    const challengeType: ChallengeType = this.inferChallengeType(input.challengeId, existing);
    const updatedSkill = SkillMasteryEngine.recordAttempt(existing, {
      passed: input.passed,
      challengeType,
      hintsUsed: input.hintsUsed,
      errorType: input.errorType,
      independent: input.hintsUsed === 0,
    });
    skills[input.topicId] = updatedSkill;

    const history = [
      ...((profile.attemptHistory ?? []) as Array<AttemptHistoryEntry & { challengeId?: string; lessonId?: string; independent?: boolean }>),
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
      },
    ];

    const successfulAttempts = history.filter((attempt) => attempt.passed).length;
    const nextProfile: LearningProfile = {
      ...profile,
      skills,
      attemptHistory: history,
      totalSuccesses: successfulAttempts,
      totalFailures: history.length - successfulAttempts,
      successfulAttempts,
      independentSolves: history.filter((attempt) => attempt.passed && attempt.independent).length,
      totalHintsUsed: history.reduce((sum, attempt) => sum + Number(attempt.hintsUsed ?? 0), 0),
      overallMastery: this.calculateOverallMastery(skills),
      currentPhase: input.passed ? 'PRACTICE' : 'DEBUG',
      topicMastery: { ...(profile.topicMastery ?? {}), [input.topicId]: updatedSkill.mastery },
      topicAccuracy: { ...(profile.topicAccuracy ?? {}), [input.topicId]: updatedSkill.evidence.attempts ? Math.round((updatedSkill.evidence.successes / updatedSkill.evidence.attempts) * 100) : 0 },
      hintDependency: { ...(profile.hintDependency ?? {}), [input.topicId]: updatedSkill.evidence.attempts ? updatedSkill.evidence.hintsUsed / updatedSkill.evidence.attempts : 0 },
      weakTopics: Object.values(skills).filter((skill) => skill.weak).map((skill) => skill.id),
      masteredTopics: Object.values(skills).filter((skill) => skill.masteryLevel === 'MASTERED').map((skill) => skill.id),
      currentTopicId: input.topicId,
      recentMistakes: input.passed ? (profile.recentMistakes ?? []) : [
        ...(profile.recentMistakes ?? []),
        { challengeId: input.challengeId, topicId: input.topicId, skillId: input.topicId, errorType: input.errorType, error: input.runtimeError, timestamp: Date.now() },
      ].slice(-20),
    };

    const canonical = this.decideNextAction(nextProfile, updatedSkill, input.passed, challengeType, 1, input.hintsUsed, input.errorType);
    let action = canonical.action as string;
    if (action === 'TEACH_AGAIN') action = 'MICRO_LESSON';
    if (action === 'DEBUG_CHALLENGE') action = 'DEBUG';
    if (action === 'INDEPENDENT_CHALLENGE') action = 'INDEPENDENT_RETRY';
    if (action === 'BOSS_CHALLENGE' || (input.passed && updatedSkill.masteryLevel === 'MASTERED')) action = 'ADVANCE';

    const decision = { ...canonical, action, topicId: input.topicId };
    nextProfile.lastDecision = decision as any;
    return { profile: nextProfile, decision };
  }

  public static decideNextAction(_profile: LearningProfile, skill: Skill, passed: boolean, challengeType: ChallengeType, difficulty: number, hintsUsedThisAttempt: number, errorType?: string): AdaptiveDecision {
    const evidence = skill.evidence;
    if (!passed) {
      const repeated = this.countRecentSameErrors(evidence.recentErrors, errorType);
      if (repeated >= 2) return { action: 'MICRO_LESSON', reason: 'Repeated misconception detected. Reteach the concept before another build task.', skillId: skill.id, recommendedDifficulty: Math.max(1, difficulty - 1), removeHints: false };
      if (evidence.failures >= 3) return { action: 'DEBUG_CHALLENGE', reason: 'Repeated failures detected. Switch to diagnosis.', skillId: skill.id, recommendedDifficulty: Math.max(1, difficulty - 1), removeHints: false };
      if (hintsUsedThisAttempt > 0) return { action: 'EASIER_CHALLENGE', reason: 'Assistance did not produce a pass. Reduce complexity.', skillId: skill.id, recommendedDifficulty: Math.max(1, difficulty - 1), removeHints: false };
      return { action: 'TEACH_AGAIN', reason: 'First failure detected. Explain the underlying mistake.', skillId: skill.id, recommendedDifficulty: difficulty, removeHints: false };
    }
    const accuracy = this.calculateAccuracy(evidence);
    const independence = this.calculateIndependence(evidence);
    if (hintsUsedThisAttempt >= 2) return { action: 'INDEPENDENT_CHALLENGE', reason: 'Passed with significant assistance. Require an independent proof.', skillId: skill.id, recommendedDifficulty: difficulty, removeHints: true };
    if (challengeType === 'BUILD' && evidence.predictSuccesses === 0) return { action: 'CONTINUE', reason: 'Build passed. Test mental execution next.', skillId: skill.id, recommendedDifficulty: difficulty, removeHints: false };
    if (challengeType === 'PREDICT' && evidence.debugSuccesses === 0 && evidence.attempts >= 2) return { action: 'DEBUG_CHALLENGE', reason: 'Prediction passed. Test diagnosis next.', skillId: skill.id, recommendedDifficulty: difficulty, removeHints: false };
    if (evidence.attempts >= 4 && accuracy >= 0.8 && independence >= 0.75 && this.countEvidenceTypes(evidence) >= 2) return { action: 'BOSS_CHALLENGE', reason: 'Consistent, independent, varied evidence is strong enough for a boss.', skillId: skill.id, recommendedDifficulty: Math.min(5, difficulty + 1), removeHints: true };
    if (accuracy >= 0.75 && independence >= 0.6) return { action: 'HARDER_CHALLENGE', reason: 'Performance is strong. Increase difficulty.', skillId: skill.id, recommendedDifficulty: Math.min(5, difficulty + 1), removeHints: false };
    if (evidence.hintsUsed >= 3 && evidence.assistedSuccesses > evidence.independentSuccesses) return { action: 'INDEPENDENT_CHALLENGE', reason: 'Hint dependency is increasing. Remove scaffolding.', skillId: skill.id, recommendedDifficulty: difficulty, removeHints: true };
    return { action: 'CONTINUE', reason: 'Performance is developing normally. Continue the sequence.', skillId: skill.id, recommendedDifficulty: difficulty, removeHints: false };
  }

  public static isBossReady(skill: Skill, profile: LearningProfile): boolean {
    const evidence = skill.evidence;
    return skill.unlocked && !(profile.weakTopics ?? []).includes(skill.id) && evidence.attempts >= 4 && this.calculateAccuracy(evidence) >= 0.8 && this.calculateIndependence(evidence) >= 0.75 && this.countEvidenceTypes(evidence) >= 2;
  }
  public static needsRemediation(skill: Skill): boolean { const evidence = skill.evidence; return evidence.attempts >= 2 && (this.calculateAccuracy(evidence) < 0.5 || evidence.failures >= 3 || evidence.recentErrors.length >= 3); }
  public static hasHintDependency(skill: Skill): boolean { const evidence = skill.evidence; return evidence.attempts >= 3 && (evidence.hintsUsed >= 5 || (evidence.assistedSuccesses > evidence.independentSuccesses * 2 && evidence.assistedSuccesses >= 3)); }
  private static inferChallengeType(_challengeId: string, skill: Skill): ChallengeType { return skill.evidence.predictSuccesses > 0 && skill.evidence.debugSuccesses === 0 ? 'DEBUG' : 'BUILD'; }
  private static calculateOverallMastery(skills: Record<string, Skill>): number { const values = Object.values(skills).map((skill) => skill.mastery); return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0; }
  private static calculateAccuracy(evidence: Skill['evidence']): number { return evidence.attempts === 0 ? 0 : evidence.successes / evidence.attempts; }
  private static calculateIndependence(evidence: Skill['evidence']): number { return evidence.successes === 0 ? 0 : evidence.independentSuccesses / evidence.successes; }
  private static countEvidenceTypes(evidence: Skill['evidence']): number { return Number(evidence.predictSuccesses > 0) + Number(evidence.debugSuccesses > 0) + Number(evidence.buildSuccesses > 0) + Number(evidence.explainSuccesses > 0); }
  private static countRecentSameErrors(errors: string[], errorType?: string): number { return errorType ? errors.filter((error) => error === errorType).length : 0; }
}
