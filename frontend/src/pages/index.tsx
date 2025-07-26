import React from 'react';
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
  const { t } = useLanguage();
  const router = useRouter();
  
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

  const features = [
    {
      icon: '⚡',
      title: t('features.instantAccess'),
      description: t('features.instantAccessDesc')
    },
    {
      icon: '🔒',
      title: t('features.securePayments'),
      description: t('features.securePaymentsDesc')
    },
    {
      icon: '🎯',
      title: t('features.premiumPartners'),
      description: t('features.premiumPartnersDesc')
    },
    {
      icon: '📱',
      title: t('features.mobileFirst'),
      description: t('features.mobileFirstDesc')
    }
  ];

  const getTestimonials = (t: any) => [
    {
      name: t('testimonials.elena.name'),
      role: t('testimonials.elena.role'),
      content: t('testimonials.elena.content'),
      avatar: '👩‍💼'
    },
    {
      name: t('testimonials.dimitar.name'),
      role: t('testimonials.dimitar.role'),
      content: t('testimonials.dimitar.content'),
      avatar: '👨‍💻'
    },
    {
      name: t('testimonials.maria.name'),
      role: t('testimonials.maria.role'),
      content: t('testimonials.maria.content'),
      avatar: '👩‍🎨'
    }
  ];
  
  const testimonials = getTestimonials(t);

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
            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="ml-10 flex items-center space-x-1">
                <a href="/" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold">{t('nav.home')}</a>
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
      <div className="relative overflow-hidden">
        {/* Video Background */}
        <VideoBackground 
          videoUrl="/videos/dvoretsa.mp4"
          overlayOpacity={0.5}
        />
        
        {/* Partner page gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-70"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

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
                onClick={() => router.push('/subscriptions')}
                className="group bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all shadow-2xl hover:shadow-gold-500/25 hover:scale-105">
                <span className="flex items-center justify-center">
                  {t('hero.cta.start')}
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
              <button 
                onClick={() => router.push('/demo')}
                className="group border-2 border-white/30 hover:border-white/50 text-white hover:bg-white/10 font-bold py-5 px-10 rounded-2xl text-lg transition-all backdrop-blur-sm">
                <span className="flex items-center justify-center">
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 4a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h14z" />
                  </svg>
                  {t('hero.cta.demo')}
                </span>
              </button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-300">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('hero.trust.verified')}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('hero.trust.instant')}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('hero.trust.noFees')}
              </div>
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
                      <button 
                        onClick={() => {
                          if (category.name === t('categories.fineDining')) router.push('/partners?category=restaurants');
                          else if (category.name === t('categories.luxuryHotels')) router.push('/partners?category=hotels');
                          else if (category.name === t('categories.wellness')) router.push('/partners?category=spas');
                          else if (category.name === t('categories.entertainment')) router.push('/partners?category=entertainment');
                        }}
                        className="bg-white/80 hover:bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                        {t('categories.explore')} →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-gold-100/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-100/30 to-blue-100/30 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-semibold mb-6">
              {t('features.badge')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('features.title1')}<br />
              <span className="bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent">{t('features.title2')}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-3xl filter drop-shadow-sm">{feature.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    <button 
                      onClick={() => router.push('/how-it-works')}
                      className="mt-4 flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform cursor-pointer hover:text-blue-700">
                      {t('features.learnMore')} 
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
              {t('testimonials.badge')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('testimonials.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-gold-400 rounded-full flex items-center justify-center text-2xl shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic leading-relaxed mb-4">
                  "{testimonial.content}"
                </p>
                <div className="flex text-yellow-400">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Leave Review Button */}
          <div className="text-center mt-12">
            <button 
              onClick={() => router.push('/profile#reviews')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
              {t('testimonials.leaveReview')}
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden py-24">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-gold-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-gold-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <span className="text-4xl">💳</span>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              {t('cta.title1')}
            </span>
            <br />
            <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              {t('cta.title2')}
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed">
            {t('cta.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button 
              onClick={() => router.push('/subscriptions')}
              className="group bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all shadow-2xl hover:shadow-gold-500/25 hover:scale-105">
              <span className="flex items-center justify-center">
                {t('cta.choosePlan')}
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
            <button 
              onClick={() => window.open('https://apps.apple.com/app/boom-card', '_blank')}
              className="group border-2 border-white/30 hover:border-white/50 text-white hover:bg-white/10 font-bold py-5 px-10 rounded-2xl text-lg transition-all backdrop-blur-sm">
              <span className="flex items-center justify-center">
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {t('cta.downloadApp')}
              </span>
            </button>
          </div>
          
          {/* Success metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">€2.5M+</div>
              <div className="text-sm text-gray-300">{t('cta.memberSavings')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">375+</div>
              <div className="text-sm text-gray-300">{t('cta.premiumPartners')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">25K+</div>
              <div className="text-sm text-gray-300">{t('cta.activeMembers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">4.9★</div>
              <div className="text-sm text-gray-300">{t('cta.memberRating')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="mb-6">
                <Logo size="md" showText={true} variant="footer" />
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                {t('footer.description')}
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://facebook.com/boomcardbg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com/boomcardbg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                </a>
                <a 
                  href="https://twitter.com/boomcardbg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6 text-white">{t('footer.premiumCategories')}</h3>
              <ul className="space-y-3">
                <li><a href="/partners?category=restaurants" className="text-gray-400 hover:text-gold-400 transition-colors">{t('footer.fineDiningRestaurants')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">{t('footer.luxuryHotelsResorts')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">{t('footer.premiumSpasWellness')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">{t('footer.entertainmentEvents')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">{t('footer.exclusiveExperiences')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6 text-white">{t('footer.company')}</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">{t('footer.aboutBoomCard')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">{t('footer.partnerWithUs')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">{t('footer.memberSupport')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">{t('footer.contactLocations')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-gold-400 transition-colors">{t('footer.pressMedia')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6 text-white">{t('footer.getTheApp')}</h3>
              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-blue-600 hover:to-gold-600 rounded-xl p-4 cursor-pointer transition-all group">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <div className="text-xs text-gray-400 group-hover:text-white">{t('footer.downloadOn')}</div>
                      <div className="text-sm font-bold text-white">{t('footer.appStore')}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-blue-600 hover:to-gold-600 rounded-xl p-4 cursor-pointer transition-all group">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <div className="text-xs text-gray-400 group-hover:text-white">{t('footer.getItOn')}</div>
                      <div className="text-sm font-bold text-white">{t('footer.googlePlay')}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-400">
                <p className="mb-2">🔒 {t('footer.securePrivate')}</p>
                <p>⚡ {t('footer.instantAccess')}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                {t('footer.rights')} | {t('footer.privacyPolicy')} | {t('footer.termsOfService')}
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  {t('footer.allSystemsOperational')}
                </span>
                <span>🇧🇬 {t('footer.madeInBulgaria')}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}