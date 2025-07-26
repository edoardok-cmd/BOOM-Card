import React, { useState } from 'react';
import Head from 'next/head';

export default function SimpleLoginTest() {
  const [result, setResult] = useState<string>('Ready to test...');

  const testLogin = async () => {
    setResult('Testing login...');
    
    try {
      // Import here to avoid SSR issues
      const { useAuthStore } = await import('../store/authStore');
      
      setResult('Imported auth store, attempting login...');
      
      // Check initial state
      const initialState = useAuthStore.getState();
      setResult(prev => prev + `\n\nInitial auth state: ${JSON.stringify(initialState)}`);
      
      setResult(prev => prev + `\n\nCalling login function...`);
      
      await useAuthStore.getState().login('test@example.com', 'Test123!');
      
      setResult(prev => prev + `\n\nLogin call completed without error!`);
      
      // Check final auth state
      const authState = useAuthStore.getState();
      setResult(prev => prev + `\n\nFinal auth state: ${JSON.stringify(authState, null, 2)}`);
      
    } catch (error) {
      setResult(prev => prev + `\n\nLogin failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setResult(prev => prev + `\n\nError stack: ${error instanceof Error ? error.stack : 'No stack'}`);
      setResult(prev => prev + `\n\nFull error object: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
      
      // Check auth state after error
      try {
        const { useAuthStore } = await import('../store/authStore');
        const errorState = useAuthStore.getState();
        setResult(prev => prev + `\n\nAuth state after error: ${JSON.stringify(errorState, null, 2)}`);
      } catch (stateError) {
        setResult(prev => prev + `\n\nCould not get auth state after error: ${stateError}`);
      }
    }
  };

  const testApiDirectly = async () => {
    setResult('Testing API directly...');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      setResult(`API URL: ${apiUrl}\n\nTesting health endpoint...`);
      
      const response = await fetch(`${apiUrl}/health`);
      setResult(prev => prev + `\n\nHealth check status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        setResult(prev => prev + `\n\nHealth check response: ${JSON.stringify(data)}`);
      } else {
        setResult(prev => prev + `\n\nHealth check failed: ${response.statusText}`);
      }
      
      // Now test login endpoint
      setResult(prev => prev + `\n\nTesting login endpoint...`);
      
      const loginResponse = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test123!'
        })
      });
      
      setResult(prev => prev + `\n\nLogin API status: ${loginResponse.status}`);
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        setResult(prev => prev + `\n\nLogin API response: ${JSON.stringify(loginData)}`);
      } else {
        setResult(prev => prev + `\n\nLogin API failed: ${loginResponse.statusText}`);
      }
      
    } catch (error) {
      setResult(prev => prev + `\n\nAPI test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testMockAuth = async () => {
    setResult('Testing mock auth directly...');
    
    try {
      const { mockAuthService } = await import('../services/mockAuthService');
      
      setResult('Imported mock auth service, attempting login...');
      
      const mockResult = await mockAuthService.login({
        email: 'test@example.com',
        password: 'Test123!'
      });
      
      setResult(`Mock auth successful! Result: ${JSON.stringify(mockResult, null, 2)}`);
      
    } catch (error) {
      setResult(`Mock auth failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <>
      <Head>
        <title>Simple Login Test - BOOM Card</title>
      </Head>

      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Simple Login Test</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={testApiDirectly}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Test API Directly
              </button>
              <button
                onClick={testMockAuth}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Test Mock Auth
              </button>
              <button
                onClick={testLogin}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Test Full Login
              </button>
            </div>
            
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
              {result}
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>This page tests login functionality without any routing or authentication guards.</p>
            <p>Environment: {process.env.NEXT_PUBLIC_API_URL}</p>
          </div>
        </div>
      </div>
    </>
  );
}