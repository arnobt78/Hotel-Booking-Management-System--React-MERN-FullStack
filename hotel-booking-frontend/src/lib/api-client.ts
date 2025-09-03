import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// Define base URL based on environment
const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Fallback URLs
  if (window.location.hostname === "mern-booking-hotel.netlify.app") {
    return "https://mern-hotel-booking-68ej.onrender.com";
  }

  if (window.location.hostname === "localhost") {
    return "http://localhost:7002";
  }

  // Default to production
  return "https://mern-hotel-booking-68ej.onrender.com";
};

// Extend axios config to include metadata
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: { retryCount: number };
}

// Create axios instance with consistent configuration
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensure cookies are sent with requests
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add Authorization header with JWT token
axiosInstance.interceptors.request.use((config: CustomAxiosRequestConfig) => {
  // Get JWT token from localStorage (no more cookie dependency)
  const token = localStorage.getItem("session_id");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Using JWT token from localStorage for authentication");
  }

  // Add retry count to track retries
  config.metadata = { retryCount: 0 };

  return config;
});

// Response interceptor to handle common errors and retries
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;

    // Handle 401 errors by clearing session
    if (error.response?.status === 401) {
      Cookies.remove("session_id");
      localStorage.removeItem("session_id");
      // Don't redirect automatically - let components handle it
    }

    // Handle rate limiting (429) with retry logic
    if (error.response?.status === 429 && config) {
      const customConfig = config as CustomAxiosRequestConfig;
      if (customConfig.metadata && customConfig.metadata.retryCount < 3) {
        const customConfig = config as CustomAxiosRequestConfig;
        if (customConfig.metadata) {
          customConfig.metadata.retryCount += 1;

          // Exponential backoff: wait 1s, 2s, 4s
          const delay =
            Math.pow(2, customConfig.metadata.retryCount - 1) * 1000;

          await new Promise((resolve) => setTimeout(resolve, delay));

          return axiosInstance(config);
        }
      }
    }

    // Handle network errors with retry
    if (!error.response && config) {
      const customConfig = config as CustomAxiosRequestConfig;
      if (customConfig.metadata && customConfig.metadata.retryCount < 2) {
        const customConfig = config as CustomAxiosRequestConfig;
        if (customConfig.metadata) {
          customConfig.metadata.retryCount += 1;

          // Wait 2 seconds before retry
          await new Promise((resolve) => setTimeout(resolve, 2000));

          return axiosInstance(config);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
