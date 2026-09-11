import type { AttemptHistoryEntry, ChallengeType, MasteryLevel, Skill, SkillEvidence } from '../types/learning';

export class SkillMasteryEngine {
  public static createSkill(id: string, name: string, description: string, prerequisites: string[] = []): Skill {
    return { id, name, description, prerequisites, mastery: 0, masteryLevel: 'BEGINNER', evidence: this.createEmptyEvidence(), weak: false, unlocked: prerequisites.length === 0 };
  }

  public static createEmptyEvidence(): SkillEvidence {
    return { attempts: 0, successes: 0, failures: 0, independentSuccesses: 0, assistedSuccesses: 0, hintsUsed: 0, predictSuccesses: 0, debugSuccesses: 0, buildSuccesses: 0, explainSuccesses: 0, recentErrors: [], lastAttemptAt: undefined };
  }

  public static evaluateTopic(attempts: AttemptHistoryEntry[] = []): { masteryLevel: MasteryLevel; mastery: number } {
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
      case 'PREDICT': case 'TRACE': if (params.passed) evidence.predictSuccesses++; break;
      case 'DEBUG': case 'FIX': if (params.passed) evidence.debugSuccesses++; break;
      case 'BUILD': case 'BOSS': case 'REFACTOR': if (params.passed) evidence.buildSuccesses++; break;
      case 'EXPLAIN': if (params.passed) evidence.explainSuccesses++; break;
    }
    const mastery = this.calculateMastery(evidence);
    return { ...skill, evidence, mastery, masteryLevel: this.getMasteryLevel(evidence, mastery), weak: evidence.attempts >= 2 && (mastery < 45 || evidence.failures >= 3) };
  }

  public static calculateMastery(evidence: SkillEvidence): number {
    if (evidence.attempts === 0) return 0;
    const accuracy = evidence.successes / evidence.attempts;
    const independence = evidence.successes > 0 ? evidence.independentSuccesses / evidence.successes : 0;
    const consistency = evidence.attempts >= 5 ? this.calculateConsistency(evidence) : Math.min(1, evidence.attempts / 5);
    const variety = this.calculateChallengeVariety(evidence);
    const hintDependency = this.calculateHintDependency(evidence);
    return Math.round(Math.max(0, Math.min(100, accuracy * 35 + independence * 30 + consistency * 15 + variety * 20 - hintDependency * 15)));
  }

  public static getMasteryLevel(evidence: SkillEvidence, mastery: number): MasteryLevel {
    if (evidence.attempts === 0) return 'BEGINNER';
    if (mastery >= 85 && evidence.independentSuccesses >= 3 && this.calculateChallengeVariety(evidence) >= 0.5) return 'MASTERED';
    if (mastery >= 70) return 'STRONG';
    if (mastery >= 55) return 'COMPETENT';
    if (mastery >= 35) return 'DEVELOPING';
    return 'BEGINNER';
  }

  public static isMastered(skill: Skill): boolean { return skill.masteryLevel === 'MASTERED'; }
  public static isWeak(skill: Skill): boolean { return skill.weak; }
  private static calculateConsistency(evidence: SkillEvidence): number { const window = Math.min(5, evidence.attempts); return window === 0 ? 0 : Math.max(0, Math.min(1, (window - evidence.recentErrors.length) / window)); }
  private static calculateChallengeVariety(evidence: SkillEvidence): number { return Math.min(1, [evidence.predictSuccesses, evidence.debugSuccesses, evidence.buildSuccesses, evidence.explainSuccesses].filter((value) => value > 0).length / 4); }
  private static calculateHintDependency(evidence: SkillEvidence): number { if (evidence.attempts === 0) return 0; const averageHints = evidence.hintsUsed / evidence.attempts; const assistedRatio = evidence.successes > 0 ? evidence.assistedSuccesses / evidence.successes : 0; return Math.min(1, averageHints / 3) * 0.5 + Math.min(1, assistedRatio) * 0.5; }
  public static getMasteryLabel(skill: Skill): string { return skill.masteryLevel; }
  public static getDiagnostic(skill: Skill): string { const e = skill.evidence; if (!e.attempts) return `${skill.name}: no evidence yet.`; if (skill.weak) return `${skill.name}: weak. More guided practice required.`; if (skill.masteryLevel === 'MASTERED') return `${skill.name}: independently demonstrated across multiple challenge types.`; return `${skill.name}: still developing. Continue varied practice.`; }
}
