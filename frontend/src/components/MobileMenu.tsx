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
      {/* Hamburger Button - Enhanced visibility */}
      <button
        onClick={toggleMenu}
        className="lg:hidden p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
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
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-black/50" onClick={toggleMenu} />
          
          {/* Menu panel - slides in from right */}
          <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto bg-white">
                <Link href="/" legacyBehavior>
                  <a 
                    onClick={toggleMenu}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3 text-xl">🏠</span>
                    <span>{t('nav.home') || 'Home'}</span>
                  </a>
                </Link>
                
                <Link href="/partners" legacyBehavior>
                  <a 
                    onClick={toggleMenu}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/partners') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3 text-xl">🏪</span>
                    <span>{t('nav.partners') || 'Partners'}</span>
                  </a>
                </Link>
                
                <Link href="/subscriptions" legacyBehavior>
                  <a 
                    onClick={toggleMenu}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/subscriptions') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3 text-xl">💳</span>
                    <span>{t('nav.plans') || 'Plans'}</span>
                  </a>
                </Link>

                {user && (
                  <>
                    <div className="my-4 border-t border-gray-200" />
                    
                    <Link href="/dashboard" legacyBehavior>
                      <a 
                        onClick={toggleMenu}
                        className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-3 text-xl">📊</span>
                        <span>{t('nav.dashboard') || 'Dashboard'}</span>
                      </a>
                    </Link>
                    
                    <Link href="/profile" legacyBehavior>
                      <a 
                        onClick={toggleMenu}
                        className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive('/profile') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-3 text-xl">👤</span>
                        <span>{t('nav.profile') || 'Profile'}</span>
                      </a>
                    </Link>
                    
                    <Link href="/help" legacyBehavior>
                      <a 
                        onClick={toggleMenu}
                        className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive('/help') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-3 text-xl">❓</span>
                        <span>{t('nav.help') || 'Help'}</span>
                      </a>
                    </Link>
                  </>
                )}
              </nav>

              {/* Language Switcher */}
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  {t('nav.language') || 'Language'}
                </p>
                <LanguageSwitcher />
              </div>

              {/* Auth Section */}
              <div className="p-4 border-t border-gray-200 bg-white">
                {user ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      {t('nav.loggedInAs') || 'Logged in as'} <strong className="text-gray-900">{user.firstName}</strong>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {t('nav.logout') || 'Logout'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" legacyBehavior>
                      <a 
                        onClick={toggleMenu}
                        className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors"
                      >
                        {t('nav.login') || 'Login'}
                      </a>
                    </Link>
                    <Link href="/register" legacyBehavior>
                      <a 
                        onClick={toggleMenu}
                        className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg text-center transition-colors"
                      >
                        {t('nav.signup') || 'Sign Up'}
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