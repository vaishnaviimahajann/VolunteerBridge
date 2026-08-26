import axios from "axios";

// In production (Render), VITE_API_URL is baked in at build time and
// points to the deployed backend. Locally, it falls back to localhost
// so `npm run dev` still works exactly as before.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
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