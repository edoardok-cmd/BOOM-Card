import React from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';

const QuickAuthPage: React.FC = () => {
  const router = useRouter();
  const authStore = useAuthStore();

  const handleQuickLogin = () => {
    // Set mock user directly in store
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      role: 'user' as const,
      avatar: null,
      membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Set tokens
    localStorage.setItem('accessToken', 'mock-jwt-token-123456789');
    localStorage.setItem('refreshToken', 'mock-refresh-token-987654321');
    localStorage.setItem('user', JSON.stringify(mockUser));

    // Set auth state in zustand store
    const authState = {
      user: mockUser,
      isAuthenticated: true
    };
    
    // Set in localStorage with the store name
    localStorage.setItem('auth-storage', JSON.stringify({
      state: authState,
      version: 0
    }));

    // Force page reload to ensure store rehydrates
    window.location.href = '/dashboard';
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Quick Authentication</h1>
      <p>Click the button below to quickly authenticate and access the dashboard.</p>
      <button 
        onClick={handleQuickLogin}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Quick Login
      </button>
    </div>
  );
};

export default QuickAuthPage;