import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '../services/authService';
import { LoginRequest } from '../types';
import { validateForm, commonValidationRules } from '../utils/validation';
import { showErrorToast } from '../utils/errorHandler';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginEnhanced() {
  const { t } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Validate form
    const validation = validateForm(formData, {
      email: commonValidationRules.email,
      password: {
        required: true,
        minLength: 6, // Relaxed for existing users
        message: 'Password must be at least 6 characters'
      }
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      await authService.login(formData);
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      // Redirect to intended page or dashboard
      const redirect = router.query.redirect as string || '/dashboard';
      router.push(redirect);
    } catch (error: any) {
      // Show error using our error handler
      showErrorToast(error);
      
      // Also show inline for better UX
      setValidationErrors({
        general: [error.message || 'Login failed. Please try again.']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4">
      <Head>
        <title>{t('auth.loginTitle') || 'Login - BOOM Card'}</title>
        <meta name="description" content={t('auth.loginDescription') || 'Login to your BOOM Card account'} />
      </Head>

      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">B</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">BOOM Card</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('auth.login') || 'Login'}</h2>
            <LanguageSwitcher />
          </div>

          {/* General error message */}
          {validationErrors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {validationErrors.general.join(', ')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email') || 'Email'}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  validationErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email.join(', ')}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password') || 'Password'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  validationErrors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password.join(', ')}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                />
                <span className="ml-2 text-sm text-gray-600">{t('auth.rememberMe') || 'Remember me'}</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-500">
                {t('auth.forgotPassword') || 'Forgot password?'}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('auth.loggingIn') || 'Logging in...'}
                </span>
              ) : (
                t('auth.loginButton') || 'Log in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.noAccount') || "Don't have an account?"} {' '}
              <Link href="/register-enhanced" className="text-orange-600 hover:text-orange-500 font-semibold">
                {t('auth.signUp') || 'Sign up'}
              </Link>
            </p>
          </div>

          {/* Social login options (future enhancement) */}
          <div className="mt-6 border-t pt-6">
            <p className="text-sm text-gray-500 text-center mb-4">
              {t('auth.orContinueWith') || 'Or continue with'}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                disabled
                className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Coming soon"
              >
                <span className="sr-only">Google</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button
                type="button"
                disabled
                className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Coming soon"
              >
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd"/>
                </svg>
              </button>
              <button
                type="button"
                disabled
                className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Coming soon"
              >
                <span className="sr-only">Apple</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15.78 5.113c-.837.842-1.555 2.017-1.384 3.201.168.011.34.01.519.002.912-.086 1.782-.636 2.373-1.494.587-.857.99-2.003.88-3.169-.169-.011-.341-.01-.52-.003-.912.085-1.281.62-1.868 1.463zM13.369 8.674c-1.082 0-2.052.455-2.654.455-.617 0-1.429-.43-2.394-.405-1.241.026-2.384.724-3.024 1.838-1.29 2.246-.33 5.563.916 7.387.616.894 1.348 1.899 2.308 1.863.926-.037 1.276-.603 2.394-.603 1.118 0 1.435.603 2.415.584.997-.018 1.629-.908 2.239-1.807.703-1.041 1.077-2.047 1.098-2.101-.024-.01-2.107-.809-2.131-3.206-.023-2.003 1.635-2.961 1.709-3.011-.936-1.383-2.393-1.54-2.876-1.574z"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <p className="text-xs text-gray-500 text-center">
              {t('auth.byLoggingIn') || 'By logging in, you agree to our'} {' '}
              <Link href="/terms" className="text-orange-600 hover:text-orange-500">
                {t('footer.termsOfService') || 'Terms of Service'}
              </Link> {' '}
              {t('auth.and') || 'and'} {' '}
              <Link href="/privacy" className="text-orange-600 hover:text-orange-500">
                {t('footer.privacyPolicy') || 'Privacy Policy'}
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← {t('auth.backToHome') || 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}