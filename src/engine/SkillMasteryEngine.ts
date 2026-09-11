import type { AttemptHistoryEntry, Skill, SkillEvidence, ChallengeType } from '../types/learning';

export class SkillMasteryEngine {
  public static createSkill(id: string, name: string, description: string, prerequisites: string[] = []): Skill { return { id, name, description, prerequisites, mastery: 0, masteryLevel: 'BEGINNER', evidence: this.createEmptyEvidence(), weak: false, unlocked: prerequisites.length === 0 }; }
  public static createEmptyEvidence(): SkillEvidence { return { attempts: 0, successes: 0, failures: 0, independentSuccesses: 0, assistedSuccesses: 0, hintsUsed: 0, predictSuccesses: 0, debugSuccesses: 0, buildSuccesses: 0, explainSuccesses: 0, recentErrors: [], lastAttemptAt: undefined }; }
  public static recordAttempt(skill: Skill, params: { passed: boolean; challengeType: ChallengeType; hintsUsed: number; errorType?: string; independent?: boolean }): Skill {
    const evidence: SkillEvidence = { ...skill.evidence, recentErrors: [...skill.evidence.recentErrors] };
    evidence.attempts += 1; evidence.lastAttemptAt = Date.now(); evidence.hintsUsed += params.hintsUsed;
    if (params.passed) { evidence.successes += 1; if (params.independent && params.hintsUsed === 0) evidence.independentSuccesses += 1; else evidence.assistedSuccesses += 1; }
    else { evidence.failures += 1; if (params.errorType) { evidence.recentErrors.push(params.errorType); if (evidence.recentErrors.length > 10) evidence.recentErrors.shift(); } }
    switch (params.challengeType) {
      case 'PREDICT': case 'TRACE': if (params.passed) evidence.predictSuccesses += 1; break;
      case 'DEBUG': case 'FIX': if (params.passed) evidence.debugSuccesses += 1; break;
      case 'BUILD': case 'BOSS': case 'REFACTOR': if (params.passed) evidence.buildSuccesses += 1; break;
      case 'EXPLAIN': if (params.passed) evidence.explainSuccesses += 1; break;
    }
    const mastery = this.calculateMastery(evidence);
    return { ...skill, evidence, mastery, masteryLevel: this.getMasteryLevel(evidence, mastery), weak: evidence.attempts >= 2 && (mastery < 45 || evidence.failures >= 3) };
  }
  public static evaluateTopic(attempts: AttemptHistoryEntry[] = []) {
    const successes = attempts.filter((attempt) => attempt.passed).length;
    const failures = attempts.length - successes;
    const hintsUsed = attempts.reduce((sum, attempt) => sum + Number(attempt.hintsUsed ?? 0), 0);
    const independentSuccesses = attempts.filter((attempt) => attempt.passed && attempt.independent).length;
    const accuracy = attempts.length ? successes / attempts.length : 0;
    return { attempts: attempts.length, successes, failures, hintsUsed, independentSuccesses, accuracy, mastery: Math.round(accuracy * 100), masteryLevel: attempts.length === 0 ? 'BEGINNER' : accuracy >= 0.85 ? 'MASTERED' : accuracy >= 0.7 ? 'STRONG' : accuracy >= 0.55 ? 'COMPETENT' : accuracy >= 0.35 ? 'DEVELOPING' : 'BEGINNER', status: attempts.length === 0 ? 'NOT_ASSESSED' : accuracy >= 0.85 ? 'MASTERED' : accuracy >= 0.7 ? 'STRONG' : accuracy >= 0.55 ? 'COMPETENT' : accuracy >= 0.35 ? 'DEVELOPING' : 'BEGINNER' };
  }
  public static calculateMastery(evidence: SkillEvidence): number {
    if (evidence.attempts === 0) return 0;
    const accuracy = evidence.successes / evidence.attempts;
    const independence = evidence.successes ? evidence.independentSuccesses / evidence.successes : 0;
    const consistency = evidence.attempts >= 5 ? this.calculateConsistency(evidence) : Math.min(1, evidence.attempts / 5);
    const variety = this.calculateChallengeVariety(evidence);
    const hintDependency = this.calculateHintDependency(evidence);
    return Math.round(Math.max(0, Math.min(100, accuracy * 35 + independence * 30 + consistency * 15 + variety * 20 - hintDependency * 15)));
  }
  public static getMasteryLevel(evidence: SkillEvidence, mastery: number) { if (evidence.attempts === 0) return 'BEGINNER' as const; if (mastery >= 85 && evidence.independentSuccesses >= 3 && this.calculateChallengeVariety(evidence) >= 0.5) return 'MASTERED' as const; if (mastery >= 70) return 'STRONG' as const; if (mastery >= 55) return 'COMPETENT' as const; if (mastery >= 35) return 'DEVELOPING' as const; return 'BEGINNER' as const; }
  public static isMastered(skill: Skill): boolean { return skill.masteryLevel === 'MASTERED'; }
  public static isWeak(skill: Skill): boolean { return skill.weak; }
  private static calculateConsistency(evidence: SkillEvidence): number { const window = Math.min(5, evidence.attempts); return window ? Math.max(0, (window - Math.min(window, evidence.recentErrors.length)) / window) : 0; }
  private static calculateChallengeVariety(evidence: SkillEvidence): number { return Math.min(1, (Number(evidence.predictSuccesses > 0) + Number(evidence.debugSuccesses > 0) + Number(evidence.buildSuccesses > 0) + Number(evidence.explainSuccesses > 0)) / 4); }
  private static calculateHintDependency(evidence: SkillEvidence): number { if (!evidence.attempts) return 0; return Math.min(1, evidence.hintsUsed / evidence.attempts / 3) * 0.5 + (evidence.successes ? Math.min(1, evidence.assistedSuccesses / evidence.successes) : 0) * 0.5; }
  public static getMasteryLabel(skill: Skill): string { return skill.masteryLevel; }
  public static getDiagnostic(skill: Skill): string { if (!skill.evidence.attempts) return `${skill.name}: no evidence yet.`; if (skill.weak) return `${skill.name}: weak. More guided practice required.`; if (skill.evidence.hintsUsed >= 3 && skill.evidence.assistedSuccesses > skill.evidence.independentSuccesses) return `${skill.name}: hint dependency detected.`; return `${skill.name}: ${skill.masteryLevel.toLowerCase()}.`; }
}
