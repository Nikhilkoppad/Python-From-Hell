import { loadPyodide, type PyodideInterface } from 'pyodide';

interface ExecuteRequest {
  type: 'execute';
  requestId: number;
  code: string;
}

interface ExecutionResponse {
  type: 'ready' | 'result';
  requestId?: number;
  stdout?: string;
  stderr?: string;
  error?: string;
}

let runtime: PyodideInterface | null = null;
let bootPromise: Promise<PyodideInterface> | null = null;
let executionInProgress = false;

const post = (message: ExecutionResponse) => self.postMessage(message);

const getRuntime = async (): Promise<PyodideInterface> => {
  if (runtime) return runtime;

  bootPromise ??= loadPyodide({
    indexURL: `${self.location.origin}/pyodide/`,
  })
    .then((loadedRuntime) => {
      runtime = loadedRuntime;
      post({ type: 'ready' });
      return loadedRuntime;
    })
    .catch((error) => {
      // A failed boot must not poison the worker forever. A later execution
      // should be allowed to retry initialization after the network recovers.
      bootPromise = null;
      throw error;
    });

  return bootPromise;
};

const formatExecutionError = (error: unknown): string => {
  const message = String(error);
  if (message && message !== '[object Object]') return message;

  if (error instanceof Error) {
    return error.stack || error.message || 'Python execution failed.';
  }

  return 'Python execution failed.';
};

self.onmessage = async (event: MessageEvent<ExecuteRequest>) => {
  if (event.data.type !== 'execute') return;

  const { requestId, code } = event.data;

  if (executionInProgress) {
    post({
      type: 'result',
      requestId,
      stdout: '',
      stderr: '',
      error: 'Another Python execution is already in progress. Wait for it to finish, then retry.',
    });
    return;
  }

  executionInProgress = true;
  const stdout: string[] = [];
  const stderr: string[] = [];

  try {
    const pyodide = await getRuntime();

    pyodide.setStdout({ batched: (line) => stdout.push(line) });
    pyodide.setStderr({ batched: (line) => stderr.push(line) });
    await pyodide.runPythonAsync(`exec(${JSON.stringify(code)}, {})`);

    post({
      type: 'result',
      requestId,
      stdout: stdout.join('\n'),
      stderr: stderr.join('\n'),
    });
  } catch (error) {
    post({
      type: 'result',
      requestId,
      stdout: stdout.join('\n'),
      stderr: stderr.join('\n'),
      error: formatExecutionError(error),
    });
  } finally {
    executionInProgress = false;
  }
};
