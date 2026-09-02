type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
};

export class EnglishAudioService {
  public static canSpeak(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public static canListen(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition || (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition);
  }

  public static speak(text: string): void {
    if (!this.canSpeak() || !text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  public static listen(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('unavailable'));
        return;
      }
      const Ctor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition
        || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
      if (!Ctor) {
        reject(new Error('STT_UNAVAILABLE'));
        return;
      }
      const recognition = new Ctor();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        resolve(transcript);
      };
      recognition.onerror = () => reject(new Error('STT_ERROR'));
      recognition.onend = () => undefined;
      recognition.start();
    });
  }
}
