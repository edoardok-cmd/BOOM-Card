import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import VideoBackground from '../components/VideoBackground';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  
  const stats = [
    { number: '5,000+', label: t('stats.users'), icon: '👥' },
    { number: '375+', label: t('stats.partners'), icon: '🏢' },
    { number: '25%', label: t('stats.savings'), icon: '💰' },
    { number: '4.8', label: t('stats.rating'), icon: '⭐' },
  ];

  const categories = [
    { 
      id: 'restaurants',
      icon: '🍽️',
      name: t('categories.fineDining'),
      partners: t('categories.restaurantPartners'),
      discount: `${t('categories.upTo')} 30% ${t('common.off')}`,
      color: 'from-primary to-primary-dark',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100'
    },
    { 
      id: 'hotels',
      icon: '🏨',
      name: t('categories.luxuryHotels'),
      partners: t('categories.hotelPartners'),
      discount: `${t('categories.upTo')} 40% ${t('common.off')}`,
      color: 'from-secondary-light to-secondary',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    { 
      id: 'spa',
      icon: '💆',
      name: t('categories.wellness'),
      partners: t('categories.spaPartners'),
      discount: `${t('categories.upTo')} 35% ${t('common.off')}`,
      color: 'from-gold-400 to-gold-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100'
    },
    { 
      id: 'entertainment',
      icon: '🎬',
      name: t('categories.entertainment'),
      partners: t('categories.entertainmentPartners'),
      discount: `${t('categories.upTo')} 25% ${t('common.off')}`,
      color: 'from-primary-light to-primary',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50'
    }
  ];

  const features = [
    { icon: '⚡', title: t('features.instantAccess'), description: t('features.instantAccessDesc') },
    { icon: '📱', title: t('features.mobileFirst'), description: t('features.mobileFirstDesc') },
    { icon: '🔒', title: t('features.secure'), description: t('features.secureDesc') },
    { icon: '✨', title: t('features.exclusive'), description: t('features.exclusiveDesc') }
  ];

  const testimonials = [
    {
      name: t('testimonials.customer1.name'),
      role: t('testimonials.customer1.role'),
      content: t('testimonials.customer1.content'),
      avatar: '👩'
    },
    {
      name: t('testimonials.customer2.name'),
      role: t('testimonials.customer2.role'),
      content: t('testimonials.customer2.content'),
      avatar: '👨'
    },
    {
      name: t('testimonials.customer3.name'),
      role: t('testimonials.customer3.role'),
      content: t('testimonials.customer3.content'),
      avatar: '👩'
    }
  ];

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative min-h-screen">
        <VideoBackground />
        {/* Navigation */}
        <nav className="relative z-20 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">BOOM Card</span>
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4 pt-4">
                  {t('nav.home')}
                </Link>
                <Link href="/partners" className="text-gray-600 hover:text-gray-900 font-medium pb-4 pt-4">
                  {t('nav.partners')}
                </Link>
                <Link href="/plans" className="text-gray-600 hover:text-gray-900 font-medium pb-4 pt-4">
                  {t('nav.plans')}
                </Link>
                {user && (
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium pb-4 pt-4">
                    {t('nav.dashboard')}
                  </Link>
                )}
                {user && (
                  <Link href="/profile" className="text-gray-600 hover:text-gray-900 font-medium pb-4 pt-4">
                    {t('nav.profile')}
                  </Link>
                )}
              </div>

              {/* Right Side - Search, Language, Get Started */}
              <div className="flex items-center space-x-4">
                {/* Search Icon */}
                <button 
                  onClick={() => router.push('/partners')}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Search Partners"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Get Started / Login Button */}
                {user ? (
                  <Link href="/dashboard" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    {t('nav.dashboard')}
                  </Link>
                ) : (
                  <Link href="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 bg-gradient-to-br from-primary-light via-primary to-primary-dark">
          <div className="relative z-10 flex items-center justify-center min-h-[85vh] px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <span className="text-sm text-white font-medium">{t('hero.badge')}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                {t('hero.title1')}<br />
                <span className="text-gold-300">
                  {t('hero.title2')}
                </span>
              </h1>
              
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                {t('hero.subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button 
                  onClick={() => router.push('/register')}
                  className="px-8 py-4 bg-gold-500 text-white rounded-full text-lg font-semibold hover:bg-gold-600 transform hover:scale-105 transition-all shadow-xl"
                >
                  {t('hero.cta.start')}
                </button>
                <button 
                  onClick={() => router.push('/demo')}
                  className="px-8 py-4 bg-white text-primary rounded-full text-lg font-semibold hover:bg-gray-100 transition-all shadow-xl"
                >
                  {t('hero.cta.demo')}
                </button>
              </div>
              
              <div className="flex items-center justify-center space-x-8 text-white">
                <div className="flex items-center">
                  <span className="text-gold-300 mr-2">✓</span>
                  {t('hero.trust.verified')}
                </div>
                <div className="flex items-center">
                  <span className="text-gold-300 mr-2">✓</span>
                  {t('hero.trust.instant')}
                </div>
                <div className="flex items-center">
                  <span className="text-gold-300 mr-2">✓</span>
                  {t('hero.trust.noFees')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-gray-600 mb-12 text-lg">{t('stats.subtitle')}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="relative z-10 py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full mb-4">
                <span className="text-sm text-primary font-medium">{t('categories.badge')}</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('categories.title')}</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('categories.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className="group bg-white rounded-2xl p-6 hover:shadow-2xl transition-all cursor-pointer border border-gray-100"
                  onClick={() => router.push(`/partners?category=${category.id}`)}
                >
                  <div className={`text-5xl mb-4 p-4 ${category.bgColor} rounded-xl inline-block`}>
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{category.partners}</p>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                      {category.discount}
                    </span>
                    <span className="text-primary group-hover:translate-x-1 transition-transform">
                      {t('categories.explore')} →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-gold-500/10 rounded-full mb-4">
                <span className="text-sm text-gold-600 font-medium">{t('features.badge')}</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('features.title1')} <span className="text-primary">{t('features.title2')}</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('features.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative z-10 py-20 bg-gradient-to-br from-secondary-light to-secondary">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full mb-4">
                <span className="text-sm text-white font-medium">{t('testimonials.badge')}</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">{t('testimonials.title')}</h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center mb-4">
                    <div className="text-4xl mr-4">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{testimonial.content}</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-gold-500">⭐</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-20 bg-black/60 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              {t('cta.title1')} <span className="text-orange-400">{t('cta.title2')}</span>
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/plans')}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                {t('cta.choosePlan')}
              </button>
              <button 
                onClick={() => router.push('/download')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full text-lg font-semibold hover:bg-white/20 transition-all"
              >
                {t('cta.downloadApp')}
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold text-white mb-1">€50K+</div>
                <div className="text-white/60 text-sm">{t('cta.memberSavings')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold text-white mb-1">375+</div>
                <div className="text-white/60 text-sm">{t('cta.premiumPartners')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold text-white mb-1">5K+</div>
                <div className="text-white/60 text-sm">{t('cta.activeMembers')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold text-white mb-1">4.8⭐</div>
                <div className="text-white/60 text-sm">{t('cta.memberRating')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 bg-gradient-to-b from-slate-800 to-slate-900 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-1">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">BOOM Card</h3>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Bulgaria's premier discount platform connecting you to exclusive experiences at the country's finest establishments.
                </p>
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600 transition-colors cursor-pointer">
                    <span className="text-gray-300">📱</span>
                  </div>
                  <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600 transition-colors cursor-pointer">
                    <span className="text-gray-300">✉️</span>
                  </div>
                  <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600 transition-colors cursor-pointer">
                    <span className="text-gray-300">☁️</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-6 text-lg">Premium Categories</h4>
                <ul className="space-y-3 text-gray-300">
                  <li><Link href="/partners?category=restaurants" className="hover:text-white transition-colors">Fine Dining Restaurants</Link></li>
                  <li><Link href="/partners?category=hotels" className="hover:text-white transition-colors">Luxury Hotels & Resorts</Link></li>
                  <li><Link href="/partners?category=spas" className="hover:text-white transition-colors">Premium Spas & Wellness</Link></li>
                  <li><Link href="/partners?category=entertainment" className="hover:text-white transition-colors">Entertainment & Events</Link></li>
                  <li><Link href="/partners" className="hover:text-white transition-colors">Exclusive Experiences</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-6 text-lg">Company</h4>
                <ul className="space-y-3 text-gray-300">
                  <li><Link href="/about" className="hover:text-white transition-colors">About BOOM Card</Link></li>
                  <li><Link href="/partners/apply" className="hover:text-white transition-colors">Partner with Us</Link></li>
                  <li><Link href="/support" className="hover:text-white transition-colors">Member Support</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact & Locations</Link></li>
                  <li><Link href="/press" className="hover:text-white transition-colors">Press & Media</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-6 text-lg">Get the App</h4>
                <div className="space-y-3 mb-6">
                  <button className="flex items-center space-x-3 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg transition-colors w-full">
                    <span className="text-xl">📱</span>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Download on the</div>
                      <div className="text-white font-semibold">App Store</div>
                    </div>
                  </button>
                  <button className="flex items-center space-x-3 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg transition-colors w-full">
                    <span className="text-xl">📱</span>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Get it on</div>
                      <div className="text-white font-semibold">Google Play</div>
                    </div>
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-300">
                    <span className="text-green-400 mr-2">🔒</span>
                    <span className="text-sm">Secure & Private</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <span className="text-blue-400 mr-2">⚡</span>
                    <span className="text-sm">Instant Access</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-700 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
                <div className="mb-4 md:mb-0">
                  <span>© 2024 BOOM Card Bulgaria. All rights reserved. | </span>
                  <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                  <span> | </span>
                  <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                </div>
                <div className="flex items-center space-x-6">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    All systems operational
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">🇧🇬</span>
                    Made in Bulgaria
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}