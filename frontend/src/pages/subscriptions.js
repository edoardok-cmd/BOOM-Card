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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('subscriptions.hero.title1') || 'Choose Your'}
            <span className="block">{t('subscriptions.hero.title2') || 'BOOM Card Plan'}</span>
          </h1>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 my-8">
            <button
              onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {t('subscriptions.billing.monthly')}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {t('subscriptions.billing.yearly')}
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-2">{t('subscriptions.billing.save25') || 'Save 25%'}</span>
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center space-x-8 text-sm opacity-90">
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('subscriptions.trust.moneyBack') || '30-Day Money Back'}
            </span>
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('subscriptions.trust.cancelAnytime') || 'Cancel Anytime'}
            </span>
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('subscriptions.trust.instantActivation') || 'Instant Activation'}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">{language === 'bg' ? 'Зареждане на абонаментни планове...' : 'Loading subscription plans...'}</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plans.map((plan) => {
              const monthlyPrice = billingCycle === 'yearly' 
                ? (plan.price * (1 - plan.yearlyDiscount / 100)).toFixed(2)
                : plan.price.toFixed(2);
              const yearlyPrice = (monthlyPrice * 12).toFixed(2);
              
              return (
                <div key={plan.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200">
                  {plan.popular && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 text-center font-semibold">
                      <span className="mr-2">✨</span>
                      {t('plans.mostPopular') || 'Most Popular'}
                    </div>
                  )}
                  
                  {currentSubscription && currentSubscription.plan_id === plan.id && (
                    <div className="bg-green-100 text-green-800 py-2 px-4 text-center font-semibold">
                      <span className="mr-2">✓</span>
                      {language === 'bg' ? 'Активен' : 'Active'}
                    </div>

                  )}
                  
                  <div className="p-8">
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-4">{plan.icon || '💳'}</div>
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-gray-600">{plan.description}</p>
                    </div>
                    
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold">
                        <span className="text-2xl">€</span>{monthlyPrice}
                        <span className="text-lg font-normal text-gray-600">/{language === 'bg' ? 'месец' : plan.period}</span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <div className="mt-2 text-sm text-gray-600">
                          <div className="line-through">€{plan.price.toFixed(2)}/{language === 'bg' ? 'месец' : 'month'}</div>
                          <div className="text-green-600 font-semibold">
                            {language === 'bg' ? `Спестете ${plan.yearlyDiscount}% годишно` : `Save ${plan.yearlyDiscount}% annually`}
                          </div>
                          <div className="text-gray-500">€{yearlyPrice} {language === 'bg' ? 'фактурира се годишно' : 'billed yearly'}</div>
                        </div>
                      )}
                      {plan.savings && (
                        <p className="text-sm text-orange-600 font-semibold mt-2">{plan.savings}</p>
                      )}
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className={`mr-3 ${feature.included ? 'text-green-500' : 'text-gray-400'}`}>
                            {feature.included ? '✓' : '✗'}
                          </span>
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        handleSubscribe(plan.backendId || plan.id);
                      }}
                      disabled={currentSubscription && currentSubscription.plan_id === plan.id}
                      className={`w-full py-4 px-6 rounded-2xl text-lg font-bold transition-all shadow-lg hover:shadow-xl ${
                        currentSubscription && currentSubscription.plan_id === plan.id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : plan.popular
                          ? `bg-gradient-to-r ${plan.color} text-white hover:scale-105`
                          : `bg-gradient-to-r ${plan.color} text-white hover:scale-105`
                      }`}
                    >
                      {currentSubscription && currentSubscription.plan_id === plan.id
                        ? (language === 'bg' ? 'Текущ план' : 'Current Plan')
                        : currentSubscription
                        ? currentSubscription.plan_id > plan.id 
                          ? (language === 'bg' ? 'Понижаване' : 'Downgrade')
                          : (language === 'bg' ? 'Надграждане' : 'Upgrade')
                        : selectedPlan === plan.id
                          ? (language === 'bg' ? 'Абонирайте се сега' : 'Subscribe Now')
                          : language === 'bg' ? `Изберете ${plan.name}` : `Choose ${plan.name}`}
                    </button>

                    {selectedPlan === plan.id && (
                      <div className="mt-4 text-center text-green-600 font-semibold">
                        ✓ {language === 'bg' ? 'Планът е избран - Готово за плащане' : 'Plan selected - Ready to checkout'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}

      {/* Detailed Comparison Table */}
      <div className="mt-16">
        <div className="text-center mb-12">
          <span className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            {t('plans.comparison.badge') || 'Detailed Comparison'}
          </span>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {language === 'bg' 
              ? 'Вижте точно какво е включено във всеки план, за да направите най-добрия избор за вашия начин на живот'
              : 'See exactly what\'s included in each plan to make the best choice for your lifestyle'}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-gray-700">
                  {t('plans.comparison.featuresAndBenefits') || 'Features & Benefits'}
                </th>
                <th className="px-6 py-4 text-center">
                  <div className="text-2xl mb-1">🌱</div>
                  <div className="text-gray-700">{language === 'bg' ? 'Основен' : 'Essential'}</div>
                </th>
                <th className="px-6 py-4 text-center relative">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-gray-700">{language === 'bg' ? 'Премиум' : 'Premium'}</div>
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {t('plans.popular') || 'Popular'}
                  </span>
                </th>
                <th className="px-6 py-4 text-center">
                  <div className="text-2xl mb-1">👑</div>
                  <div className="text-gray-700">{language === 'bg' ? 'VIP Елит' : 'VIP Elite'}</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {features.map((feature, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {feature.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {feature.basic}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {feature.premium}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {feature.vip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 bg-gray-50 py-16 px-8 rounded-3xl">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('plans.faq.title')}
          </h2>
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {t('plans.faq.changePlan.question') || 'Can I change my plan anytime?'}
              </h3>
              <p className="text-gray-600">
                {t('plans.faq.changePlan.answer') || 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences.'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {t('plans.faq.satisfaction.question') || 'What happens if I\'m not satisfied?'}
              </h3>
              <p className="text-gray-600">
                {t('plans.faq.satisfaction.answer') || 'We offer a 30-day money-back guarantee. If you\'re not completely satisfied with your BOOM Card experience, we\'ll refund your membership fee.'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {t('plans.faq.howToUse.question') || 'How do I use my membership at partner locations?'}
              </h3>
              <p className="text-gray-600">
                {t('plans.faq.howToUse.answer') || 'Simply show your digital membership card in the BOOM Card app or present your QR code at participating partners. Discounts are applied instantly.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center bg-gradient-to-r from-orange-500 to-red-500 py-16 px-8 rounded-3xl">
        <h2 className="text-4xl font-bold text-white mb-6">
          {t('plans.cta.title') || 'Ready to Save?'}
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          {t('plans.cta.subtitle') || 'Join 25,000+ members already enjoying exclusive discounts at Bulgaria\'s finest establishments'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              // Scroll to the pricing plans section
              const plansSection = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
              if (plansSection) {
                plansSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-white hover:bg-gray-50 text-orange-600 px-8 py-4 rounded-xl font-semibold shadow-lg transition-all"
          >
            {t('plans.cta.startMembership') || 'Start Your Membership'}
          </button>
          <button
            onClick={() => window.open('https://boomcard.bg', '_blank')}
            className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-xl font-semibold transition-all"
          >
            📱 {t('plans.cta.downloadApp') || 'Download App'}
          </button>
        </div>
      </div>
      
        </div>
      </section>
    </div>
  );
}