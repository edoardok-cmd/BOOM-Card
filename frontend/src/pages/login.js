import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Login() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email,
    password
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (

        {t('auth.loginTitle') || 'Login - BOOM Card'}

        {/* Logo */}

              B
            
            BOOM Card

        {/* Login Card */}

            {t('auth.login')}

          {error && (
            
              {error}
            
          )}

                {t('auth.email')}

                {t('auth.password')}

                {t('auth.rememberMe') || 'Remember me'}

              {isLoading ? t('auth.loggingIn') || 'Logging in...' : t('auth.loginButton')}

              {t('auth.noAccount')} {' '}

              {t('auth.byLoggingIn') || 'By logging in, you agree to our'} {' '}
               {' '}
              {t('auth.and') || 'and'} {' '}

        {/* Back to Home */}

  );
}