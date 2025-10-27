import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

function MessageList() {
  const { messages, activeConversation, typingUsers } = useSelector(
    (state) => state.chat
  );
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  //Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Filter messages for active conersation
  const conversationMessages = messages.filter(
    (msg) =>
      (msg.sender._id === user._id &&
        msg.receiver._id === activeConversation?.userId) ||
      (msg.sender._id === activeConversation?.userId &&
        msg.receiver._id === user._id)
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
      {conversationMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        </div>
      ) : (
        <>
          {conversationMessages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwnMessage={message.sender._id === user._id}
            />
          ))}

          {/* Typing indicator */}
          {typingUsers.includes(activeConversation?.userId) && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {activeConversation.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="bg-gray-200 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}

function MessageBubble({ message, isOwnMessage }) {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isOwnMessage
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-white text-gray-900 rounded-bl-none shadow"
        }`}
      >
        <p className="text-sm break-words">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isOwnMessage ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export default MessageList;
