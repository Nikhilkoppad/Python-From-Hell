import type { EvaluationResult, LearningLanguage, RoastIntensity } from '../types';
import { RoastEngine } from './RoastEngine';
import type { ChallengeType } from '../types/learning';

interface ExecutableChallenge {
  expectedOutput?: string;
  title?: string;
  type?: ChallengeType;
  requiredCodePatterns?: Array<{ pattern: string; explanation: string }>;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isOutputOnlyCheat(userCode: string, expectedOutput: string, challengeType?: ChallengeType): boolean {
  if (!challengeType || !['BUILD', 'FIX', 'DEBUG'].includes(challengeType)) return false;
  const expected = expectedOutput.trim();
  if (!expected) return false;
  const normalized = userCode.trim().replace(/\s+/g, ' ');
  return new RegExp(`^print\\s*\\(\\s*["']${escapeRegExp(expected)}["']\\s*\\)$`).test(normalized);
}

export class JudgmentEngine {
  public static evaluate(challenge: ExecutableChallenge, userCode: string, output: string, runtimeError: string): EvaluationResult {
    return this.evaluateExecution(
      userCode,
      output,
      challenge.expectedOutput ?? '',
      runtimeError || null,
      challenge.title ?? 'current challenge',
      'APOCALYPSE',
      0,
      challenge.requiredCodePatterns ?? [],
      'HINDI',
      challenge.type
    );
  }

  public static evaluateExecution(
    userCode: string,
    output: string,
    expectedOutput: string,
    runtimeError: string | null,
    lessonTitle: string,
    intensity: RoastIntensity,
    failureCount: number,
    requiredCodePatterns: Array<{ pattern: string; explanation: string }> = [],
    language: LearningLanguage = 'ENGLISH',
    challengeType?: ChallengeType
  ): EvaluationResult {
    const cleanOutput = output.trim();
    const cleanExpected = expectedOutput.trim();

    let missingRequirement: { pattern: string; explanation: string } | undefined;
    for (const requirement of requiredCodePatterns) {
      try {
        if (!new RegExp(requirement.pattern, 'm').test(userCode)) {
          missingRequirement = requirement;
          break;
        }
      } catch {
        missingRequirement = requirement;
        break;
      }
    }

    const outputOnlyCheat = isOutputOnlyCheat(userCode, cleanExpected, challengeType);
    const errorType = outputOnlyCheat
      ? 'OUTPUT_ONLY_CHEAT'
      : missingRequirement
        ? 'REQUIRED_CONCEPT_MISSING'
        : runtimeError?.includes('timed out')
          ? 'TIMEOUT'
          : runtimeError?.match(/(?:SyntaxError|IndentationError|NameError|UnboundLocalError|TypeError|ValueError|ZeroDivisionError)/)?.[0]
            ?? (runtimeError ? 'RUNTIME_ERROR' : 'OUTPUT_MISMATCH');
    const generatedRoast = RoastEngine.generateRoast(
      errorType,
      runtimeError ?? '',
      { attemptCount: failureCount + 1, hintsUsed: 0 },
      intensity,
      language
    );

    if (!runtimeError && cleanOutput === cleanExpected && !missingRequirement && !outputOnlyCheat) {
      return {
        passed: true,
        userOutput: cleanOutput,
        roastMessage: generatedRoast.roast,
        explanation: 'Your code output matches the expected target perfectly.',
        fixHint: 'Proceed to the next task.',
        personaUsed: intensity,
      };
    }

    const message = outputOnlyCheat
      ? 'This solution only prints the expected answer. Demonstrate the requested Python logic instead of hard-coding the target output.'
      : missingRequirement?.explanation || runtimeError || `Expected "${cleanExpected}", got "${cleanOutput}"`;

    return {
      passed: false,
      userOutput: cleanOutput,
      errorType,
      errorMessage: message,
      roastMessage: generatedRoast.roast,
      explanation: outputOnlyCheat
        ? `The output is correct, but the solution does not demonstrate the required ${challengeType ?? 'challenge'} logic.`
        : missingRequirement
          ? `The output is not enough for this challenge: ${missingRequirement.explanation}`
          : runtimeError
            ? `${errorType}: Python could not complete this attempt in ${lessonTitle}. Read the traceback from top to bottom; the last line usually names the actual problem.`
            : `Attempt #${failureCount + 1} ran successfully, but its output did not match the target.`,
      fixHint: outputOnlyCheat
        ? 'Remove the hard-coded print and implement the behavior described by the challenge.'
        : missingRequirement?.explanation || runtimeError
          ? generatedRoast.fix ?? 'Compare each output line, including spelling, spaces, and capitalization.'
          : 'Compare each output line, including spelling, spaces, and capitalization.',
      personaUsed: intensity,
    };
  }
}
