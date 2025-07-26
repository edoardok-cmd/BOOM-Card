import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import VideoBackground from '../components/VideoBackground';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import MobileMenu from '../components/MobileMenu';
import Logo from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">BOOM Card</h1>
          <p className="text-2xl">Loading...</p>
        </div>
      </div>
    );
  }
  
  const stats = [
    { number: '375+', label: t('stats.activePartners'), icon: '🏪' },
    { number: '€2.5M+', label: t('stats.totalSavings'), icon: '💰' },
    { number: '25K+', label: t('stats.happyMembers'), icon: '👥' },
    { number: '15+', label: t('stats.cities'), icon: '🌍' }
  ];

  const categories = [
    { 
      icon: '🍽️', 
      name: t('categories.fineDining'), 
      partners: t('categories.fineDiningDesc'), 
      discount: `${t('categories.upTo')} 30% ${t('common.off')}`,
      color: 'from-gold-400 to-gold-500',
      bgColor: 'bg-gradient-to-br from-gold-50 to-gold-100'
    },
    { 
      icon: '🏨', 
      name: t('categories.luxuryHotels'), 
      partners: t('categories.luxuryHotelsDesc'), 
      discount: `${t('categories.upTo')} 40% ${t('common.off')}`,
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    { 
      icon: '💆', 
      name: t('categories.wellness'), 
      partners: t('categories.wellnessDesc'), 
      discount: `${t('categories.upTo')} 35% ${t('common.off')}`,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    { 
      icon: '🎭', 
      name: t('categories.entertainment'), 
      partners: t('categories.entertainmentDesc'), 
      discount: `${t('categories.upTo')} 25% ${t('common.off')}`,
      color: 'from-gold-500 to-gold-600',
      bgColor: 'bg-gradient-to-br from-gold-50 to-gold-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>Boom Card - Unlock Bulgaria's Premium Experiences</title>
        <meta name="description" content="Access exclusive discounts at over 375 premium restaurants, luxury hotels, world-class spas, and entertainment venues across Bulgaria." />
        <link rel="icon" href="/favicon.ico" />
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
                <a href="/" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold">
                  {t('nav.home')}
                </a>
                <a href="/partners" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  {t('nav.partners')}
                </a>
                <a href="/subscriptions" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  {t('nav.plans')}
                </a>
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
      <div className="relative overflow-hidden">
        <VideoBackground 
          videoUrl="/videos/dvoretsa.mp4"
          posterUrl="/images/restaurant-poster.jpg"
          overlayOpacity={0.5}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-70"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-white/10 backdrop-blur-sm text-white border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                {t('hero.badge')}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                {t('hero.title1')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">
                {t('hero.title2')}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-4xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button 
                onClick={() => router.push('/register')}
                className="group bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all shadow-2xl hover:shadow-gold-500/25 hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  {t('hero.cta.primary')}
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
              
              <button 
                onClick={() => router.push('/demo')}
                className="group border-2 border-white/30 hover:border-white/50 text-white hover:bg-white/10 font-bold py-5 px-10 rounded-2xl text-lg transition-all backdrop-blur-sm"
              >
                <span className="flex items-center justify-center">
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 4a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h14z" />
                  </svg>
                  {t('hero.cta.secondary')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('stats.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('stats.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">{stat.icon}</span>
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              {t('categories.badge')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('categories.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('categories.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <div key={index} className={`${category.bgColor} rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-2`}>
                <div className="flex items-start space-x-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{category.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{category.partners}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                        {category.discount}
                      </span>
                      <button className="bg-white/80 hover:bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                        {t('common.explore')} →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}