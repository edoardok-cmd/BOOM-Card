import React, { useState } from 'react';
import { authService } from '../services/authService';
import { LoginRequest, RegisterRequest } from '../types';
import { showErrorToast } from '../utils/errorHandler';
import { validateForm, commonValidationRules } from '../utils/validation';

const TestAuthPage: React.FC = () => {
  // Login form state
  const [loginData, setLoginData] = useState<LoginRequest>({
    email: 'test@example.com',
    password: 'Test123!@#'
  });

  // Register form state
  const [registerData, setRegisterData] = useState<RegisterRequest>({
    firstName: 'Test',
    lastName: 'User',
    email: 'newuser@example.com',
    password: 'Test123!@#',
    phone: '0888123456'
  });

  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Test login
  const testLogin = async () => {
    setIsLoading(true);
    try {
      // Validate form first
      const validation = validateForm(loginData, {
        email: commonValidationRules.email,
        password: commonValidationRules.password
      });

      if (!validation.isValid) {
        setTestResults({
          login: {
            success: false,
            error: 'Validation failed',
            details: validation.errors
          }
        });
        return;
      }

      // Attempt login
      const user = await authService.login(loginData);
      setTestResults({
        login: {
          success: true,
          user,
          isAuthenticated: authService.isAuthenticated(),
          token: authService.getAccessToken()
        }
      });
    } catch (error: any) {
      setTestResults({
        login: {
          success: false,
          error: error.message || 'Login failed',
          code: error.code
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test registration
  const testRegister = async () => {
    setIsLoading(true);
    try {
      // Validate form
      const validation = validateForm(registerData, {
        email: commonValidationRules.email,
        password: commonValidationRules.password,
        phone: commonValidationRules.phone,
        firstName: commonValidationRules.name,
        lastName: commonValidationRules.name
      });

      if (!validation.isValid) {
        setTestResults({
          register: {
            success: false,
            error: 'Validation failed',
            details: validation.errors
          }
        });
        return;
      }

      // Attempt registration
      const user = await authService.register(registerData);
      setTestResults({
        register: {
          success: true,
          user
        }
      });
    } catch (error: any) {
      setTestResults({
        register: {
          success: false,
          error: error.message || 'Registration failed',
          code: error.code
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test auth state
  const testAuthState = () => {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getUser();
    const accessToken = authService.getAccessToken();
    const hasPremium = authService.hasMembership('premium');
    const isActive = authService.isMembershipActive();

    setTestResults({
      authState: {
        isAuthenticated,
        hasUser: !!user,
        user,
        hasAccessToken: !!accessToken,
        tokenLength: accessToken?.length || 0,
        hasPremiumMembership: hasPremium,
        isMembershipActive: isActive
      }
    });
  };

  // Test logout
  const testLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setTestResults({
        logout: {
          success: true,
          isAuthenticated: authService.isAuthenticated(),
          hasUser: !!authService.getUser(),
          hasToken: !!authService.getAccessToken()
        }
      });
    } catch (error: any) {
      setTestResults({
        logout: {
          success: false,
          error: error.message || 'Logout failed'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test error toast
  const testErrorToast = () => {
    showErrorToast('This is a test error message');
    setTestResults({
      errorToast: {
        success: true,
        message: 'Toast should appear (check console if not visible)'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>

        {/* Current Auth State */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <button
            onClick={testAuthState}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Check Auth State
          </button>
        </div>

        {/* Login Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Login Test</h2>
          <div className="space-y-4 mb-4">
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            onClick={testLogin}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Login
          </button>
        </div>

        {/* Register Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Register Test</h2>
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={registerData.firstName}
                onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={registerData.lastName}
                onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                className="px-3 py-2 border rounded"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={registerData.phone || ''}
              onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            onClick={testRegister}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Register
          </button>
        </div>

        {/* Other Tests */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Other Tests</h2>
          <div className="space-x-4">
            <button
              onClick={testLogout}
              disabled={isLoading}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              Test Logout
            </button>
            <button
              onClick={testErrorToast}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Test Error Toast
            </button>
          </div>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAuthPage;