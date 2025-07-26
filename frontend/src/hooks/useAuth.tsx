import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import { 
  User, 
  LoginRequest, 
  RegisterRequest 
} from '../types';
import { authService } from '../services/authService';
import { AppError, showErrorToast } from '../utils/errorHandler';

// Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
  hasMembership: (type: 'standard' | 'premium' | 'vip') => boolean;
  isMembershipActive: () => boolean;
  getMembershipDaysRemaining: () => number;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
      
      // Redirect to dashboard or intended page
      const redirect = router.query.redirect as string || '/dashboard';
      router.push(redirect);
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast(error);
      } else {
        showErrorToast('Login failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Register
  const register = useCallback(async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const newUser = await authService.register(data);
      
      // Auto-login is not implemented, redirect to login
      router.push('/login?registered=true');
    } catch (error) {
      if (error instanceof AppError) {
        showErrorToast(error);
      } else {
        showErrorToast('Registration failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Update user data
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    authService.setUser(updatedUser);
  }, []);

  // Check membership type
  const hasMembership = useCallback((type: 'standard' | 'premium' | 'vip'): boolean => {
    return authService.hasMembership(type);
  }, []);

  // Check if membership is active
  const isMembershipActive = useCallback((): boolean => {
    return authService.isMembershipActive();
  }, []);

  // Get membership days remaining
  const getMembershipDaysRemaining = useCallback((): number => {
    return authService.getMembershipDaysRemaining();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    hasMembership,
    isMembershipActive,
    getMembershipDaysRemaining
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredMembership?: 'standard' | 'premium' | 'vip';
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredMembership,
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasMembership, isMembershipActive } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login with current path as redirect
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    } else if (!isLoading && requiredMembership && !hasMembership(requiredMembership)) {
      // Redirect to subscription page if membership is insufficient
      router.push('/subscriptions?upgrade=true');
    } else if (!isLoading && !isMembershipActive()) {
      // Redirect to subscription page if membership expired
      router.push('/subscriptions?expired=true');
    }
  }, [isAuthenticated, isLoading, requiredMembership, hasMembership, isMembershipActive, router]);

  if (isLoading) {
    return fallback || <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  if (requiredMembership && !hasMembership(requiredMembership)) {
    return fallback || null;
  }

  if (!isMembershipActive()) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Hook for requiring authentication
export function useRequireAuth(requiredMembership?: 'standard' | 'premium' | 'vip') {
  const { isAuthenticated, isLoading, hasMembership, isMembershipActive } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    } else if (!isLoading && requiredMembership && !hasMembership(requiredMembership)) {
      router.push('/subscriptions?upgrade=true');
    } else if (!isLoading && !isMembershipActive()) {
      router.push('/subscriptions?expired=true');
    }
  }, [isAuthenticated, isLoading, requiredMembership, hasMembership, isMembershipActive, router]);

  return {
    isAuthenticated,
    isLoading,
    hasRequiredMembership: !requiredMembership || hasMembership(requiredMembership),
    isMembershipActive: isMembershipActive()
  };
}

// Hook for guest only pages (login, register)
export function useGuestOnly() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isLoading };
}