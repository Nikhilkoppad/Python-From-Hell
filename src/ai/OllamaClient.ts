export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
  };
}

export interface OllamaChatResponse {
  model: string;
  created_at?: string;
  message: {
    role: 'assistant';
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
  };
}

export class OllamaClient {
  private baseUrl: string;
  private model: string;
  private timeoutMs: number;

  constructor(
    baseUrl = '/ollama',
    model = 'gemma4:latest',
    timeoutMs = 120000
  ) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.timeoutMs = timeoutMs;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getModel(): string {
    return this.model;
  }

  public setModel(model: string): void {
    this.model = model;
  }

  public async checkHealth(): Promise<{
    online: boolean;
    latencyMs: number;
    details?: any;
  }> {
    const start = Date.now();

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      const latencyMs = Date.now() - start;

      if (!response.ok) {
        return {
          online: false,
          latencyMs,
        };
      }

      const details = await response.json();

      const models: OllamaModel[] = details.models || [];

      const modelAvailable = models.some(
        (availableModel) =>
          availableModel.name === this.model ||
          availableModel.model === this.model
      );

      return {
        online: modelAvailable,
        latencyMs,
        details: {
          ...details,
          modelAvailable,
          selectedModel: this.model,
        },
      };
    } catch {
      return {
        online: false,
        latencyMs: Date.now() - start,
      };
    }
  }

  public async createChatCompletion(
    messages: OllamaMessage[],
    temperature = 0.6,
    maxTokens = 512
  ): Promise<{
    response: OllamaChatResponse;
    latencyMs: number;
  }> {
    const start = Date.now();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const request: OllamaChatRequest = {
        model: this.model,
        messages,
        stream: false,
        options: {
          temperature,
          num_predict: maxTokens,
        },
      };

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      const latencyMs = Date.now() - start;

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => 'Unknown Ollama error');

        throw new Error(
          `Ollama error (${response.status}): ${errorText.substring(0, 300)}`
        );
      }

      const data: OllamaChatResponse = await response.json();

      return {
        response: data,
        latencyMs,
      };
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new Error('Ollama request timed out');
      }

      throw error instanceof Error
        ? error
        : new Error('Ollama request failed');
    } finally {
      clearTimeout(timer);
    }
  }
}