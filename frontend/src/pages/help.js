import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import { useLanguage } from '../contexts/LanguageContext';

export default function HelpCenter() {
  const { t } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id, name) || 'All Topics', icon,
    { id, name) || 'Account & Login', icon,
    { id, name) || 'Billing & Payments', icon,
    { id, name) || 'Using BOOM Card', icon,
    { id, name) || 'Partners & Offers', icon,
    { id, name) || 'Technical Issues', icon
  ];

  const helpArticles = [
    {
      id,
      category,
      title) || 'How to reset your password',
      content) || 'Go to the login page and click "Forgot Password". Enter your email address and we\'ll send you a reset link.',
      popular
    },
    {
      id,
      category,
      title) || 'How to change your subscription plan',
      content) || 'Navigate to Account Settings > Billing and click "Change Plan". Select your new plan and confirm the change.',
      popular
    },
    {
      id,
      category,
      title) || 'How to use your QR code',
      content) || 'Open the BOOM Card app, tap on "My Card" to display your QR code. Show it to the merchant at checkout.',
      popular
    },
    {
      id,
      category,
      title) || 'Finding partner locations near you',
      content) || 'Use the search bar or browse by category. Enable location services for personalized recommendations.',
      popular
    },
    {
      id,
      category,
      title) || 'App not working properly',
      content) || 'Try clearing your browser cache or updating to the latest version. If issues persist, contact support.',
      popular
    },
    {
      id,
      category,
      title) || 'How to cancel your subscription',
      content) || 'Go to Account Settings > Billing and click "Cancel Subscription". Your access will continue until the end of the billing period.',
      popular
    }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (

        {t('help.title') || 'Help Center - BOOM Card'}

      {/* Navigation */}

                {t('nav.help') || 'Help'}

      {/* Hero Section */}

            {t('help.hero.subtitle') || 'Find answers to your questions'}

          {/* Search Bar */}

               setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-12 text-gray-900 rounded-lg text-lg focus
              />

      {/* Categories */}

            {categories.map(category => (
               setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover
                }`}
              >
                {category.icon}
                {category.name}
              
            ))}

      {/* Articles */}
      
         0 ? (
             (
                
                    {article.title}
                    {article.popular && (
                      
                        {t('help.popular') || 'Popular'}
                      
                    )}
                  
                  {article.content}

              ))}
            
          ) : (

                {t('help.noResults') || 'No articles found. Try a different search term.'}

          )}

      {/* Contact Support */}

            {t('help.contact.title') || 'Still need help?'}

            {t('help.contact.subtitle') || 'Our support team is here to assist you'}

              {t('help.contact.email') || 'Email'}
              support@boomcard.bg

              {t('help.contact.phone') || 'Phone'}
              +359 2 123 4567

              {t('help.contact.hours') || 'Hours'}
              Mon-Fri 9AM-6PM

  );
}