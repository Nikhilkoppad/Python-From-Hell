const STORAGE_KEY = "python-from-hell-progress-v3";
const LEGACY_KEYS = ["python-from-hell-progress", "python-from-hell-progress-v2"];
const STORAGE_VERSION = 3;

export interface ProgressData {
  [key: string]: unknown;
}

interface PersistedProgress {
  version: number;
  data: ProgressData;
}

function isRecord(value: unknown): value is ProgressData {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function unwrapStored(value: unknown): ProgressData | null {
  if (!isRecord(value)) return null;

  if (value.version === STORAGE_VERSION && isRecord(value.data)) {
    return value.data;
  }

  // Migrate the previous versioned envelope without changing learner data.
  if (value.version === 1 && isRecord(value.data)) {
    return value.data;
  }

  // Migrate the older raw-progress format.
  return value;
}

export function loadProgress(): ProgressData {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      const migrated = unwrapStored(JSON.parse(current));
      if (migrated) return migrated;
    }

    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key);
      if (!legacy) continue;

      const migrated = unwrapStored(JSON.parse(legacy));
      if (!migrated) continue;

      // Write the migrated state to the current format once, then keep the
      // legacy key untouched so an older build can still recover the data.
      saveProgress(migrated);
      return migrated;
    }

    return {};
  } catch (error) {
    console.error("Failed to load progress:", error);
    return {};
  }
}

export function saveProgress(progress: unknown): void {
  if (!isRecord(progress)) return;

  try {
    const payload: PersistedProgress = {
      version: STORAGE_VERSION,
      data: progress,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
}
