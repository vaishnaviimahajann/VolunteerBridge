import axios from "axios";

// Backend runs on port 5000, all routes are prefixed with /api
// (see server.js -> app.use('/api/auth', ...) etc.)
const api = axios.create({
  baseURL: "http://localhost:5000",
});

// Attach token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
