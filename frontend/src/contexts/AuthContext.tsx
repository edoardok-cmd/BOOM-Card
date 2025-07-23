import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipType?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const API_BASE_URL = 'http://localhost:5002';
    // Temporarily use test endpoint for debugging
    const response = await fetch(`${API_BASE_URL}/test-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Login failed:', data);
      const errorMessage = data.message || data.error || 'Login failed';
      if (data.details && Array.isArray(data.details)) {
        const validationErrors = data.details.map((detail: any) => detail.msg).join(', ');
        throw new Error(`${errorMessage}: ${validationErrors}`);
      }
      throw new Error(errorMessage);
    }

    // Store token and user
    const tokenData = data.data?.tokens || data.data;
    const token = tokenData.accessToken || tokenData.token;
    const userData = data.data?.user || data.data;
    const user = {
      id: userData.id.toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      membershipType: userData.membershipType || 'Premium',
    };
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setToken(token);
    setUser(user);
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const API_BASE_URL = 'http://localhost:5002/api';
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Registration failed:', data);
      const errorMessage = data.message || data.error || 'Registration failed';
      if (data.details && Array.isArray(data.details)) {
        const validationErrors = data.details.map((detail: any) => detail.msg).join(', ');
        throw new Error(`${errorMessage}: ${validationErrors}`);
      }
      throw new Error(errorMessage);
    }

    // Store token and user
    const tokenData = data.data?.tokens || data.data;
    const token = tokenData.accessToken || tokenData.token;
    const userData = data.data?.user || data.data;
    const user = {
      id: userData.id.toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      membershipType: userData.membershipType || 'Premium',
    };
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Redirect to home
    router.push('/');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};