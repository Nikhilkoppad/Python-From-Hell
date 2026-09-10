import type { LearningLanguage } from '../types';

export type AudioEventType =
  | 'CHALLENGE_CLEARED'
  | 'EXECUTION_FAILED'
  | 'BOSS_ENGAGED'
  | 'BOSS_VICTORY'
  | 'MILESTONE_CLEARED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'ROAST_CALLOUT';

export interface AudioSettings {
  soundEnabled: boolean;
  voiceEnabled: boolean;
  volume: number; // 0.0 to 1.0
  language: LearningLanguage;
}

const STORAGE_KEY_AUDIO = 'python_hell_audio_settings';

export class AudioEngine {
  private static settings: AudioSettings = this.loadSettings();
  private static audioCtx: AudioContext | null = null;

  private static loadSettings(): AudioSettings {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY_AUDIO);
        if (stored) return JSON.parse(stored);
      }
    } catch {
      // Fallback below
    }
    return {
      soundEnabled: true,
      voiceEnabled: true,
      volume: 0.8,
      language: 'HINDI',
    };
  }

  public static getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public static updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_AUDIO, JSON.stringify(this.settings));
      }
    } catch {
      // ignore storage error
    }
  }

  private static getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Generates synthesizer tone without requiring external audio files
   */
  public static playTone(frequency: number, type: OscillatorType, durationMs: number): void {
    if (!this.settings.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(this.settings.volume * 0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  }

  public static playSuccessChime(): void {
    this.playTone(587.33, 'triangle', 120); // D5
    setTimeout(() => this.playTone(880.0, 'sine', 220), 120); // A5
  }

  public static playErrorBuzzer(): void {
    this.playTone(130.81, 'sawtooth', 250); // C3
  }

  public static playBossHorn(): void {
    this.playTone(92.5, 'sawtooth', 400); // F#2
    setTimeout(() => this.playTone(110.0, 'sawtooth', 600), 250); // A2
  }

  public static playVictoryFanfare(): void {
    this.playTone(523.25, 'triangle', 100);
    setTimeout(() => this.playTone(659.25, 'triangle', 100), 110);
    setTimeout(() => this.playTone(783.99, 'triangle', 120), 220);
    setTimeout(() => this.playTone(1046.5, 'sine', 350), 340);
  }

  /**
   * Synthesizes spoken voice via browser Web Speech API
   */
  public static speak(text: string, langOverride?: LearningLanguage): void {
    if (!this.settings.voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[#*_`]/g, '').substring(0, 180);
      const utterance = new SpeechSynthesisUtterance(cleanText);

      const targetLang = langOverride || this.settings.language;
      utterance.lang = targetLang === 'HINDI' ? 'hi-IN' : 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      utterance.volume = this.settings.volume;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith(targetLang === 'HINDI' ? 'hi' : 'en'));
      if (voice) utterance.voice = voice;

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis blocked
    }
  }

  /**
   * Main Event-driven Multimodal Reaction Dispatcher
   */
  public static triggerEvent(
    event: AudioEventType,
    payload?: { message?: string; language?: LearningLanguage }
  ): void {
    const isHindi = (payload?.language || this.settings.language) === 'HINDI';

    switch (event) {
      case 'CHALLENGE_CLEARED':
        this.playSuccessChime();
        break;

      case 'EXECUTION_FAILED':
        this.playErrorBuzzer();
        break;

      case 'BOSS_ENGAGED':
        this.playBossHorn();
        this.speak(isHindi ? 'Cerberus jaag chuka hai. Bach ke reh.' : 'Cerberus has awakened. Defend your code.', payload?.language);
        break;

      case 'BOSS_VICTORY':
        this.playVictoryFanfare();
        this.speak(isHindi ? 'Shabash! Cerberus dhool chaat gaya.' : 'Victory achieved! Cerberus has been slain.', payload?.language);
        break;

      case 'MILESTONE_CLEARED':
        this.playSuccessChime();
        this.speak(isHindi ? 'Milestone verify ho gaya.' : 'Milestone verified and approved.', payload?.language);
        break;

      case 'ACHIEVEMENT_UNLOCKED':
        this.playVictoryFanfare();
        break;

      case 'ROAST_CALLOUT':
        if (payload?.message) {
          this.speak(payload.message, payload?.language);
        }
        break;
    }
  }
}
