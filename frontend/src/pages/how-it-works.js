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
      number: 1,
      title: t('howItWorks.step1.title') || 'Sign Up',
      description: t('howItWorks.step1.desc') || 'Create your account and select from our Essential, Premium, or VIP membership plans.',
      icon: '📝'
    },
    {
      number: 2,
      title: t('howItWorks.step2.title') || 'Receive Your Card',
      description: t('howItWorks.step2.desc') || 'Get your digital card instantly or receive your physical card within 3-5 business days.',
      icon: '💳'
    },
    {
      number: 3,
      title: t('howItWorks.step3.title') || 'Start Saving',
      description: t('howItWorks.step3.desc') || 'Show your card at any partner location to receive exclusive discounts.',
      icon: '🎉'
    }
  ];

  return (
    <div>
      <Head>
        <title>{t('howItWorks.title') || 'How It Works - BOOM Card'}</title>
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1>{t('nav.howItWorks') || 'How It Works'}</h1>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-lg text-center">{t('howItWorks.hero.subtitle') || 'Start saving at Bulgaria\'s finest establishments in just 4 simple steps'}</p>
        </div>
      </section>

      {/* Steps Section */}
      
         (
              
                {/* Connection Line */}
                {index 
                    {step.icon}

                    {step.number}

                    {step.title}

                    {step.description}

            ))}

      {/* Benefits Section */}

                💰

                {t('howItWorks.benefits.savings.title') || 'Instant Savings'}

                {t('howItWorks.benefits.savings.description') || 'Save up to 40% at over 375 premium venues'}

                📱

                {t('howItWorks.benefits.digital.title') || 'Fully Digital'}

                {t('howItWorks.benefits.digital.description') || 'No physical card needed - everything in your app'}

                ⚡

                {t('howItWorks.benefits.instant.title') || 'Instant Access'}

                {t('howItWorks.benefits.instant.description') || 'Start saving immediately after signup'}

      {/* CTA Section */}
      <section className="py-12 bg-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-8">{t('howItWorks.cta.subtitle') || 'Join thousands of members enjoying exclusive discounts'}</p>
          <button
            onClick={() => router.push('/subscriptions')}
            className="bg-white text-orange-600 px-8 py-3 rounded-lg hover:bg-gray-100"
          >
            {t('howItWorks.cta.button') || 'Get Started Now'}
          </button>
        </div>
      </section>
    </div>
  );
}