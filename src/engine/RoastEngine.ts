import type { RoastIntensity, LearningLanguage } from '../types';

/**
 * Roast Engine - Maintains roast history and generates contextual roasts
 * Never repeatedly uses the same insult
 */

export interface RoastHistoryEntry {
  id: string;
  timestamp: number;
  lastRoastTime: number;
  roastText: string;
  errorType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RoastEngineConfig {
  maxHistorySize: number;
  cooldownPeriod: number;
  severityLevels: ('LOW' | 'MEDIUM' | 'HIGH')[];
}

export interface RoastStats {
  totalRoasts: number;
  roastsBySeverity: Record<string, number>;
  lastRoastTime: number;
  repeatProtection: Set<string>;
}

/**
 * Generates a roast based on the error type, learner history, and current severity
 */
export class RoastEngine {
  private config: RoastEngineConfig = {
    maxHistorySize: 50,
    cooldownPeriod: 5000,
    severityLevels: ['LOW', 'MEDIUM', 'HIGH'],
  };

  private history: RoastHistoryEntry[] = [];
  private roastStats: RoastStats = {
    totalRoasts: 0,
    roastsBySeverity: { LOW: 0, MEDIUM: 0, HIGH: 0 },
    lastRoastTime: 0,
    repeatProtection: new Set(),
  };

  addRoast(errorType: string, roastText: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'): string {
    const now = Date.now();

    // Check cooldown - don't roast too frequently
    if (now - (this.history[this.history.length - 1]?.lastRoastTime || 0) < this.config.cooldownPeriod && this.history.length > 0) {
      // Skip roast, return supportive message instead
      return this.getSupportiveMessage(errorType);
    }

    // Check repeat protection - don't repeat the same roast
    const recentRoasts = this.history.slice(-10).map(h => h.roastText.toLowerCase());
    if (recentRoasts.includes(roastText.toLowerCase())) {
      // Find a different roast or use supportive mode
      return this.getSupportiveMessage(errorType);
    }

    // Create roast entry
    const entry: RoastHistoryEntry = {
      id: `roast-${Date.now()}`,
      timestamp: now,
      lastRoastTime: now,
      roastText: roastText,
      errorType,
      severity,
    };

    // Maintain history size
    if (this.history.length >= this.config.maxHistorySize) {
      this.history.shift();
    }
    this.history.push(entry);

    // Update stats
    this.roastStats.totalRoasts++;
    this.roastStats.roastsBySeverity[severity] = (this.roastStats.roastsBySeverity[severity] || 0) + 1;
    this.roastStats.lastRoastTime = now;

    // Add to repeat protection (limited size)
    if (this.roastStats.repeatProtection.size >= 20) {
      this.roastStats.repeatProtection.clear();
    }
    this.roastStats.repeatProtection.add(roastText.toLowerCase());

    return roastText;
  }

  private getSupportiveMessage(errorType: string): string {
    const supportiveMessages: Record<string, string> = {
      SYNTAX: 'Good try! Let\'s look at the syntax together.',
      INDENTATION: 'Keep working on the indentation - you\'re getting closer!',
      VARIABLE: 'Variable troubleshooting is key - let\'s break this down.',
      TIMEOUT: 'Take a breath - timeouts happen to everyone!',
      WRONG_ANSWER: 'Everyone gets answers wrong sometimes - it\'s part of learning!',
      SUCCESS: 'Great job! Your code ran successfully.',
    };

    return (supportiveMessages as Record<string, string>)[errorType] || 'Keep trying!';
  }

  getRoast(errorType: string, severity?: 'LOW' | 'MEDIUM' | 'HIGH'): string {
    const determinedSeverity = severity || this.determineSeverity();
    return this.addRoast(errorType, '', determinedSeverity);
  }

  determineSeverity(): 'LOW' | 'MEDIUM' | 'HIGH' {
    // Based on failure count and history
    const failureCount = this.history.filter(h => h.errorType.includes('ERROR')).length;
    if (failureCount >= 5) return 'HIGH';
    if (failureCount >= 2) return 'MEDIUM';
    return 'LOW';
  }

  getRoastStats(): RoastStats {
    return this.roastStats;
  }

  getRoastHistory(): RoastHistoryEntry[] {
    return this.history;
  }

static generateRoast(
    errorType: string,
    runtimeError: string,
    _attemptInfo: { attemptCount: number; hintsUsed: number },
    intensity: RoastIntensity,
    language: LearningLanguage
  ): { roast: string; fix?: string } {
    const engine = new RoastEngine();
    const severityMap: Record<RoastIntensity, 'LOW' | 'MEDIUM' | 'HIGH'> = {
      SUPPORTIVE: 'LOW',
      SAVAGE: 'MEDIUM',
      NIGHTMARE: 'HIGH',
      APOCALYPSE: 'HIGH',
      DESI_SENIOR: 'MEDIUM',
      ACADEMIC: 'LOW',
    };
    const roastText = engine.addRoast(errorType, runtimeError, severityMap[intensity]);
    const fixHint = language === 'HINDI'
      ? 'BC, dekho carefully. Output match nahi kar raha?'
      : 'Look at the output carefully. Does it match?';
    return { roast: roastText, fix: fixHint };
  }
}
