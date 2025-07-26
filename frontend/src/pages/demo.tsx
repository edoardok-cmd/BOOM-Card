import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import { useLanguage } from '../contexts/LanguageContext';

export default function Demo() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  const demoSteps = [
    {
      title: t('demo.step1.title'),
      description: t('demo.step1.description'),
      image: '🏪',
      color: 'from-blue-400 to-blue-500'
    },
    {
      title: t('demo.step2.title'),
      description: t('demo.step2.description'),
      image: '📱',
      color: 'from-purple-400 to-purple-500'
    },
    {
      title: t('demo.step3.title'),
      description: t('demo.step3.description'),
      image: '💰',
      color: 'from-green-400 to-green-500'
    },
    {
      title: t('demo.step4.title'),
      description: t('demo.step4.description'),
      image: '🎉',
      color: 'from-gold-400 to-gold-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>{t('demo.title')}</title>
        <meta name="description" content={t('demo.description')} />
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
                <a href="/dashboard" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('nav.dashboard')}</a>
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
      <div className="relative overflow-hidden py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            {t('demo.hero.title')}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t('demo.hero.subtitle')}
          </p>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              {t('demo.interactive.badge')}
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('demo.interactive.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('demo.interactive.subtitle')}
            </p>
          </div>

          {/* Demo Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Interactive Demo */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {demoSteps[activeStep].title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {t('demo.interactive.step')} {activeStep + 1} / {demoSteps.length}
                  </span>
                </div>
                
                {/* Demo Screen */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-6 min-h-[300px] flex items-center justify-center">
                  <div className={`w-32 h-32 bg-gradient-to-r ${demoSteps[activeStep].color} rounded-3xl flex items-center justify-center shadow-lg`}>
                    <span className="text-6xl">{demoSteps[activeStep].image}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  {demoSteps[activeStep].description}
                </p>
                
                {/* Step Navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeStep === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                    disabled={activeStep === 0}
                  >
                    {t('demo.interactive.previous')}
                  </button>
                  
                  <div className="flex space-x-2">
                    {demoSteps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveStep(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === activeStep
                            ? 'bg-blue-600 w-8'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setActiveStep(Math.min(demoSteps.length - 1, activeStep + 1))}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeStep === demoSteps.length - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={activeStep === demoSteps.length - 1}
                  >
                    {t('demo.interactive.next')}
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - Features */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t('demo.features.title')}
              </h3>
              
              <div className="bg-blue-50 rounded-2xl p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('demo.features.instant.title')}</h4>
                    <p className="text-gray-600">{t('demo.features.instant.description')}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-2xl p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white text-xl">🔒</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('demo.features.secure.title')}</h4>
                    <p className="text-gray-600">{t('demo.features.secure.description')}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-2xl p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-white text-xl">📍</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('demo.features.everywhere.title')}</h4>
                    <p className="text-gray-600">{t('demo.features.everywhere.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Demo Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('demo.video.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('demo.video.subtitle')}
            </p>
          </div>
          
          {/* Video Placeholder */}
          <div className="bg-gray-900 rounded-3xl shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </div>
              <p className="text-white text-lg">{t('demo.video.placeholder')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('demo.cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('demo.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/subscriptions')}
              className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-4 px-8 rounded-xl text-lg transition-colors">
              {t('demo.cta.getStarted')}
            </button>
            <button 
              onClick={() => router.push('/partners')}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-xl text-lg transition-colors">
              {t('demo.cta.explorePartners')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}