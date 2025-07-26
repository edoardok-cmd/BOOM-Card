import { boomApi } from './boomApi';
import { mockAuthService } from './mockAuthService';
import { 
  User, 
  AuthTokens,
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  ApiResponse 
} from '../types';
import { AppError } from '../utils/errorHandler';

class AuthService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  async login(credentials: LoginRequest): Promise<User> {
    // TEMPORARY: Force mock authentication while backend is down
    console.log('🔧 Using mock authentication (backend is down)');
    
    const mockResponse = await mockAuthService.login(credentials);
    this.setTokens(mockResponse.tokens);
    this.setUser(mockResponse.user);
    
    // Set up token refresh timer
    this.setupTokenRefresh();
    
    return mockResponse.user;
    
    /* ORIGINAL CODE - Uncomment when backend is working
    try {
      const response = await boomApi.login(credentials);
      
      if (response.data) {
        const { user } = response.data;
        
        // Set up token refresh timer
        this.setupTokenRefresh();
        
        return user;
      }
      
      throw new AppError('Login failed', 'LOGIN_FAILED', 401);
    } catch (error) {
      // If real API fails (backend not running), use mock auth
      console.warn('Backend API unavailable, using mock authentication');
      
      const mockResponse = await mockAuthService.login(credentials);
      this.setTokens(mockResponse.tokens);
      this.setUser(mockResponse.user);
      
      // Set up token refresh timer
      this.setupTokenRefresh();
      
      return mockResponse.user;
    }
    */
  }

  async register(data: RegisterRequest): Promise<User> {
    const response = await boomApi.register(data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new AppError('Registration failed', 'REGISTRATION_FAILED', 400);
  }

  async logout(): Promise<void> {
    // Clear token refresh timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
    
    try {
      await boomApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
      window.location.href = '/login';
    }
  }

  async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new AppError('No refresh token available', 'NO_REFRESH_TOKEN', 401);
    }
    
    // Token refresh is handled by the API interceptor
    // Just make an authenticated request to trigger refresh
    await boomApi.getCurrentUser();
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await boomApi.forgotPassword(email);
    
    if (!response.success) {
      throw new AppError(
        response.error || 'Failed to send reset email',
        'FORGOT_PASSWORD_FAILED',
        400
      );
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await boomApi.resetPassword(token, newPassword);
    
    if (!response.success) {
      throw new AppError(
        response.error || 'Failed to reset password',
        'RESET_PASSWORD_FAILED',
        400
      );
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await boomApi.verifyEmail(token);
    
    if (!response.success) {
      throw new AppError(
        response.error || 'Failed to verify email',
        'EMAIL_VERIFICATION_FAILED',
        400
      );
    }
  }

  // Token management
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  // User management
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }

  setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  async getCurrentUser(forceRefresh: boolean = false): Promise<User> {
    // Return cached user if not forcing refresh
    if (!forceRefresh) {
      const cachedUser = this.getUser();
      if (cachedUser) return cachedUser;
    }
    
    try {
      return await boomApi.getCurrentUser();
    } catch (error) {
      // If API fails, try to get user from mock service
      const token = this.getAccessToken();
      if (token) {
        return await mockAuthService.getCurrentUser(token);
      }
      throw error;
    }
  }

  // Auth state
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getUser();
  }

  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Utility methods
  hasMembership(type: 'standard' | 'premium' | 'vip'): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    const membershipOrder = { standard: 1, premium: 2, vip: 3 };
    return membershipOrder[user.membershipType] >= membershipOrder[type];
  }

  isMembershipActive(): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    const expiryDate = new Date(user.membershipExpiry);
    return expiryDate > new Date();
  }

  getMembershipDaysRemaining(): number {
    const user = this.getUser();
    if (!user) return 0;
    
    const expiryDate = new Date(user.membershipExpiry);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }

  // Set up automatic token refresh
  private setupTokenRefresh(): void {
    // Clear existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
    
    // Set up new timer - refresh token 5 minutes before expiry
    const expiresIn = 3600000; // 1 hour in milliseconds (adjust based on your token expiry)
    const refreshTime = expiresIn - 300000; // 5 minutes before expiry
    
    this.tokenRefreshTimer = setTimeout(async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (refreshToken) {
          // Token refresh is handled by the API interceptor
          // Just make a simple authenticated request to trigger refresh
          await this.getCurrentUser(true);
          
          // Set up next refresh
          this.setupTokenRefresh();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Logout user if refresh fails
        await this.logout();
      }
    }, refreshTime);
  }

  // Social authentication
  async connectSocialAccount(provider: 'google' | 'facebook' | 'apple'): Promise<void> {
    const authUrl = await boomApi.connectAccount(provider);
    
    // Open authentication window
    const authWindow = window.open(
      authUrl,
      'socialAuth',
      'width=500,height=600,menubar=no,toolbar=no'
    );
    
    // Check for authentication completion
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        try {
          if (authWindow?.closed) {
            clearInterval(checkInterval);
            // Check if authentication was successful
            this.getCurrentUser(true)
              .then(() => resolve())
              .catch(() => reject(new Error('Social authentication failed')));
          }
        } catch (error) {
          clearInterval(checkInterval);
          reject(error);
        }
      }, 1000);
      
      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        authWindow?.close();
        reject(new Error('Social authentication timeout'));
      }, 300000);
    });
  }

  // Disconnect social account
  async disconnectSocialAccount(provider: 'google' | 'facebook' | 'apple'): Promise<void> {
    await boomApi.disconnectAccount(provider);
    // Refresh user data
    await this.getCurrentUser(true);
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export the class for testing
export default AuthService;