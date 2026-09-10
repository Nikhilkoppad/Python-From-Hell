# AGENTS.md — Python From Hell

This file contains compact, high-signal guidance for future OpenCode sessions. Every line answers: "Would an agent likely miss this without help?"

## Build / Lint / Test

- `pnpm dev` — start Vite dev server
- `pnpm build` — `tsc -b && vite build`
- `pnpm lint` — run oxlint
- `pnpm preview` — run `vite preview`

**Order matters:** lint → typecheck → test. Run `tsc -b` first; it will catch type errors before the build runs.

## Project Structure

- `src/components/` — React UI (Onboarding, Lesson, Editor, Terminal, etc.)
- `src/engine/` — core logic:
  - `JudgmentEngine.ts` — evaluates code execution against expectations, generates roasts; checks `requiredCodePatterns` regex
  - `LearningEngine.ts` — updates progress (XP, completed lessons, mastery)
  - `RoastEngine.ts` — generates context-aware roasts by category/intensity/language; tracks recent roast IDs to avoid repetition
- `src/execution/` — Python runtime:
  - `PythonRuntime.ts` — manages Web Worker + Pyodide, 4s execution timeout, cancellation
  - `PythonWorker.ts` — loads Pyodide, executes user code, returns stdout/stderr/errors
- `src/data/` — curriculum, roasts, diagnostic questions, achievements
- `src/types.ts` — type definitions: `RoastIntensity`, `LearningLanguage`, `UserProgress`, `EvaluationResult`
- `src/utils/storage.ts` — loadProgress/saveProgress via localStorage

## Key Flows (from App.tsx)

**Code execution** (App.tsx:254):
1. `handleRunCode` creates `PythonRuntime` (lazy, singleton via ref) and calls `pythonRuntime.current.execute(code)`
2. Code runs in a Web Worker via Pyodide (boot takes ~15s on first run; shows ready message)
3. 4-second execution timeout kills infinite loops
4. `JudgmentEngine.evaluateExecution` evaluates: output matches expected **and** required code patterns
5. `RoastEngine.generateRoast` produces context-aware roast based on error type/intensity/language

**Progression** (App.tsx:296-343):
- On success: `LearningEngine.updateProgressOnAttempt` awards XP (50 on lesson complete, 10 otherwise)
- On failure: failureCount increments, progress timestamp updates
- `moveToLesson` / `handleNextLesson` advances the learner

**Persistence** (App.tsx:180-182):
- `loadProgress` / `saveProgress` from `utils/storage.ts` persist user state to localStorage
- `useEffect` after every progress save

## Critical Constraints

- **Real Python execution is non-negotiable** (PYTHON_FROM_HELL_REQUIREMENTS.md:407-429). The Pyodide-based execution must eventually replace any regex-based simulation.
- **Roast variation is critical** (RoastEngine.ts:57-113). Never repeatedly show the same roast — the engine tracks recent roast IDs and selects from fresh pools. Intensity levels in types: `SUPPORTIVE` | `SAVAGE` | `NIGHTMARE` | `APOCALYPSE` | `DESI_SENIOR` | `ACADEMIC`. Roasts.ts currently uses: `APOCALYPSE` | `SAVAGE` | `DESI_SENIOR`.
- **HINDI/ENGLISH language modes** (App.tsx:61-64). `isHindi` flag controls all UI text. Technical content stays in English; everything around it uses the selected language.
- **Required code patterns** (JudgmentEngine.ts:19-21). Challenges define `requiredCodePatterns` (regex). If a pattern isn't found in user code, the result fails with `REQUIRED_CONCEPT_MISSING` error type.
- **Do not fake execution** (AI_Prompt.md:681-703). Never claim browser/runtime functionality was verified if not actually tested.
- **Preserve the brutal personality** (AI_Prompt.md:114-147). Dark hacker aesthetic, red/orange danger accents, terminal atmosphere, monospace typography, Indian/Hinglish profanity, brutal humor.
- **Do not rewrite working systems just because a different implementation looks cleaner** (AI_Prompt.md:1624-1637). Inspect, understand, identify actual problems, decide if incremental improvement is sufficient.

## Roast System

- Roasts categorized by situation: `SUCCESS` | `SYNTAX` | `INDENTATION` | `VARIABLE` | `TIMEOUT` | `RUNTIME` | `WRONG_ANSWER`
- `categoryFor` maps error types to roast categories (RoastEngine.ts:48-55)
- Intensity: `SUPPORTIVE` | `SAVAGE` | `NIGHTMARE` | `APOCALYPSE` | `DESI_SENIOR` | `ACADEMIC`
- Language: `ENGLISH` | `HINDI`
- Recent roast history tracked (RoastEngine.ts:12-14, 44) — last 6 roast IDs, avoids repetition
- `RoastEngine.select()` cycles through pools, rejects recently used profanity/start-phrases, resets counts after 3 uses per roast

## Python Runtime Quirks

- Pyodide boot takes ~15 seconds (`initializationTimeout` in PythonRuntime.ts:48-57); first run shows ready message (Hindi variant available)
- Worker cancellation via `pythonRuntime.cancel()` (App.tsx:349-351)
- Dispose on cleanup: `pythonRuntime.current?.dispose()` (App.tsx:184)
- 4-second execution timeout (PythonRuntime.ts:17, 59-72)
- `execute()` is promise-based; caller must handle `execution.cancelled`, `execution.error`, `execution.stdout`, `execution.stderr`

## Typecheck & Lint Quirks

- `tsconfig.app.json`: `verbatimModuleSyntax: true`, `noEmit: true`, strict local-parameter rules
- `tsconfig.node.json`: `module: nodenext`, for Vite config typing
- Oxlint config (`.oxlintrc.json`): plugins `react`, `typescript`, `oxc`; type-aware lint requires `oxlint-tsgolint`
- Ignore patterns: `public/pyodide/**`