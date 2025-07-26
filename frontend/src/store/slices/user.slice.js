import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { api } from '../../services/api';
import { RootState } from '../store';
import { showNotification } from './notification.slice';

// User interfaces
export 

export 

export ;
  push;
  sms;
}

export 

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

export 

export 

export 

export 

export 

export 

export 

// Constants
const USER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const USER_STORAGE_KEY = 'boom_user';

// Initial state
const initialState: UserState = {
  currentUser,
  users: [],
  selectedUser,
  permissions: [],
  roles: [],
  loading: false,
  error,
  lastSync,
  filters,
  pagination;

// Slice definition
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers,
    
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    
    setUsers: (state, action: PayloadAction) => {
      state.users = action.payload;
    },
    
    addUser: (state, action: PayloadAction) => {
      state.users.push(action.payload);
      state.pagination.total += 1;
    },
    
    updateUser: (state, action: PayloadAction }>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload.updates };
      }
      if (state.currentUser?.id === action.payload.id) {
        state.currentUser = { ...state.currentUser, ...action.payload.updates };
      },
    
    removeUser: (state, action: PayloadAction) => {
      state.users = state.users.filter(user => user.id !== action.payload);
      state.pagination.total -= 1;
    },
    
    setSelectedUser: (state, action: PayloadAction) => {
      state.selectedUser = action.payload;
    },
    
    setPermissions: (state, action: PayloadAction) => {
      state.permissions = action.payload;
    },
    
    setRoles: (state, action: PayloadAction) => {
      state.roles = action.payload;
    },
    
    setLoading: (state, action: PayloadAction) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction) => {
      state.error = action.payload;
    },
    
    setFilters: (state, action: PayloadAction>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    setPagination: (state, action: PayloadAction>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    updateUserStatus: (state, action: PayloadAction) => {
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        user.name.toLowerCase().includes(query: t("query")
        user.email.toLowerCase().includes(query: t("query")
        user.department?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }
);

export const selectUserById = createSelector(
  [selectUsers, (_: RootState, userId) => userId],
  (users, userId) => users.find(user => user.id === userId)
);

export const selectUsersWithRole = createSelector(
  [selectUsers, (_: RootState, role) => role],
  (users, role) => users.filter(user => user.roles.includes(role))
);

export const selectActiveUsers = createSelector(
  [selectUsers],
  (users) => users.filter(user => user.status === UserStatus.ACTIVE)
);

export const selectUserHasPermission = createSelector(
  [selectCurrentUser, (_: RootState, permission) => permission],
  (currentUser, permission) => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
  }
);

export const selectUserHasRole = createSelector(
  [selectCurrentUser, (_: RootState, role) => role],
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
