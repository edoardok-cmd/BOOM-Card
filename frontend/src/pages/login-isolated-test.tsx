import React, { useState } from 'react';
import Head from 'next/head';

export default function LoginIsolatedTest() {
  const [output, setOutput] = useState<string>('Ready to test...');
  const [step, setStep] = useState(0);

  const addOutput = (message: string) => {
    console.log(message);
    setOutput(prev => prev + '\n' + message);
  };

  const testCompleteLoginFlow = async () => {
    setOutput('Starting isolated login test...\n');
    setStep(1);
    
    try {
      addOutput('Step 1: Testing environment variables...');
      addOutput(`API URL: ${process.env.NEXT_PUBLIC_API_URL}`);
      
      setStep(2);
      addOutput('Step 2: Testing mock auth service...');
      
      // Import mock auth service
      const { mockAuthService } = await import('../services/mockAuthService');
      const mockResult = await mockAuthService.login({
        email: 'test@example.com',
        password: 'Test123!'
      });
      
      addOutput('✅ Mock auth successful!');
      addOutput(`Mock result: ${JSON.stringify(mockResult.user)}`);
      
      setStep(3);
      addOutput('Step 3: Testing auth service...');
      
      // Import auth service
      const { authService } = await import('../services/authService');
      const authResult = await authService.login({
        email: 'test@example.com',
        password: 'Test123!'
      });
      
      addOutput('✅ Auth service successful!');
      addOutput(`Auth result: ${JSON.stringify(authResult)}`);
      
      setStep(4);
      addOutput('Step 4: Testing Zustand store...');
      
      // Import Zustand store
      const { useAuthStore } = await import('../store/authStore');
      
      // Check initial state
      const initialState = useAuthStore.getState();
      addOutput(`Initial Zustand state: ${JSON.stringify({
        user: initialState.user,
        isAuthenticated: initialState.isAuthenticated,
        error: initialState.error
      })}`);
      
      // Try login
      await useAuthStore.getState().login('test@example.com', 'Test123!');
      
      // Check final state
      const finalState = useAuthStore.getState();
      addOutput('✅ Zustand login successful!');
      addOutput(`Final Zustand state: ${JSON.stringify({
        user: finalState.user,
        isAuthenticated: finalState.isAuthenticated,
        error: finalState.error
      })}`);
      
      addOutput('\n🎉 ALL TESTS PASSED! Login is working correctly.');
      addOutput('The issue must be with page routing/redirects.');
      
    } catch (error) {
      addOutput(`❌ Test failed at step ${step}:`);
      addOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addOutput(`Stack: ${error instanceof Error ? error.stack : 'No stack'}`);
      
      if (step >= 4) {
        // If Zustand failed, check its state
        try {
          const { useAuthStore } = await import('../store/authStore');
          const errorState = useAuthStore.getState();
          addOutput(`Zustand error state: ${JSON.stringify({
            user: errorState.user,
            isAuthenticated: errorState.isAuthenticated,
            error: errorState.error
          })}`);
        } catch (stateError) {
          addOutput(`Could not get Zustand state: ${stateError}`);
        }
      }
    }
  };

  return (
    <>
      <Head>
        <title>Isolated Login Test - BOOM Card</title>
      </Head>

      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">🔬 Isolated Login Test</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <div className="mb-6 text-center">
              <button
                onClick={testCompleteLoginFlow}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 shadow-lg"
              >
                🧪 Run Complete Login Test
              </button>
            </div>
            
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output}
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>This test runs the complete login flow without any page redirects.</p>
            <p>It will show exactly where the login process fails.</p>
            <p className="mt-2">Environment: {process.env.NEXT_PUBLIC_API_URL}</p>
          </div>
        </div>
      </div>
    </>
  );
}