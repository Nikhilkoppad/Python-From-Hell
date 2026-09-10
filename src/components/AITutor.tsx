import React, { useState, useEffect, useCallback } from 'react';
import type {
  UserProgress,
  LearningLanguage,
  RoastIntensity,
} from '../types';
import {
  AITeacherService,
  type AITeacherResponse,
} from '../ai/AITeacherService';
import { AIRouter } from '../ai/AIRouter';
import {
  Bot,
  Sparkles,
  Bug,
  Brain,
  Flame,
  Send,
  X,
  ShieldAlert,
} from 'lucide-react';

interface AITutorProps {
  progress: UserProgress;
  language: LearningLanguage | string;
  intensity: RoastIntensity | string;
  onClose: () => void;
  onHintRequest?: () => void;
  setHintsUsed?: (count: number) => void;
  currentErrorType?: string;
  lessonTitle?: string;
  lessonConcept?: string;
  userCode?: string;
  runtimeError?: string | null;
  terminalOutput?: string;
  expectedOutput?: string;
}

export const AITutor: React.FC<AITutorProps> = ({
  progress,
  language,
  onClose,
  onHintRequest,
  setHintsUsed,
  currentErrorType,
  lessonTitle = 'Python Lesson',
  lessonConcept = 'Current Concept',
  userCode = '',
  runtimeError = null,
  terminalOutput = '',
  expectedOutput = '',
}) => {
  const isHindi = language === 'HINDI';

  const [activeMode, setActiveMode] = useState<
    'HINT' | 'DEBUG' | 'EXPLAIN' | 'ROAST' | 'CHAT'
  >('HINT');

  const [customQuery, setCustomQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] =
    useState<AITeacherResponse | null>(null);

  const [gatewayStatus, setGatewayStatus] = useState<{
    online: boolean;
    latencyMs?: number;
    modelCount: number;
  }>({
    online: false,
    modelCount: 0,
  });

  const fetchGuidance = useCallback(
    async (
      mode:
        | 'HINT'
        | 'DEBUG'
        | 'EXPLAIN'
        | 'ROAST'
        | 'CHAT',
      query?: string
    ) => {
      setIsLoading(true);
      setActiveMode(mode);

      if (mode === 'HINT') {
        onHintRequest?.();

        setHintsUsed?.(
          (progress.aiTutor?.totalHintsProvided ?? 0) + 1
        );
      }

      try {
        const res =
          await AITeacherService.requestGuidance({
            progress,
            lessonTitle,
            lessonConcept,
            userCode,
            runtimeError,
            terminalOutput,
            expectedOutput,
            userQuery:
              query ||
              (mode === 'HINT'
                ? 'Give me a hint'
                : mode === 'DEBUG'
                  ? 'Why did my code fail?'
                  : mode === 'EXPLAIN'
                    ? 'Explain this concept'
                    : mode === 'ROAST'
                      ? 'Roast my attempt'
                      : 'Help me with this Python problem'),
            mode,
          });

        setResponse(res);
      } catch {
        setResponse({
          message: isHindi
            ? 'BC, AI connection me issue aaya. Local retry karo.'
            : 'Failed to reach the local AI tutor. Falling back to local diagnostic.',
          source: 'LOCAL_FALLBACK',
          modelUsed: 'local-fallback',
          providerUsed: 'local',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      expectedOutput,
      isHindi,
      lessonConcept,
      lessonTitle,
      onHintRequest,
      progress,
      runtimeError,
      setHintsUsed,
      terminalOutput,
      userCode,
    ]
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const health =
          await AIRouter.getClient().checkHealth();

        const models =
          await AIRouter.getAvailableModels();

        if (mounted) {
          setGatewayStatus({
            online: health.online,
            latencyMs: health.latencyMs,
            modelCount: models.length,
          });
        }
      } catch {
        if (mounted) {
          setGatewayStatus({
            online: false,
            modelCount: 0,
          });
        }
      }

      if (mounted) {
        await fetchGuidance(
          runtimeError ? 'DEBUG' : 'HINT'
        );
      }
    };

    void init();

    return () => {
      mounted = false;
    };
  }, [fetchGuidance, runtimeError]);

  const handleCustomSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!customQuery.trim() || isLoading) {
      return;
    }

    void fetchGuidance(
      'CHAT',
      customQuery.trim()
    );

    setCustomQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono">
      <div className="bg-slate-950 border-2 border-red-600/70 rounded-2xl max-w-2xl w-full shadow-[0_0_80px_rgba(220,38,38,0.35)] flex flex-col max-h-[90vh] overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-900/60 bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-400">
              <Bot className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wider">
                  JARVIS // HELL PROCTOR
                </h2>

                <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/50 border border-red-700 text-red-300 uppercase font-bold">
                  {isHindi ? 'DESI MODE' : 'ENGLISH'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                {isHindi
                  ? 'Galti batayega, roast karega, par seekha ke chhodega.'
                  : 'Brutal diagnosis, contextual hints, real Python mastery.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close AI Tutor"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOCAL AI STATUS */}
        <div className="px-6 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                gatewayStatus.online
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />

            <span className="text-slate-400">
              Local AI Engine:
            </span>

            <span
              className={
                gatewayStatus.online
                  ? 'text-emerald-400 font-bold'
                  : 'text-amber-400 font-semibold'
              }
            >
              {gatewayStatus.online
                ? `ONLINE (${gatewayStatus.modelCount} Local Model)`
                : 'OLLAMA OFFLINE / FAILSAFE'}
            </span>
          </div>

          {response?.modelUsed && (
            <div className="text-slate-500 text-[10px]">
              Active:{' '}
              <span className="text-slate-300 font-mono">
                {response.providerUsed
                  ? `${response.providerUsed}/`
                  : ''}
                {response.modelUsed}
              </span>

              {response.latencyMs
                ? ` (${response.latencyMs}ms)`
                : ''}
            </div>
          )}
        </div>

        {/* MODE SELECTOR */}
        <div className="px-6 py-3 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/40">

          <button
            onClick={() => void fetchGuidance('HINT')}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'HINT'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isHindi
                ? 'Hint Maang'
                : 'Actionable Hint'}
            </span>
          </button>

          <button
            onClick={() => void fetchGuidance('DEBUG')}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'DEBUG'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-red-300 hover:bg-slate-800'
            }`}
          >
            <Bug className="w-3.5 h-3.5 text-red-400" />
            <span>
              {isHindi
                ? 'Error Debug'
                : 'Debug Error'}
            </span>
          </button>

          <button
            onClick={() => void fetchGuidance('EXPLAIN')}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'EXPLAIN'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-blue-300 hover:bg-slate-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {isHindi
                ? 'Concept Samajh'
                : 'Explain Logic'}
            </span>
          </button>

          <button
            onClick={() => void fetchGuidance('ROAST')}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'ROAST'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-orange-300 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>
              {isHindi
                ? 'Roast Kar BC'
                : 'Savage Roast'}
            </span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">

          {currentErrorType && (
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-red-950/60 border border-red-900 text-red-300 text-xs">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />

              <span>
                Active Incident:{' '}
                <strong className="text-red-200">
                  {currentErrorType}
                </strong>
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />

              <p className="text-xs text-slate-400 animate-pulse font-mono">
                {isHindi
                  ? 'JARVIS tera code inspect karke roast ready kar raha hai...'
                  : 'Gemma 4 is analyzing your code and preparing guidance...'}
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">

              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-mono">
                {response?.message ||
                  (isHindi
                    ? 'BC, buttons click karke guidance le!'
                    : 'Select an option above to request AI guidance.')}
              </div>

              {response?.source === 'LOCAL_OLLAMA' && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    Specialist: {response.category}
                  </span>

                  <span className="text-emerald-400 font-semibold">
                    ⚡ Running locally via Gemma 4
                  </span>
                </div>
              )}

              {response?.source === 'LOCAL_FALLBACK' && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    Specialist: {response.category}
                  </span>

                  <span className="text-amber-400 font-semibold">
                    ⚠ Local rule-based fallback
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CUSTOM QUESTION */}
        <form
          onSubmit={handleCustomSubmit}
          className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2"
        >
          <input
            type="text"
            value={customQuery}
            onChange={(e) =>
              setCustomQuery(e.target.value)
            }
            placeholder={
              isHindi
                ? 'Kuch specific poochhna hai? Type kar...'
                : 'Ask a specific debugging or concept question...'
            }
            className="flex-1 bg-black border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={
              isLoading || !customQuery.trim()
            }
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black text-xs rounded-lg transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />

            <span>
              {isHindi ? 'Poochh' : 'Ask'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};