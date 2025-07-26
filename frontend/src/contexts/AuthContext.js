import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider= ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const login = async (email, password) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    // Use the actual auth login endpoint
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Login failed', data);
      const errorMessage = data.message || data.error || 'Login failed';
      if (data.details && Array.isArray(data.details)) {
        const validationErrors = data.details.map((detail) => detail.msg).join(', ');
        throw new Error(`${errorMessage}: ${validationErrors}`);
      }
      throw new Error(errorMessage);
    }

    // Handle backend response - currently returns placeholder data
    if (data.data?.note) {
      // Backend is returning placeholder response, create mock user for testing
      const user = {
        id: 'mock-user-id',
        email: email,
        firstName: 'Test',
        lastName: 'User',
        membershipType: 'basic',
      };
      const token = 'mock-token-for-testing';
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      return; // Exit early with mock data
    }

    // Store token and user (for when backend returns real data)
    const tokenData = data.data?.tokens || data.data;
    const token = tokenData?.accessToken || tokenData?.token;
    const userData = data.data?.user || data.data;
    
    if (!userData?.id || !token) {
      throw new Error('Invalid response from server - missing user data or token');
    }
    
    const user = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      membershipType: userData.membershipType,
    };
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setToken(token);
    setUser(user);
  };

  const register = async (firstName, lastName, email, password) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Registration failed', data);
      const errorMessage = data.message || data.error || 'Registration failed';
      if (data.details && Array.isArray(data.details)) {
        const validationErrors = data.details.map((detail) => detail.msg).join(', ');
        throw new Error(`${errorMessage}: ${validationErrors}`);
      }
      throw new Error(errorMessage);
    }

    // Store token and user
    const tokenData = data.data?.tokens || data.data;
    const token = tokenData.accessToken || tokenData.token;
    const userData = data.data?.user || data.data;
    const user = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      membershipType: userData.membershipType,
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

  const updateUser = (updatedUser) => {
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};