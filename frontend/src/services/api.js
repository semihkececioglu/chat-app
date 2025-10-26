import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - logout
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  register: (userData) => api.post("/api/auth/register", userData),
  login: (userData) => api.post("/api/auth/login", userData),
  getMe: () => api.get("api/auth/me"),
};

export const userAPI = {
  getUsers: () => api.get("/api/users"),
  getUserById: (id) => api.get(`/api/users/${id}`),
};

export const messageAPI = {
  getConversations: () => api.get("/api/messages/conversations"),
  getMessage: (userId) => api.get(`/api/messages/${userId}`),
  sendMessage: (data) => api.post("/api/messages", data),
};

export default api;
