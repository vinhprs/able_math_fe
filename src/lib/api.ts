import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import type { IAuthResponse } from "@shared/types/users.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

/**
 * Create axios instance with base configuration
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

/**
 * Request interceptor: Attach JWT token to requests
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle 401 errors and token refresh
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          // Only redirect if not already on login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }

        // Attempt to refresh token
        const response = await axios.post<{ success: boolean; data: IAuthResponse; timestamp: string }>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        // Backend wraps response in { success, data, timestamp }
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update tokens in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear storage and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        // Only redirect if not already on login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Format error for better handling
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as { message?: string | string[] };

      // Create formatted error
      const formattedError = {
        ...error,
        message: data?.message || error.message || "An error occurred",
        status,
        data: data,
      };

      return Promise.reject(formattedError);
    } else if (error.request) {
      // Request was made but no response received (network error)
      const networkError = {
        ...error,
        message: "Network error. Please check your connection and try again.",
        isNetworkError: true,
      };
      return Promise.reject(networkError);
    }

    // Something else happened
    return Promise.reject(error);
  }
);

export default api;
