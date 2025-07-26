import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import MobileMenu from '../components/MobileMenu';
import { useLanguage } from '../contexts/LanguageContext';

export default function Transactions() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>{t('transactions.title') || 'Transactions'} - BOOM Card</title>
      </Head>

      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Logo size="md" showText={true} />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="ml-10 flex items-center space-x-1">
                <a href="/" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">Home</a>
                <a href="/dashboard" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">Dashboard</a>
                <a href="/partners" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">Partners</a>
                <a href="/transactions" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold">Transactions</a>
                <div className="pl-4 ml-4 border-l border-gray-200 flex items-center space-x-3">
                  <LanguageSwitcher />
                  <UserProfileDropdown />
                </div>
              </div>
            </div>
            <div className="flex lg:hidden items-center space-x-2">
              <LanguageSwitcher />
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Transaction History</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-center py-12">
            No transactions yet. Start using your BOOM Card to see your savings history here!
          </p>
        </div>
      </div>
    </div>
  );
}