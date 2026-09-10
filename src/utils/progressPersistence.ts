const STORAGE_KEY = "python-from-hell-progress";

export interface ProgressData {
  [key: string]: unknown;
}

export function loadProgress(): ProgressData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored);

    if (parsed && typeof parsed === "object") {
      return parsed as ProgressData;
    }

    return {};
  } catch (error) {
    console.error("Failed to load progress:", error);
    return {};
  }
}

export function saveProgress(progress: ProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
}