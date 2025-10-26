import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  conversations: [],
  activeConversation: null,
  onlineUsers: [],
  typingUsers: [],
  isLoading: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Set active conversation
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },

    // Add message
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    // Set messages
    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    // Clear messages
    clearMessages: (state) => {
      state.messages = [];
    },

    // Set conversations
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },

    // Update conversation
    upDateConversation: (state, action) => {
      const index = state.conversations.findIndex(
        (conv) => conv._id === action.payload._id
      );
      if (index !== -1) {
        state.conversations[index] = action.payload;
      }
    },

    // Set online users
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },

    // Add online user
    addOnlineUser: (state, action) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },

    // Remove online user
    removeOnlineUser: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(
        (userId) => userId !== action.payload
      );
    },

    // Set typing user
    setTypingUser: (state, action) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },

    // Remove typing user
    removeTypingUser: (state, action) => {
      state.typingUsers = state.typingUsers.filter(
        (userId) => userId !== action.payload
      );
    },

    // Set loading
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setActiveConversation,
  addMessage,
  setMessages,
  clearMessages,
  setConversations,
  upDateConversation,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setTypingUser,
  removeTypingUser,
  setLoading,
} = chatSlice.actions;

export default chatSlice.reducer;
