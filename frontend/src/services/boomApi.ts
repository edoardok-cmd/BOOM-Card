import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  Partner,
  PartnerFilters,
  SubscriptionPlan,
  Subscription,
  Transaction,
  Activity,
  Achievement,
  Favorite,
  UserStats,
  ApiResponse,
  PaginatedResponse,
  ContactForm,
  ReviewForm,
  QRCodeData,
  ConnectedAccount
} from '../types';
import { AppError, parseApiError, logError } from '../utils/errorHandler';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003/api';

// Create axios instance with base configuration
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for CORS cookies
  });

  // Request interceptor for authentication
  instance.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      // Check if we're on the client side
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add language header
        const language = localStorage.getItem('language') || 'bg';
        if (config.headers) {
          config.headers['Accept-Language'] = language;
        }
      }
      
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling and token refresh
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest: any = error.config;
      
      // Handle token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      // Parse and log the error
      const appError = parseApiError(error, localStorage.getItem('language') as 'en' | 'bg' || 'bg');
      logError(appError, { url: error.config?.url, method: error.config?.method });
      
      return Promise.reject(appError);
    }
  );

  return instance;
};

// Create the API instance
const apiInstance = createApiInstance();

// API Service Class
class BoomApiService {
  // === Authentication ===
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiInstance.post<LoginResponse>('/auth/login', data);
    
    // Store tokens and user data
    if (response.data.data) {
      const { user, tokens } = response.data.data;
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await apiInstance.post<ApiResponse<User>>('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiInstance.post('/auth/logout');
    } catch (error) {
      // Log error but don't throw - logout should always succeed locally
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    const response = await apiInstance.post<ApiResponse<void>>('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await apiInstance.post<ApiResponse<void>>('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  }

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    const response = await apiInstance.post<ApiResponse<void>>('/auth/verify-email', { token });
    return response.data;
  }

  // === User Management ===
  async getCurrentUser(): Promise<User> {
    const response = await apiInstance.get<ApiResponse<User>>('/users/me');
    if (response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    throw new AppError('Failed to get user data', 'USER_NOT_FOUND', 404);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiInstance.put<ApiResponse<User>>('/users/me', data);
    if (response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    throw new AppError('Failed to update profile', 'UPDATE_FAILED', 400);
  }

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiInstance.post<ApiResponse<{ url: string }>>('/users/me/avatar', 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (response.data.data) {
      return response.data.data.url;
    }
    throw new AppError('Failed to upload avatar', 'UPLOAD_FAILED', 400);
  }

  async updatePreferences(preferences: Partial<User['preferences']>): Promise<User> {
    const response = await apiInstance.put<ApiResponse<User>>('/users/me/preferences', preferences);
    if (response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    throw new AppError('Failed to update preferences', 'UPDATE_FAILED', 400);
  }

  // === Partners ===
  async getPartners(filters?: PartnerFilters): Promise<PaginatedResponse<Partner>> {
    const response = await apiInstance.get<PaginatedResponse<Partner>>('/partners', { 
      params: filters 
    });
    return response.data;
  }

  async getPartner(id: string): Promise<Partner> {
    const response = await apiInstance.get<ApiResponse<Partner>>(`/partners/${id}`);
    if (response.data.data) {
      return response.data.data;
    }
    throw new AppError('Partner not found', 'NOT_FOUND', 404);
  }

  async getFeaturedPartners(): Promise<Partner[]> {
    const response = await apiInstance.get<ApiResponse<Partner[]>>('/partners/featured');
    return response.data.data || [];
  }

  async getPartnerCategories(): Promise<string[]> {
    const response = await apiInstance.get<ApiResponse<string[]>>('/partners/categories');
    return response.data.data || [];
  }

  async searchPartners(query: string): Promise<Partner[]> {
    const response = await apiInstance.get<ApiResponse<Partner[]>>('/partners/search', {
      params: { q: query }
    });
    return response.data.data || [];
  }

  // === Subscriptions ===
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiInstance.get<ApiResponse<SubscriptionPlan[]>>('/subscriptions/plans');
    return response.data.data || [];
  }

  async getCurrentSubscription(): Promise<Subscription | null> {
    const response = await apiInstance.get<ApiResponse<Subscription>>('/subscriptions/current');
    return response.data.data || null;
  }

  async subscribe(planId: string, paymentMethodId?: string): Promise<Subscription> {
    const response = await apiInstance.post<ApiResponse<Subscription>>('/subscriptions/subscribe', {
      planId,
      paymentMethodId
    });
    if (response.data.data) {
      return response.data.data;
    }
    throw new AppError('Failed to create subscription', 'SUBSCRIPTION_FAILED', 400);
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await apiInstance.post(`/subscriptions/${subscriptionId}/cancel`);
  }

  async updateSubscription(subscriptionId: string, planId: string): Promise<Subscription> {
    const response = await apiInstance.put<ApiResponse<Subscription>>(
      `/subscriptions/${subscriptionId}`,
      { planId }
    );
    if (response.data.data) {
      return response.data.data;
    }
    throw new AppError('Failed to update subscription', 'UPDATE_FAILED', 400);
  }

  // === Transactions ===
  async getTransactions(filters?: {
    startDate?: string;
    endDate?: string;
    partnerId?: string;
    status?: string;
  }): Promise<Transaction[]> {
    const response = await apiInstance.get<ApiResponse<Transaction[]>>('/transactions', {
      params: filters
    });
    return response.data.data || [];
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await apiInstance.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    if (response.data.data) {
      return response.data.data;
    }
    throw new AppError('Transaction not found', 'NOT_FOUND', 404);
  }

  // === Activities ===
  async getActivities(limit: number = 10): Promise<Activity[]> {
    const response = await apiInstance.get<ApiResponse<Activity[]>>('/activities', {
      params: { limit }
    });
    return response.data.data || [];
  }

  // === Achievements ===
  async getAchievements(): Promise<Achievement[]> {
    const response = await apiInstance.get<ApiResponse<Achievement[]>>('/achievements');
    return response.data.data || [];
  }

  // === Favorites ===
  async getFavorites(): Promise<Favorite[]> {
    const response = await apiInstance.get<ApiResponse<Favorite[]>>('/favorites');
    return response.data.data || [];
  }

  async addFavorite(partnerId: string): Promise<void> {
    await apiInstance.post('/favorites', { partnerId });
  }

  async removeFavorite(partnerId: string): Promise<void> {
    await apiInstance.delete(`/favorites/${partnerId}`);
  }

  // === User Stats ===
  async getUserStats(): Promise<UserStats> {
    const response = await apiInstance.get<ApiResponse<UserStats>>('/users/me/stats');
    if (response.data.data) {
      return response.data.data;
    }
    throw new AppError('Failed to get user stats', 'STATS_FAILED', 400);
  }

  // === QR Code ===
  async getQRCode(): Promise<QRCodeData> {
    const response = await apiInstance.get<ApiResponse<QRCodeData>>('/users/me/qr-code');
    if (response.data.data) {
      return response.data.data;
    }
    throw new AppError('Failed to get QR code', 'QR_FAILED', 400);
  }

  async regenerateQRCode(): Promise<QRCodeData> {
    const response = await apiInstance.post<ApiResponse<QRCodeData>>('/users/me/qr-code/regenerate');
    if (response.data.data) {
      return response.data.data;
    }
    throw new AppError('Failed to regenerate QR code', 'QR_FAILED', 400);
  }

  // === Discount Usage ===
  async useDiscount(partnerId: string, discountCode?: string): Promise<{
    transactionId: string;
    savings: number;
  }> {
    const response = await apiInstance.post<ApiResponse<{
      transactionId: string;
      savings: number;
    }>>('/discounts/use', {
      partnerId,
      discountCode
    });
    
    if (response.data.data) {
      return response.data.data;
    }
    throw new AppError('Failed to use discount', 'DISCOUNT_FAILED', 400);
  }

  // === Reviews ===
  async submitReview(data: ReviewForm): Promise<void> {
    await apiInstance.post('/reviews', data);
  }

  // === Contact ===
  async submitContactForm(data: ContactForm): Promise<void> {
    await apiInstance.post('/contact', data);
  }

  // === Connected Accounts ===
  async getConnectedAccounts(): Promise<ConnectedAccount[]> {
    const response = await apiInstance.get<ApiResponse<ConnectedAccount[]>>('/users/me/connected-accounts');
    return response.data.data || [];
  }

  async connectAccount(provider: 'google' | 'facebook' | 'apple'): Promise<string> {
    const response = await apiInstance.post<ApiResponse<{ authUrl: string }>>(
      `/auth/connect/${provider}`
    );
    if (response.data.data) {
      return response.data.data.authUrl;
    }
    throw new AppError('Failed to connect account', 'CONNECTION_FAILED', 400);
  }

  async disconnectAccount(provider: 'google' | 'facebook' | 'apple'): Promise<void> {
    await apiInstance.delete(`/auth/disconnect/${provider}`);
  }

  // === Notifications ===
  async getNotifications(): Promise<any[]> {
    const response = await apiInstance.get<ApiResponse<any[]>>('/notifications');
    return response.data.data || [];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await apiInstance.put(`/notifications/${id}/read`);
  }

  async updateNotificationSettings(settings: any): Promise<void> {
    await apiInstance.put('/notifications/settings', settings);
  }
}

// Export singleton instance
export const boomApi = new BoomApiService();

// Export the class for testing
export { BoomApiService };

// Default export
export default boomApi;