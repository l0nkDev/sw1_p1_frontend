import { Injectable, OnInit } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket;
  private messageSubject = new Subject<string>();

  constructor() {
    this.socket = new WebSocket('ws://localhost:8000/ws/session/12312321312'); // Adjust URL as needed

    this.socket.onopen = (event) => {
      console.log('WebSocket connection opened:', event);
    };

    this.socket.onmessage = (event) => {
      console.log('Message from server:', JSON.parse(event.data));
      this.messageSubject.next(event.data);
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  sendMessage(message: string): void {
    this.socket.send(JSON.stringify({ message }));
  }

  getMessages(): Observable<string> {
    return this.messageSubject.asObservable();
  }
}
