import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  if (!user) {
    return (
      <button
        onClick={() => router.push('/login')}
        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium px-6 py-2 rounded-full transition-all duration-200 transform hover:scale-105"
      >
        {t('auth.login') || 'Login'}
      </button>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
          {user.firstName?.[0] || 'U'}
        </div>
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
        <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
          {t('nav.profile') || 'Profile'}
        </a>
        <a href="/account-settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
          {t('nav.account') || 'Account Settings'}
        </a>
        <hr className="my-2" />
        <button
          onClick={logout}
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          {t('nav.logout') || 'Logout'}
        </button>
      </div>
    </div>
  );
}
