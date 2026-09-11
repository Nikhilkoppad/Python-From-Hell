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

const post = (message: ExecutionResponse) => self.postMessage(message);

const getRuntime = async (): Promise<PyodideInterface> => {
  if (runtime) return runtime;

  bootPromise ??= loadPyodide({
    indexURL: `${self.location.origin}/pyodide/`,
  }).then((loadedRuntime) => {
    runtime = loadedRuntime;
    post({ type: 'ready' });
    return loadedRuntime;
  });

  return bootPromise;
};

self.onmessage = async (event: MessageEvent<ExecuteRequest>) => {
  if (event.data.type !== 'execute') return;

  const { requestId, code } = event.data;
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
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
