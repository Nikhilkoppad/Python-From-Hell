import type { ModelCapability, SpecialistCategory } from '../types';
import { ProviderHealthTracker } from './ProviderHealth';

export class SpecialistSelector {
  /**
   * Classifies user prompt and system task into a SpecialistCategory
   */
  public static classifyTask(prompt: string, contextHint?: string): SpecialistCategory {
    const text = `${prompt} ${contextHint || ''}`.toLowerCase();

    if (text.includes('vision') || text.includes('image') || text.includes('diagram') || text.includes('screenshot')) {
      return 'VISION';
    }

    if (text.includes('architecture') || text.includes('system design') || text.includes('trade-off') || text.includes('deep reasoning') || text.includes('complex logic')) {
      return 'ARCHITECTURE_REASONING';
    }

    if (text.includes('debug') || text.includes('traceback') || text.includes('error') || text.includes('test') || text.includes('exception') || text.includes('assertion')) {
      return 'DEBUGGING_TESTING';
    }

    if (text.includes('css') || text.includes('tailwind') || text.includes('component') || text.includes('layout') || text.includes('ui') || text.includes('visual')) {
      return 'UI_UX';
    }

    if (text.includes('quick') || text.includes('simple') || text.includes('format') || text.includes('summary') || text.includes('short hint')) {
      return 'FAST_SIMPLE';
    }

    if (text.includes('def ') || text.includes('print') || text.includes('python') || text.includes('function') || text.includes('loop') || text.includes('code') || text.includes('algorithm')) {
      return 'CODING';
    }

    return 'CODING'; // Default for Python From Hell is high-quality coding
  }

  /**
   * Builds an intelligent prioritized fallback candidate list for a given category
   */
  public static selectCandidates(
    category: SpecialistCategory,
    availableModels: ModelCapability[]
  ): ModelCapability[] {
    const isAvailable = (m: ModelCapability) => ProviderHealthTracker.isAvailable(m.provider, m.id);

    // 1. Exact Category Matches
    const primaryMatches = availableModels
      .filter((m) => m.category === category && isAvailable(m))
      .sort((a, b) => this.scoreModel(b, category) - this.scoreModel(a, category));

    // 2. Related / Secondary Category Matches (e.g., Coding <-> Debugging <-> Architecture)
    const secondaryCategories = this.getRelatedCategories(category);
    const secondaryMatches = availableModels
      .filter((m) => secondaryCategories.includes(m.category) && !primaryMatches.includes(m) && isAvailable(m))
      .sort((a, b) => this.scoreModel(b, category) - this.scoreModel(a, category));

    // 3. Reliable General Models as Last Resort
    const generalFallback = availableModels
      .filter((m) => m.category === 'GENERAL' && !primaryMatches.includes(m) && !secondaryMatches.includes(m) && isAvailable(m))
      .sort((a, b) => this.scoreModel(b, 'GENERAL') - this.scoreModel(a, 'GENERAL'));

    const chain = [...primaryMatches, ...secondaryMatches, ...generalFallback];

    // If everything is cooled down or no models matched, return all models sorted by health
    if (chain.length === 0) {
      return [...availableModels].sort((a, b) => a.failureCount - b.failureCount);
    }

    return chain;
  }

  private static getRelatedCategories(category: SpecialistCategory): SpecialistCategory[] {
    switch (category) {
      case 'CODING':
        return ['DEBUGGING_TESTING', 'ARCHITECTURE_REASONING'];
      case 'DEBUGGING_TESTING':
        return ['CODING', 'ARCHITECTURE_REASONING'];
      case 'ARCHITECTURE_REASONING':
        return ['CODING', 'GENERAL'];
      case 'UI_UX':
        return ['CODING', 'GENERAL'];
      case 'FAST_SIMPLE':
        return ['CODING', 'GENERAL'];
      case 'VISION':
        return ['GENERAL'];
      default:
        return ['CODING', 'FAST_SIMPLE'];
    }
  }

  private static scoreModel(model: ModelCapability, targetCategory: SpecialistCategory): number {
    let score = 100;

    // Quality bonus
    if (model.id.includes('sonnet') || model.id.includes('coder') || model.id.includes('4o') || model.id.includes('o1')) {
      score += 50;
    }

    // Category match
    if (model.category === targetCategory) {
      score += 40;
    }

    // Health and latency penalty
    if (model.latencyMs && model.latencyMs > 0) {
      score -= Math.min(model.latencyMs / 100, 30); // Latency deduction
    }

    if (model.failureCount > 0) {
      score -= model.failureCount * 25;
    }

    return score;
  }
}
