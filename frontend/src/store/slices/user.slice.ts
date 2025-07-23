import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { api } from '../../services/api';
import { RootState } from '../store';
import { showNotification } from './notification.slice';

// User interfaces
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImage?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationPreferences {
  email: {
    marketing: boolean;
    transactions: boolean;
    security: boolean;
    updates: boolean;
  };
  push: {
    marketing: boolean;
    transactions: boolean;
    security: boolean;
    updates: boolean;
  };
  sms: {
    marketing: boolean;
    transactions: boolean;
    security: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'contacts' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  allowContactRequests: boolean;
}

export enum UserRole {
  USER = 'USER',
  PREMIUM = 'PREMIUM',
  BUSINESS = 'BUSINESS',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  BANNED = 'BANNED'
}

export interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  lastFetch: number | null;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  profileImage?: string;
}

export interface UpdatePreferencesPayload {
  language?: string;
  currency?: string;
  timezone?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: Partial<NotificationPreferences>;
  privacy?: Partial<PrivacySettings>;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface Enable2FAPayload {
  password: string;
}

export interface Verify2FAPayload {
  token: string;
  code: string;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

// Constants
const USER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const USER_STORAGE_KEY = 'boom_user';

// Initial state
const initialState: UserState = {
  currentUser: null,
  users: [],
  selectedUser: null,
  permissions: [],
  roles: [],
  loading: false,
  error: null,
  lastSync: null,
  filters: {
    role: null,
    status: null,
    department: null,
    searchQuery: ''
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0
  };

// Slice definition
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Synchronous actions
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.lastSync = new Date().toISOString();
    },
    
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
      state.pagination.total += 1;
    },
    
    updateUser: (state, action: PayloadAction<{ id: string; updates: Partial<User> }>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload.updates };
      }
      if (state.currentUser?.id === action.payload.id) {
        state.currentUser = { ...state.currentUser, ...action.payload.updates };
      },
    
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
      state.pagination.total -= 1;
    },
    
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    
    setPermissions: (state, action: PayloadAction<Permission[]>) => {
      state.permissions = action.payload;
    },
    
    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setFilters: (state, action: PayloadAction<Partial<UserFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    setPagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    updateUserStatus: (state, action: PayloadAction<{ id: string; status: UserStatus }>) => {
      const user = state.users.find(u => u.id === action.payload.id);
      if (user) {
        user.status = action.payload.status;
      }
      if (state.currentUser?.id === action.payload.id) {
        state.currentUser.status = action.payload.status;
      }
  },
  
  extraReducers: (builder) => {
    // Handle async thunks
    builder
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.lastSync = new Date().toISOString();
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch users list
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.pagination.total -= 1;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch permissions
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissions = action.payload;
      })
      
      // Fetch roles
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles = action.payload;
      });
  });

// Export actions
export const {
  setCurrentUser,
  clearCurrentUser,
  setUsers,
  addUser,
  updateUser,
  removeUser,
  setSelectedUser,
  setPermissions,
  setRoles,
  setLoading,
  setError,
  setFilters,
  resetFilters,
  setPagination,
  updateUserStatus
} = userSlice.actions;

// Selectors
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectUsers = (state: RootState) => state.user.users;
export const selectSelectedUser = (state: RootState) => state.user.selectedUser;
export const selectUserPermissions = (state: RootState) => state.user.permissions;
export const selectUserRoles = (state: RootState) => state.user.roles;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;
export const selectUserFilters = (state: RootState) => state.user.filters;
export const selectUserPagination = (state: RootState) => state.user.pagination;

// Memoized selectors
export const selectFilteredUsers = createSelector(
  [selectUsers, selectUserFilters],
  (users, filters) => {
    let filtered = [...users];
    
    if (filters.role) {
      filtered = filtered.filter(user => user.roles.includes(filters.role!));
    }
    
    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }
    
    if (filters.department) {
      filtered = filtered.filter(user => user.department === filters.department);
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }
);

export const selectUserById = createSelector(
  [selectUsers, (_: RootState, userId: string) => userId],
  (users, userId) => users.find(user => user.id === userId)
);

export const selectUsersWithRole = createSelector(
  [selectUsers, (_: RootState, role: string) => role],
  (users, role) => users.filter(user => user.roles.includes(role))
);

export const selectActiveUsers = createSelector(
  [selectUsers],
  (users) => users.filter(user => user.status === UserStatus.ACTIVE)
);

export const selectUserHasPermission = createSelector(
  [selectCurrentUser, (_: RootState, permission: string) => permission],
  (currentUser, permission) => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
  }
);

export const selectUserHasRole = createSelector(
  [selectCurrentUser, (_: RootState, role: string) => role],
  (currentUser, role) => {
    if (!currentUser) return false;
    return currentUser.roles.includes(role);
  }
);

// Export reducer
export default userSlice.reducer;

}
}
}
}
}
