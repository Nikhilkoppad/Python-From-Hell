import type { ModelCapability, SpecialistCategory } from '../types';
import { ProviderHealthTracker } from './ProviderHealth';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  provider?: string;
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OmniRouteClient {
  private baseUrl: string;
  private defaultTimeoutMs: number;

  constructor(baseUrl?: string, timeoutMs: number = 12000) {
    const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_OMNIROUTE_URL;
    this.baseUrl = baseUrl || (typeof window !== 'undefined' && (window as any).__OMNIROUTE_URL__) || envUrl || 'http://localhost:8000';
    this.defaultTimeoutMs = timeoutMs;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  public async checkHealth(): Promise<{ online: boolean; latencyMs: number; details?: any }> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(async () => {
        return await fetch(`${this.baseUrl}/v1/health`, { method: 'GET', signal: controller.signal });
      });
      clearTimeout(timer);

      const latencyMs = Date.now() - start;
      if (res.ok) {
        const details = await res.json().catch(() => ({}));
        return { online: true, latencyMs, details };
      }
      return { online: false, latencyMs };
    } catch {
      return { online: false, latencyMs: Date.now() - start };
    }
  }

  public async discoverModels(): Promise<ModelCapability[]> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${this.baseUrl}/v1/models`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      }).catch(async () => {
        return await fetch(`${this.baseUrl}/models`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
      });
      clearTimeout(timer);

      if (!res.ok) {
        return this.getFallbackCatalog();
      }

      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.data || data.models || []);

      if (!Array.isArray(rawList) || rawList.length === 0) {
        return this.getFallbackCatalog();
      }

      return rawList.map((m: any) => this.mapRawModelToCapability(m));
    } catch {
      return this.getFallbackCatalog();
    }
  }

  private mapRawModelToCapability(raw: any): ModelCapability {
    const id = raw.id || raw.name || 'unknown-model';
    const name = raw.name || raw.display_name || id;
    const provider = raw.owned_by || raw.provider || this.inferProvider(id);
    const category = this.inferCategory(id, raw.capabilities);
    const health = ProviderHealthTracker.getStatus(provider, id);

    return {
      id,
      name,
      provider,
      category,
      contextWindow: raw.context_length || raw.context_window || 8192,
      maxTokens: raw.max_tokens || 4096,
      supportsStreaming: Boolean(raw.supports_streaming ?? true),
      supportsVision: Boolean(raw.supports_vision || id.includes('vision') || id.includes('4o')),
      costTier: raw.cost_tier || (id.includes('mini') || id.includes('flash') || id.includes('haiku') ? 'LOW' : 'HIGH'),
      healthy: health.healthy && Date.now() >= health.cooldownUntil,
      latencyMs: health.averageLatencyMs || undefined,
      failureCount: health.consecutiveFailures,
      cooldownUntil: health.cooldownUntil || undefined,
    };
  }

  private inferProvider(modelId: string): string {
    const lower = modelId.toLowerCase();
    if (lower.includes('gpt') || lower.includes('o1') || lower.includes('o3')) return 'openai';
    if (lower.includes('claude')) return 'anthropic';
    if (lower.includes('gemini')) return 'google';
    if (lower.includes('deepseek')) return 'deepseek';
    if (lower.includes('qwen')) return 'qwen';
    if (lower.includes('llama')) return 'meta';
    if (lower.includes('mistral')) return 'mistral';
    return 'omniroute';
  }

  private inferCategory(modelId: string, capabilities?: string[]): SpecialistCategory {
    const lower = modelId.toLowerCase();
    if (capabilities?.includes('vision') || lower.includes('vision')) return 'VISION';
    if (lower.includes('coder') || lower.includes('code') || lower.includes('python')) return 'CODING';
    if (lower.includes('o1') || lower.includes('o3') || lower.includes('reason') || lower.includes('r1')) return 'ARCHITECTURE_REASONING';
    if (lower.includes('mini') || lower.includes('flash') || lower.includes('haiku')) return 'FAST_SIMPLE';
    return 'GENERAL';
  }

  public getFallbackCatalog(): ModelCapability[] {
    return [
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder V2.5',
        provider: 'deepseek',
        category: 'CODING',
        costTier: 'LOW',
        healthy: true,
        failureCount: 0,
      },
      {
        id: 'qwen-2.5-coder-32b',
        name: 'Qwen 2.5 Coder 32B',
        provider: 'qwen',
        category: 'CODING',
        costTier: 'LOW',
        healthy: true,
        failureCount: 0,
      },
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        category: 'CODING',
        costTier: 'HIGH',
        healthy: true,
        failureCount: 0,
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        category: 'GENERAL',
        costTier: 'HIGH',
        healthy: true,
        failureCount: 0,
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'google',
        category: 'FAST_SIMPLE',
        costTier: 'LOW',
        healthy: true,
        failureCount: 0,
      },
      {
        id: 'claude-3-5-haiku',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        category: 'FAST_SIMPLE',
        costTier: 'LOW',
        healthy: true,
        failureCount: 0,
      },
    ];
  }

  public async createChatCompletion(
    req: ChatCompletionRequest,
    provider: string = 'omniroute'
  ): Promise<{ response: ChatCompletionResponse; latencyMs: number }> {
    const start = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.defaultTimeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(req),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const latencyMs = Date.now() - start;

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown network error');
        ProviderHealthTracker.recordFailure(provider, req.model, errorText, res.status);
        throw new Error(`OmniRoute error (${res.status}): ${errorText.substring(0, 120)}`);
      }

      const data: ChatCompletionResponse = await res.json();
      ProviderHealthTracker.recordSuccess(provider, req.model, latencyMs);
      return { response: data, latencyMs };
    } catch (err: any) {
      clearTimeout(timer);
      const msg = err.name === 'AbortError' ? 'Timeout (Gateway exceeded deadline)' : (err.message || 'Network failure');
      ProviderHealthTracker.recordFailure(provider, req.model, msg);
      throw new Error(msg);
    }
  }
}
