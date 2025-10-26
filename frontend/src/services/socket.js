import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

class SocketService {
  constructor() {
    this.socket = null;
  }

  // Connect to socket server
  connect(token) {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return this.socket;
    }

    console.log("Connecting to socket server...");

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttemps: 5,
    });

    // Connection events
    this.socket.on("connect", () => {
      console.log("Socket connected", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    return this.socket;
  }

  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      console.log("Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Join conversation room
  joinConversation(userId) {
    if (this.socket) {
      this.socket.emit("join_conversation", userId);
      console.log("Joined conversation with:", userId);
    }
  }

  // Send message
  sendMessage(receiverId, content) {
    if (this.socket) {
      this.socket.emit("send_message", { receiverId, content });
      console.log("Message sent to:", receiverId);
    }
  }

  // Typing indicators
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

  // Listen to events
  on(eventName, callback) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  // Remove event listener
  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }
}

// Export singleton instance
export default new SocketService();
