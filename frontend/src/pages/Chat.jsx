import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import {
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  addMessage,
  setTypingUser,
  removeTypingUser,
} from "../store/slices/chatSlice";
import socketService from "../services/socket";
import Sidebar from "../components/chat/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";

function Chat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && user.token) {
      const socket = socketService.connect(user.token);

      // Socket connection events
      socket.on("connect", () => {
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      // Online users
      socket.on("online_users", (users) => {
        dispatch(setOnlineUsers(users));
      });

      socket.on("user_online", (data) => {
        dispatch(addOnlineUser(data.userId));
        socketService.joinConversation(data.userId);
      });

      socket.on("user_offline", (data) => {
        dispatch(removeOnlineUser(data.userId));
      });

      // Messages
      socket.on("receive_message", (message) => {
        dispatch(addMessage(message));
      });

      // Typing indicators
      socket.on("user_typing", (data) => {
        dispatch(setTypingUser(data.userId));
      });

      socket.on("user_stop_typing", (data) => {
        dispatch(removeTypingUser(data.userId));
      });
    }

    return () => {
      socketService.disconnect();
    };
  }, [user, dispatch]);

  const handleLogout = () => {
    socketService.disconnect();
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} isConnected={isConnected} />

      {/* Chat Window */}
      <ChatWindow />
    </div>
  );
}

export default Chat;
