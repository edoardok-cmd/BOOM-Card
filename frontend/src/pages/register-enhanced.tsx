import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '../services/authService';
import { RegisterRequest } from '../types';
import { validateForm, commonValidationRules, isValidPhone, formatPhone } from '../utils/validation';
import { showErrorToast } from '../utils/errorHandler';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function RegisterEnhanced() {
  const { t } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Check terms agreement
    if (!agreedToTerms) {
      setValidationErrors({
        general: ['You must agree to the terms and conditions']
      });
      return;
    }

    // Check password confirmation
    if (formData.password !== confirmPassword) {
      setValidationErrors({
        confirmPassword: ['Passwords do not match']
      });
      return;
    }

    // Validate form
    const validation = validateForm(formData, {
      firstName: commonValidationRules.name,
      lastName: commonValidationRules.name,
      email: commonValidationRules.email,
      password: commonValidationRules.password,
      phone: {
        required: false,
        custom: (value: string) => !value || isValidPhone(value) || 'Please enter a valid phone number'
      }
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(formData);
      
      // Show success message
      showErrorToast('Registration successful! Please check your email to verify your account.');
      
      // Redirect to login
      router.push('/login?registered=true');
    } catch (error: any) {
      // Show error using our error handler
      showErrorToast(error);
      
      // Also show inline for better UX
      setValidationErrors({
        general: [error.message || 'Registration failed. Please try again.']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format phone number as user types
    if (name === 'phone') {
      const formatted = formatPhone(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4 py-8">
      <Head>
        <title>{t('auth.registerTitle') || 'Sign Up - BOOM Card'}</title>
        <meta name="description" content={t('auth.registerDescription') || 'Create your BOOM Card account'} />
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

        {/* Register Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('auth.register') || 'Create Account'}</h2>
            <LanguageSwitcher />
          </div>

          {/* General error message */}
          {validationErrors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {validationErrors.general.join(', ')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.firstName') || 'First Name'}
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.firstName.join(', ')}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.lastName') || 'Last Name'}
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.lastName.join(', ')}</p>
                )}
              </div>
            </div>

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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.phone') || 'Phone'} <span className="text-gray-400 text-xs">{t('auth.optional') || '(optional)'}</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0888 123 456"
                autoComplete="tel"
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phone.join(', ')}</p>
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
                autoComplete="new-password"
              />
              {validationErrors.password && (
                <div className="mt-1 text-sm text-red-600">
                  {validationErrors.password.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {t('auth.passwordRequirements') || 'Min 8 characters, uppercase, lowercase, number, and special character'}
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.confirmPassword') || 'Confirm Password'}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (validationErrors.confirmPassword) {
                    setValidationErrors(prev => {
                      const updated = { ...prev };
                      delete updated.confirmPassword;
                      return updated;
                    });
                  }
                }}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword.join(', ')}</p>
              )}
            </div>

            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 mt-0.5" 
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                {t('auth.agreeToTerms') || 'I agree to the'} {' '}
                <Link href="/terms" className="text-orange-600 hover:text-orange-500">
                  {t('footer.termsOfService') || 'Terms of Service'}
                </Link> {' '}
                {t('auth.and') || 'and'} {' '}
                <Link href="/privacy" className="text-orange-600 hover:text-orange-500">
                  {t('footer.privacyPolicy') || 'Privacy Policy'}
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !agreedToTerms}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('auth.creatingAccount') || 'Creating account...'}
                </span>
              ) : (
                t('auth.createAccountButton') || 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.alreadyHaveAccount') || 'Already have an account?'} {' '}
              <Link href="/login-enhanced" className="text-orange-600 hover:text-orange-500 font-semibold">
                {t('auth.loginLink') || 'Log in'}
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