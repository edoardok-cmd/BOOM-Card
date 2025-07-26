import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import MobileMenu from '../components/MobileMenu';
import { useLanguage } from '../contexts/LanguageContext';

export default function HelpCenter() {
  const { t } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: t('help.categories.all') || 'All Topics', icon: '📚' },
    { id: 'account', name: t('help.categories.account') || 'Account & Login', icon: '👤' },
    { id: 'billing', name: t('help.categories.billing') || 'Billing & Payments', icon: '💳' },
    { id: 'usage', name: t('help.categories.usage') || 'Using BOOM Card', icon: '📱' },
    { id: 'partners', name: t('help.categories.partners') || 'Partners & Offers', icon: '🏪' },
    { id: 'technical', name: t('help.categories.technical') || 'Technical Issues', icon: '🔧' }
  ];

  const helpArticles = [
    {
      id: 1,
      category: 'account',
      title: t('help.articles.resetPassword.title') || 'How to reset your password',
      content: t('help.articles.resetPassword.content') || 'Go to the login page and click "Forgot Password". Enter your email address and we\'ll send you a reset link.',
      popular: true
    },
    {
      id: 2,
      category: 'billing',
      title: t('help.articles.changeSubscription.title') || 'How to change your subscription plan',
      content: t('help.articles.changeSubscription.content') || 'Navigate to Account Settings > Billing and click "Change Plan". Select your new plan and confirm the change.',
      popular: true
    },
    {
      id: 3,
      category: 'usage',
      title: t('help.articles.useQR.title') || 'How to use your QR code',
      content: t('help.articles.useQR.content') || 'Open the BOOM Card app, tap on "My Card" to display your QR code. Show it to the merchant at checkout.',
      popular: true
    },
    {
      id: 4,
      category: 'partners',
      title: t('help.articles.findPartners.title') || 'Finding partner locations near you',
      content: t('help.articles.findPartners.content') || 'Use the search bar or browse by category. Enable location services for personalized recommendations.',
      popular: false
    },
    {
      id: 5,
      category: 'technical',
      title: t('help.articles.appNotWorking.title') || 'App not working properly',
      content: t('help.articles.appNotWorking.content') || 'Try clearing your browser cache or updating to the latest version. If issues persist, contact support.',
      popular: false
    },
    {
      id: 6,
      category: 'billing',
      title: t('help.articles.cancelSubscription.title') || 'How to cancel your subscription',
      content: t('help.articles.cancelSubscription.content') || 'Go to Account Settings > Billing and click "Cancel Subscription". Your access will continue until the end of the billing period.',
      popular: false
    }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>{t('help.title') || 'Help Center - BOOM Card'}</title>
        <meta name="description" content={t('help.description') || 'Get help with your BOOM Card membership'} />
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
                <a href="/" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('nav.home')}</a>
                <a href="/partners" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('nav.partners')}</a>
                <a href="/subscriptions" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('nav.plans')}</a>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('help.hero.title') || 'Help Center'}
          </h1>
          <p className="text-xl opacity-90 mb-8">
            {t('help.hero.subtitle') || 'Find answers to your questions'}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder={t('help.searchPlaceholder') || 'Search for help...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-12 text-gray-900 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-white"
              />
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map(article => (
                <div key={article.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                    {article.popular && (
                      <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2.5 py-0.5 rounded">
                        {t('help.popular') || 'Popular'}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{article.content}</p>
                  <button className="text-orange-500 font-medium hover:text-orange-600 transition-colors">
                    {t('help.readMore') || 'Read more →'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {t('help.noResults') || 'No articles found. Try a different search term.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('help.contact.title') || 'Still need help?'}
          </h2>
          <p className="text-xl opacity-90 mb-8">
            {t('help.contact.subtitle') || 'Our support team is here to assist you'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('help.contact.email') || 'Email'}</h3>
              <p className="opacity-90">support@boomcard.bg</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('help.contact.phone') || 'Phone'}</h3>
              <p className="opacity-90">+359 2 123 4567</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('help.contact.hours') || 'Hours'}</h3>
              <p className="opacity-90">Mon-Fri 9AM-6PM</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
// Force server-side rendering
export async function getServerSideProps() {
  return {
    props: {},
  }
}
