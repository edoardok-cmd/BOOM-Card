import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '../../services/api';
import { RootState } from '../store';

// Types and Interfaces
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  updates: boolean;
  reminders: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  allowDataCollection: boolean;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  PREMIUM = 'PREMIUM',
  GUEST = 'GUEST'
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  sessionExpiresAt: string | null;
  lastActivity: string | null;
  loginAttempts: number;
  isRefreshing: boolean;
  mfaRequired: boolean;
  mfaVerified: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  sessionId: string;
  mfaRequired?: boolean;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface MFASetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAVerifyRequest {
  code: string;
  trustDevice?: boolean;
}

// Constants
const AUTH_STORAGE_KEY = 'boom_auth_state';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// API Endpoints
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  RESET_PASSWORD: '/auth/reset-password',
  RESET_PASSWORD_CONFIRM: '/auth/reset-password/confirm',
  CHANGE_PASSWORD: '/auth/change-password',
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile/update',
  MFA_SETUP: '/auth/mfa/setup',
  MFA_VERIFY: '/auth/mfa/verify',
  MFA_DISABLE: '/auth/mfa/disable',
  SESSION_VALIDATE: '/auth/session/validate',
  OAUTH_CALLBACK: '/auth/oauth/callback'
};

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessionExpiry: null,
  lastActivity: null,
  permissions: [],
  roles: [],
  twoFactorRequired: false,
  twoFactorVerified: false,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      if (state.auth.token) {
        await authAPI.logout(state.auth.token);
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      if (!state.auth.refreshToken) {
        throw new Error('No refresh token available');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
);

export const verifyTwoFactor = createAsyncThunk(
  'auth/verifyTwoFactor',
  async (code: string, { getState, rejectWithValue }) => {
    try {
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '2FA verification failed');
    }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: UpdateProfileData, { getState, rejectWithValue }) => {
    try {
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload;
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.sessionExpiry = null;
      state.lastActivity = null;
      state.permissions = [];
      state.roles = [];
      state.twoFactorRequired = false;
      state.twoFactorVerified = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setTwoFactorRequired: (state, action: PayloadAction<boolean>) => {
      state.twoFactorRequired = action.payload;
    },
    updatePermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    updateRoles: (state, action: PayloadAction<string[]>) => {
      state.roles = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.sessionExpiry = action.payload.expiresAt;
        state.lastActivity = Date.now();
        state.permissions = action.payload.permissions || [];
        state.roles = action.payload.roles || [];
        state.twoFactorRequired = action.payload.twoFactorRequired || false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.sessionExpiry = null;
        state.lastActivity = null;
        state.permissions = [];
        state.roles = [];
        state.twoFactorRequired = false;
        state.twoFactorVerified = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Clear auth state even if logout API call fails
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.sessionExpiry = action.payload.expiresAt;
        state.lastActivity = Date.now();
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Clear auth on refresh failure
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      // Two-factor verification
      .addCase(verifyTwoFactor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyTwoFactor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.twoFactorVerified = true;
        state.twoFactorRequired = false;
        state.token = action.payload.token;
        state.sessionExpiry = action.payload.expiresAt;
        state.error = null;
      })
      .addCase(verifyTwoFactor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  setUser,
  setToken,
  setRefreshToken,
  updateLastActivity,
  clearAuth,
  setError,
  clearError,
  setTwoFactorRequired,
  updatePermissions,
  updateRoles,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectPermissions = (state: RootState) => state.auth.permissions;
export const selectRoles = (state: RootState) => state.auth.roles;
export const selectTwoFactorRequired = (state: RootState) => state.auth.twoFactorRequired;
export const selectTwoFactorVerified = (state: RootState) => state.auth.twoFactorVerified;
export const selectSessionExpiry = (state: RootState) => state.auth.sessionExpiry;

// Permission check selectors
export const selectHasPermission = (permission: string) => (state: RootState) =>
  state.auth.permissions.includes(permission);

export const selectHasAnyPermission = (permissions: string[]) => (state: RootState) =>
  permissions.some(permission => state.auth.permissions.includes(permission));

export const selectHasAllPermissions = (permissions: string[]) => (state: RootState) =>
  permissions.every(permission => state.auth.permissions.includes(permission));

export const selectHasRole = (role: string) => (state: RootState) =>
  state.auth.roles.includes(role);

export const selectHasAnyRole = (roles: string[]) => (state: RootState) =>
  roles.some(role => state.auth.roles.includes(role));

// Session validity selector
export const selectIsSessionValid = (state: RootState) => {
  const { sessionExpiry, lastActivity, isAuthenticated } = state.auth;
  if (!isAuthenticated || !sessionExpiry) return false;
  
  const now = Date.now();
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes
  const isExpired = now > sessionExpiry;
  const isInactive = lastActivity ? now - lastActivity > sessionTimeout : false;
  
  return !isExpired && !isInactive;
};

export default authSlice.reducer;

}
}
}
}
}
