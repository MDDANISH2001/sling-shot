import { io, Socket } from "socket.io-client";
import { Preferences } from "@capacitor/preferences";

// Default fallback URL
const DEFAULT_SOCKET_URL = "http://172.168.0.82:3001";

class SocketService {
  private socket: Socket | null = null;
  private socketUrl: string = DEFAULT_SOCKET_URL;

  async getSocketUrl(): Promise<string> {
    try {
      const { value: savedIP } = await Preferences.get({ key: "socket_ip" });
      const { value: savedPort } = await Preferences.get({ key: "socket_port" });
      
      if (savedIP && savedPort) {
        return `http://${savedIP}:${savedPort}`;
      }
      if (savedIP) {
        return `http://${savedIP}:3001`;
      }
    } catch (error) {
      console.error("Error loading socket URL:", error);
    }
    return DEFAULT_SOCKET_URL;
  }

  async connect(): Promise<Socket> {
    if (!this.socket) {
      this.socketUrl = await this.getSocketUrl();
      console.log("Connecting to:", this.socketUrl);
      
      this.socket = io(this.socketUrl, {
        transports: ["websocket"],
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on("connect", () => {
        console.log("✓ Connected to server:", this.socket?.id);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("✗ Disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("Connection error:", error.message);
      });
    }

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  async disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async reconnect() {
    await this.disconnect();
    return await this.connect();
  }
}

export const socketService = new SocketService();
export const getSocket = async () => await socketService.connect();
