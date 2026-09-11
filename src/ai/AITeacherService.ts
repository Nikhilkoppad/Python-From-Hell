import { AIRouter } from './AIRouter';
import { LearnerContextManager } from './LearnerContextManager';
import type { LearningProfile } from '../types/learning';

export type AITutorMode = 'HINT' | 'DEBUG' | 'EXPLAIN' | 'ROAST' | 'CHAT';

export interface AITutorRequest {
  mode: AITutorMode;
  lessonTitle?: string;
  concept?: string;
  code?: string;
  lessonConcept?: string;
  userCode?: string;
  terminalOutput?: string;
  runtimeError?: string | null;
  expectedOutput?: string;
  userQuery?: string;
  profile?: LearningProfile;
  progress?: LearningProfile;
  failureCount?: number;
  hintsThisAttempt?: number;
}

export interface AITeacherResponse {
  message: string;
  /** Compatibility alias for older UI code. */
  text?: string;
  source: 'LOCAL_OLLAMA' | 'LOCAL_FALLBACK';
  mode: AITutorMode;
  shouldTeach?: boolean;
  shouldDebug?: boolean;
  shouldRemoveScaffolding?: boolean;
}

export class AITeacherService {
  static async requestGuidance(request: AITutorRequest): Promise<AITeacherResponse> {
    const profile = request.profile ?? request.progress;
    const lessonTitle = request.lessonTitle ?? 'Python Lesson';
    const concept = request.concept ?? request.lessonConcept ?? 'Current Concept';
    const code = request.code ?? request.userCode ?? '';
    const terminalOutput = request.terminalOutput ?? '';
    const runtimeError = request.runtimeError ?? '';
    const expectedOutput = request.expectedOutput ?? '';
    const userQuery = request.userQuery ?? '';
    const failureCount = request.failureCount ?? 0;
    const hintsThisAttempt = request.hintsThisAttempt ?? 0;

    const systemPrompt = LearnerContextManager.buildSystemPrompt(profile as any);
    const userPrompt = this.buildUserPrompt({ mode: request.mode, lessonTitle, concept, code, terminalOutput, runtimeError, expectedOutput, userQuery, failureCount, hintsThisAttempt });

    try {
      const healthy = await AIRouter.getClient().checkHealth();
      if (!healthy.online) return this.fallback(request);
      const result = await AIRouter.routeAI({ systemPrompt, userPrompt, temperature: request.mode === 'ROAST' ? 0.9 : 0.65, maxTokens: 700 });
      if (!result.content) return this.fallback(request);
      return {
        message: result.content,
        text: result.content,
        source: 'LOCAL_OLLAMA',
        mode: request.mode,
        shouldTeach: request.mode === 'DEBUG' || failureCount >= 2,
        shouldDebug: Boolean(runtimeError) || failureCount >= 2,
        shouldRemoveScaffolding: hintsThisAttempt === 0 && failureCount === 0,
      };
    } catch {
      return this.fallback(request);
    }
  }

  private static buildUserPrompt(input: { mode: AITutorMode; lessonTitle: string; concept: string; code: string; terminalOutput: string; runtimeError: string; expectedOutput: string; userQuery: string; failureCount: number; hintsThisAttempt: number }): string {
    return `JARVIS // HELL PROCTOR\nMODE: ${input.mode}\nLESSON: ${input.lessonTitle}\nCONCEPT: ${input.concept}\nFAILURES: ${input.failureCount}\nHINTS THIS ATTEMPT: ${input.hintsThisAttempt}\n\nCODE:\n${input.code || '(empty)'}\n\nEXPECTED OUTPUT:\n${input.expectedOutput || '(not supplied)'}\n\nTERMINAL:\n${input.terminalOutput || '(nothing)'}\n\nRUNTIME ERROR:\n${input.runtimeError || '(none)'}\n\nLEARNER REQUEST:\n${input.userQuery || '(none)'}\n\nTeach the concept simply, diagnose deterministic evidence first, give one useful next step, and use brutal humor without becoming vague.`;
  }

  private static fallback(request: AITutorRequest): AITeacherResponse {
    const mode = request.mode;
    const messages: Record<AITutorMode, string> = {
      HINT: 'Read the error/output first. Identify what Python actually did before changing the code.',
      DEBUG: 'Start at the traceback. Find the final exception line, then trace upward to the line that caused it.',
      EXPLAIN: `Break ${request.concept ?? request.lessonConcept ?? 'this concept'} into one rule, one example, and one mistake to avoid.`,
      ROAST: 'Your code has entered the evidence locker. Fix the smallest incorrect assumption first.',
      CHAT: 'Ask me one specific Python question and we will attack it step by step.',
    };
    return { message: messages[mode], text: messages[mode], source: 'LOCAL_FALLBACK', mode, shouldTeach: mode !== 'ROAST', shouldDebug: mode === 'DEBUG' || Boolean(request.runtimeError) };
  }
}
