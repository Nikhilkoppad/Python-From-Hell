import { AIRouter } from './AIRouter';
import { LearnerContextManager } from './LearnerContextManager';
import type { LearningProfile } from '../types/learning';

export type AITutorMode = 'HINT' | 'DEBUG' | 'EXPLAIN' | 'ROAST' | 'CHAT';
export interface AITutorRequest { mode: AITutorMode; lessonTitle?: string; concept?: string; code?: string; lessonConcept?: string; userCode?: string; terminalOutput?: string; runtimeError?: string | null; expectedOutput?: string; userQuery?: string; profile?: LearningProfile; progress?: LearningProfile; failureCount?: number; hintsThisAttempt?: number; }
export interface AITeacherResponse { message: string; text?: string; source: 'LOCAL_OLLAMA' | 'LOCAL_FALLBACK'; mode?: AITutorMode; modelUsed?: string; providerUsed?: string; latencyMs?: number; category?: string; shouldTeach?: boolean; shouldDebug?: boolean; shouldRemoveScaffolding?: boolean; }

export class AITeacherService {
  static async requestGuidance(request: AITutorRequest): Promise<AITeacherResponse> {
    const profile = request.profile ?? request.progress;
    const lessonTitle = request.lessonTitle ?? 'Python Lesson';
    const concept = request.concept ?? request.lessonConcept ?? 'Current Concept';
    const code = request.code ?? request.userCode ?? '';
    const terminalOutput = request.terminalOutput ?? '';
    const runtimeError = request.runtimeError ?? '';
    const expectedOutput = request.expectedOutput ?? '';
    const failureCount = request.failureCount ?? 0;
    const hintsThisAttempt = request.hintsThisAttempt ?? 0;
    const systemPrompt = LearnerContextManager.buildSystemPrompt(profile);
    const userPrompt = `JARVIS // HELL PROCTOR\nMODE: ${request.mode}\nLESSON: ${lessonTitle}\nCONCEPT: ${concept}\nFAILURES: ${failureCount}\nHINTS: ${hintsThisAttempt}\nCODE:\n${code || '(empty)'}\nTERMINAL:\n${terminalOutput || '(nothing)'}\nERROR:\n${runtimeError || '(none)'}\nEXPECTED:\n${expectedOutput || '(not supplied)'}\nREQUEST:\n${request.userQuery || '(none)'}\n\nTeach simply, diagnose deterministic evidence first, then give one useful next step.`;
    try {
      const health = await AIRouter.getClient().checkHealth();
      if (!health.online) return this.fallback(request);
      const result = await AIRouter.routeAI({ systemPrompt, userPrompt, temperature: request.mode === 'ROAST' ? 0.9 : 0.65, maxTokens: 700 });
      if (!result.content) return this.fallback(request);
      return { message: result.content, text: result.content, source: 'LOCAL_OLLAMA', mode: request.mode, modelUsed: result.modelUsed, providerUsed: result.providerUsed, latencyMs: result.latencyMs, category: result.category, shouldTeach: request.mode === 'DEBUG' || failureCount >= 2, shouldDebug: Boolean(runtimeError) || failureCount >= 2, shouldRemoveScaffolding: hintsThisAttempt === 0 && failureCount === 0 };
    } catch { return this.fallback(request); }
  }
  private static fallback(request: AITutorRequest): AITeacherResponse {
    const messages: Record<AITutorMode, string> = { HINT: 'Read the error/output first. Identify what Python actually did before changing the code.', DEBUG: 'Start at the traceback. Find the final exception line, then trace upward.', EXPLAIN: `Break ${request.concept ?? request.lessonConcept ?? 'this concept'} into one rule, one example, and one common mistake.`, ROAST: 'Your code is now evidence. Fix the smallest incorrect assumption first.', CHAT: 'Ask one specific Python question and we will attack it step by step.' };
    const message = messages[request.mode];
    return { message, text: message, source: 'LOCAL_FALLBACK', mode: request.mode, shouldTeach: request.mode !== 'ROAST', shouldDebug: request.mode === 'DEBUG' || Boolean(request.runtimeError) };
  }
}
