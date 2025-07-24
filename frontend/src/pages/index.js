import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import VideoBackground from '../components/VideoBackground';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import Logo from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();
  
  const stats = [
    { number: '375+', label: t('stats.activePartners') || 'Active Partners', icon: '🏪' },
    { number: '€2.5M+', label: t('stats.totalSavings') || 'Total Savings', icon: '💰' },
    { number: '25K+', label: t('stats.happyMembers') || 'Happy Members', icon: '👥' },
    { number: '15+', label: t('stats.cities') || 'Cities', icon: '🌍' }
  ];

  const categories = [
    { 
      icon: '🍽️', 
      name: t('categories.fineDining') || 'Fine Dining', 
      partners: t('categories.restaurantPartners') || '150+ Partners', 
      discount: `${t('categories.upTo') || 'Up to'} 30% ${t('common.off') || 'off'}`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      icon: '🏨', 
      name: t('categories.luxuryHotels') || 'Luxury Hotels', 
      partners: t('categories.hotelPartners') || '75+ Partners', 
      discount: `${t('categories.upTo') || 'Up to'} 40% ${t('common.off') || 'off'}`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      icon: '💆', 
      name: t('categories.wellness') || 'Wellness & Spa', 
      partners: t('categories.spaPartners') || '100+ Partners', 
      discount: `${t('categories.upTo') || 'Up to'} 35% ${t('common.off') || 'off'}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      icon: '🎭', 
      name: t('categories.entertainment') || 'Entertainment', 
      partners: t('categories.entertainmentPartners') || '50+ Partners', 
      discount: `${t('categories.upTo') || 'Up to'} 25% ${t('common.off') || 'off'}`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const features = [
    {
      icon: '⚡',
      title: t('features.instantAccess') || 'Instant Access',
      description: t('features.instantAccessDesc') || 'Immediate access to all partner discounts'
    },
    {
      icon: '📱',
      title: t('features.mobileFirst') || 'Mobile First',
      description: t('features.mobileFirstDesc') || 'Optimized for mobile experience'
    },
    {
      icon: '🔒',
      title: t('features.secure') || 'Secure & Private',
      description: t('features.secureDesc') || 'Your data is protected and secure'
    },
    {
      icon: '💫',
      title: t('features.exclusive') || 'Exclusive Deals',
      description: t('features.exclusiveDesc') || 'Access to member-only discounts'
    }
  ];

  const getTestimonials = (t) => [
    {
      name: t('testimonials.customer1.name') || 'Maria Popova',
      role: t('testimonials.customer1.role') || 'Sofia Resident',
      content: t('testimonials.customer1.content') || 'Amazing discounts at my favorite restaurants!',
      avatar: '👩‍💼'
    },
    {
      name: t('testimonials.customer2.name') || 'Ivan Petrov',
      role: t('testimonials.customer2.role') || 'Business Owner',
      content: t('testimonials.customer2.content') || 'Great value and excellent service.',
      avatar: '👨‍💼'
    },
    {
      name: t('testimonials.customer3.name') || 'Elena Nikolova',
      role: t('testimonials.customer3.role') || 'Marketing Manager',
      content: t('testimonials.customer3.content') || 'I save money every month with BOOM Card.',
      avatar: '👩‍💻'
    }
  ];
  
  const testimonials = getTestimonials(t);

  return (
    <>
      <Head>
        <title>{t('meta.title') || 'Boom Card - Unlock Bulgaria\'s Premium Experiences'}</title>
        <meta name="description" content={t('meta.description') || 'Premium discount card for restaurants, hotels, and entertainment in Bulgaria'} />
      </Head>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-orange-600 font-medium">
                {t('nav.home') || 'Home'}
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <VideoBackground />

        {/* Partner page gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-gold-500/20 to-orange-500/20 border border-gold-500/30 backdrop-blur-sm mb-8">
            <span className="text-gold-400 font-semibold text-sm">
              {t('hero.badge') || '🎯 Premium Membership Platform'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gold-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              {t('hero.title1') || 'Unlock Bulgaria\'s'}
            </span>
            <br />
            <span className="text-white">
              {t('hero.title2') || 'Premium Experiences'}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('hero.subtitle') || 'Access exclusive discounts at 375+ premium venues across Bulgaria'}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button 
              onClick={() => router.push('/subscriptions')}
              className="group bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-lg"
            >
              <span className="flex items-center">
                {t('hero.cta.start') || 'Start Saving Today'}
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            
            <button 
              onClick={() => router.push('/demo')}
              className="group border-2 border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:bg-white/10 text-lg"
            >
              <span className="flex items-center">
                {t('hero.cta.demo') || 'Watch Demo'}
                <svg className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/80 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('hero.trust.verified') || 'Verified Partners'}
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {t('hero.trust.instant') || 'Instant Access'}
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              {t('hero.trust.noFees') || 'No Hidden Fees'}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 mb-12 text-lg">
            {t('stats.subtitle') || 'Trusted by thousands of members across Bulgaria'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-semibold text-sm mb-4">
              {t('categories.badge') || '🎯 Premium Categories'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('categories.title') || 'Explore Premium Categories'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('categories.subtitle') || 'Discover exclusive discounts across Bulgaria\'s finest establishments'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <div key={index} className={`group ${category.bgColor} rounded-3xl p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105`}>
                <div className="text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className={`text-xl font-bold ${category.color} mb-2`}>{category.name}</h3>
                  <p className="text-gray-600 mb-4">{category.partners}</p>
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm mb-6">
                    <span className={`font-bold ${category.color}`}>
                      {category.discount}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      if (category.name === (t('categories.fineDining') || 'Fine Dining')) router.push('/partners?category=restaurants');
                      else if (category.name === (t('categories.luxuryHotels') || 'Luxury Hotels')) router.push('/partners?category=hotels');
                      else if (category.name === (t('categories.wellness') || 'Wellness & Spa')) router.push('/partners?category=spas');
                      else if (category.name === (t('categories.entertainment') || 'Entertainment')) router.push('/partners?category=entertainment');
                    }}
                    className="bg-white/80 hover:bg-white text-gray-900 font-semibold px-6 py-2 rounded-full transition-all duration-200 group-hover:shadow-md"
                  >
                    {t('categories.explore') || 'Explore'} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm mb-4">
              {t('features.badge') || '⚡ Platform Features'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('features.title1') || 'Why Choose'} <span className="text-blue-600">{t('features.title2') || 'BOOM Card?'}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('features.subtitle') || 'Experience the future of premium discounts with our cutting-edge platform'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <button 
                    onClick={() => router.push('/how-it-works')}
                    className="mt-4 flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700 transition-colors mx-auto"
                  >
                    {t('features.learnMore') || 'Learn More'} 
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-600 font-semibold text-sm mb-4">
              {t('testimonials.badge') || '💬 Member Reviews'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('testimonials.title') || 'What Our Members Say'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('testimonials.subtitle') || 'Join thousands of satisfied members saving money every day'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-3xl p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Leave Review Button */}
          <div className="text-center">
            <button 
              onClick={() => router.push('/profile#reviews')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              {t('testimonials.leaveReview') || 'Leave a Review'}
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-gold-500 to-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="mb-8">
            <div className="text-6xl mb-6">💳</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t('cta.title1') || 'Ready to Start'} <span className="text-gold-400">{t('cta.title2') || 'Saving?'}</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              {t('cta.subtitle') || 'Join BOOM Card today and unlock exclusive discounts at Bulgaria\'s finest establishments'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button 
              onClick={() => router.push('/subscriptions')}
              className="group bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 text-lg"
            >
              <span className="flex items-center">
                {t('cta.choosePlan') || 'Choose Your Plan'}
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            
            <button 
              onClick={() => window.open('https://app.boomcard.bg', '_blank')}
              className="group border-2 border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:bg-white/10 text-lg"
            >
              <span className="flex items-center">
                {t('cta.downloadApp') || 'Download App'}
                <svg className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
            </button>
          </div>

          {/* Success metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gold-400 mb-2">€2.5M+</div>
              <div className="text-gray-300">{t('cta.memberSavings') || 'Member Savings'}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">375+</div>
              <div className="text-gray-300">{t('cta.premiumPartners') || 'Premium Partners'}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">25K+</div>
              <div className="text-gray-300">{t('cta.activeMembers') || 'Active Members'}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">4.9★</div>
              <div className="text-gray-300">{t('cta.memberRating') || 'Member Rating'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo />
              <p className="text-gray-400 mb-4 max-w-md">
                {t('footer.description') || 'Bulgaria\'s premium discount platform connecting members with exclusive offers at finest venues.'}
              </p>
              <div className="text-sm text-gray-500">
                {t('footer.premiumCategories') || 'Fine Dining • Luxury Hotels • Wellness & Spa • Entertainment'}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">{t('footer.company') || 'Company'}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
                <li><a href="/careers" className="hover:text-white">Careers</a></li>
                <li><a href="/press" className="hover:text-white">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">{t('footer.getTheApp') || 'Get the App'}</h4>
              <div className="space-y-3">
                <a href="#" className="flex items-center text-gray-400 hover:text-white">
                  <span className="mr-2">📱</span>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="font-semibold">{t('footer.appStore') || 'App Store'}</div>
                  </div>
                </a>
                <a href="#" className="flex items-center text-gray-400 hover:text-white">
                  <span className="mr-2">🤖</span>
                  <div>
                    <div className="text-xs">Get it on</div>
                    <div className="font-semibold">{t('footer.googlePlay') || 'Google Play'}</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <span>🔒 {t('footer.securePrivate') || 'Secure & Private'}</span>
              <span>⚡ {t('footer.instantAccess') || 'Instant Access'}</span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                {t('footer.allSystemsOperational') || 'All Systems Operational'}
              </span>
              <span>🇧🇬 {t('footer.madeInBulgaria') || 'Made in Bulgaria'}</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}