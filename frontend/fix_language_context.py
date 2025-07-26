#!/usr/bin/env python3
import os

# Fix the LanguageContext to handle missing translations properly
language_context_content = '''import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Meta
    'meta.title': 'Boom Card - Unlock Bulgaria\\'s Premium Experiences',
    'meta.description': 'Premium discount card for restaurants, hotels, and entertainment in Bulgaria',
    
    // Navigation
    'nav.home': 'Home',
    'nav.partners': 'Partners',
    'nav.plans': 'Plans',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.account': 'Account',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Auth
    'auth.login': 'Login',
    
    // Hero section
    'hero.badge': '🎯 Premium Membership Platform',
    'hero.title1': 'Unlock Bulgaria\\'s',
    'hero.title2': 'Premium Experiences',
    'hero.subtitle': 'Access exclusive discounts at 375+ premium venues across Bulgaria',
    'hero.cta.start': 'Start Saving Today',
    'hero.cta.demo': 'Watch Demo',
    'hero.trust.verified': 'Verified Partners',
    'hero.trust.instant': 'Instant Access',
    'hero.trust.noFees': 'No Hidden Fees',
    
    // Stats
    'stats.subtitle': 'Trusted by thousands of members across Bulgaria',
    'stats.users': 'Active Users',
    'stats.partners': 'Partner Venues',
    'stats.savings': 'Average Savings',
    'stats.rating': 'User Rating',
    
    // Categories
    'categories.badge': '🎯 Premium Categories',
    'categories.title': 'Explore Premium Categories',
    'categories.subtitle': 'Discover exclusive discounts across Bulgaria\\'s finest establishments',
    'categories.fineDining': 'Fine Dining',
    'categories.luxuryHotels': 'Luxury Hotels',
    'categories.wellness': 'Wellness & Spa',
    'categories.entertainment': 'Entertainment',
    'categories.restaurantPartners': '150+ Partners',
    'categories.hotelPartners': '75+ Partners',
    'categories.spaPartners': '100+ Partners',
    'categories.entertainmentPartners': '50+ Partners',
    'categories.upTo': 'Up to',
    'categories.explore': 'Explore',
    
    // Features
    'features.badge': '⚡ Platform Features',
    'features.title1': 'Why Choose',
    'features.title2': 'BOOM Card?',
    'features.subtitle': 'Experience the future of premium discounts with our cutting-edge platform',
    'features.instantAccess': 'Instant Access',
    'features.instantAccessDesc': 'Immediate access to all partner discounts',
    'features.mobileFirst': 'Mobile First',
    'features.mobileFirstDesc': 'Optimized for mobile experience',
    'features.secure': 'Secure & Private',
    'features.secureDesc': 'Your data is protected and secure',
    'features.exclusive': 'Exclusive Deals',
    'features.exclusiveDesc': 'Access to member-only discounts',
    'features.learnMore': 'Learn More',
    
    // Testimonials
    'testimonials.badge': '💬 Member Reviews',
    'testimonials.title': 'What Our Members Say',
    'testimonials.subtitle': 'Join thousands of satisfied members saving money every day',
    'testimonials.customer1.name': 'Maria Popova',
    'testimonials.customer1.role': 'Sofia Resident',
    'testimonials.customer1.content': 'Amazing discounts at my favorite restaurants!',
    'testimonials.customer2.name': 'Ivan Petrov',
    'testimonials.customer2.role': 'Business Owner',
    'testimonials.customer2.content': 'Great value and excellent service.',
    'testimonials.customer3.name': 'Elena Nikolova',
    'testimonials.customer3.role': 'Marketing Manager',
    'testimonials.customer3.content': 'I save money every month with BOOM Card.',
    'testimonials.leaveReview': 'Leave a Review',
    
    // CTA section
    'cta.title1': 'Ready to Start',
    'cta.title2': 'Saving?',
    'cta.subtitle': 'Join BOOM Card today and unlock exclusive discounts at Bulgaria\\'s finest establishments',
    'cta.choosePlan': 'Choose Your Plan',
    'cta.downloadApp': 'Download App',
    'cta.memberSavings': 'Member Savings',
    'cta.premiumPartners': 'Premium Partners',
    'cta.activeMembers': 'Active Members',
    'cta.memberRating': 'Member Rating',
    
    // Footer
    'footer.description': 'Bulgaria\\'s premium discount platform connecting members with exclusive offers at finest venues.',
    'footer.premiumCategories': 'Fine Dining • Luxury Hotels • Wellness & Spa • Entertainment',
    'footer.company': 'Company',
    'footer.getTheApp': 'Get the App',
    'footer.appStore': 'App Store',
    'footer.googlePlay': 'Google Play',
    'footer.securePrivate': 'Secure & Private',
    'footer.instantAccess': 'Instant Access',
    'footer.allSystemsOperational': 'All Systems Operational',
    'footer.madeInBulgaria': 'Made in Bulgaria',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.off': 'off',
  },
  bg: {
    // Navigation
    'nav.home': 'Начало',
    'nav.partners': 'Партньори',
    'nav.plans': 'Планове',
    'nav.dashboard': 'Табло',
    'nav.profile': 'Профил',
    'nav.account': 'Акаунт',
    'nav.login': 'Вход',
    'nav.logout': 'Изход',
    
    // Add more Bulgarian translations as needed
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    // Get the translation directly using the flat key
    const currentTranslations = translations[language] || translations.en;
    const translation = currentTranslations[key];
    
    if (!translation) {
      // Return the default English translation if available
      const defaultTranslation = translations.en[key];
      if (defaultTranslation) {
        return defaultTranslation;
      }
      // Only warn in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Translation missing for key: ${key}`);
      }
      return key;
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
'''

with open('src/contexts/LanguageContext.js', 'w') as f:
    f.write(language_context_content)

print("✅ Fixed LanguageContext.js")
print("The context now properly handles missing translations and falls back to English")