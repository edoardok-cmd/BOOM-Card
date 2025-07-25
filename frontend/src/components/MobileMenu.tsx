import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/');
  };

  const isActive = (path: string) => router.pathname === path;

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle menu"
      >
        {!isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-black/50" onClick={toggleMenu} />
          
          {/* Menu panel */}
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <Link href="/" onClick={toggleMenu}>
                  <a className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                    {t('nav.home')}
                  </a>
                </Link>
                
                <Link href="/partners" onClick={toggleMenu}>
                  <a className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/partners') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                    {t('nav.partners')}
                  </a>
                </Link>
                
                <Link href="/subscriptions" onClick={toggleMenu}>
                  <a className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/subscriptions') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                    {t('nav.plans')}
                  </a>
                </Link>

                {user && (
                  <>
                    <div className="my-4 border-t" />
                    
                    <Link href="/dashboard" onClick={toggleMenu}>
                      <a className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                        {t('nav.dashboard')}
                      </a>
                    </Link>
                    
                    <Link href="/profile" onClick={toggleMenu}>
                      <a className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/profile') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                        {t('nav.profile')}
                      </a>
                    </Link>
                    
                    <Link href="/account-settings" onClick={toggleMenu}>
                      <a className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/account-settings') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                        {t('nav.accountSettings')}
                      </a>
                    </Link>
                    
                    <Link href="/help" onClick={toggleMenu}>
                      <a className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/help') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                        {t('nav.help')}
                      </a>
                    </Link>
                  </>
                )}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t space-y-4">
                {/* Language Switcher */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('common.language')}</span>
                  <LanguageSwitcher />
                </div>

                {/* Auth Buttons */}
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={toggleMenu}>
                      <a className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium text-center transition-colors">
                        {t('nav.login')}
                      </a>
                    </Link>
                    <Link href="/register" onClick={toggleMenu}>
                      <a className="block w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium text-center transition-colors">
                        {t('nav.getStarted')}
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}