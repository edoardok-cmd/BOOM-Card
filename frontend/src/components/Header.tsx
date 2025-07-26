import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import UserProfileDropdown from './UserProfileDropdown';
import MobileMenu from './MobileMenu';
import Logo from './Logo';

export default function Header() {
  const { t } = useLanguage();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.partners'), href: '/partners' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  const authNavigation = [
    { name: t('nav.dashboard'), href: '/dashboard' },
    { name: t('nav.partners'), href: '/partners' },
    { name: t('nav.transactions'), href: '/transactions' },
    { name: t('nav.profile'), href: '/profile' },
  ];

  const currentNav = isAuthenticated ? authNavigation : navigation;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Logo className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              BOOM Card
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors ${
                  router.pathname === item.href
                    ? 'text-orange-600'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {isAuthenticated && user ? (
              <UserProfileDropdown />
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/login"
                  className="font-medium text-gray-600 hover:text-orange-600 transition-colors"
                >
                  {t('auth.login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-medium hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  {t('auth.signUp')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
}