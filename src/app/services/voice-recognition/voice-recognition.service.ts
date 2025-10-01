import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class VoiceRecognitionService {
  recognition = window.SpeechRecognition ? new SpeechRecognition() : null;
  canListen = false;
  isListening = false;
  isStoppedSpeechRecog = false;
  tempWords = '';
  text = '';

  constructor() {
    if (this.recognition == null) return;
    this.canListen = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'es-ES';
  }

  init() {
    this.recognition!.addEventListener('result', (event: any) => {
      const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
      this.tempWords = transcript;
    });
  }

  start() {
    this.isStoppedSpeechRecog = false;
    this.recognition!.start();
    console.log('Speech recognition started');
    this.wordConcat();
    this.isListening = true;
    this.recognition!.start();
  }

  stop() {
    this.isStoppedSpeechRecog = true;
    this.wordConcat();
    this.recognition!.stop();
    this.isListening = false;
    console.log('End speech recognition');
  }

  wordConcat() {
    this.text = `${this.text} ${this.tempWords}.`;
    this.tempWords = '';
  }
}
