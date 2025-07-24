import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Register() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName,
    lastName,
    email,
    password,
    confirmPassword
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch') || 'Passwords do not match');
      return;
    }

    // Validate password requirements
    if (formData.password.length  {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (

        {t('auth.registerTitle') || 'Sign Up - BOOM Card'}

        {/* Logo */}

              B
            
            BOOM Card

        {/* Register Card */}

            {t('auth.register')}

          {error && (
            
              {error}
            
          )}

                  {t('auth.firstName')}

                  {t('auth.lastName')}

                {t('auth.email')}

                {t('auth.password')}

                {t('auth.passwordHint') || 'Must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)'}

                {t('auth.confirmPassword')}

                {t('auth.agreeToTerms') || 'I agree to the'} {' '}
                 {' '}
                {t('auth.and') || 'and'} {' '}

              {isLoading ? t('auth.creatingAccount') || 'Creating account...' : t('auth.registerButton')}

              {t('auth.haveAccount')} {' '}

        {/* Back to Home */}

  );
}