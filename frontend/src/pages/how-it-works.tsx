import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import { useLanguage } from '../contexts/LanguageContext';

export default function HowItWorks() {
  const { t } = useLanguage();
  const router = useRouter();

  const steps = [
    {
      number: '1',
      title: t('howItWorks.steps.signUp.title') || 'Sign Up & Choose Your Plan',
      description: t('howItWorks.steps.signUp.description') || 'Create your account and select from our Essential, Premium, or VIP membership plans.',
      icon: '📝',
      color: 'from-blue-400 to-blue-500'
    },
    {
      number: '2',
      title: t('howItWorks.steps.getCard.title') || 'Get Your Digital Card',
      description: t('howItWorks.steps.getCard.description') || 'Receive your digital BOOM Card instantly in the app with a unique QR code.',
      icon: '💳',
      color: 'from-orange-400 to-red-500'
    },
    {
      number: '3',
      title: t('howItWorks.steps.browse.title') || 'Browse Premium Partners',
      description: t('howItWorks.steps.browse.description') || 'Explore our curated network of 375+ luxury venues across Bulgaria.',
      icon: '🔍',
      color: 'from-purple-400 to-pink-500'
    },
    {
      number: '4',
      title: t('howItWorks.steps.save.title') || 'Show Card & Save',
      description: t('howItWorks.steps.save.description') || 'Present your QR code at checkout and enjoy instant discounts up to 40%.',
      icon: '✨',
      color: 'from-green-400 to-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>{t('howItWorks.title') || 'How It Works - BOOM Card'}</title>
        <meta name="description" content={t('howItWorks.description') || 'Learn how BOOM Card works and start saving at premium venues'} />
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
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-1">
                <a href="/" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('nav.home')}</a>
                <a href="/partners" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('nav.partners')}</a>
                <a href="/subscriptions" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('nav.plans')}</a>
                <a href="/how-it-works" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold">{t('nav.howItWorks') || 'How It Works'}</a>
                <div className="pl-4 ml-4 border-l border-gray-200 flex items-center space-x-3">
                  <SearchBar />
                  <LanguageSwitcher />
                  <UserProfileDropdown />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('howItWorks.hero.title') || 'How BOOM Card Works'}
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            {t('howItWorks.hero.subtitle') || 'Start saving at Bulgaria\'s finest establishments in just 4 simple steps'}
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gray-300 -z-10"></div>
                )}
                
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
                  <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <span className="text-4xl">{step.icon}</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-200 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('howItWorks.benefits.title') || 'Why Choose BOOM Card?'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('howItWorks.benefits.savings.title') || 'Instant Savings'}
              </h3>
              <p className="text-gray-600">
                {t('howItWorks.benefits.savings.description') || 'Save up to 40% at over 375 premium venues'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('howItWorks.benefits.digital.title') || 'Fully Digital'}
              </h3>
              <p className="text-gray-600">
                {t('howItWorks.benefits.digital.description') || 'No physical card needed - everything in your app'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('howItWorks.benefits.instant.title') || 'Instant Access'}
              </h3>
              <p className="text-gray-600">
                {t('howItWorks.benefits.instant.description') || 'Start saving immediately after signup'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('howItWorks.cta.title') || 'Ready to Start Saving?'}
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            {t('howItWorks.cta.subtitle') || 'Join thousands of members enjoying exclusive discounts'}
          </p>
          <button 
            onClick={() => router.push('/subscriptions')}
            className="bg-white hover:bg-gray-100 text-orange-600 font-bold py-4 px-8 rounded-xl text-lg transition-colors">
            {t('howItWorks.cta.button') || 'Get Started Now'}
          </button>
        </div>
      </section>

    </div>
  );
}