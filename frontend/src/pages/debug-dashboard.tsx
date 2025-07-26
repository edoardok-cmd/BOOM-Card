import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { usePartnerStore } from '../store/partnerStore';

const DebugDashboard: React.FC = () => {
  const [apiResponses, setApiResponses] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const partnerStore = usePartnerStore();

  useEffect(() => {
    const testAPIs = async () => {
      // Test each API endpoint
      const endpoints = [
        { name: 'stats', url: 'http://localhost:3001/api/users/me/stats' },
        { name: 'activities', url: 'http://localhost:3001/api/activities' },
        { name: 'featured', url: 'http://localhost:3001/api/partners/featured' },
        { name: 'health', url: 'http://localhost:3001/health' }
      ];

      for (const endpoint of endpoints) {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(endpoint.url, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          setApiResponses(prev => ({ ...prev, [endpoint.name]: { status: response.status, data } }));
        } catch (error: any) {
          setErrors(prev => ({ ...prev, [endpoint.name]: error.message }));
        }
      }
    };

    testAPIs();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Dashboard Debug</h1>
      
      <h2>Auth State:</h2>
      <pre>{JSON.stringify({
        isAuthenticated: authStore.isAuthenticated,
        user: authStore.user,
        isLoading: authStore.isLoading
      }, null, 2)}</pre>

      <h2>User Store State:</h2>
      <pre>{JSON.stringify({
        stats: userStore.stats,
        activities: userStore.activities,
        isLoading: userStore.isLoading
      }, null, 2)}</pre>

      <h2>Partner Store State:</h2>
      <pre>{JSON.stringify({
        featuredPartners: partnerStore.featuredPartners,
        isLoading: partnerStore.isLoading
      }, null, 2)}</pre>

      <h2>API Responses:</h2>
      <pre>{JSON.stringify(apiResponses, null, 2)}</pre>

      <h2>Errors:</h2>
      <pre>{JSON.stringify(errors, null, 2)}</pre>

      <h2>LocalStorage:</h2>
      <pre>{JSON.stringify({
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        authStorage: localStorage.getItem('auth-storage')
      }, null, 2)}</pre>
    </div>
  );
};

export default DebugDashboard;