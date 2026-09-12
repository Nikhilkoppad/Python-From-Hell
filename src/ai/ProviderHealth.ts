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
    return Date.now() >= status.cooldownUntil && (status.healthy || status.consecutiveFailures < 3);
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
      : Math.round(status.averageLatencyMs * 0.7 + latencyMs * 0.3);
  }

  public static recordFailure(provider: string, modelId: string, errorReason: string, httpStatus?: number): void {
    const status = this.getStatus(provider, modelId);
    status.consecutiveFailures += 1;
    status.totalRequests += 1;
    status.lastFailureReason = errorReason;
    status.cooldownUntil = Date.now() + (httpStatus === 429 ? 60000 : 45000);
    if (status.consecutiveFailures >= 2) status.healthy = false;
  }

  public static getAllStatuses(): HealthStatus[] {
    return Array.from(this.healthMap.values());
  }

  public static reset(): void {
    this.healthMap.clear();
  }
}
