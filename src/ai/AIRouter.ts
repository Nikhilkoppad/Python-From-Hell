import type { AIRoutingRecord, ModelCapability, SpecialistCategory } from '../types';
import { SpecialistSelector } from './SpecialistSelector';
import { OllamaClient } from './OllamaClient';

export interface RouteAIRequest {
  systemPrompt: string;
  userPrompt?: string;
  userMessage?: string;
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

  public static setClient(client: OllamaClient): void { this.client = client; }
  public static getClient(): OllamaClient { return this.client; }

  public static async getAvailableModels(forceRefresh = false): Promise<ModelCapability[]> {
    const now = Date.now();
    if (!forceRefresh && this.cachedModels.length > 0 && now - this.lastDiscoveryTime < this.DISCOVERY_TTL_MS) return this.cachedModels;
    const health = await this.client.checkHealth();
    if (!health.online) { this.cachedModels = []; this.lastDiscoveryTime = now; return []; }
    const model: ModelCapability = { id: this.client.getModel(), name: this.client.getModel(), provider: 'ollama', category: 'CODING', contextWindow: 32768, maxTokens: 4096, supportsStreaming: true, supportsVision: false, costTier: 'FREE', healthy: true, latencyMs: health.latencyMs, failureCount: 0 };
    this.cachedModels = [model];
    this.lastDiscoveryTime = now;
    return this.cachedModels;
  }

  public static async routeAI(request: RouteAIRequest): Promise<RouteAIResponse> {
    const start = Date.now();
    const userPrompt = request.userPrompt ?? request.userMessage ?? '';
    const category = request.categoryHint || SpecialistSelector.classifyTask(userPrompt);
    const fallbackChain = [`ollama/${this.client.getModel()}`];
    try {
      const health = await this.client.checkHealth();
      if (!health.online) throw new Error('Ollama is offline');
      const response = await this.client.createChatCompletion([
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: userPrompt },
      ], request.temperature ?? 0.6, request.maxTokens ?? 512);
      const content = response.response.message.content.trim();
      const result: RouteAIResponse = { content, category, modelUsed: this.client.getModel(), providerUsed: 'ollama', fallbackChain, latencyMs: response.latencyMs || Date.now() - start, success: Boolean(content) };
      this.routingLogs.push({ requestId: `route-${Date.now()}`, timestamp: new Date().toISOString(), category, selectedProvider: 'ollama', selectedModel: this.client.getModel(), fallbackChain, latencyMs: result.latencyMs, success: result.success });
      return result;
    } catch (error) {
      return { content: '', category, modelUsed: this.client.getModel(), providerUsed: 'ollama', fallbackChain, latencyMs: Date.now() - start, success: false, error: error instanceof Error ? error.message : String(error), fromFallbackCatalog: true };
    }
  }

  public static getRoutingLogs(): AIRoutingRecord[] { return [...this.routingLogs]; }
}
