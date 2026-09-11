import type { EvaluationResult, LearningLanguage, RoastIntensity } from '../types';
import type { Challenge } from '../data/curriculum';
import { RoastEngine } from './RoastEngine';

export class JudgmentEngine {
  /**
   * Canonical execution evaluator.
   * Output matching and required-code-pattern checks are deterministic;
   * the AI layer is never responsible for deciding pass/fail.
   */
  public static evaluateExecution(
    _userCode: string,
    output: string,
    expectedOutput: string,
    runtimeError: string | null,
    lessonTitle: string,
    intensity: RoastIntensity,
    failureCount: number,
    requiredCodePatterns: Array<{ pattern: string; explanation: string }> = [],
    language: LearningLanguage = 'ENGLISH'
  ): EvaluationResult {
    const cleanOutput = output.trim();
    const cleanExpected = expectedOutput.trim();

    const missingRequirement = requiredCodePatterns.find(
      (requirement) => {
        try {
          return !new RegExp(requirement.pattern).test(_userCode);
        } catch {
          return true;
        }
      }
    );

    const errorType = missingRequirement
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

    if (!runtimeError && cleanOutput === cleanExpected && !missingRequirement) {
      return {
        passed: true,
        userOutput: cleanOutput,
        roastMessage: generatedRoast.roast,
        explanation: 'Your code output matches the expected target perfectly.',
        fixHint: 'Proceed to the next task.',
        personaUsed: intensity,
      };
    }

    return {
      passed: false,
      userOutput: cleanOutput,
      errorType,
      errorMessage: missingRequirement?.explanation || runtimeError || `Expected "${cleanExpected}", got "${cleanOutput}"`,
      roastMessage: generatedRoast.roast,
      explanation: missingRequirement
        ? `The output is not enough for this challenge: ${missingRequirement.explanation}`
        : runtimeError
          ? `${errorType}: Python could not complete this attempt in ${lessonTitle}. Read the traceback from top to bottom; the last line usually names the actual problem.`
          : `Attempt #${failureCount + 1} ran successfully, but its output did not match the target.`,
      fixHint: missingRequirement
        ? missingRequirement.explanation
        : runtimeError
          ? generatedRoast.fix ?? 'Compare each output line, including spelling, spaces, and capitalization.'
          : 'Compare each output line, including spelling, spaces, and capitalization.',
      personaUsed: intensity,
    };
  }

  /**
   * Backwards-compatible adapter for the legacy App call site.
   * It delegates immediately to the canonical evaluator instead of
   * maintaining a second judging implementation.
   */
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
      'HINDI'
    );
  }
}
