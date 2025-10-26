import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  joinConversation(userId) {
    if (this.socket) {
      this.socket.emit("join_conversation", userId);
    }
  }

  sendMessage(receiverId, content) {
    if (this.socket) {
      this.socket.emit("send_message", { receiverId, content });
    }
  }

  startTyping(receiverId) {
    if (this.socket) {
      this.socket.emit("typing_start", receiverId);
    }
  }

  stopTyping(receiverId) {
    if (this.socket) {
      this.socket.emit("typing_stop", receiverId);
    }
  }

  on(eventName, callback) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }
}

export default new SocketService();
