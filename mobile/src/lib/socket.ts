import { io, Socket } from 'socket.io-client';

// IMPORTANT: Change this to your backend server URL
// For local development, use your computer's IP address on the local network
// Example: 'http://192.168.1.100:3001'
// const SOCKET_URL =  'http://192.168.29.25:3001';
const SOCKET_URL =  'https://kg45xxml-3001.inc1.devtunnels.ms';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✓ Connected to server:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('✗ Disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
      });
    }

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
export const getSocket = () => socketService.connect();
