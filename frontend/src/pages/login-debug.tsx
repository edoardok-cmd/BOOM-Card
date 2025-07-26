import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { boomApi } from '../services/boomApi';

export default function LoginDebug() {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: 'test@example.com',
    password: 'Test123!'
  });
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const testBackendConnection = async () => {
    addLog('Testing backend connection...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      addLog(`Backend response status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        addLog(`Backend response: ${JSON.stringify(data)}`);
      } else {
        addLog(`Backend error: ${response.statusText}`);
      }
    } catch (error) {
      addLog(`Backend connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testDirectAPILogin = async () => {
    addLog('Testing direct API login...');
    try {
      const response = await boomApi.login(formData);
      addLog(`Direct API login success: ${JSON.stringify(response)}`);
    } catch (error) {
      addLog(`Direct API login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testAuthServiceLogin = async () => {
    addLog('Testing auth service login...');
    try {
      const result = await authService.login(formData);
      addLog(`Auth service login success: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`Auth service login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testZustandLogin = async () => {
    addLog('Testing Zustand store login...');
    setIsLoading(true);
    try {
      await useAuthStore.getState().login(formData.email, formData.password);
      addLog('Zustand login success!');
      addLog(`Auth state: ${JSON.stringify(useAuthStore.getState())}`);
      addLog('Login completed successfully - NOT redirecting to avoid losing debug info');
    } catch (error) {
      addLog(`Zustand login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addLog(`Auth state: ${JSON.stringify(useAuthStore.getState())}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setLogs([]);
    addLog('Starting comprehensive login test...');
    addLog(`Environment: API_URL=${process.env.NEXT_PUBLIC_API_URL}`);
    
    await testBackendConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testDirectAPILogin();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testAuthServiceLogin();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testZustandLogin();
  };

  return (
    <>
      <Head>
        <title>Login Debug - BOOM Card</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Login Debug Tool</h1>

            {/* Test Credentials */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Test Credentials</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <button
                onClick={testBackendConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Backend
              </button>
              <button
                onClick={testDirectAPILogin}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Test API
              </button>
              <button
                onClick={testAuthServiceLogin}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Test Service
              </button>
              <button
                onClick={testZustandLogin}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? 'Testing...' : 'Test Zustand'}
              </button>
              <button
                onClick={runAllTests}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Run All Tests
              </button>
            </div>

            {/* Logs */}
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              <h3 className="text-white font-bold mb-2">Debug Logs:</h3>
              {logs.length === 0 ? (
                <p className="text-gray-400">No logs yet. Run a test to see output.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Go to Regular Login
              </button>
              <button
                onClick={() => router.push('/test-backend')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Go to Backend Test
              </button>
              <button
                onClick={() => setLogs([])}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}