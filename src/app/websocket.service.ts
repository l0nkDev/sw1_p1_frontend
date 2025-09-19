import { Subject, Observable } from 'rxjs';

export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<string>();

  constructor(sessionId: string) {
    this.init(sessionId);
  }

  init(sessionId: string) {
    if (sessionId !== '') {
      this.socket = new WebSocket(`wss://websocket.lonk.dev/ws/session/${sessionId}`); // Adjust URL as needed

      this.socket.onopen = (event) => {
        console.log('WebSocket connection opened:', event);
      };

      this.socket.onmessage = (event) => {
        console.log('Message from server:', JSON.parse(event.data));
        this.messageSubject.next(event.data);
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        this.socket = new WebSocket(`wss://websocket.lonk.dev/ws/session/${sessionId}`);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.socket = new WebSocket(`wss://websocket.lonk.dev/ws/session/${sessionId}`);
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
