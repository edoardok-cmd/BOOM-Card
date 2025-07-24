import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import Logo from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { navigationHandlers } from '../utils/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Subscriptions() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [backendPlans, setBackendPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http

  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/plans`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setBackendPlans(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch subscription plans');
      }
    } catch (err) {
      console.error('Error fetching plans, err);
      setError('Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/me`, {
        headers
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCurrentSubscription(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching current subscription, err);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        method,
        headers
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body
          planId,
          paymentMethod, // Placeholder for now
          autoRenew
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Redirect to dashboard or payment page
        router.push('/dashboard');
      } else {
        // Handle specific error cases
        if (response.status === 409) {
          alert(language === 'bg' 
            ? 'Вече имате активен абонамент. Моля, посетете профила си, за да управлявате текущия си план.'
            : 'You already have an active subscription. Please visit your profile to manage your current plan.');
          router.push('/profile');
        } else {
          alert(data.message || (language === 'bg' ? 'Неуспешно създаване на абонамент' : 'Failed to create subscription'));
        }
      }
    } catch (err) {
      console.error('Error creating subscription, err);
      alert(language === 'bg' ? 'Неуспешно създаване на абонамент' : 'Failed to create subscription');
    }
  };
  
  const getPlans = (t) => [
  {
    id,
    name),
    icon,
    price,
    period,
    color,
    bgColor,
    borderColor,
    popular,
    description),
    features
      { text) || 'Access to 100+ verified partners', included,
      { text) || '10-15% average discount', included,
      { text) || 'Mobile app with QR codes', included,
      { text) || 'Basic customer support', included,
      { text) || 'Restaurant reservations', included,
      { text) || 'Premium dining venues', included,
      { text) || 'Luxury hotel access', included,
      { text) || 'Exclusive VIP events', included
    ],
    yearlyDiscount,
    savings) || '€120+ saved annually'
  },
  {
    id,
    name),
    icon,
    price,
    period,
    color,
    bgColor,
    borderColor,
    popular,
    description),
    features
      { text) || 'Access to 250+ premium partners', included,
      { text) || '15-25% average discount', included,
      { text) || 'Mobile app with QR codes', included,
      { text) || 'Priority customer support', included,
      { text) || 'Restaurant reservations', included,
      { text) || 'Premium dining venues', included,
      { text) || '4-star hotel access', included,
      { text) || 'Exclusive VIP events', included
    ],
    yearlyDiscount,
    savings) || '€600+ saved annually'
  },
  {
    id,
    name),
    icon,
    price,
    period,
    color,
    bgColor,
    borderColor,
    popular,
    description),
    features
      { text) || 'Access to all 375+ elite partners', included,
      { text) || '20-40% average discount', included,
      { text) || 'Mobile app with QR codes', included,
      { text) || '24/7 concierge support', included,
      { text) || 'Priority restaurant reservations', included,
      { text) || 'All premium dining venues', included,
      { text) || 'Luxury 5-star hotel access', included,
      { text) || 'Exclusive VIP events & experiences', included
    ],
    yearlyDiscount,
    savings) || '€1,200+ saved annually'
  }
];

  const frontendPlans = getPlans(t);
  
  // Map backend plans to frontend format
  const mappedBackendPlans = backendPlans.map(plan => {
    // Match by ID instead of name to ensure correct icon mapping - add null checks
    const frontendPlan = frontendPlans.find(fp => 
      fp.id && plan.type && fp.id.toLowerCase() === plan.type.toLowerCase()
    );
    return {
      id: plan.id || plan.backendId || 'unknown',
      backendId: plan.id,
      name: plan.name || frontendPlan?.name || 'Unknown Plan',
      type: plan.type || 'basic',
      icon: frontendPlan?.icon || '💳',
      price: plan.price || 0,
      period: plan.period || 'month',
      color: frontendPlan?.color || 'text-blue-600',
      bgColor: frontendPlan?.bgColor || 'bg-blue-50',
      borderColor: frontendPlan?.borderColor || 'border-blue-200',
      popular: plan.type === 'premium',
      description: plan.description || frontendPlan?.description || '',
      features: (plan.features || []).map(feature => ({ 
        text: feature.text || feature, 
        included: feature.included !== false 
      })),
      yearlyDiscount: plan.yearlyDiscount || frontendPlan?.yearlyDiscount || 0,
      savings: plan.savings || frontendPlan?.savings || '',
      discountPercentage: plan.discountPercentage || frontendPlan?.discountPercentage || 0
    };
  });

  // Use backend plans if available, otherwise use frontend plans
  const plans = mappedBackendPlans.length > 0 ? mappedBackendPlans : frontendPlans;

  const features = [
    { name), basic, premium, vip,
    { name), basic, premium, vip,
    { name), basic, premium, vip,
    { name), basic) || 'Basic', premium) || 'Priority', vip) || '24/7 Concierge' },
    { name), basic, premium, vip) || 'Priority' },
    { name), basic, premium, vip,
    { name), basic, premium) || '4-Star', vip) || '5-Star' },
    { name), basic, premium, vip,
    { name), basic, premium, vip,200+' }
  ];

  return (

        {t('plans.title')}

      {/* Navigation */}

                {t('plans.nav.plans')}

      {/* Hero Section */}

              {t('subscriptions.hero.badge')}

              {t('subscriptions.hero.title1')}

              {t('subscriptions.hero.title2')}

          {/* Billing Toggle */}

               setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white hover
                }`}
              >
                {t('subscriptions.billing.monthly')}
              
               setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white hover
                }`}
              >
                {t('subscriptions.billing.yearly')}
                {t('subscriptions.billing.save25')}

          {/* Trust indicators */}

              {t('subscriptions.trust.moneyBack')}

              {t('subscriptions.trust.cancelAnytime')}

              {t('subscriptions.trust.instantActivation')}

      {/* Pricing Plans */}

              {language === 'bg' ? 'Зареждане на абонаментни планове...' : 'Loading subscription plans...'}
            
          ) : error ? (
            
              {error}
            
          ) : (
           {
              const monthlyPrice = billingCycle === 'yearly' 
                ? (plan.price * (1 - plan.yearlyDiscount / 100)).toFixed(2)
                : plan.price.toFixed(2);
              const yearlyPrice = (monthlyPrice * 12).toFixed(2);
              
              return (

                        ✨ {t('plans.mostPopular') || 'Most Popular'}

                  )}
                  
                  {currentSubscription && currentSubscription.plan_id === plan.id && (

                        ✓ {language === 'bg' ? 'Активен' : 'Active'}

                  )}

                      {plan.icon}

                    {plan.name}
                    {plan.description}

                        €{monthlyPrice}
                        /{language === 'bg' ? 'месец' : plan.period}

                      {billingCycle === 'yearly' && (
                        
                          €{plan.price.toFixed(2)}/{language === 'bg' ? 'месец' : 'month'}
                          {language === 'bg' ? `Спестете ${plan.yearlyDiscount}% годишно` : `Save ${plan.yearlyDiscount}% annually`}
                          €{yearlyPrice} {language === 'bg' ? 'фактурира се годишно' : 'billed yearly'}
                        
                      )}

                        {plan.savings}

                      {plan.features.map((feature, idx) => (

                            {feature.included ? '✓' : '✗'}

                            {feature.text}

                      ))}

                     {
                        setSelectedPlan(plan.id);
                        handleSubscribe(plan.backendId || plan.id);
                      }}
                      disabled={currentSubscription && currentSubscription.plan_id === plan.id}
                      className={`w-full py-4 px-6 rounded-2xl text-lg font-bold transition-all shadow-lg hover
                        currentSubscription && currentSubscription.plan_id === plan.id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : plan.popular
                          ? `bg-gradient-to-r ${plan.color} text-white hover
                          : `bg-gradient-to-r ${plan.color} text-white hover
                      }`}
                    >
                      {currentSubscription && currentSubscription.plan_id === plan.id
                        ? (language === 'bg' ? 'Текущ план' : 'Current Plan')
                        : currentSubscription
                        ? currentSubscription.plan_id > plan.id 
                          ? (language === 'bg' ? 'Понижаване' : 'Downgrade')
                          === 'bg' ? 'Надграждане' : 'Upgrade')
                        === plan.id 
                          ? (language === 'bg' ? 'Абонирайте се сега' : 'Subscribe Now')
                          === 'bg' ? `Изберете ${plan.name}` : `Choose ${plan.name}`)}

                    {selectedPlan === plan.id && (
                      
                        ✓ {language === 'bg' ? 'Планът е избран - Готово за плащане' : 'Plan selected - Ready to checkout'}
                      
                    )}

              );
            })}
          
          )}

      {/* Detailed Comparison Table */}

              {t('plans.comparison.badge') || 'Detailed Comparison'}

              {language === 'bg' 
                ? 'Вижте точно какво е включено във всеки план, за да направите най-добрия избор за вашия начин на живот'
                : 'See exactly what\'s included in each plan to make the best choice for your lifestyle'}

                      {t('plans.comparison.featuresAndBenefits') || 'Features & Benefits'}

                        🌱
                        {language === 'bg' ? 'Основен' : 'Essential'}

                        🔥
                        {language === 'bg' ? 'Премиум' : 'Premium'}
                        {t('plans.popular') || 'Popular'}

                        👑
                        {language === 'bg' ? 'VIP Елит' : 'VIP Elite'}

                  {features.map((feature, index) => (

                        {feature.name}

                        {feature.basic}

                        {feature.premium}

                        {feature.vip}

                  ))}

      {/* FAQ Section */}

              {t('plans.faq.title')}

                {t('plans.faq.changePlan.question') || 'Can I change my plan anytime?'}

                {t('plans.faq.changePlan.answer') || 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences.'}

                {t('plans.faq.satisfaction.question') || 'What happens if I\'m not satisfied?'}

                {t('plans.faq.satisfaction.answer') || 'We offer a 30-day money-back guarantee. If you\'re not completely satisfied with your BOOM Card experience, we\'ll refund your membership fee.'}

                {t('plans.faq.howToUse.question') || 'How do I use my membership at partner locations?'}

                {t('plans.faq.howToUse.answer') || 'Simply show your digital membership card in the BOOM Card app or present your QR code at participating partners. Discounts are applied instantly.'}

      {/* CTA Section */}

            {t('plans.cta.subtitle') || 'Join 25,000+ members already enjoying exclusive discounts at Bulgaria\'s finest establishments'}
          
           {
                // Scroll to the pricing plans section
                const plansSection = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
                if (plansSection) {
                  plansSection.scrollIntoView({ behavior);
                }
              }}
              className="bg-white hover
              {t('plans.cta.startMembership') || 'Start Your Membership'}
            
             window.open('https, '_blank')}
              className="border-2 border-white text-white hover
              📱 {t('plans.cta.downloadApp') || 'Download App'}

  );
}