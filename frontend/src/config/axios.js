// Role: creating an axios instance to be used across project 

// axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false, // you’re using Bearer tokens, not cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// inject the latest token into every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

export default axiosInstance;
