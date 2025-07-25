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

      <div className="relative min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="relative z-20 bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-primary">
                  BOOM Card
                </Link>
                <div className="hidden md:block ml-10">
                  <div className="flex items-baseline space-x-4">
                    <Link href="/" className="text-gray-700 hover:text-primary px-3 py-2 font-medium">
                      {t('nav.home')}
                    </Link>
                    <Link href="/partners" className="text-gray-700 hover:text-primary px-3 py-2 font-medium">
                      {t('nav.partners')}
                    </Link>
                    <Link href="/plans" className="text-gray-700 hover:text-primary px-3 py-2 font-medium">
                      {t('nav.plans')}
                    </Link>
                    {user && (
                      <Link href="/dashboard" className="text-gray-700 hover:text-primary px-3 py-2 font-medium">
                        {t('nav.dashboard')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                {user ? (
                  <Link href="/profile" className="text-gray-700 hover:text-primary font-medium">
                    {t('nav.profile')}
                  </Link>
                ) : (
                  <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-colors font-medium">
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-light via-primary to-primary-dark">
          <div className="absolute inset-0 bg-black opacity-10"></div>
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
        <section className="py-20 bg-white">
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
        <section className="py-20 bg-gray-50">
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
        <section className="py-20 bg-white">
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
        <section className="py-20 bg-gradient-to-br from-secondary-light to-secondary">
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
        <section className="py-20 bg-gradient-to-br from-primary to-primary-dark">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              {t('cta.title1')} <span className="text-gold-300">{t('cta.title2')}</span>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/plans')}
                className="px-8 py-4 bg-gold-500 text-white rounded-full text-lg font-semibold hover:bg-gold-600 transform hover:scale-105 transition-all shadow-xl"
              >
                {t('cta.choosePlan')}
              </button>
              <button 
                onClick={() => router.push('/download')}
                className="px-8 py-4 bg-white text-primary rounded-full text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-xl"
              >
                {t('cta.downloadApp')}
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-white">
              <div>
                <div className="text-3xl font-bold mb-1">€50K+</div>
                <div className="text-white/80">{t('cta.memberSavings')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">375+</div>
                <div className="text-white/80">{t('cta.premiumPartners')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">5K+</div>
                <div className="text-white/80">{t('cta.activeMembers')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">4.8★</div>
                <div className="text-white/80">{t('cta.memberRating')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">BOOM Card</h3>
                <p className="text-gray-400">{t('footer.description')}</p>
                <div className="mt-4 text-sm text-gray-500">
                  {t('footer.premiumCategories')}
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">{t('footer.company')}</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/partners" className="hover:text-white transition-colors">Partners</Link></li>
                  <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">{t('footer.getTheApp')}</h4>
                <div className="space-y-4">
                  <button className="flex items-center space-x-3 bg-gray-800 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors w-full">
                    <span className="text-2xl">🍎</span>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Download on the</div>
                      <div className="text-white font-semibold">{t('footer.appStore')}</div>
                    </div>
                  </button>
                  <button className="flex items-center space-x-3 bg-gray-800 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors w-full">
                    <span className="text-2xl">🤖</span>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Get it on</div>
                      <div className="text-white font-semibold">{t('footer.googlePlay')}</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400">© 2024 BOOM Card. All rights reserved.</p>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <span className="flex items-center text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {t('footer.allSystemsOperational')}
                  </span>
                  <span className="text-gray-400">{t('footer.madeInBulgaria')} 🇧🇬</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}