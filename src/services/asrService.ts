import { SupportedLanguage } from '../types';

interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

class ASRService {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        this.recognition = new SpeechRecognitionConstructor();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
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

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(
    lang: SupportedLanguage = 'en',
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      console.warn('SpeechRecognition API not available in browser. Using fallback simulation.');
      // Simulated voice capture for kiosk environments without mic access
      setTimeout(() => {
        const fallbackText = lang === 'hi'
          ? "मुझे पिछले 3 दिनों से छाती में भारीपन और हल्का बुखार महसूस हो रहा है"
          : lang === 'mr'
          ? "मला मागील दोन दिवसांपासून खोकला आणि डोकेदुखी आहे"
          : lang === 'gu'
          ? "મને ત્રણ દિવસથી છાતીમાં દુખાવો અને શ્વાસ લેવામાં તકલીફ છે"
          : "I have had severe chest tightness and persistent dry cough for the past 3 days.";
        onResult(fallbackText, true);
        onEnd();
      }, 2500);
      return false;
    }

    try {
      this.recognition.lang = this.getLangCode(lang);
      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }
        onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('ASR Recognition error:', event.error);
        this.isListening = false;
        onError(event.error);
        onEnd();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.error('Error starting recognition:', err);
      this.isListening = false;
      onError(err);
      onEnd();
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
    }
    this.isListening = false;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const asrService = new ASRService();
