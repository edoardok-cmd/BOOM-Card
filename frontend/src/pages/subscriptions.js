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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
      console.error('Error fetching plans', err);
      setError('Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/me`, {
        headers: {
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCurrentSubscription(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching current subscription', err);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: {
        },
        body: JSON.stringify({
          planId,
          paymentMethod: 'card', // Placeholder for now
          autoRenew: true
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
      console.error('Error creating subscription', err);
      alert(language === 'bg' ? 'Неуспешно създаване на абонамент' : 'Failed to create subscription');
    }
  };
  
  const getPlans = (t) => [
    {
      id: 'basic',
      name: t('plans.basic.name') || 'Basic',
      price: 0,
      period: t('plans.basic.period') || 'month',
      description: t('plans.basic.description') || 'Essential features for personal use',
      features: [
        t('plans.basic.features.0') || 'Virtual debit card',
        t('plans.basic.features.1') || 'Basic expense tracking', 
        t('plans.basic.features.2') || 'Monthly spending reports',
        t('plans.basic.features.3') || 'Standard security features'
      ],
      color: 'from-gray-500 to-gray-600',
      popular: false
    },
    {
      id: 'premium', 
      name: t('plans.premium.name') || 'Premium',
      price: 9.99,
      period: t('plans.premium.period') || 'month',
      description: t('plans.premium.description') || 'Advanced features for power users',
      features: [
        t('plans.premium.features.0') || 'All Basic features',
        t('plans.premium.features.1') || 'Multiple virtual cards',
        t('plans.premium.features.2') || 'Advanced analytics',
        t('plans.premium.features.3') || 'Priority support',
        t('plans.premium.features.4') || 'Cashback rewards'
      ],
      color: 'from-blue-500 to-purple-600',
      popular: true
    },
    {
      id: 'vip',
      name: t('plans.vip.name') || 'VIP',
      price: 29.99,
      period: t('plans.vip.period') || 'month',
      description: t('plans.vip.description') || 'Exclusive benefits for VIP members',
      features: [
        t('plans.vip.features.0') || 'All Premium features',
        t('plans.vip.features.1') || 'Unlimited virtual cards',
        t('plans.vip.features.2') || 'Concierge service',
        t('plans.vip.features.3') || 'Exclusive partner deals',
        t('plans.vip.features.4') || 'Custom card designs',
        t('plans.vip.features.5') || 'Higher cashback rates'
      ],
      color: 'from-yellow-400 to-orange-500',
      popular: false
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
    { name: t("features.partners") || "Partner Access", basic: true, premium: true, vip: true },
    { name: t("features.virtual_cards") || "Virtual Cards", basic: "1", premium: "5", vip: "Unlimited" },
    { name: t("features.cashback") || "Cashback", basic: "0.5%", premium: "2%", vip: "5%" },
    { name: t("features.support") || "Support", basic: "Email", premium: "Priority", vip: "24/7 Concierge" },
    { name: t("features.analytics") || "Analytics", basic: false, premium: true, vip: true },
    { name: t("features.security") || "Enhanced Security", basic: false, premium: true, vip: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{t('plans.title')} - BOOM Card</title>
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="flex items-center space-x-4">
              <a href="/subscriptions" className="text-orange-600 font-semibold">
                {t('plans.nav.plans')}
              </a>
              <SearchBar />
              <LanguageSwitcher />
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-semibold">{t('subscriptions.hero.badge')}</span>
          </div>

              {t('subscriptions.hero.title1')}

              {t('subscriptions.hero.title2')}

          {/* Billing Toggle */}

               setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {t('subscriptions.billing.monthly')}
              
               setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white hover:bg-white/10'
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
                      className={`w-full py-4 px-6 rounded-2xl text-lg font-bold transition-all shadow-lg hover:shadow-xl ${ && currentSubscription.plan_id : selectedPlan === plan.id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : plan.popular
                          ? `bg-gradient-to-r ${plan.color} text-white hover
                          : `bg-gradient-to-r ${plan.color} text-white hover
                      }`}
                    >
                      {currentSubscription && currentSubscription.plan_id : selectedPlan === plan.id
                          ? (language : (language === 'bg' ? 'Текущ план' : 'Current Plan')
                        : currentSubscription
                        ? currentSubscription.plan_id > plan.id 
                          ? (language : (language === 'bg' ? 'Понижаване' : 'Downgrade')
                          : (language === 'bg' ? 'Надграждане' : 'Upgrade')
                        : selectedPlan === plan.id
                          ? (language : (language === 'bg' ? 'Абонирайте се сега' : 'Subscribe Now')
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
                  plansSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-white hover:bg-gray-50 text-orange-600 px-8 py-4 rounded-xl font-semibold shadow-lg transition-all"
            >
              {t('plans.cta.startMembership') || 'Start Your Membership'}
            
             window.open('https://boomcard.bg', '_blank')}
              className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-xl font-semibold transition-all"
            >
              📱 {t('plans.cta.downloadApp') || 'Download App'}

  );
}