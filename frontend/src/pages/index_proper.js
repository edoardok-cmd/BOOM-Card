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
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-gradient-to-br from-orange-100 to-red-100'
    },
    { 
      id: 'hotels',
      icon: '🏨',
      name: t('categories.luxuryHotels'),
      partners: t('categories.hotelPartners'),
      discount: `${t('categories.upTo')} 40% ${t('common.off')}`,
      color: 'from-blue-400 to-indigo-500',
      bgColor: 'bg-gradient-to-br from-blue-100 to-indigo-100'
    },
    { 
      id: 'spa',
      icon: '💆',
      name: t('categories.wellness'),
      partners: t('categories.spaPartners'),
      discount: `${t('categories.upTo')} 35% ${t('common.off')}`,
      color: 'from-green-400 to-teal-500',
      bgColor: 'bg-gradient-to-br from-green-100 to-teal-100'
    },
    { 
      id: 'entertainment',
      icon: '🎬',
      name: t('categories.entertainment'),
      partners: t('categories.entertainmentPartners'),
      discount: `${t('categories.upTo')} 25% ${t('common.off')}`,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-100 to-pink-100'
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
        <nav className="relative z-20 bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-white">
                  BOOM Card
                </Link>
                <div className="hidden md:block ml-10">
                  <div className="flex items-baseline space-x-4">
                    <Link href="/" className="text-white hover:text-orange-400 px-3 py-2">
                      {t('nav.home')}
                    </Link>
                    <Link href="/partners" className="text-white hover:text-orange-400 px-3 py-2">
                      {t('nav.partners')}
                    </Link>
                    <Link href="/plans" className="text-white hover:text-orange-400 px-3 py-2">
                      {t('nav.plans')}
                    </Link>
                    {user && (
                      <Link href="/dashboard" className="text-white hover:text-orange-400 px-3 py-2">
                        {t('nav.dashboard')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                {user ? (
                  <Link href="/profile" className="text-white hover:text-orange-400">
                    {t('nav.profile')}
                  </Link>
                ) : (
                  <Link href="/login" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 flex items-center justify-center min-h-[90vh] px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <span className="text-sm text-white">{t('hero.badge')}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              {t('hero.title1')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                {t('hero.title2')}
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={() => router.push('/register')}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                {t('hero.cta.start')}
              </button>
              <button 
                onClick={() => router.push('/demo')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full text-lg font-semibold hover:bg-white/20 transition-all"
              >
                {t('hero.cta.demo')}
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-white/80">
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                {t('hero.trust.verified')}
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                {t('hero.trust.instant')}
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                {t('hero.trust.noFees')}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 py-20 bg-black/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-white/80 mb-12">{t('stats.subtitle')}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="relative z-10 py-20 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                <span className="text-sm text-white">{t('categories.badge')}</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">{t('categories.title')}</h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">{t('categories.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all cursor-pointer"
                  onClick={() => router.push(`/partners?category=${category.id}`)}
                >
                  <div className="text-5xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                  <p className="text-white/60 text-sm mb-4">{category.partners}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{category.discount}</span>
                    <span className="text-white/60 group-hover:text-white transition-colors">
                      {t('categories.explore')} →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 py-20 bg-black/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                <span className="text-sm text-white">{t('features.badge')}</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                {t('features.title1')} <span className="text-orange-400">{t('features.title2')}</span>
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">{t('features.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative z-10 py-20 bg-gradient-to-b from-black/40 to-black/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                <span className="text-sm text-white">{t('testimonials.badge')}</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">{t('testimonials.title')}</h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-4xl mr-4">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-bold text-white">{testimonial.name}</h4>
                      <p className="text-white/60 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-white/80">{testimonial.content}</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
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
                className="px-8 py-4 bg-white text-gray-900 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                {t('cta.downloadApp')}
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 bg-black/80 backdrop-blur-sm py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">BOOM Card</h3>
                <p className="text-white/60">{t('footer.description')}</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">{t('footer.company')}</h4>
                <ul className="space-y-2 text-white/60">
                  <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                  <li><Link href="/partners" className="hover:text-white">Partners</Link></li>
                  <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                  <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-white/60">
                  <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                  <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                  <li><Link href="/cookies" className="hover:text-white">Cookies</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">{t('footer.getTheApp')}</h4>
                <div className="space-y-4">
                  <button className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20">
                    <span>📱</span>
                    <span className="text-white">{t('footer.appStore')}</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20">
                    <span>📱</span>
                    <span className="text-white">{t('footer.googlePlay')}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60">
              <p>© 2024 BOOM Card. {t('footer.madeInBulgaria')} 🇧🇬</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}