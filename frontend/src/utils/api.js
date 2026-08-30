import axios from "axios";

// In dev (`npm run dev`), always use the local backend.
// In a production build, use VITE_API_URL if it was injected at build
// time — otherwise fall back to the known production backend URL.
// (Render doesn't reliably pass dashboard Environment Variables as
// Docker build args, so this fallback keeps things working either way.)
const baseURL = import.meta.env.DEV
  ? "http://localhost:5000"
  : import.meta.env.VITE_API_URL || "https://volunteerbridge.onrender.com";

const api = axios.create({
  baseURL,
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