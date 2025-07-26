import React, { useEffect, useState } from 'react';

const TestDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const testAPIs = async () => {
      console.log('Starting API tests...');
      
      const token = localStorage.getItem('accessToken');
      console.log('Token:', token);

      const endpoints = [
        { name: 'stats', url: 'http://localhost:3001/api/users/me/stats' },
        { name: 'activities', url: 'http://localhost:3001/api/activities' },
        { name: 'featured', url: 'http://localhost:3001/api/partners/featured' }
      ];

      for (const endpoint of endpoints) {
        console.log(`Testing ${endpoint.name}...`);
        try {
          const response = await fetch(endpoint.url, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          });
          
          const text = await response.text();
          console.log(`${endpoint.name} response:`, text);
          
          try {
            const json = JSON.parse(text);
            setData(prev => ({ ...prev, [endpoint.name]: json }));
          } catch {
            setData(prev => ({ ...prev, [endpoint.name]: text }));
          }
        } catch (error: any) {
          console.error(`${endpoint.name} error:`, error);
          setErrors(prev => ({ ...prev, [endpoint.name]: error.message }));
        }
      }
      
      setLoading(false);
    };

    testAPIs();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Loading...</h1>
        <p>Check browser console for logs</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Test Dashboard</h1>
      
      <h2>Auth Info:</h2>
      <pre>{JSON.stringify({
        token: localStorage.getItem('accessToken'),
        authStorage: localStorage.getItem('auth-storage')
      }, null, 2)}</pre>

      <h2>API Responses:</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <h2>Errors:</h2>
      <pre>{JSON.stringify(errors, null, 2)}</pre>

      <hr />
      
      <button 
        onClick={() => window.location.href = '/quick-auth'}
        style={{ 
          padding: '10px 20px', 
          marginRight: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Go to Quick Auth
      </button>
      
      <button 
        onClick={() => window.location.href = '/dashboard'}
        style={{ 
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Try Dashboard Complete
      </button>
    </div>
  );
};

export default TestDashboard;