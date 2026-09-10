export interface HealthStatus {
  provider: string;
  modelId: string;
  healthy: boolean;
  consecutiveFailures: number;
  lastFailureReason?: string;
  cooldownUntil: number;
  averageLatencyMs: number;
  totalRequests: number;
  successfulRequests: number;
}

export class ProviderHealthTracker {
  private static healthMap: Map<string, HealthStatus> = new Map();
  private static providerGroups: Map<string, string> = new Map([
    ['openai-gpt-4o', 'openai'],
    ['openai-gpt-4o-mini', 'openai'],
    ['openai-o1', 'openai'],
    ['openai-o3-mini', 'openai'],
    ['anthropic-claude-3-5-sonnet', 'anthropic'],
    ['anthropic-claude-3-5-haiku', 'anthropic'],
    ['google-gemini-2.0-flash', 'google'],
    ['google-gemini-1.5-pro', 'google'],
    ['deepseek-coder', 'deepseek'],
    ['deepseek-chat', 'deepseek'],
    ['qwen-coder', 'qwen'],
  ]);

  private static DEFAULT_COOLDOWN_MS = 45000; // 45 seconds
  private static RATE_LIMIT_COOLDOWN_MS = 60000; // 60 seconds

  private static getKey(provider: string, modelId: string): string {
    return `${provider}:${modelId}`.toLowerCase();
  }

  public static getStatus(provider: string, modelId: string): HealthStatus {
    const key = this.getKey(provider, modelId);
    let status = this.healthMap.get(key);
    if (!status) {
      status = {
        provider,
        modelId,
        healthy: true,
        consecutiveFailures: 0,
        cooldownUntil: 0,
        averageLatencyMs: 0,
        totalRequests: 0,
        successfulRequests: 0,
      };
      this.healthMap.set(key, status);
    }
    return status;
  }

  public static isAvailable(provider: string, modelId: string): boolean {
    const status = this.getStatus(provider, modelId);
    if (Date.now() < status.cooldownUntil) {
      return false;
    }
    return status.healthy || status.consecutiveFailures < 3;
  }

  public static recordSuccess(provider: string, modelId: string, latencyMs: number): void {
    const status = this.getStatus(provider, modelId);
    status.healthy = true;
    status.consecutiveFailures = 0;
    status.cooldownUntil = 0;
    status.totalRequests += 1;
    status.successfulRequests += 1;
    status.averageLatencyMs = status.averageLatencyMs === 0
      ? latencyMs
      : Math.round((status.averageLatencyMs * 0.7) + (latencyMs * 0.3));
  }

  public static recordFailure(
    provider: string,
    modelId: string,
    errorReason: string,
    httpStatus?: number
  ): void {
    const status = this.getStatus(provider, modelId);
    status.consecutiveFailures += 1;
    status.totalRequests += 1;
    status.lastFailureReason = errorReason;

    const isRateLimit = httpStatus === 429 || errorReason.toLowerCase().includes('quota') || errorReason.toLowerCase().includes('rate');
    const cooldownDuration = isRateLimit ? this.RATE_LIMIT_COOLDOWN_MS : this.DEFAULT_COOLDOWN_MS;
    status.cooldownUntil = Date.now() + cooldownDuration;

    if (status.consecutiveFailures >= 2) {
      status.healthy = false;
    }

    // Provider deduplication: cool down models sharing the same root provider if rate-limited
    if (isRateLimit) {
      const rootProvider = this.providerGroups.get(modelId) || provider.toLowerCase();
      this.healthMap.forEach((entry) => {
        const entryRoot = this.providerGroups.get(entry.modelId) || entry.provider.toLowerCase();
        if (entryRoot === rootProvider && entry.modelId !== modelId) {
          entry.cooldownUntil = Math.max(entry.cooldownUntil, Date.now() + 30000);
        }
      });
    }
  }

  public static getAllStatuses(): HealthStatus[] {
    return Array.from(this.healthMap.values());
  }

  public static reset(): void {
    this.healthMap.clear();
  }
}
