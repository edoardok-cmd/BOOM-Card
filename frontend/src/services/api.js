import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';

// API Response Types
export 

export 

// User & Authentication Types
export 

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  GUEST = 'GUEST'
}

export 

export 

export 

export 

// Card Types
export 

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

export 

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5002';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers,
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
    const originalRequest = error.config;
    
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

export const connectWebSocket = (userId) => {
  if (!socket) {
    socket = io(WS_URL, {
      auth,
      query,
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

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// API Service Class
class ApiService {
  // Authentication
  async login(data: LoginRequest)> {
    const response = await axiosInstance.post>('/auth/login', data);
    return response.data;
  }
  
  async register(data: RegisterRequest)> {
    const response = await axiosInstance.post>('/auth/register', data);
    return response.data;
  }
  
  async logout()> {
    const response = await axiosInstance.post>('/auth/logout');
    return response.data;
  }
  
  async refreshToken(refreshToken)> {
    const response = await axiosInstance.post>('/auth/refresh', { refreshToken });
    return response.data;
  }
  
  async forgotPassword(email)> {
    const response = await axiosInstance.post>('/auth/forgot-password', { email });
    return response.data;
  }
  
  async resetPassword(data: ResetPasswordRequest)> {
    const response = await axiosInstance.post>('/auth/reset-password', data);
    return response.data;
  }
  
  // User Management
  async getCurrentUser()> {
    const response = await axiosInstance.get>('/users/me');
    return response.data;
  }
  
  async updateProfile(data: Partial)> {
    const response = await axiosInstance.put>('/users/me', data);
    return response.data;
  }
  
  async uploadAvatar(file: File)> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await axiosInstance.post>('/users/me/avatar', formData, {
      headers,
    });
    return response.data;
  }
  
  // Cards
  async getCards(params?)>> {
    const response = await axiosInstance.get>>('/cards', { params });
    return response.data;
  }
  
  async getCard(id)> {
    const response = await axiosInstance.get>(`/cards/${id}`);
    return response.data;
  }
  
  async createCard(data: Partial)> {
    const response = await axiosInstance.post>('/cards', data);
    return response.data;
  }
  
  async updateCard(id, data: Partial)> {
    const response = await axiosInstance.put>(`/cards/${id}`, data);
    return response.data;
  }
  
  async deleteCard(id)> {
    const response = await axiosInstance.delete>(`/cards/${id}`);
    return response.data;
  }
  
  async uploadAttachment(cardId, file: File)> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post>(`/cards/${cardId}/attachments`, formData, {
      headers,
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
