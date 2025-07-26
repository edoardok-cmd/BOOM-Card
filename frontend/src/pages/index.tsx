import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import CategoryCard from '../components/CategoryCard';
import PartnerCard from '../components/PartnerCard';
import { motion } from 'framer-motion';

const categories = [
  {
    id: 'fine-dining',
    title: { en: 'Fine Dining', bg: 'Изискана кухня' },
    icon: '🍽️',
    count: 120,
    color: 'from-orange-400 to-red-500'
  },
  {
    id: 'hotels',
    title: { en: 'Luxury Hotels', bg: 'Луксозни хотели' },
    icon: '🏨',
    count: 85,
    color: 'from-blue-400 to-indigo-500'
  },
  {
    id: 'spa',
    title: { en: 'Spa & Wellness', bg: 'СПА и уелнес' },
    icon: '💆',
    count: 95,
    color: 'from-purple-400 to-pink-500'
  },
  {
    id: 'entertainment',
    title: { en: 'Entertainment', bg: 'Развлечения' },
    icon: '🎭',
    count: 75,
    color: 'from-green-400 to-teal-500'
  }
];

const featuredPartners = [
  {
    id: 1,
    name: 'The Sofia Grand',
    category: 'Fine Dining',
    discount: 30,
    rating: 4.8,
    image: '/images/partners/sofia-grand.jpg',
    location: 'Sofia Center'
  },
  {
    id: 2,
    name: 'Emerald Resort & Spa',
    category: 'Luxury Hotels',
    discount: 40,
    rating: 4.9,
    image: '/images/partners/emerald-resort.jpg',
    location: 'Borovets'
  },
  {
    id: 3,
    name: 'Marina Bay Restaurant',
    category: 'Seafood',
    discount: 35,
    rating: 4.7,
    image: '/images/partners/marina-bay.jpg',
    location: 'Varna'
  }
];

export default function Home() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <>
      <Head>
        <title>{t('meta.home.title')}</title>
        <meta name="description" content={t('meta.home.description')} />
        <meta property="og:title" content={t('meta.home.title')} />
        <meta property="og:description" content={t('meta.home.description')} />
      </Head>

      <div className="min-h-screen">
        <Navigation />

        {/* Hero Section with Video Background */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              onLoadedData={() => setIsVideoLoaded(true)}
            >
              <source src="/videos/dvoretsa.mp4" type="video/mp4" />
            </video>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-medium mb-6">
                {t('hero.badge')}
              </span>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="block">{t('hero.title1')}</span>
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {t('hero.title2')}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    {t('hero.cta.start')}
                  </motion.a>
                </Link>
                <Link href="/demo">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    {t('hero.cta.demo')}
                  </motion.a>
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>{t('hero.trust.verified')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>{t('hero.trust.instant')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>{t('hero.trust.noFees')}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{t('stats.title')}</h2>
              <p className="text-xl text-gray-600">{t('stats.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-blue-600">375+</div>
                <div className="text-gray-600 mt-2">{t('stats.activePartners')}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-green-600">€2.5M+</div>
                <div className="text-gray-600 mt-2">{t('stats.totalSavings')}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-purple-600">25K+</div>
                <div className="text-gray-600 mt-2">{t('stats.happyMembers')}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-orange-600">7</div>
                <div className="text-gray-600 mt-2">{t('stats.cities')}</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{t('categories.title')}</h2>
              <p className="text-xl text-gray-600">{t('categories.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Partners */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{t('featured.title')}</h2>
              <p className="text-xl text-gray-600">{t('featured.subtitle')}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPartners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PartnerCard partner={partner} />
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/partners">
                <a className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  {t('featured.viewAll')}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">{t('cta.title')}</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <Link href="/register">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {t('cta.button')}
              </motion.a>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}