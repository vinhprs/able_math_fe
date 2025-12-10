import api from "@/lib/api";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName: string;
}

class AuthService {
  private readonly ACCESS_TOKEN_KEY = "accessToken";
  private readonly REFRESH_TOKEN_KEY = "refreshToken";
  private readonly USER_KEY = "user";

  /**
   * Login and store tokens
   */
  async login(username: string, password: string): Promise<User> {
    const response = await api.post<{
      success: boolean;
      data: {
        user: User;
        accessToken: string;
        refreshToken: string;
        expiresIn?: number;
      };
      timestamp: string;
    }>("/auth/login", { username, password });

    const { user, accessToken, refreshToken } = response.data.data;

    this.setTokens(accessToken, refreshToken);
    this.setUser(user);

    return user;
  }

  /**
   * Logout and clear tokens
   */
  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearTokens();
      this.clearUser();
    }
  }

  /**
   * Set both tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Set access token only (used during refresh)
   */
  setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  /**
   * Set refresh token only
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Set user data
   */
  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user data
   */
  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Clear user data
   */
  clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
