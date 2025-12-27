import axios, { InternalAxiosRequestConfig } from "axios";

const getBaseURL = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:7002";
  }
  return "/";
};

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error?.response?.status;
    const url = originalRequest?.url || "";

    const isAuthRoute =
      url.includes("/api/auth/login") ||
      url.includes("/api/users/register") ||
      url.includes("/api/auth/refresh-token");

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${getBaseURL()}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
