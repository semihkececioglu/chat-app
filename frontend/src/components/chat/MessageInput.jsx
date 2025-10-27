import { useState } from "react";
import { useSelector } from "react-redux";
import socketService from "../../services/socket";

function MessageInput() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { activeConversation } = useSelector((state) => state.chat);

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (e.target.value.length > 0) {
      socketService.startTyping(activeConversation.userId);
    } else {
      socketService.stopTyping(activeConversation.userId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || isSending) return;

    setIsSending(true);

    try {
      socketService.stopTyping(activeConversation.userId);
      socketService.sendMessage(activeConversation.userId, message.trim());
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="px-6 py-4 bg-white border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ maxHeight: "120px" }}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span>Send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
