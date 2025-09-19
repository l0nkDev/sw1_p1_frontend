import { Subject, Observable } from 'rxjs';
import { environment } from '../environments/environment.development';

export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<string>();

  constructor(sessionId: string) {
    this.init(sessionId);
  }

  init(sessionId: string) {
    if (sessionId !== '') {
      this.socket = new WebSocket(
        environment.wsUrl + `/session/${sessionId}`,
      );

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
  }

  sendMessage(message: string): void {
    this.socket?.send(JSON.stringify({ message }));
  }

  getMessages(): Observable<string> {
    return this.messageSubject.asObservable();
  }
}
