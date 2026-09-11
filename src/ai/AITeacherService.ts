import { AIRouter } from './AIRouter';
import { LearnerContextManager } from './LearnerContextManager';
import type { LearningProfile } from '../types/learning';
import type { UserProgress } from '../types';

export type AITutorMode = 'HINT' | 'DEBUG' | 'EXPLAIN' | 'ROAST' | 'CHAT';
export interface AITutorRequest {
  mode: AITutorMode; lessonTitle?: string; lessonConcept?: string; concept?: string; code?: string; userCode?: string;
  terminalOutput?: string; runtimeError?: string | null; expectedOutput?: string; userQuery?: string;
  profile?: LearningProfile | UserProgress; progress?: LearningProfile | UserProgress; failureCount?: number; hintsThisAttempt?: number;
}
export interface AITeacherResponse {
  message: string; text?: string; source: 'LOCAL_OLLAMA' | 'LOCAL_FALLBACK'; mode?: AITutorMode; modelUsed?: string; providerUsed?: string; latencyMs?: number; category?: string;
  shouldTeach?: boolean; shouldDebug?: boolean; shouldRemoveScaffolding?: boolean;
}
export type AITutorResponse = AITeacherResponse;

export class AITeacherService {
  static async requestGuidance(request: AITutorRequest): Promise<AITeacherResponse> {
    const rawProfile = request.profile ?? request.progress;
    const profile = rawProfile as LearningProfile | undefined;
    const code = request.code ?? request.userCode ?? '';
    const concept = request.concept ?? request.lessonConcept ?? 'current Python concept';
    const lessonTitle = request.lessonTitle ?? 'Python lesson';
    const failureCount = request.failureCount ?? 0;
    const hintsThisAttempt = request.hintsThisAttempt ?? 0;
    const userMessage = LearnerContextManager.buildUserMessage({ mode: request.mode, lessonTitle, concept, code, terminalOutput: request.terminalOutput ?? '', runtimeError: request.runtimeError ?? '', expectedOutput: request.expectedOutput ?? '', userQuery: request.userQuery ?? '', failureCount, hintsThisAttempt });

    if (!profile) return this.fallback({ ...request, code, concept, lessonTitle, failureCount, hintsThisAttempt });
    const systemPrompt = LearnerContextManager.buildSystemPrompt(profile);
    try {
      const health = await AIRouter.getClient().checkHealth();
      if (!health.online) return this.fallback({ ...request, code, concept, lessonTitle, failureCount, hintsThisAttempt });
      const result = await AIRouter.routeAI({ systemPrompt, userPrompt: userMessage, temperature: request.mode === 'ROAST' ? 0.9 : 0.65, maxTokens: 700 });
      const message = result.content.trim();
      if (!message) return this.fallback({ ...request, code, concept, lessonTitle, failureCount, hintsThisAttempt });
      return { message, text: message, source: 'LOCAL_OLLAMA', mode: request.mode, modelUsed: result.modelUsed, providerUsed: result.providerUsed, latencyMs: result.latencyMs, category: result.category, shouldTeach: request.mode === 'DEBUG' || failureCount >= 2, shouldDebug: Boolean(request.runtimeError) || failureCount >= 2, shouldRemoveScaffolding: hintsThisAttempt === 0 && failureCount === 0 };
    } catch { return this.fallback({ ...request, code, concept, lessonTitle, failureCount, hintsThisAttempt }); }
  }

  private static fallback(request: AITutorRequest & { code?: string; concept?: string; lessonTitle?: string; failureCount?: number; hintsThisAttempt?: number }): AITeacherResponse {
    const code = request.code ?? ''; const concept = request.concept ?? 'current Python concept'; const failureCount = request.failureCount ?? 0; const hintsUsed = request.hintsThisAttempt ?? 0; let message: string;
    switch (request.mode) {
      case 'DEBUG': message = request.runtimeError ? `JARVIS // DEBUG\n\nRead the final traceback line first.\n\n${request.runtimeError}\n\nFind the failing line and fix the smallest broken assumption.` : 'JARVIS // DEBUG\n\nTrace inputs, variables, conditions, loops, and final output one step at a time.'; break;
      case 'EXPLAIN': message = `JARVIS // EXPLAIN\n\n${this.explainConcept(concept)}`; break;
      case 'ROAST': message = `JARVIS // ROAST\n\nYour code has achieved ${failureCount > 1 ? 'a suspiciously consistent failure pattern' : 'an impressive amount of confidence for so little evidence'}.\n\nTechnical observation: inspect the ${concept} logic before changing random lines.`; break;
      case 'CHAT': message = 'JARVIS // LOCAL MODE\n\nGemma is unavailable right now. Ask about the current Python concept and we will dissect it.'; break;
      default: message = this.hintConcept(concept, code, hintsUsed);
    }
    return { message, text: message, source: 'LOCAL_FALLBACK', mode: request.mode, modelUsed: 'local-fallback', providerUsed: 'ollama', shouldTeach: failureCount >= 2 || request.mode === 'EXPLAIN', shouldDebug: Boolean(request.runtimeError) || failureCount >= 2, shouldRemoveScaffolding: hintsUsed === 0 && failureCount === 0 };
  }

  private static hintConcept(concept: string, code: string, hintsUsed: number): string {
    const firstLine = code.split('\n')[0]?.trim();
    const hints: Record<string, string[]> = {
      'print()': ['Check exactly what you pass to print().', 'Verify the quotes and parentheses.', 'Display is not storage: inspect the value you are printing.'],
      variables: ['Trace the variable from assignment to use.', 'Check which value the name actually refers to.', 'Follow Python top-to-bottom before changing anything.'],
      strings: ['Check whether the value is text or a number.', 'Inspect quotation marks.', 'Think about concatenation versus numeric addition.'],
      conditionals: ['Read the condition as a yes/no question.', 'Check the comparison operator.', 'Trace which branch should execute.'],
      loops: ['Count the intended iterations.', 'Check range boundaries.', 'For while loops, identify what changes the condition.'],
      lists: ['Remember zero-based indexing.', 'Check whether you need an item or the entire list.', 'Inspect the index before rewriting the loop.'],
      functions: ['Check parameters and return values.', 'Separate print from return.', 'Trace the value entering and leaving the function.'],
    };
    const pool = hints[concept] ?? ['Read the error carefully before changing random lines.', 'Trace the values through the program one line at a time.', 'Find the smallest assumption your code is making.'];
    return `JARVIS // HINT\n\n${pool[Math.min(hintsUsed, pool.length - 1)]}${firstLine ? `\n\nObserved first line: ${firstLine}` : ''}`;
  }

  private static explainConcept(concept: string): string {
    const explanations: Record<string, string> = { 'print()': 'print() displays a value in the terminal. It does not store that value.', variables: 'A variable is a name referring to a value. Assignment with = binds that name to a value.', strings: 'A string is text represented by quotes. Python treats quoted text differently from numbers and variable names.', conditionals: 'Conditionals let Python choose a block based on whether a condition is True or False.', loops: 'Loops repeat work. for usually iterates over a sequence or range; while continues while its condition is true.', lists: 'A list is an ordered, mutable collection. Python uses zero-based indexing.', functions: 'A function packages reusable logic. Parameters receive input and return sends a result back.' };
    return explanations[concept] ?? `Start with the smallest definition of ${concept}, then connect it to the code in front of you.`;
  }
}
