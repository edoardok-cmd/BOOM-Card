import { apiService } from './api';
import { User, AuthTokens, LoginRequest, RegisterRequest } from './api';

class AuthService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';

  async login(credentials: LoginRequest): Promise<User> {
    const response = await apiService.login(credentials);
    
    if (response.success && response.data) {
      const { accessToken, refreshToken, user } = response.data;
      
      // Store tokens
      this.setTokens({ accessToken, refreshToken } as AuthTokens);
      
      // Store user data
      this.setUser(user);
      
      return user;
    }
    
    throw new Error(response.error || 'Login failed');
  }

  async register(data: RegisterRequest): Promise<User> {
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }

  async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    
    if (response.success && response.data) {
      this.setTokens(response.data);
    } else {
      throw new Error('Token refresh failed');
    }

  async forgotPassword(email: string): Promise<void> {
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to send reset email');
    }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to reset password');
    }

  // Token management
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  // User management
  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Auth state
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getUser();
  }

  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Utility methods
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  hasPermission(permission: string): boolean {
    return user?.permissions?.includes(permission) || false;
  }

// Export singleton instance
export const authService = new AuthService();

// Export the class for testing
export default AuthService;

}
}
}
}
}
