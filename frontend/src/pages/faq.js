import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export default function FAQ() {
  const { t } = useLanguage();
  const [openItems, setOpenItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'id', name: t('name') || 'All Questions' },
    { id: 'id', name: t('name') || 'General' },
    { id: 'id', name: t('name') || 'Membership' },
    { id: 'id', name: t('name') || 'Using BOOM Card' },
    { id: 'id', name: t('name') || 'Billing' },
    { id: 'id', name: t('name') || 'Partners' }
  ];

  const faqs = [
    {
      category: 'general',
      question: t('faq.general.what_is_boom') || 'What is BOOM Card?',
      answer: t('faq.general.what_is_boom_answer') || 'BOOM Card is Bulgaria's premier discount card that gives you exclusive access to discounts at hundreds of restaurants, hotels, spas, and entertainment venues. With savings of 10-50% at each partner location, your membership pays for itself quickly.'
    },
    {
      category: 'general',
      question: t('faq.general.how_works') || 'How does BOOM Card work?',
      answer: t('faq.general.how_works_answer') || 'Simply present your BOOM Card at participating venues to receive your discount. You can use the physical card or show your digital card in our mobile app.'
    },
    {
      category: 'membership',
      question: t('faq.membership.cost') || 'How much does membership cost?',
      answer: t('faq.membership.cost_answer') || 'We offer several membership tiers: Basic (Free), Premium ($9.99/month), and VIP ($29.99/month). Each tier offers different benefits and discount levels.'
    },
    {
      category: 'membership',
      question: t('faq.membership.cancel') || 'Can I cancel my membership?',
      answer: t('faq.membership.cancel_answer') || 'Yes, you can cancel your membership at any time from your account settings. There are no cancellation fees.'
    },
    {
      category: 'partners',
      question: t('faq.partners.how_many') || 'How many partners does BOOM Card have?',
      answer: t('faq.partners.how_many_answer') || 'We have over 500 partners across Bulgaria, including restaurants, hotels, spas, gyms, and entertainment venues. Our network is constantly growing.'
    },
    {
      category: 'technical',
      question: t('faq.technical.app') || 'Is there a mobile app?',
      answer: t('faq.technical.app_answer') || 'Yes! The BOOM Card app is available for both iOS and Android. You can view partners, check your savings, and use your digital card directly from the app.'
    }
  ];

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleItem = (index) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    
      {/* Hero Section */}

            {t('faq.hero.subtitle') || 'Everything you need to know about BOOM Card'}

      {/* Categories */}

            {categories.map(category => (
               setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover
                }`}
              >
                {category.name}
              
            ))}

      {/* FAQ Items */}

            {filteredFaqs.map((faq, index) => {
              const isOpen = openItems.includes(index);
              return (
                
                   toggleItem(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover
                  >
                    {faq.question}

                  {isOpen && (
                    
                      {faq.answer}
                    
                  )}
                
              );
            })}

      {/* Still Have Questions */}

            {t('faq.cta.title') || 'Still have questions?'}

            {t('faq.cta.subtitle') || 'We\'re here to help'}

              {t('faq.cta.contact') || 'Contact Support'}

              {t('faq.cta.help') || 'Visit Help Center'}

  );
}