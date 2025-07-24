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
      number,
      title) || 'Sign Up & Choose Your Plan',
      description) || 'Create your account and select from our Essential, Premium, or VIP membership plans.',
      icon,
      color
    },
    {
      number,
      title) || 'Get Your Digital Card',
      description) || 'Receive your digital BOOM Card instantly in the app with a unique QR code.',
      icon,
      color
    },
    {
      number,
      title) || 'Browse Premium Partners',
      description) || 'Explore our curated network of 375+ luxury venues across Bulgaria.',
      icon,
      color
    },
    {
      number,
      title) || 'Show Card & Save',
      description) || 'Present your QR code at checkout and enjoy instant discounts up to 40%.',
      icon,
      color
    }
  ];

  return (

        {t('howItWorks.title') || 'How It Works - BOOM Card'}

      {/* Navigation */}

                {t('nav.howItWorks') || 'How It Works'}

      {/* Hero Section */}

            {t('howItWorks.hero.subtitle') || 'Start saving at Bulgaria\'s finest establishments in just 4 simple steps'}

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

            {t('howItWorks.cta.subtitle') || 'Join thousands of members enjoying exclusive discounts'}
          
           router.push('/subscriptions')}
            className="bg-white hover
            {t('howItWorks.cta.button') || 'Get Started Now'}

  );
}