import React from 'react';
import { useRouter } from 'next/router';
import Logo from './Logo';
import SearchBar from './SearchBar';
import LanguageSwitcher from './LanguageSwitcher';
import UserProfileDropdown from './UserProfileDropdown';
import MobileMenu from './MobileMenu';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Logo size="md" showText={true} />
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-center space-x-1">
              <a 
                href="/" 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  router.pathname === '/' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {t('nav.home')}
              </a>
              <a 
                href="/partners" 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  router.pathname === '/partners' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {t('nav.partners')}
              </a>
              <a 
                href="/subscriptions" 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  router.pathname === '/subscriptions' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {t('nav.plans')}
              </a>
              
              {user && (
                <a 
                  href="/dashboard" 
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    router.pathname === '/dashboard' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {t('nav.dashboard')}
                </a>
              )}
              
              <div className="pl-4 ml-4 border-l border-gray-200 flex items-center space-x-3">
                <SearchBar />
                <LanguageSwitcher />
                <UserProfileDropdown />
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center space-x-2">
            <LanguageSwitcher />
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}