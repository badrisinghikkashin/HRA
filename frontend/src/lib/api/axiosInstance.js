import axios from "axios";

const API = axios.create({
  baseURL: "https://ikkahin-hra.onrender.com/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("hra_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// globally handle 401 responses by clearing auth and redirecting to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // token invalid/expired - clear and redirect to login page
      localStorage.removeItem("hra_token");
      localStorage.removeItem("hra_user");
      // optionally trigger a reload to enforce login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;