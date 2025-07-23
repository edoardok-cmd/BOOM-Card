# Authentication API Examples

## Overview

This document provides comprehensive examples for integrating with the BOOM Card authentication API. All examples include proper error handling, TypeScript types, and security best practices.

## Table of Contents

- [User Registration](#user-registration)
- [User Login](#user-login)
- [Token Refresh](#token-refresh)
- [Password Reset](#password-reset)
- [OAuth2 Integration](#oauth2-integration)
- [Multi-Factor Authentication](#multi-factor-authentication)
- [Session Management](#session-management)

## User Registration

### Basic Registration

```typescript
import axios, { AxiosError } from 'axios';

interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
  preferredLanguage?: 'en' | 'bg';
}

interface RegistrationResponse {
  success: boolean;
  data: {
    userId: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
  };
}

async function registerUser(data: RegistrationData): Promise<RegistrationResponse> {
  try {
    const response = await axios.post<RegistrationResponse>(
      'https://api.boomcard.com/v1/auth/register',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': '1.0',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data) {
        throw new Error(axiosError.response.data.error.message);
      }
    }
    throw error;
  }
}

// Usage example
const newUser: RegistrationData = {
  email: 'user@example.com',
  password: 'SecurePassword123!',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+359888123456',
  acceptTerms: true,
  marketingConsent: true,
  preferredLanguage: 'en',
};

try {
  const result = await registerUser(newUser);
  console.log('Registration successful:', result);
  // Store tokens securely
  localStorage.setItem('accessToken', result.data.accessToken);
  // Store refresh token in httpOnly cookie (server-side)
} catch (error) {
  console.error('Registration failed:', error);
}
```

### Registration with Email Verification

```typescript
interface EmailVerificationData {
  email: string;
  verificationCode: string;
}

async function verifyEmail(data: EmailVerificationData): Promise<void> {
  try {
    await axios.post(
      'https://api.boomcard.com/v1/auth/verify-email',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.status === 400) {
        throw new Error('Invalid verification code');
      }
    }
    throw error;
  }
}

// Resend verification email
async function resendVerificationEmail(email: string): Promise<void> {
  await axios.post(
    'https://api.boomcard.com/v1/auth/resend-verification',
    { email },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
```

## User Login

### Standard Login

```typescript
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'consumer' | 'partner' | 'admin';
      emailVerified: boolean;
      twoFactorEnabled: boolean;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    requiresTwoFactor?: boolean;
    twoFactorSessionId?: string;
  };
}

async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await axios.post<LoginResponse>(
      'https://api.boomcard.com/v1/auth/login',
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': getDeviceId(), // Implement device fingerprinting
        },
        withCredentials: true, // For cookie-based sessions
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      if (axiosError.response?.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      }
    }
    throw error;
  }
}

// Helper function for device fingerprinting
function getDeviceId(): string {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

### Login with Rate Limiting

```typescript
interface RateLimitInfo {
  remaining: number;
  reset: Date;
  total: number;
}

class AuthService {
  private rateLimitInfo: RateLimitInfo | null = null;

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        'https://api.boomcard.com/v1/auth/login',
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract rate limit headers
      this.rateLimitInfo = {
        remaining: parseInt(response.headers['x-ratelimit-remaining'] || '0'),
        reset: new Date(parseInt(response.headers['x-ratelimit-reset'] || '0') * 1000),
        total: parseInt(response.headers['x-ratelimit-limit'] || '0'),
      };

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
      }
      throw error;
    }
  }

  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }
}
```

## Token Refresh

### Automatic Token Refresh

```typescript
interface TokenRefreshResponse {
  accessToken: string;
  expiresIn: number;
}

class TokenManager {
  private refreshPromise: Promise<string> | null = null;

  async getAccessToken(): Promise<string> {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No access token available');
    }

    if (this.isTokenExpired(token)) {
      return this.refreshAccessToken();
    }

    return token;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      // Refresh 5 minutes before expiry
      return Date.now() >= expiryTime - 300000;
    } catch {
      return true;
    }
  }

  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      const response = await axios.post<TokenRefreshResponse>(
        'https://api.boomcard.com/v1/auth/refresh',
        {},
        {
          withCredentials: true, // Sends httpOnly refresh token cookie
          headers: {
            'X-Device-Id': getDeviceId(),
          },
        }
      );

      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      
      return accessToken;
    } catch (error) {
      // Clear tokens on refresh failure
      localStorage.removeItem('accessToken');
      throw new Error('Session expired. Please login again.');
    }
  }
}

// Axios interceptor for automatic token refresh
const tokenManager = new TokenManager();

axios.interceptors.request.use(
  async (config) => {
    if (config.url?.includes('/auth/')) {
      return config;
    }

    try {
      const token = await tokenManager.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      // Redirect to login
      window.location.href = '/login';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

## Password Reset

### Request Password Reset

```typescript
interface PasswordResetRequest {
  email: string;
}

interface PasswordResetResponse {
  success: boolean;
  message: string;
  resetTokenExpiry?: number; // Minutes until expiry
}

async function requestPasswordReset(email: string): Promise<PasswordResetResponse> {
  try {
    const response = await axios.post<PasswordResetResponse>(
      'https://api.boomcard.com/v1/auth/password-reset/request',
      { email },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Always return success to prevent email enumeration
      return {
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.',
      };
    }
    throw error;
  }
}
```

### Complete Password Reset

```typescript
interface PasswordResetData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface Pass