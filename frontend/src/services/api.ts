import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// User & Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  GUEST = 'GUEST'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Card Types
export interface Card {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: CardCategory;
  tags: string[];
  status: CardStatus;
  priority: Priority;
  dueDate?: string;
  completedAt?: string;
  attachments: Attachment[];
  collaborators: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export enum CardCategory {
  PERSONAL = 'PERSONAL',
  WORK = 'WORK',
  EDUCATION = 'EDUCATION',
  HEALTH = 'HEALTH',
  FINANCE = 'FINANCE',
  OTHER = 'OTHER'
}

export enum CardStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5002';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// WebSocket connection
let socket: Socket | null = null;

export const connectWebSocket = (userId: string): Socket => {
  if (!socket) {
    socket = io(WS_URL, {
      auth: {
        token: localStorage.getItem('accessToken'),
      },
      query: {
        userId,
      },
    });
    
    socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
    
    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }
  
  return socket;
};

export const disconnectWebSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// API Service Class
class ApiService {
  // Authentication
  async login(data: LoginRequest): Promise<ApiResponse<AuthTokens & { user: User }>> {
    const response = await axiosInstance.post<ApiResponse<AuthTokens & { user: User }>>('/auth/login', data);
    return response.data;
  }
  
  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await axiosInstance.post<ApiResponse<User>>('/auth/register', data);
    return response.data;
  }
  
  async logout(): Promise<ApiResponse<void>> {
    const response = await axiosInstance.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  }
  
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    const response = await axiosInstance.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken });
    return response.data;
  }
  
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.post<ApiResponse<void>>('/auth/forgot-password', { email });
    return response.data;
  }
  
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
    const response = await axiosInstance.post<ApiResponse<void>>('/auth/reset-password', data);
    return response.data;
  }
  
  // User Management
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await axiosInstance.get<ApiResponse<User>>('/users/me');
    return response.data;
  }
  
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await axiosInstance.put<ApiResponse<User>>('/users/me', data);
    return response.data;
  }
  
  async uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await axiosInstance.post<ApiResponse<{ url: string }>>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
  
  // Cards
  async getCards(params?: {
    page?: number;
    pageSize?: number;
    category?: CardCategory;
    status?: CardStatus;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Card>>> {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Card>>>('/cards', { params });
    return response.data;
  }
  
  async getCard(id: string): Promise<ApiResponse<Card>> {
    const response = await axiosInstance.get<ApiResponse<Card>>(`/cards/${id}`);
    return response.data;
  }
  
  async createCard(data: Partial<Card>): Promise<ApiResponse<Card>> {
    const response = await axiosInstance.post<ApiResponse<Card>>('/cards', data);
    return response.data;
  }
  
  async updateCard(id: string, data: Partial<Card>): Promise<ApiResponse<Card>> {
    const response = await axiosInstance.put<ApiResponse<Card>>(`/cards/${id}`, data);
    return response.data;
  }
  
  async deleteCard(id: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/cards/${id}`);
    return response.data;
  }
  
  async uploadAttachment(cardId: string, file: File): Promise<ApiResponse<Attachment>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post<ApiResponse<Attachment>>(`/cards/${cardId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export axios instance for custom requests
export { axiosInstance };

// Default export
export default apiService;
