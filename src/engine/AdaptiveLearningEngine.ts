import type { AdaptiveDecision, ChallengeType, LearningProfile, Skill } from '../types/learning';
import { SkillMasteryEngine } from './SkillMasteryEngine';

export interface AdaptiveAttemptInput {
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
  challengeType?: ChallengeType;
}

export interface AdaptiveAttemptResult {
  profile: LearningProfile;
  decision: AdaptiveDecision;
}

export class AdaptiveLearningEngine {
  public static recordAttempt(input: AdaptiveAttemptInput): AdaptiveAttemptResult {
    const now = Date.now();
    const independent = input.passed && input.hintsUsed === 0;
    const history = input.profile.attemptHistory ?? [];
    const previousSkill = input.profile.skills?.[input.topicId];
    const skill = previousSkill ?? SkillMasteryEngine.createSkill(input.topicId, input.topicId, input.topicId);
    const challengeType = input.challengeType ?? 'BUILD';

    const updatedSkill = SkillMasteryEngine.recordAttempt(skill, {
      passed: input.passed,
      challengeType,
      hintsUsed: input.hintsUsed,
      errorType: input.errorType,
      independent,
    });

    const updatedSkills = { ...(input.profile.skills ?? {}), [input.topicId]: updatedSkill };
    const difficulty = this.getDifficulty(input.code);
    const decision = this.decideNextAction(
      input.profile,
      updatedSkill,
      input.passed,
      challengeType,
      difficulty,
      input.hintsUsed,
      input.errorType
    );

    const attempt = {
      challengeId: input.challengeId,
      lessonId: input.lessonId,
      topicId: input.topicId,
      skillId: input.topicId,
      passed: input.passed,
      hintsUsed: input.hintsUsed,
      independent,
      runtimeError: input.runtimeError,
      errorType: input.errorType,
      code: input.code,
      output: input.output,
      timestamp: now,
    };

    const previousAttemptTimestamp = history.length > 0
      ? history[history.length - 1]?.timestamp
      : input.profile.lastActiveTimestamp;
    const nextStreak = this.calculateStreak(Number(input.profile.streak ?? 1), previousAttemptTimestamp, now);

    const nextProfile: LearningProfile = {
      ...input.profile,
      skills: updatedSkills,
      totalAttempts: (input.profile.totalAttempts ?? 0) + 1,
      totalSuccesses: input.profile.totalSuccesses + (input.passed ? 1 : 0),
      totalFailures: input.profile.totalFailures + (input.passed ? 0 : 1),
      successfulAttempts: (input.profile.successfulAttempts ?? 0) + (input.passed ? 1 : 0),
      independentSolves: (input.profile.independentSolves ?? 0) + (independent ? 1 : 0),
      totalHintsUsed: (input.profile.totalHintsUsed ?? 0) + input.hintsUsed,
      xp: Number(input.profile.xp ?? 0),
      streak: nextStreak,
      overallMastery: this.averageMastery(updatedSkills),
      currentTopicId: input.topicId,
      currentPhase: decision.phase ?? this.phaseForAction(decision.action),
      topicMastery: { ...(input.profile.topicMastery ?? {}), [input.topicId]: updatedSkill.mastery },
      topicAccuracy: {
        ...(input.profile.topicAccuracy ?? {}),
        [input.topicId]: updatedSkill.evidence.attempts === 0 ? 0 : Math.round((updatedSkill.evidence.successes / updatedSkill.evidence.attempts) * 100),
      },
      topicIndependentSolve: {
        ...(input.profile.topicIndependentSolve ?? {}),
        [input.topicId]: updatedSkill.evidence.successes === 0 ? 0 : Math.round((updatedSkill.evidence.independentSuccesses / updatedSkill.evidence.successes) * 100),
      },
      hintDependency: {
        ...(input.profile.hintDependency ?? {}),
        [input.topicId]: updatedSkill.evidence.attempts === 0 ? 0 : Math.round((updatedSkill.evidence.hintsUsed / updatedSkill.evidence.attempts) * 100),
      },
      weakTopics: updatedSkill.weak
        ? Array.from(new Set([...(input.profile.weakTopics ?? []), input.topicId]))
        : (input.profile.weakTopics ?? []).filter((topic) => topic !== input.topicId),
      masteredTopics: updatedSkill.masteryLevel === 'MASTERED'
        ? Array.from(new Set([...(input.profile.masteredTopics ?? []), input.topicId]))
        : input.profile.masteredTopics ?? [],
      recentMistakes: input.passed
        ? input.profile.recentMistakes ?? []
        : [...(input.profile.recentMistakes ?? []), { challengeId: input.challengeId, topicId: input.topicId, skillId: input.topicId, errorType: input.errorType, error: input.runtimeError, timestamp: now }].slice(-20),
      attemptHistory: [...history, attempt].slice(-100),
      lastDecision: decision,
      lastActiveTimestamp: now,
    };

    return { profile: nextProfile, decision };
  }

  public static decideNextAction(
    _profile: LearningProfile,
    skill: Skill,
    passed: boolean,
    challengeType: ChallengeType,
    difficulty: number,
    hintsUsedThisAttempt: number,
    errorType?: string
  ): AdaptiveDecision {
    const evidence = skill.evidence;
    if (!passed) {
      const recentSameErrors = this.countRecentSameErrors(evidence.recentErrors, errorType);
      if (recentSameErrors >= 2) return { action: 'TEACH_AGAIN', reason: 'You are repeating the same mistake. Stop throwing new problems at the learner and reteach the missing concept.', skillId: skill.id, topicId: skill.id, phase: 'TEACH', confidence: 0.95, recommendedDifficulty: Math.max(1, difficulty - 1), removeHints: false };
      if (evidence.failures >= 3) return { action: 'DEBUG_CHALLENGE', reason: 'Repeated failures detected. Switch from building code to diagnosing broken code.', skillId: skill.id, topicId: skill.id, phase: 'DEBUG', confidence: 0.9, recommendedDifficulty: Math.max(1, difficulty - 1), removeHints: false };
      if (hintsUsedThisAttempt > 0) return { action: 'EASIER_CHALLENGE', reason: 'The learner needed assistance and still failed. Reduce complexity before increasing difficulty.', skillId: skill.id, topicId: skill.id, phase: 'TEACH', confidence: 0.85, recommendedDifficulty: Math.max(1, difficulty - 1), removeHints: false };
      return { action: 'TEACH_AGAIN', reason: 'First failure detected. Explain the underlying mistake before giving another coding task.', skillId: skill.id, topicId: skill.id, phase: 'TEACH', confidence: 0.8, recommendedDifficulty: difficulty, removeHints: false };
    }

    const accuracy = this.calculateAccuracy(evidence);
    const independence = this.calculateIndependence(evidence);
    if (hintsUsedThisAttempt >= 2) return { action: 'INDEPENDENT_CHALLENGE', reason: 'The learner succeeded with significant assistance. Require an independent proof before calling this skill mastered.', skillId: skill.id, topicId: skill.id, phase: 'INDEPENDENT', confidence: 0.88, recommendedDifficulty: difficulty, removeHints: true };
    if (challengeType === 'BUILD' && evidence.predictSuccesses === 0) return { action: 'CONTINUE', reason: 'Build challenge passed. Test mental execution next with a prediction challenge.', skillId: skill.id, topicId: skill.id, phase: 'PREDICT', confidence: 0.78, recommendedDifficulty: difficulty, removeHints: false };
    if (challengeType === 'PREDICT' && evidence.debugSuccesses === 0 && evidence.attempts >= 2) return { action: 'DEBUG_CHALLENGE', reason: 'The learner can predict the code. Now test whether they can diagnose broken code.', skillId: skill.id, topicId: skill.id, phase: 'DEBUG', confidence: 0.8, recommendedDifficulty: difficulty, removeHints: false };
    const evidenceTypes = this.countEvidenceTypes(evidence);
    if (evidence.attempts >= 4 && accuracy >= 0.8 && independence >= 0.75 && evidenceTypes >= 2) return { action: 'BOSS_CHALLENGE', reason: 'The learner has demonstrated consistent, mostly independent performance across multiple challenge types. Time to prove it in a boss challenge.', skillId: skill.id, topicId: skill.id, phase: 'MASTERY', confidence: 0.92, recommendedDifficulty: Math.min(5, difficulty + 1), removeHints: true };
    if (accuracy >= 0.75 && independence >= 0.6) return { action: 'HARDER_CHALLENGE', reason: 'Performance is strong. Increase difficulty to test whether the skill transfers to a harder problem.', skillId: skill.id, topicId: skill.id, phase: 'PRACTICE', confidence: 0.82, recommendedDifficulty: Math.min(5, difficulty + 1), removeHints: false };
    if (evidence.hintsUsed >= 3 && evidence.assistedSuccesses > evidence.independentSuccesses) return { action: 'INDEPENDENT_CHALLENGE', reason: 'Hint dependency is increasing. Remove scaffolding and require the learner to solve independently.', skillId: skill.id, topicId: skill.id, phase: 'INDEPENDENT', confidence: 0.8, recommendedDifficulty: difficulty, removeHints: true };
    return { action: 'CONTINUE', reason: 'Performance is developing normally. Continue with the learning sequence.', skillId: skill.id, topicId: skill.id, phase: 'PRACTICE', confidence: 0.72, recommendedDifficulty: difficulty, removeHints: false };
  }

  public static isBossReady(skill: Skill, profile: LearningProfile): boolean {
    const evidence = skill.evidence;
    return skill.unlocked && !(profile.weakSkills ?? []).includes(skill.id) && evidence.attempts >= 4 && this.calculateAccuracy(evidence) >= 0.8 && this.calculateIndependence(evidence) >= 0.75 && this.countEvidenceTypes(evidence) >= 2;
  }

  public static needsRemediation(skill: Skill): boolean {
    const evidence = skill.evidence;
    return evidence.attempts >= 2 && (this.calculateAccuracy(evidence) < 0.5 || evidence.failures >= 3 || evidence.recentErrors.length >= 3);
  }

  public static hasHintDependency(skill: Skill): boolean {
    const evidence = skill.evidence;
    return evidence.attempts >= 3 && (evidence.hintsUsed >= 5 || (evidence.assistedSuccesses > evidence.independentSuccesses * 2 && evidence.assistedSuccesses >= 3));
  }

  private static calculateAccuracy(evidence: Skill['evidence']): number { return evidence.attempts === 0 ? 0 : evidence.successes / evidence.attempts; }
  private static calculateIndependence(evidence: Skill['evidence']): number { return evidence.successes === 0 ? 0 : evidence.independentSuccesses / evidence.successes; }
  private static countEvidenceTypes(evidence: Skill['evidence']): number { return [evidence.predictSuccesses, evidence.debugSuccesses, evidence.buildSuccesses, evidence.explainSuccesses].filter((value) => value > 0).length; }
  private static countRecentSameErrors(errors: string[], errorType?: string): number { return !errorType ? 0 : errors.filter((error) => error === errorType).length; }
  private static averageMastery(skills: Record<string, Skill>): number { const values = Object.values(skills); return values.length ? Math.round(values.reduce((sum, skill) => sum + skill.mastery, 0) / values.length) : 0; }
  private static calculateStreak(currentStreak: number, lastActiveTimestamp: unknown, now: number): number {
    const last = typeof lastActiveTimestamp === 'string' || typeof lastActiveTimestamp === 'number' ? new Date(lastActiveTimestamp).getTime() : NaN;
    if (!Number.isFinite(last)) return Math.max(1, currentStreak);
    const lastDay = new Date(last);
    const currentDay = new Date(now);
    lastDay.setHours(0, 0, 0, 0);
    currentDay.setHours(0, 0, 0, 0);
    const dayGap = Math.round((currentDay.getTime() - lastDay.getTime()) / 86_400_000);
    if (dayGap === 0) return Math.max(1, currentStreak);
    if (dayGap === 1) return Math.max(1, currentStreak + 1);
    return 1;
  }
  private static phaseForAction(action: AdaptiveDecision['action']): LearningProfile['currentPhase'] { if (action === 'DEBUG_CHALLENGE') return 'DEBUG'; if (action === 'INDEPENDENT_CHALLENGE') return 'INDEPENDENT'; if (action === 'BOSS_CHALLENGE') return 'MASTERY'; if (action === 'TEACH_AGAIN') return 'TEACH'; return 'PRACTICE'; }
  private static getDifficulty(code?: string): number { const complexity = (code?.match(/\b(if|elif|else|for|while|def|class|try|except)\b/g)?.length ?? 0); return Math.min(5, Math.max(1, 1 + Math.floor(complexity / 2))); }
}
