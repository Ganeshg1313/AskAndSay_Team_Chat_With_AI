// Role: creating an axios instance to be used across project 

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  withCredentials: true, // Ensure credentials (cookies, auth headers) are sent
});

export default axiosInstance;
