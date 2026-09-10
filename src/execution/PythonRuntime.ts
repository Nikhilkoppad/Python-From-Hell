export interface PythonExecutionResult {
  stdout: string;
  stderr: string;
  error: string | null;
  timedOut: boolean;
  cancelled: boolean;
}

interface WorkerResponse {
  type: 'ready' | 'result';
  requestId?: number;
  stdout?: string;
  stderr?: string;
  error?: string;
}

const EXECUTION_TIMEOUT_MS = 4_000;

export class PythonRuntime {
  private worker: Worker | null = null;
  private nextRequestId = 0;
  private isReady = false;
  private activeCancel: (() => void) | null = null;

  private getWorker(): Worker {
    if (this.worker) return this.worker;

    this.worker = new Worker(
      new URL('./PythonWorker.ts', import.meta.url),
      { type: 'module' }
    );

    return this.worker;
  }

  private resetWorker(): void {
    this.worker?.terminate();
    this.worker = null;
    this.isReady = false;
  }

  public execute(code: string): Promise<PythonExecutionResult> {
    const requestId = ++this.nextRequestId;
    const worker = this.getWorker();

    return new Promise((resolve) => {
      let executionTimeout: number | null = null;
      const initializationTimeout = window.setTimeout(() => {
        this.resetWorker();
        finish({
          stdout: '',
          stderr: '',
          error: 'Python took too long to start. Check your connection, then retry.',
          timedOut: true,
          cancelled: false,
        });
      }, 15_000);

      const startExecutionTimer = () => {
        if (executionTimeout !== null) return;
        window.clearTimeout(initializationTimeout);
        executionTimeout = window.setTimeout(() => {
          this.resetWorker();
          finish({
            stdout: '',
            stderr: '',
            error: 'Execution timed out after 4 seconds. Your code may contain an infinite loop.',
            timedOut: true,
            cancelled: false,
          });
        }, EXECUTION_TIMEOUT_MS);
      };

      const finish = (result: PythonExecutionResult) => {
        window.clearTimeout(initializationTimeout);
        if (executionTimeout !== null) window.clearTimeout(executionTimeout);
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onWorkerError);
        this.activeCancel = null;
        resolve(result);
      };

      const cancel = () => {
        this.resetWorker();
        finish({
          stdout: '',
          stderr: '',
          error: 'Execution cancelled. The worker was safely reset.',
          timedOut: false,
          cancelled: true,
        });
      };

      this.activeCancel = cancel;

      const onMessage = (event: MessageEvent<WorkerResponse>) => {
        const response = event.data;
        if (response.type === 'ready') {
          this.isReady = true;
          startExecutionTimer();
          return;
        }
        if (response.type !== 'result' || response.requestId !== requestId) return;

        if (response.error) this.resetWorker();

        finish({
          stdout: response.stdout ?? '',
          stderr: response.stderr ?? '',
          error: response.error ?? null,
          timedOut: false,
          cancelled: false,
        });
      };

      const onWorkerError = () => {
        this.resetWorker();
        finish({
          stdout: '',
          stderr: '',
          error: 'The Python runtime could not start. Reload the page and try again.',
          timedOut: false,
          cancelled: false,
        });
      };

      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onWorkerError);
      if (this.isReady) startExecutionTimer();
      worker.postMessage({ type: 'execute', requestId, code });
    });
  }

  public cancel(): void {
    this.activeCancel?.();
  }

  public dispose(): void {
    this.resetWorker();
  }
}
