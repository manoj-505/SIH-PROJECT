import { SupportedLanguage } from '../types';

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  private getLangCode(lang: SupportedLanguage): string {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'mr': return 'mr-IN';
      case 'gu': return 'gu-IN';
      case 'en':
      default: return 'en-IN';
    }
  }

  public speak(
    text: string,
    lang: SupportedLanguage = 'en',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      onEnd?.();
      return;
    }

    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = this.getLangCode(lang);
      utterance.lang = targetLang;
      utterance.rate = 0.92; // Slightly slower for kiosk & elderly clarity
      utterance.pitch = 1.0;

      // Select voice matching language if available
      const voices = this.synth.getVoices();
      const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(lang) || v.lang.toLowerCase() === targetLang.toLowerCase());
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('TTS utterance error:', e);
        this.currentUtterance = null;
        onError?.(e);
        onEnd?.();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (err) {
      console.error('Failed to trigger TTS:', err);
      onError?.(err);
      onEnd?.();
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const ttsService = new TTSService();
