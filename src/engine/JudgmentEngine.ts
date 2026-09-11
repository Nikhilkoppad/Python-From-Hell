import type { EvaluationResult, LearningLanguage, RoastIntensity } from '../types';
import type { Challenge } from '../data/curriculum';
import { RoastEngine } from './RoastEngine';

export class JudgmentEngine {
  /**
   * Canonical execution evaluator.
   * Deterministic facts decide pass/fail; the AI layer is never authoritative.
   */
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
    challengeType?: Challenge['type']
  ): EvaluationResult {
    const cleanOutput = output.trim();
    const cleanExpected = expectedOutput.trim();
    const normalizedCode = userCode.trim();

    const missingRequirement = requiredCodePatterns.find((requirement) => {
      try {
        return !new RegExp(requirement.pattern, 'm').test(userCode);
      } catch {
        return true;
      }
    });

    // BUILD/FIX/DEBUG tasks must demonstrate a solution, not merely print the
    // expected answer. This blocks the simplest output-only cheating path.
    const outputOnlyCheat = ['BUILD', 'FIX', 'DEBUG'].includes(String(challengeType))
      && new RegExp(`^\\s*print\\s*\\(\\s*[\"']${escapeRegExp(cleanExpected)}[\"']\\s*\\)\\s*$`, 'i').test(normalizedCode);

    const errorType = missingRequirement
      ? 'REQUIRED_CONCEPT_MISSING'
      : outputOnlyCheat
        ? 'OUTPUT_ONLY_CHEAT'
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
        explanation: 'Deterministic checks passed: the execution output matches the expected target and the required solution evidence is present.',
        fixHint: 'Proceed to the next task.',
        personaUsed: intensity,
      };
    }

    const failureMessage = missingRequirement?.explanation
      ?? (outputOnlyCheat ? 'Printing the expected answer is not a valid solution for this challenge. Implement or repair the requested logic.' : null)
      ?? runtimeError
      ?? `Expected "${cleanExpected}", got "${cleanOutput}"`;

    return {
      passed: false,
      userOutput: cleanOutput,
      errorType,
      errorMessage: failureMessage,
      roastMessage: generatedRoast.roast,
      explanation: missingRequirement
        ? `The output is not enough for this challenge: ${missingRequirement.explanation}`
        : outputOnlyCheat
          ? 'The answer was reproduced directly instead of demonstrating the requested coding skill.'
          : runtimeError
            ? `${errorType}: Python could not complete this attempt in ${lessonTitle}. Read the traceback from top to bottom; the last line usually names the actual problem.`
            : `Attempt #${failureCount + 1} ran successfully, but its output did not match the target.`,
      fixHint: missingRequirement
        ? missingRequirement.explanation
        : outputOnlyCheat
          ? 'Use the starter code and implement the requested behavior instead of hard-coding the expected output.'
          : runtimeError
            ? generatedRoast.fix ?? 'Compare each output line, including spelling, spaces, and capitalization.'
            : 'Compare each output line, including spelling, spaces, and capitalization.',
      personaUsed: intensity,
    };
  }

  /** Backwards-compatible adapter for the legacy App call site. */
  public static evaluate(
    challenge: Challenge,
    userCode: string,
    output: string,
    runtimeError: string | null
  ): EvaluationResult {
    return this.evaluateExecution(
      userCode,
      output,
      challenge.expectedOutput,
      runtimeError,
      challenge.title ?? challenge.instruction,
      'APOCALYPSE',
      0,
      challenge.requiredCodePatterns ?? [],
      'HINDI',
      challenge.type
    );
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
