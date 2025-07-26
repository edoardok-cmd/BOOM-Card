import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { mockLogin, mockProfile } from '../utils/mockAuth';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session - only on client side
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
    
    try {
      // Try real API first
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle backend response
        if (data.data?.note) {
          // Backend is returning placeholder response
          throw new Error('Use mock auth');
        }

        // Store token and user (for when backend returns real data)
        const tokenData = data.data?.tokens || data.data;
        const token = tokenData?.accessToken || tokenData?.token;
        const userData = data.data?.user || data.data;
        
        if (!userData?.id || !token) {
          throw new Error('Invalid response from server');
        }
        
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
        return;
      }
    } catch (error) {
      console.log('API unavailable or returned error, using mock authentication');
    }

    // Use mock authentication
    try {
      const mockData = await mockLogin(email, password);
      const { user, token } = mockData.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
    } catch (mockError) {
      throw new Error('Invalid credentials');
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    // For static deployment, create a mock user
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      firstName,
      lastName,
      membershipType: 'standard',
    };
    const token = btoa(`${newUser.id}:${Date.now()}`);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    setToken(token);
    setUser(newUser);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setToken(null);
    setUser(null);
    // Only push to home if router is ready and on client side
    if (typeof window !== 'undefined' && router.isReady) {
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}