// Role: creating an axios instance to be used across project 

// axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,          // <— include cookies / auth headers
  // no need to set `Authorization` here if you use an interceptor below
});

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default api;
