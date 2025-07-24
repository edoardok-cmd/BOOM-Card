import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import VideoBackground from '../components/VideoBackground';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import { navigationHandlers, buttonHandlers } from '../utils/navigation';

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();
  
  const stats = [
    { number, label), icon,
    { number, label), icon,
    { number, label), icon,
    { number, label), icon
  ];

  const categories = [
    { 
      id,
      icon, 
      name), 
      partners), 
      discount)} 30% ${t('common.off')}`,
      color,
      bgColor
    },
    { 
      id,
      icon, 
      name), 
      partners), 
      discount)} 40% ${t('common.off')}`,
      color,
      bgColor
    },
    { 
      id,
      icon, 
      name), 
      partners), 
      discount)} 35% ${t('common.off')}`,
      color,
      bgColor
    },
    { 
      id,
      icon, 
      name), 
      partners), 
      discount)} 25% ${t('common.off')}`,
      color,
      bgColor
    }
  ];

  const features = [
    {
      icon,
      title),
      description)
    },
    {
      icon,
      title),
      description)
    },
    {
      icon,
      title),
      description)
    },
    {
      icon,
      title),
      description)
    }
  ];

  const testimonials = [
    {
      name,
      role,
      content,
      avatar
    },
    {
      name,
      role,
      content,
      avatar
    },
    {
      name,
      role,
      content,
      avatar
    }
  ];

  return (

        Boom Card - Unlock Bulgaria's Premium Experiences

      {/* Navigation */}

                    B
                  
                  BOOM Card

                {t('nav.home')}

                   navigationHandlers.startMembership(router)}
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover
                    {t('nav.getStarted')}

      {/* Hero Section */}
      
        {/* Video Background */}

        {/* Partner page gradient overlay */}

        {/* Decorative elements */}

                {t('hero.badge')}

                {t('hero.title1')}

                {t('hero.title2')}

             navigationHandlers.startMembership(router)}
                className="group bg-gradient-to-r from-gold-500 to-gold-600 hover
                
                  {t('hero.cta.start')}

               navigationHandlers.showDemo()}
                className="group border-2 border-white/30 hover

                  {t('hero.cta.demo')}

            {/* Trust indicators */}

                {t('hero.trust.verified')}

                {t('hero.trust.instant')}

                {t('hero.trust.noFees')}

      {/* Stats Section */}

              {t('stats.subtitle')}

           (
              
                {stat.icon}

                {stat.label}
              
            ))}

      {/* Categories Section */}

              {t('categories.badge')}

              {t('categories.subtitle')}

           (
              
                  {category.icon}

                    {category.name}
                    {category.partners}

                        {category.discount}
                      
                       navigationHandlers.goToPartnerCategory(router, category.id)}
                        className="bg-white/80 hover
                        {t('categories.explore')} →

            ))}

      {/* Features Section */}
      
        {/* Decorative background */}

              {t('features.badge')}

              {t('features.title2')}

              {t('features.subtitle')}

           (
              
                  {feature.icon}

                    {feature.description}
                     navigationHandlers.showComingSoon()}
                      className="mt-4 flex items-center text-blue-600 font-semibold text-sm group-hover
                      {t('features.learnMore')} 

            ))}

      {/* Testimonials Section */}

              {t('testimonials.badge')}

              {t('testimonials.subtitle')}

           (

                    {testimonial.avatar}

                    {testimonial.name}
                    {testimonial.role}

                  "{testimonial.content}"

                  {[1,2,3,4,5].map((star) => (

                  ))}

            ))}

      {/* CTA Section */}
      
        {/* Background */}

        {/* Decorative elements */}

              💳

              {t('cta.title1')}

              {t('cta.title2')}

           navigationHandlers.startMembership(router)}
              className="group bg-gradient-to-r from-gold-500 to-gold-600 hover
              
                {t('cta.choosePlan')}

             navigationHandlers.showComingSoon()}
              className="group border-2 border-white/30 hover

                {t('cta.downloadApp')}

          {/* Success metrics */}
          
              €2.5M+
              {t('cta.memberSavings')}

              375+
              {t('cta.premiumPartners')}

              25K+
              {t('cta.activeMembers')}

              4.9★
              {t('cta.memberRating')}

      {/* Footer */}

                  B
                
                BOOM Card

                {t('footer.description')}

                 navigationHandlers.openSocialMedia('facebook')}
                  className="w-10 h-10 bg-gray-800 hover
                  📘
                
                 navigationHandlers.openSocialMedia('instagram')}
                  className="w-10 h-10 bg-gray-800 hover
                  📷
                
                 navigationHandlers.openSocialMedia('twitter')}
                  className="w-10 h-10 bg-gray-800 hover
                  🐦

              {t('footer.premiumCategories')}

              {t('footer.company')}
              
                 { e.preventDefault(); navigationHandlers.showComingSoon(); }} className="text-gray-400 hover)}

                 { e.preventDefault(); navigationHandlers.showComingSoon(); }} className="text-gray-400 hover)}
                 { e.preventDefault(); navigationHandlers.showComingSoon(); }} className="text-gray-400 hover)}

              {t('footer.getTheApp')}
              
                 navigationHandlers.downloadApp('ios')}
                  className="bg-gradient-to-r from-gray-800 to-gray-700 hover
                  
                    📱

                      {t('footer.appStore')}

                 navigationHandlers.downloadApp('android')}
                  className="bg-gradient-to-r from-gray-800 to-gray-700 hover
                  
                    🤖

                      {t('footer.googlePlay')}

                🔒 {t('footer.securePrivate')}
                ⚡ {t('footer.instantAccess')}

             { e.preventDefault(); navigationHandlers.showComingSoon(); }} className="hover)} | 
                 { e.preventDefault(); navigationHandlers.showComingSoon(); }} className="hover)}

                  {t('footer.allSystemsOperational')}
                
                🇧🇬 {t('footer.madeInBulgaria')}

  );
}