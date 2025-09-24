/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';

  declare global {
    interface Window {
      SpeechRecognition: typeof SpeechRecognition;
      webkitSpeechRecognition: typeof SpeechRecognition; // For broader browser compatibility
    }
  }

@Injectable({
  providedIn: 'root',
})

export class VoiceRecognitionService {
  ISpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new this.ISpeechRecognition();
  isStoppedSpeechRecog = false;
  tempWords = '';
  text = '';

  constructor() {
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
  }

  init() {
    this.recognition.addEventListener('result', (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      this.tempWords = transcript;
    });
  }

  start() {
    this.isStoppedSpeechRecog = false;
    this.recognition.start();
    console.log('Speech recognition started');

    this.recognition.addEventListener('end', () => {
      if (this.isStoppedSpeechRecog) {
        this.recognition.stop();
        console.log('End speech recognition');
      } else {
        this.wordConcat();
        this.recognition.start();
      }
    });
  }

  stop() {
    this.isStoppedSpeechRecog = true;
    this.wordConcat();
    this.recognition.stop();
    console.log('End speech recognition');
  }

  wordConcat() {
    this.text = `${this.text} ${this.tempWords}.`;
    this.tempWords = '';
  }
}