# Python From Hell

Python From Hell is a browser-based adaptive Python learning arena built around real execution, deterministic judging, evidence-based mastery, and a brutal hell-themed teaching style.

## What it does

- Runs Python in the browser with Pyodide.
- Judges challenge results deterministically before AI explains them.
- Tracks attempts, hints, independence, mistakes, mastery, XP, and streaks.
- Adapts the next challenge from actual learner evidence.
- Includes a diagnostic, curriculum map, debugging dungeon, projects, boss fights, achievements, and learner dossier.
- Uses local Ollama/Gemma for AI tutoring when available, with a local deterministic fallback when it is not.
- Persists learner progress locally with versioned storage migration.

## Development

Requirements:

- Node.js 22+
- npm

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Validate the project:

```bash
npm run lint
npm run build
```

## Local AI

The application is designed around a local Ollama provider. Configure the Ollama endpoint/model through the project's existing environment configuration when needed. AI is an interpretation and teaching layer; deterministic runtime execution and judging remain authoritative.

## Architecture

The main learning loop is:

**Learn → Understand → Check → Guided Practice → Code → Execute → Judge → Explain/Roast → Record Evidence → Mastery → Remediation/Next Challenge**

Core areas live under `src/engine`, `src/execution`, `src/ai`, `src/components`, and `src/data`.

## Product principle

Python From Hell is intentionally profane and irreverent, but the profanity is directed at code, mistakes, and situations—not protected characteristics or personal identity. The goal is memorable teaching, not harassment.

## License

MIT. See `LICENSE`.
