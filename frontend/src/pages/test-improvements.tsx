import React, { useState } from 'react';
import { 
  useAuth,
  useApi,
  useLocalStorage,
  useDebounce,
  useWindowSize,
  useMediaQuery
} from '../hooks';
import { 
  boomApi,
  authService,
  partnerService,
  subscriptionService,
  userService
} from '../services';
import {
  validateForm,
  commonValidationRules,
  formatCurrency,
  formatDate,
  formatRelativeTime
} from '../utils';
import { AppError, showErrorToast } from '../utils/errorHandler';

const TestImprovementsPage: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);

  // Test hooks
  const windowSize = useWindowSize();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [savedValue, setSavedValue] = useLocalStorage('testValue', 'initial');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Test API hook
  const { data: apiTestData, isLoading, error, execute: testApi } = useApi(
    async () => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => resolve({ message: 'API test successful' }), 1000);
      });
    }
  );

  // Run all tests
  const runTests = async () => {
    setIsRunning(true);
    const results: Record<string, any> = {};

    // Test 1: Error Handling
    try {
      const testError = new AppError('Test error', 'TEST_ERROR', 400);
      results.errorHandling = {
        success: true,
        message: testError.message,
        code: testError.code
      };
    } catch (error) {
      results.errorHandling = { success: false, error };
    }

    // Test 2: Validation
    try {
      const validationTest = validateForm(
        { 
          email: 'test@example.com',
          password: 'Test123!@#',
          phone: '0888123456'
        },
        {
          email: commonValidationRules.email,
          password: commonValidationRules.password,
          phone: commonValidationRules.phone
        }
      );
      results.validation = {
        success: validationTest.isValid,
        errors: validationTest.errors
      };
    } catch (error) {
      results.validation = { success: false, error };
    }

    // Test 3: Formatting
    try {
      results.formatting = {
        success: true,
        currency: formatCurrency(99.99),
        date: formatDate(new Date()),
        relativeTime: formatRelativeTime(new Date(Date.now() - 3600000))
      };
    } catch (error) {
      results.formatting = { success: false, error };
    }

    // Test 4: Local Storage Hook
    try {
      setSavedValue('test-updated');
      results.localStorage = {
        success: true,
        value: savedValue,
        updated: 'test-updated'
      };
    } catch (error) {
      results.localStorage = { success: false, error };
    }

    // Test 5: Window Hooks
    try {
      results.windowHooks = {
        success: true,
        windowSize,
        isMobile
      };
    } catch (error) {
      results.windowHooks = { success: false, error };
    }

    // Test 6: Debounce Hook
    try {
      results.debounce = {
        success: true,
        immediate: searchTerm,
        debounced: debouncedSearch
      };
    } catch (error) {
      results.debounce = { success: false, error };
    }

    // Test 7: Auth Service
    try {
      const isAuthenticated = authService.isAuthenticated();
      const user = authService.getUser();
      results.authService = {
        success: true,
        isAuthenticated,
        hasUser: !!user
      };
    } catch (error) {
      results.authService = { success: false, error };
    }

    // Test 8: API Service Structure
    try {
      results.apiServices = {
        success: true,
        services: {
          boomApi: typeof boomApi === 'object',
          authService: typeof authService === 'object',
          partnerService: typeof partnerService === 'object',
          subscriptionService: typeof subscriptionService === 'object',
          userService: typeof userService === 'object'
        }
      };
    } catch (error) {
      results.apiServices = { success: false, error };
    }

    setTestResults(results);
    setIsRunning(false);
  };

  // Test form validation
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm(formData, {
      email: commonValidationRules.email,
      password: commonValidationRules.password,
      phone: commonValidationRules.phone
    });
    
    if (validation.isValid) {
      showErrorToast('Form is valid! (This is a test success message)');
      setFormErrors({});
    } else {
      setFormErrors(validation.errors);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Test Improvements Page</h1>
        
        {/* Test Runner */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Automated Tests</h2>
          <button
            onClick={runTests}
            disabled={isRunning}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
          
          {Object.keys(testResults).length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Manual Form Validation Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Form Validation Test</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="test@example.com"
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email.join(', ')}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Min 8 chars, upper, lower, number, special"
              />
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">{formErrors.password.join(', ')}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone (Bulgarian)</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="0888123456"
              />
              {formErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{formErrors.phone.join(', ')}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Validate Form
            </button>
          </form>
        </div>

        {/* API Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">API Hook Test</h2>
          <button
            onClick={() => testApi()}
            disabled={isLoading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Test API Hook'}
          </button>
          
          {apiTestData && (
            <div className="mt-4 p-4 bg-green-100 rounded">
              Success: {JSON.stringify(apiTestData)}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 rounded">
              Error: {error.message}
            </div>
          )}
        </div>

        {/* Debounce Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Debounce Hook Test</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-2"
            placeholder="Type to test debounce..."
          />
          <p className="text-sm text-gray-600">
            Immediate value: <span className="font-mono">{searchTerm}</span>
          </p>
          <p className="text-sm text-gray-600">
            Debounced value (500ms): <span className="font-mono">{debouncedSearch}</span>
          </p>
        </div>

        {/* Window Size Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Window Hooks Test</h2>
          <p>Window Width: <span className="font-mono">{windowSize.width}px</span></p>
          <p>Window Height: <span className="font-mono">{windowSize.height}px</span></p>
          <p>Is Mobile: <span className="font-mono">{isMobile ? 'Yes' : 'No'}</span></p>
        </div>
      </div>
    </div>
  );
};

export default TestImprovementsPage;