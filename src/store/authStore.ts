import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  IUser,
  ILoginCredentials,
  IAuthResponse,
} from "@shared/types/users.types";
import api from "@/lib/api";

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: ILoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: IUser) => void;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
  initialize: () => void;
}

type AuthStore = AuthState & AuthActions;

/**
 * Auth store using Zustand with persistence
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: ILoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<{ success: boolean; data: IAuthResponse; timestamp: string }>(
            "/auth/login",
            credentials
          );
          // Backend wraps response in { success, data, timestamp }
          const { accessToken, refreshToken, user } = response.data.data;

          // Store tokens in localStorage (also done by persist middleware)
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("user", JSON.stringify(user));

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          // Format error message
          let errorMessage = "Login failed. Please try again.";

          if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message;

            if (status === 401) {
              errorMessage = "Invalid username or password.";
            } else if (status === 403) {
              errorMessage = "Access denied.";
            } else if (status >= 500) {
              errorMessage = "Server error. Please try again later.";
            } else if (message) {
              errorMessage = Array.isArray(message)
                ? message.join(", ")
                : message;
            }
          } else if (error.request) {
            errorMessage = "Network error. Please check your connection.";
          } else if (error.message) {
            errorMessage = error.message;
          }

          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });
      },

      setUser: (user: IUser) => {
        set({ user });
      },

      refreshAccessToken: async () => {
        const { refreshToken: currentRefreshToken } = get();
        if (!currentRefreshToken) {
          throw new Error("No refresh token available");
        }

        try {
          const response = await api.post<{ success: boolean; data: IAuthResponse; timestamp: string }>("/auth/refresh", {
            refreshToken: currentRefreshToken,
          });
          // Backend wraps response in { success, data, timestamp }
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          set({
            accessToken,
            refreshToken: newRefreshToken,
          });
        } catch (error: any) {
          // Refresh failed, logout user
          get().logout();
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: () => {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const userStr = localStorage.getItem("user");

        if (accessToken && refreshToken && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
            });

            // Verify token is still valid by fetching current user (async, non-blocking)
            api
              .get<{ success: boolean; data: IUser; timestamp: string }>("/auth/me")
              .then((response) => {
                // Backend wraps response in { success, data, timestamp }
                const currentUser = response.data.data;
                set({ user: currentUser });
                localStorage.setItem("user", JSON.stringify(currentUser));
              })
              .catch(() => {
                // Token invalid, try to refresh
                if (refreshToken) {
                  get()
                    .refreshAccessToken()
                    .then(() => {
                      // After refresh, fetch user again
                      return api.get<{ success: boolean; data: IUser; timestamp: string }>("/auth/me");
                    })
                    .then((response) => {
                      // Backend wraps response in { success, data, timestamp }
                      const currentUser = response.data.data;
                      set({ user: currentUser });
                      localStorage.setItem("user", JSON.stringify(currentUser));
                    })
                    .catch(() => {
                      // Refresh failed, clear storage
                      get().logout();
                    });
                } else {
                  get().logout();
                }
              });
          } catch {
            // Invalid user data, clear storage
            get().logout();
          }
        } else {
          // No stored auth data
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
