import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';



export default function FAQ() {
  const { t } = useLanguage();
  const [openItems, setOpenItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: t('faq.categories.all') || 'All Questions' },
    { id: 'general', name: t('faq.categories.general') || 'General' },
    { id: 'membership', name: t('faq.categories.membership') || 'Membership' },
    { id: 'usage', name: t('faq.categories.usage') || 'Using BOOM Card' },
    { id: 'billing', name: t('faq.categories.billing') || 'Billing' },
    { id: 'partners', name: t('faq.categories.partners') || 'Partners' }
  ];

  const faqs = [
    {
      category: 'general',
      question: t('faq.items.whatIs.q') || 'What is BOOM Card?',
      answer: t('faq.items.whatIs.a') || 'BOOM Card is Bulgaria\'s premier discount card that gives you exclusive access to discounts at hundreds of restaurants, hotels, spas, and entertainment venues. With savings of 10-50% at each partner location, your membership pays for itself quickly.'
    },
    {
      category: 'general',
      question: t('faq.items.howWorks.q') || 'How does BOOM Card work?',
      answer: t('faq.items.howWorks.a') || 'Simply show your unique QR code from the BOOM Card app at any partner location to receive your discount. The discount is applied immediately to your bill.'
    },
    {
      category: 'membership',
      question: t('faq.items.plans.q') || 'What membership plans are available?',
      answer: t('faq.items.plans.a') || 'We offer three plans: Individual (19 BGN/month), Standard (29 BGN/month with more partners), and Family (49 BGN/month for up to 5 members). All plans include unlimited use at all partner locations.'
    },
    {
      category: 'membership',
      question: t('faq.items.cancel.q') || 'Can I cancel my membership anytime?',
      answer: t('faq.items.cancel.a') || 'Yes, you can cancel your membership at any time from your account settings. Your access will continue until the end of your current billing period.'
    },
    {
      category: 'usage',
      question: t('faq.items.multipleUse.q') || 'Can I use BOOM Card multiple times at the same venue?',
      answer: t('faq.items.multipleUse.a') || 'Yes! You can use your BOOM Card unlimited times at all partner locations. There are no restrictions on how often you can enjoy discounts.'
    },
    {
      category: 'usage',
      question: t('faq.items.shareCard.q') || 'Can I share my BOOM Card with friends?',
      answer: t('faq.items.shareCard.a') || 'Individual and Standard plans are for personal use only. If you want to share benefits with family members, consider our Family Plan which allows up to 5 members.'
    },
    {
      category: 'billing',
      question: t('faq.items.paymentMethods.q') || 'What payment methods do you accept?',
      answer: t('faq.items.paymentMethods.a') || 'We accept all major credit and debit cards (Visa, Mastercard, American Express). All payments are processed securely through Stripe.'
    },
    {
      category: 'billing',
      question: t('faq.items.changePlan.q') || 'Can I change my subscription plan?',
      answer: t('faq.items.changePlan.a') || 'Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes take effect at the start of your next billing cycle.'
    },
    {
      category: 'partners',
      question: t('faq.items.findPartners.q') || 'How do I find partner locations?',
      answer: t('faq.items.findPartners.a') || 'Use the search feature in the app or website to find partners by location, category, or name. You can also enable location services for personalized recommendations nearby.'
    },
    {
      category: 'partners',
      question: t('faq.items.becomePartner.q') || 'How can my business become a BOOM Card partner?',
      answer: t('faq.items.becomePartner.a') || 'We\'re always looking for quality partners! Contact us at partners@boomcard.bg or visit our Partner Portal to learn more about the benefits and application process.'
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
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('faq.hero.title') || 'Frequently Asked Questions'}
          </h1>
          <p className="text-xl opacity-90">
            {t('faq.hero.subtitle') || 'Everything you need to know about BOOM Card'}
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-gray-50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openItems.includes(index);
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('faq.cta.title') || 'Still have questions?'}
          </h2>
          <p className="text-xl opacity-90 mb-8">
            {t('faq.cta.subtitle') || 'We\'re here to help'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {t('faq.cta.contact') || 'Contact Support'}
            </a>
            <a
              href="/help"
              className="inline-block bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              {t('faq.cta.help') || 'Visit Help Center'}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}