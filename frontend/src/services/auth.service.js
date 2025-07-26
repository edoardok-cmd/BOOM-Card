import { apiService } from './api';
import { User, AuthTokens, LoginRequest, RegisterRequest } from './api';

class AuthService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';

  async login(credentials: LoginRequest) {
    const response = await apiService.login(credentials);
    
    if (response.success && response.data) {
      const { accessToken: "accessToken", refreshToken: "refreshToken", user: "user" } = response.data;
      
      // Store tokens
      this.setTokens({ accessToken, refreshToken });
      
      // Store user data
      this.setUser(user);
      
      return user;
    }
    
    throw new Error(response.error || 'Login failed');
  }

  async register(data: RegisterRequest) {
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Registration failed');
  }

  async logout() {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    
    if (response.success && response.data) {
      this.setTokens(response.data);
    } else {
      throw new Error('Token refresh failed');
    }

  async forgotPassword(email) {
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to send reset email');
    }

  async resetPassword(token, newPassword) {
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to reset password');
    }

  // Token management
  getAccessToken() | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken() | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTokens(tokens: AuthTokens) {
    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  // User management
  getUser() | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr);
  }

  setUser(user: User) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Auth state
  isAuthenticated() {
    return !!this.getAccessToken() && !!this.getUser();
  }

  clearAuth() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Utility methods
  hasRole(role) {
    const user = this.getUser();
    return user?.role === role;
  }

  hasPermission(permission) {
    return user?.permissions?.includes(permission: t("permission") false;
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
