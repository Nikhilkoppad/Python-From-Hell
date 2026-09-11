import type {
  AIRoutingRecord,
  ModelCapability,
  SpecialistCategory,
} from '../types';
import { SpecialistSelector } from './SpecialistSelector';
import { OllamaClient } from './OllamaClient';

export interface RouteAIRequest {
  systemPrompt: string;
  userPrompt: string;
  categoryHint?: SpecialistCategory;
  temperature?: number;
  maxTokens?: number;
}

export interface RouteAIResponse {
  content: string;
  category: SpecialistCategory;
  modelUsed: string;
  providerUsed: string;
  fallbackChain: string[];
  latencyMs: number;
  success: boolean;
  error?: string;
  fromFallbackCatalog?: boolean;
}

export class AIRouter {
  private static client: OllamaClient = new OllamaClient();
  private static routingLogs: AIRoutingRecord[] = [];

  private static cachedModels: ModelCapability[] = [];
  private static lastDiscoveryTime = 0;
  private static readonly DISCOVERY_TTL_MS = 60000;

  public static setClient(client: OllamaClient): void {
    this.client = client;
  }

  public static getClient(): OllamaClient {
    return this.client;
  }

  public static async getAvailableModels(
    forceRefresh = false
  ): Promise<ModelCapability[]> {
    const now = Date.now();

    if (
      !forceRefresh &&
      this.cachedModels.length > 0 &&
      now - this.lastDiscoveryTime < this.DISCOVERY_TTL_MS
    ) {
      return this.cachedModels;
    }

    const health = await this.client.checkHealth();

    if (!health.online) {
      this.cachedModels = [];
      this.lastDiscoveryTime = now;
      return [];
    }

    const model: ModelCapability = {
      id: this.client.getModel(),
      name: this.client.getModel(),
      provider: 'ollama',
      category: 'CODING',
      contextWindow: 32768,
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: false,
      costTier: 'FREE',
      healthy: true,
      latencyMs: health.latencyMs,
      failureCount: 0,
    };

    this.cachedModels = [model];
    this.lastDiscoveryTime = now;

    return this.cachedModels;
  }

  public static async routeAI(
    request: RouteAIRequest
  ): Promise<RouteAIResponse> {
    const start = Date.now();

    const category =
      request.categoryHint ||
      SpecialistSelector.classifyTask(request.userPrompt);

    const fallbackChain = [`ollama/${this.client.getModel()}`];

    try {
      const health = await this.client.checkHealth();

      if (!health.online) {
        throw new Error(
          `Ollama is unavailable or model "${this.client.getModel()}" is not loaded`
        );
      }

      const messages = [
        {
          role: 'system' as const,
          content: request.systemPrompt,
        },
        {
          role: 'user' as const,
          content: request.userPrompt,
        },
      ];

      const { response, latencyMs } =
        await this.client.createChatCompletion(
          messages,
          request.temperature ?? 0.6,
          request.maxTokens ?? 512
        );

      const content = response.message?.content?.trim() || '';

      if (!content) {
        throw new Error('Ollama returned an empty response');
      }

      const record: AIRoutingRecord = {
        requestId: `req_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        category,
        selectedProvider: 'ollama',
        selectedModel: this.client.getModel(),
        fallbackChain: [...fallbackChain],
        latencyMs,
        success: true,
        promptTokens: response.prompt_eval_count,
        completionTokens: response.eval_count,
      };

      this.logRecord(record);

      return {
        content,
        category,
        modelUsed: this.client.getModel(),
        providerUsed: 'ollama',
        fallbackChain,
        latencyMs,
        success: true,
      };
    } catch (error: any) {
      const totalLatencyMs = Date.now() - start;
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Local Ollama execution failed';

      const failureRecord: AIRoutingRecord = {
        requestId: `req_fail_${Date.now()}`,
        timestamp: new Date().toISOString(),
        category,
        selectedProvider: 'ollama',
        selectedModel: this.client.getModel(),
        fallbackChain,
        latencyMs: totalLatencyMs,
        success: false,
        errorReason: errorMessage,
      };

      this.logRecord(failureRecord);

      return {
        content: '',
        category,
        modelUsed: this.client.getModel(),
        providerUsed: 'ollama',
        fallbackChain,
        latencyMs: totalLatencyMs,
        success: false,
        error: errorMessage,
      };
    }
  }

  private static logRecord(record: AIRoutingRecord): void {
    this.routingLogs.unshift(record);

    if (this.routingLogs.length > 100) {
      this.routingLogs.pop();
    }
  }

  public static getRoutingLogs(): AIRoutingRecord[] {
    return [...this.routingLogs];
  }

  public static clearRoutingLogs(): void {
    this.routingLogs = [];
  }
}