import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

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
    } else if (
      !token &&
      !config.url?.includes("/auth/login") &&
      !config.url?.includes("/auth/refresh")
    ) {
      console.warn(
        "No access token found in localStorage for request:",
        config.url
      );
      console.log("Available localStorage keys:", Object.keys(localStorage));
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// State for handling refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response interceptor: Handle 401 errors and token refresh with queue
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Format error for better handling (for non-401 errors)
    if (error.response?.status !== 401) {
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

    // Handle 401 Unauthorized - token refresh
    // Skip refresh for auth endpoints to prevent infinite loops
    if (
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          // Create fresh config with token
          const retryConfig: InternalAxiosRequestConfig = {
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            } as any,
          };

          return api.request(retryConfig);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Mark request as retried and start refresh process
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.warn("No refresh token available, logging out...");
      console.log("Current localStorage keys:", Object.keys(localStorage));
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      processQueue(new Error("No refresh token"), null);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      isRefreshing = false;
      return Promise.reject(error);
    }

    console.log("Attempting token refresh...");

    try {
      // Call refresh endpoint (use axios directly to avoid interceptor loop)
      const response = await axios.post<{
        success: boolean;
        data: {
          accessToken: string;
          refreshToken?: string;
          expiresIn?: number;
        };
        timestamp: string;
      }>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Backend wraps response in { success, data, timestamp }
      if (!response.data.success || !response.data.data) {
        throw new Error("Invalid refresh response format");
      }

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      if (!accessToken) {
        throw new Error("No access token in refresh response");
      }

      // Update stored tokens
      localStorage.setItem("accessToken", accessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      console.log(
        "Token refreshed successfully, new token:",
        accessToken.substring(0, 20) + "..."
      );

      // Process all queued requests first
      processQueue(null, accessToken);

      // Create a fresh request config with the new token
      // This ensures the token is definitely included
      const retryConfig: InternalAxiosRequestConfig = {
        ...originalRequest,
        headers: {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`,
        } as any,
      };

      // Retry original request with new token
      console.log("Retrying request with new token:", originalRequest.url);
      const authHeader = retryConfig.headers?.Authorization;
      if (typeof authHeader === "string") {
        console.log(
          "Retry config Authorization:",
          authHeader.substring(0, 30) + "..."
        );
      }

      // Use api instance but with updated config
      // The request interceptor will see the token in localStorage and add it again,
      // but we've also set it in headers to be safe
      return api.request(retryConfig);
    } catch (refreshError: any) {
      // Refresh failed, logout user
      console.error("Token refresh failed:", refreshError);

      // If refresh endpoint also returns 401, prevent infinite loop
      if (refreshError.response?.status === 401) {
        console.error("Refresh token is invalid or expired");
      }

      processQueue(refreshError, null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?session=expired";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }

    // If we reach here, token refresh failed - reject the error
    return Promise.reject(error);
  }
);

export default api;
