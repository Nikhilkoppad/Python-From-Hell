import type { EvaluationResult, LearningLanguage, RoastIntensity } from '../types';
import { RoastEngine } from './RoastEngine';

interface ExecutableChallenge {
  expectedOutput?: string;
  title?: string;
  requiredCodePatterns?: Array<{ pattern: string; explanation: string }>;
}

export class JudgmentEngine {
  public static evaluate(challenge: ExecutableChallenge, userCode: string, output: string, runtimeError: string): EvaluationResult {
    return this.evaluateExecution(userCode, output, challenge.expectedOutput ?? '', runtimeError || null, challenge.title ?? 'current challenge', 'APOCALYPSE', 0, challenge.requiredCodePatterns ?? [], 'HINDI');
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
    language: LearningLanguage = 'ENGLISH'
  ): EvaluationResult {
    const cleanOutput = output.trim();
    const cleanExpected = expectedOutput.trim();
    const missingRequirement = requiredCodePatterns.find((requirement) => !new RegExp(requirement.pattern).test(userCode));
    const errorType = missingRequirement ? 'REQUIRED_CONCEPT_MISSING' : runtimeError?.includes('timed out') ? 'TIMEOUT' : runtimeError?.match(/(?:SyntaxError|IndentationError|NameError|UnboundLocalError|TypeError|ValueError|ZeroDivisionError)/)?.[0] ?? (runtimeError ? 'RUNTIME_ERROR' : 'OUTPUT_MISMATCH');
    const generatedRoast = RoastEngine.generateRoast(errorType, runtimeError ?? '', { attemptCount: failureCount + 1, hintsUsed: 0 }, intensity, language);

    if (!runtimeError && cleanOutput === cleanExpected && !missingRequirement) {
      return { passed: true, userOutput: cleanOutput, roastMessage: generatedRoast.roast, explanation: 'Your code output matches the expected target perfectly.', fixHint: 'Proceed to the next task.', personaUsed: intensity };
    }

    return {
      passed: false,
      userOutput: cleanOutput,
      errorType,
      errorMessage: missingRequirement?.explanation || runtimeError || `Expected "${cleanExpected}", got "${cleanOutput}"`,
      roastMessage: generatedRoast.roast,
      explanation: missingRequirement ? `The output is not enough for this challenge: ${missingRequirement.explanation}` : runtimeError ? `${errorType}: Python could not complete this attempt in ${lessonTitle}. Read the traceback from top to bottom; the last line usually names the actual problem.` : `Attempt #${failureCount + 1} ran successfully, but its output did not match the target.`,
      fixHint: missingRequirement?.explanation || runtimeError ? generatedRoast.fix ?? 'Compare each output line, including spelling, spaces, and capitalization.' : 'Compare each output line, including spelling, spaces, and capitalization.',
      personaUsed: intensity,
    };
  }
}
