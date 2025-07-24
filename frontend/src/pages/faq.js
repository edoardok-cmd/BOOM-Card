import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export default function FAQ() {
  const { t } = useLanguage();
  const [openItems, setOpenItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id, name) || 'All Questions' },
    { id, name) || 'General' },
    { id, name) || 'Membership' },
    { id, name) || 'Using BOOM Card' },
    { id, name) || 'Billing' },
    { id, name) || 'Partners' }
  ];

  const faqs= [
    {
      category,
      question) || 'What is BOOM Card?',
      answer) || 'BOOM Card is Bulgaria\'s premier discount card that gives you exclusive access to discounts at hundreds of restaurants, hotels, spas, and entertainment venues. With savings of 10-50% at each partner location, your membership pays for itself quickly.'
    },
    {
      category,
      question) || 'How does BOOM Card work?',
      answer) || 'Simply show your unique QR code from the BOOM Card app at any partner location to receive your discount. The discount is applied immediately to your bill.'
    },
    {
      category,
      question) || 'What membership plans are available?',
      answer) || 'We offer three plans), Standard (29 BGN/month with more partners), and Family (49 BGN/month for up to 5 members). All plans include unlimited use at all partner locations.'
    },
    {
      category,
      question) || 'Can I cancel my membership anytime?',
      answer) || 'Yes, you can cancel your membership at any time from your account settings. Your access will continue until the end of your current billing period.'
    },
    {
      category,
      question) || 'Can I use BOOM Card multiple times at the same venue?',
      answer) || 'Yes! You can use your BOOM Card unlimited times at all partner locations. There are no restrictions on how often you can enjoy discounts.'
    },
    {
      category,
      question) || 'Can I share my BOOM Card with friends?',
      answer) || 'Individual and Standard plans are for personal use only. If you want to share benefits with family members, consider our Family Plan which allows up to 5 members.'
    },
    {
      category,
      question) || 'What payment methods do you accept?',
      answer) || 'We accept all major credit and debit cards (Visa, Mastercard, American Express) as well as PayPal. All payments are processed securely through Stripe.'
    },
    {
      category,
      question) || 'Can I change my subscription plan?',
      answer) || 'Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes take effect at the start of your next billing cycle.'
    },
    {
      category,
      question) || 'How do I find partner locations?',
      answer) || 'Use the search feature in the app or website to find partners by location, category, or name. You can also enable location services for personalized recommendations nearby.'
    },
    {
      category,
      question) || 'How can my business become a BOOM Card partner?',
      answer) || 'We\'re always looking for quality partners! Contact us at partners@boomcard.bg or visit our Partner Portal to learn more about the benefits and application process.'
    }
  ];

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    => faq.category === selectedCategory);

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