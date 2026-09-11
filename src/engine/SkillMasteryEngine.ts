import type { Skill, SkillEvidence, ChallengeType } from '../types/learning';

export class SkillMasteryEngine {
  public static createSkill(id: string, name: string, description: string, prerequisites: string[] = []): Skill { return { id, name, description, prerequisites, mastery: 0, masteryLevel: 'BEGINNER', evidence: this.createEmptyEvidence(), weak: false, unlocked: prerequisites.length === 0 }; }
  public static createEmptyEvidence(): SkillEvidence { return { attempts: 0, successes: 0, failures: 0, independentSuccesses: 0, assistedSuccesses: 0, hintsUsed: 0, predictSuccesses: 0, debugSuccesses: 0, buildSuccesses: 0, explainSuccesses: 0, recentErrors: [], lastAttemptAt: undefined }; }
  public static evaluateTopic(attempts: Array<{ passed: boolean; hintsUsed?: number; independent?: boolean; errorType?: string; code?: string }> = []) {
    const evidence = this.createEmptyEvidence();
    evidence.attempts = attempts.length;
    evidence.successes = attempts.filter((attempt) => attempt.passed).length;
    evidence.failures = evidence.attempts - evidence.successes;
    evidence.independentSuccesses = attempts.filter((attempt) => attempt.passed && attempt.independent).length;
    evidence.assistedSuccesses = evidence.successes - evidence.independentSuccesses;
    evidence.hintsUsed = attempts.reduce((sum, attempt) => sum + Number(attempt.hintsUsed ?? 0), 0);
    evidence.recentErrors = attempts.filter((attempt) => !attempt.passed && attempt.errorType).map((attempt) => attempt.errorType as string).slice(-10);
    for (const attempt of attempts) {
      if (!attempt.passed) continue;
      const code = attempt.code ?? '';
      if (/\bprint\s*\(/.test(code)) evidence.buildSuccesses++;
      if (/\b(if|for|while|try|except)\b/.test(code)) evidence.debugSuccesses++;
      if (/\b(def|class)\b/.test(code)) evidence.explainSuccesses++;
      if (/\b(range|for|while)\b/.test(code)) evidence.predictSuccesses++;
    }
    const mastery = this.calculateMastery(evidence);
    return { masteryLevel: this.getMasteryLevel(evidence, mastery), mastery };
  }
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
  public static getDiagnostic(skill: Skill): string { if (!skill.evidence.attempts) return `${skill.name}: no evidence yet.`; if (skill.weak) return `${skill.name}: weak. More guided practice required.`; return `${skill.name}: ${skill.masteryLevel.toLowerCase()}.`; }
}
