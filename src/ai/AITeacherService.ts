import { AIRouter } from "./AIRouter";
import { LearnerContextManager } from "./LearnerContextManager";
import { RoastEngine } from "../engine/RoastEngine";
import type { LearningProfile } from "../types/learning";

export type AITutorMode =
  | "HINT"
  | "DEBUG"
  | "EXPLAIN"
  | "ROAST"
  | "CHAT";

export interface AITutorRequest {
  mode: AITutorMode;
  lessonTitle: string;
  concept: string;
  code: string;
  terminalOutput?: string;
  runtimeError?: string;
  expectedOutput?: string;
  userQuery?: string;
  profile?: LearningProfile;
  failureCount?: number;
  hintsThisAttempt?: number;
}

export interface AITutorResponse {
  message: string;
  source: "LOCAL_OLLAMA" | "LOCAL_FALLBACK";
  mode: AITutorMode;
  shouldTeach?: boolean;
  shouldDebug?: boolean;
  shouldRemoveScaffolding?: boolean;
}

/**
 * JARVIS / HELL PROCTOR
 *
 * This service is deliberately kept provider-agnostic.
 * AIRouter handles the actual local AI connection.
 *
 * The important difference from the old tutor is that JARVIS receives
 * learning evidence, not just the user's code.
 */
export class AITeacherService {
  static async requestGuidance(
    request: AITutorRequest
  ): Promise<AITutorResponse> {
    const {
      mode,
      lessonTitle,
      concept,
      code,
      terminalOutput = "",
      runtimeError = "",
      expectedOutput = "",
      userQuery = "",
      profile,
      failureCount = 0,
      hintsThisAttempt = 0,
    } = request;

    const systemPrompt =
      LearnerContextManager.buildSystemPrompt(
        profile as any
      );

    const userMessage = this.buildEnhancedUserMessage({
      mode,
      lessonTitle,
      concept,
      code,
      terminalOutput,
      runtimeError,
      expectedOutput,
      userQuery,
      profile,
      failureCount,
      hintsThisAttempt,
    });

    try {
      const router = AIRouter.getClient();

      const healthy = await router.checkHealth();

      if (!healthy) {
        return this.fallback(request);
      }

      const result = await AIRouter.routeAI({
        systemPrompt,
        userMessage,
        temperature: mode === "ROAST" ? 0.9 : 0.65,
        maxTokens: 700,
      });

      const message =
        result?.content?.trim();

      if (!message) {
        return this.fallback(request);
      }

      return {
        message,
        source: "LOCAL_OLLAMA",
        mode,
        shouldTeach:
          mode === "DEBUG" ||
          failureCount >= 2,

        shouldDebug:
          Boolean(runtimeError) ||
          failureCount >= 2,

        shouldRemoveScaffolding:
          hintsThisAttempt === 0 &&
          failureCount === 0,
      };
    } catch {
      return this.fallback(request);
    }
  }

  /**
   * Richer context than the previous tutor.
   *
   * JARVIS should know:
   * - what the learner is studying
   * - what they attempted
   * - how many times they failed
   * - how many hints they used
   * - what Python actually reported
   * - what the learner is asking
   */
  private static buildEnhancedUserMessage(
    request: AITutorRequest
  ): string {
    const {
      mode,
      lessonTitle,
      concept,
      code,
      terminalOutput,
      runtimeError,
      expectedOutput,
      userQuery,
      profile,
      failureCount,
      hintsThisAttempt,
    } = request;

    const weakTopics =
      profile?.skills
        ?.filter((skill) => skill.weak)
        .map((skill) => skill.name)
        .join(", ") || "none recorded";

    const misconceptions =
      profile?.skills
        ?.flatMap((skill) =>
          skill.evidence.recentErrors
        )
        .slice(-8)
        .join(", ") || "none recorded";

    return `
JARVIS // HELL PROCTOR

MODE:
${mode}

CURRENT LESSON:
${lessonTitle}

CURRENT CONCEPT:
${concept}

LEARNER CODE:
---CODE---
${code || "(empty)"}
---END CODE---

EXPECTED OUTPUT:
${expectedOutput || "(not supplied)"}

TERMINAL OUTPUT:
${terminalOutput || "(nothing)"}

RUNTIME ERROR:
${runtimeError || "(none)"}

FAILURES THIS ATTEMPT:
${failureCount}

HINTS USED THIS ATTEMPT:
${hintsThisAttempt}

KNOWN WEAK TOPICS:
${weakTopics}

RECENT MISCONCEPTIONS:
${misconceptions}

LEARNER QUERY:
${userQuery || "(none)"}

BEHAVIOR RULES:

1. Do NOT immediately dump the final solution.
2. Diagnose the learner's actual mistake first.
3. If they made a syntax mistake, explain the syntax.
4. If they made a conceptual mistake, teach the concept differently.
5. If the same mistake appears repeatedly, explicitly point out the pattern.
6. If they have failed 3 or more times, stop simply saying "try again".
   Give a tiny targeted teaching intervention.
7. If they solved independently, acknowledge the independence.
8. If they are abusing hints, reduce scaffolding.
9. DEBUG mode should focus on the traceback and root cause.
10. HINT mode should give the smallest useful nudge.
11. EXPLAIN mode should teach the concept clearly.
12. ROAST mode may be brutal and sarcastic, but the roast must target
    the coding behavior, not random nonsense.
13. CHAT mode should answer naturally while remaining in character.
14. Never sacrifice technical correctness for comedy.
15. Never pretend code works when it does not.

PERSONALITY:

You are JARVIS // HELL PROCTOR.

You are an extremely sharp Python mentor with brutal Indian-style
sarcasm and dark technical humor.

You are not a generic motivational chatbot.

Your job is to turn the learner into someone who can actually code
without depending on AI.

Be funny.
Be ruthless.
Be technically correct.
Be varied.

Do not repeat the same insult every response.

The learner should feel:
"JARVIS is roasting me, but somehow I actually understand Python now."

Now respond in the requested mode.
`.trim();
  }

  /**
   * Local fallback when Ollama/Gemma is unavailable.
   *
   * The application remains usable even without the AI server.
   */
  private static fallback(
    request: AITutorRequest
  ): AITutorResponse {
    const {
      mode,
      concept,
      code,
      runtimeError,
      failureCount = 0,
      hintsThisAttempt = 0,
    } = request;

    let message = "";

    switch (mode) {
      case "DEBUG":
        message = this.debugFallback(
          concept,
          code,
          runtimeError,
          failureCount
        );
        break;

      case "EXPLAIN":
        message = this.explainFallback(
          concept
        );
        break;

      case "ROAST":
        message = this.roastFallback(
          code,
          failureCount
        );
        break;

      case "CHAT":
        message =
          "JARVIS // LOCAL MODE\n\n" +
          "Gemma is currently unavailable, so I'm running on local rules. " +
          "Ask me about the current Python concept and we'll dissect it.";
        break;

      case "HINT":
      default:
        message = this.hintFallback(
          concept,
          code,
          hintsThisAttempt
        );
        break;
    }

    return {
      message,
      source: "LOCAL_FALLBACK",
      mode,

      shouldTeach:
        failureCount >= 2 ||
        mode === "EXPLAIN",

      shouldDebug:
        Boolean(runtimeError) ||
        failureCount >= 2,

      shouldRemoveScaffolding:
        hintsThisAttempt === 0 &&
        failureCount === 0,
    };
  }

  private static hintFallback(
    concept: string,
    code: string,
    hintsUsed: number
  ): string {
    const hints: Record<string, string[]> = {
      "print()": [
        "Look at what you are passing into print().",
        "Python can only display what you actually give it.",
        "Check the quotes and parentheses before touching anything else.",
      ],

      variables: [
        "Check which variable actually stores the value you need.",
        "Trace the variable from its assignment to the print statement.",
        "Python executes your assignments from top to bottom.",
      ],

      strings: [
        "Check whether you are working with text or numbers.",
        "Look at your quotation marks.",
        "If you need to combine text, think about string concatenation.",
      ],

      conditionals: [
        "Read your condition as a yes/no question.",
        "Check whether the comparison operator matches the requirement.",
        "Trace which branch Python should enter.",
      ],

      loops: [
        "Count how many times the loop should execute.",
        "Check the range boundaries.",
        "For a while loop, ask yourself what changes the condition.",
      ],

      lists: [
        "Remember: Python indexes from zero.",
        "Check the index carefully.",
        "Ask yourself whether you want the item or the entire list.",
      ],

      functions: [
        "Check the parameters and the value being returned.",
        "A function can calculate something without automatically displaying it.",
        "Look for the difference between print and return.",
      ],

      exceptions: [
        "Read the final line of the traceback first.",
        "Identify the exception type before changing code.",
        "Don't blindly catch every exception. Find the actual failure.",
      ],

      "classes and objects": [
        "Separate the class blueprint from the object created from it.",
        "Check whether the instance method receives self.",
        "Trace which object's attribute or method you are accessing.",
      ],
    };

    const pool =
      hints[concept] ?? [
        "Read the error carefully before changing random lines.",
        "Trace the values through the program one line at a time.",
        "Find the smallest assumption your code is making.",
      ];

    return (
      "JARVIS // HINT\n\n" +
      pool[Math.min(hintsUsed, pool.length - 1)]
    );
  }

  private static debugFallback(
    concept: string,
    code: string,
    runtimeError: string,
    failureCount: number
  ): string {
    if (runtimeError) {
      return `
JARVIS // DEBUG MODE

The program gave you an error.

Start with the traceback instead of performing random keyboard surgery.

ERROR:
${runtimeError}

Concept:
${concept}

Failures:
${failureCount}

First question:
What exact line did Python identify as the failure?

Second question:
What does the exception type actually mean?

Do not rewrite the entire program.
Fix the smallest broken assumption first.
      `.trim();
    }

    if (!code.trim()) {
      return `
JARVIS // DEBUG MODE

There is currently no code to diagnose.

You magnificent disaster, give Python something to execute first.
      `.trim();
    }

    return `
JARVIS // DEBUG MODE

No runtime traceback was provided.

That means we need to inspect behavior rather than blindly hunting
syntax ghosts.

Concept:
${concept}

Start by tracing:
1. Inputs
2. Variable values
3. Condition results
4. Loop iterations
5. Final output

One line at a time.
      `.trim();
  }

  private static explainFallback(
    concept: string
  ): string {
    const explanations: Record<string, string> = {
      "print()":
        "print() displays a value in the terminal. It does not store the value.",

      variables:
        "A variable is a name referring to a value. Assignment with = makes that name refer to the value.",

      strings:
        "A string is text. Python recognizes string literals because they are surrounded by quotes.",

      conditionals:
        "Conditionals let Python choose which block of code to execute based on a True or False condition.",

      loops:
        "Loops repeat a block of code. A for loop commonly iterates over a sequence or range, while a while loop continues while its condition is true.",

      lists:
        "A list is an ordered, mutable collection. Python uses zero-based indexing, so the first item is at index 0.",

      functions:
        "A function packages reusable logic. Parameters provide input and return sends a result back to the caller.",

      exceptions:
        "Exceptions represent problems during execution. try and except let you handle expected failures without crashing the program.",

      "classes and objects":
        "A class defines a blueprint for objects. An object is an instance of that class.",
    };

    return `
JARVIS // TEACHING MODE

${explanations[concept] ??
      `Let's break down ${concept} from first principles.`}

Now explain the concept back to yourself without looking at the code.
If you cannot explain it, you do not own it yet.
    `.trim();
  }

  private static roastFallback(
    code: string,
    failureCount: number
  ): string {
    if (!code.trim()) {
      return (
        "JARVIS // ROAST MODE\n\n" +
        "There is no code here. Even Python can't debug a blank screen."
      );
    }

    const roasts = [
      "Your code has confidence. Unfortunately, it has no supporting evidence.",
      "Python didn't betray you. Your indentation did.",
      "This program is not broken. It is simply expressing strong disagreement with your logic.",
      "I have inspected the code. The good news is that Python is still innocent.",
      "That solution was ambitious. The execution, however, filed a complaint.",
      "You didn't debug the program. You negotiated with it. Python declined.",
      "Somewhere in this code is a perfectly good idea hiding under several questionable decisions.",
    ];

    const roast =
      roasts[
        Math.min(
          Math.max(failureCount, 0),
          roasts.length - 1
        )
      ];

    return `JARVIS // ROAST MODE\n\n${roast}`;
  }
}