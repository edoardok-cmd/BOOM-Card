import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import Logo from '../components/Logo';
import MobileMenu from '../components/MobileMenu';
import { useLanguage } from '../contexts/LanguageContext';
import { navigationHandlers } from '../utils/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Subscriptions() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [backendPlans, setBackendPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

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
      console.error('Error fetching plans:', err);
      setError('Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/me`, {
        headers: {
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
      console.error('Error fetching current subscription:', err);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          planId: planId,
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
      console.error('Error creating subscription:', err);
      alert(language === 'bg' ? 'Неуспешно създаване на абонамент' : 'Failed to create subscription');
    }
  };
  
  const getPlans = (t: any) => [
  {
    id: 'basic',
    name: t('plans.essential.name'),
    icon: '🌱',
    price: 9.99,
    period: 'month',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    popular: false,
    description: t('plans.essential.description'),
    features: [
      { text: t('plans.features.access100Partners') || 'Access to 100+ verified partners', included: true },
      { text: t('plans.features.discount10to15') || '10-15% average discount', included: true },
      { text: t('plans.features.mobileApp') || 'Mobile app with QR codes', included: true },
      { text: t('plans.features.basicSupport') || 'Basic customer support', included: true },
      { text: t('plans.features.restaurantReservations') || 'Restaurant reservations', included: true },
      { text: t('plans.features.premiumDining') || 'Premium dining venues', included: false },
      { text: t('plans.features.luxuryHotelAccess') || 'Luxury hotel access', included: false },
      { text: t('plans.features.vipEvents') || 'Exclusive VIP events', included: false }
    ],
    yearlyDiscount: 20,
    savings: t('plans.essential.savings') || '€120+ saved annually'
  },
  {
    id: 'premium',
    name: t('plans.premium.name'),
    icon: '🔥',
    price: 19.99,
    period: 'month',
    color: 'from-orange-400 to-red-500',
    bgColor: 'from-orange-50 to-red-50',
    borderColor: 'border-orange-300',
    popular: true,
    description: t('plans.premium.description'),
    features: [
      { text: t('plans.features.access250Partners') || 'Access to 250+ premium partners', included: true },
      { text: t('plans.features.discount15to25') || '15-25% average discount', included: true },
      { text: t('plans.features.mobileApp') || 'Mobile app with QR codes', included: true },
      { text: t('plans.features.prioritySupport') || 'Priority customer support', included: true },
      { text: t('plans.features.restaurantReservations') || 'Restaurant reservations', included: true },
      { text: t('plans.features.premiumDining') || 'Premium dining venues', included: true },
      { text: t('plans.features.fourStarHotels') || '4-star hotel access', included: true },
      { text: t('plans.features.vipEvents') || 'Exclusive VIP events', included: false }
    ],
    yearlyDiscount: 25,
    savings: t('plans.premium.savings') || '€600+ saved annually'
  },
  {
    id: 'vip',
    name: t('plans.vip.name'),
    icon: '👑',
    price: 39.99,
    period: 'month',
    color: 'from-purple-400 to-indigo-500',
    bgColor: 'from-purple-50 to-indigo-50',
    borderColor: 'border-purple-300',
    popular: false,
    description: t('plans.vip.description'),
    features: [
      { text: t('plans.features.access375Partners') || 'Access to all 375+ elite partners', included: true },
      { text: t('plans.features.discount20to40') || '20-40% average discount', included: true },
      { text: t('plans.features.mobileApp') || 'Mobile app with QR codes', included: true },
      { text: t('plans.features.conciergeSupport') || '24/7 concierge support', included: true },
      { text: t('plans.features.priorityReservations') || 'Priority restaurant reservations', included: true },
      { text: t('plans.features.allPremiumDining') || 'All premium dining venues', included: true },
      { text: t('plans.features.fiveStarHotels') || 'Luxury 5-star hotel access', included: true },
      { text: t('plans.features.vipEventsExperiences') || 'Exclusive VIP events & experiences', included: true }
    ],
    yearlyDiscount: 30,
    savings: t('plans.vip.savings') || '€1,200+ saved annually'
  }
];

  const frontendPlans = getPlans(t);
  
  // Map backend plans to frontend format
  const mappedBackendPlans = backendPlans.map(plan => {
    // Match by ID instead of name to ensure correct icon mapping
    const frontendPlan = frontendPlans.find(fp => fp.id.toLowerCase() === plan.id.toLowerCase());
    return {
      id: plan.id,
      backendId: plan.id,
      name: frontendPlan?.name || plan.name,
      type: plan.id,
      icon: frontendPlan?.icon || '🎯',
      price: plan.price,
      period: 'month',
      color: frontendPlan?.color || 'from-gray-400 to-gray-500',
      bgColor: frontendPlan?.bgColor || 'from-gray-50 to-gray-100',
      borderColor: frontendPlan?.borderColor || 'border-gray-200',
      popular: plan.type === 'Premium',
      description: frontendPlan?.description || plan.features[0],
      features: frontendPlan?.features || plan.features.map(f => ({ text: f, included: true })),
      yearlyDiscount: frontendPlan?.yearlyDiscount || 20,
      savings: frontendPlan?.savings || `Save with ${plan.type}`,
      discountPercentage: plan.discount_percentage
    };
  });

  // Use backend plans if available, otherwise use frontend plans
  const plans = mappedBackendPlans.length > 0 ? mappedBackendPlans : frontendPlans;

  const features = [
    { name: t('plans.comparison.partnerAccess'), basic: '100+', premium: '250+', vip: '375+' },
    { name: t('plans.comparison.discountRange'), basic: '10-15%', premium: '15-25%', vip: '20-40%' },
    { name: t('plans.comparison.mobileApp'), basic: '✓', premium: '✓', vip: '✓' },
    { name: t('plans.comparison.support'), basic: t('plans.comparison.basicSupport') || 'Basic', premium: t('plans.comparison.prioritySupport') || 'Priority', vip: t('plans.comparison.conciergeSupport') || '24/7 Concierge' },
    { name: t('plans.comparison.reservations'), basic: '✓', premium: '✓', vip: t('plans.comparison.priorityText') || 'Priority' },
    { name: t('plans.comparison.premiumDining'), basic: '✗', premium: '✓', vip: '✓' },
    { name: t('plans.comparison.hotelAccess'), basic: '✗', premium: t('plans.comparison.fourStar') || '4-Star', vip: t('plans.comparison.fiveStar') || '5-Star' },
    { name: t('plans.comparison.vipEvents'), basic: '✗', premium: '✗', vip: '✓' },
    { name: t('plans.comparison.savingsPotential'), basic: '€120+', premium: '€600+', vip: '€1,200+' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>{t('plans.title')}</title>
        <meta name="description" content={t('plans.description')} />
      </Head>

      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Logo size="md" showText={true} />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="ml-10 flex items-center space-x-1">
                <a href="/" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('plans.nav.home')}</a>
                <a href="/partners" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('plans.nav.partners')}</a>
                <a href="/subscriptions" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold">{t('plans.nav.plans')}</a>
                <div className="pl-4 ml-4 border-l border-gray-200 flex items-center space-x-3">
                  <SearchBar />
                  <LanguageSwitcher />
                  <UserProfileDropdown />
                </div>
              </div>
            </div>
            {/* Mobile Navigation */}
            <div className="flex lg:hidden items-center space-x-2">
              <LanguageSwitcher />
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-white/10 backdrop-blur-sm text-white border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
              {t('subscriptions.hero.badge')}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              {t('subscriptions.hero.title1')}
            </span>
            <br />
            <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">
              {t('subscriptions.hero.title2')}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-4xl mx-auto leading-relaxed">
            {t('subscriptions.hero.subtitle')}
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
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
                <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">{t('subscriptions.billing.save25')}</span>
              </button>
            </div>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-300">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('subscriptions.trust.moneyBack')}
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('subscriptions.trust.cancelAnytime')}
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('subscriptions.trust.instantActivation')}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">{language === 'bg' ? 'Зареждане на абонаментни планове...' : 'Loading subscription plans...'}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const monthlyPrice = billingCycle === 'yearly' 
                ? (plan.price * (1 - plan.yearlyDiscount / 100)).toFixed(2)
                : plan.price.toFixed(2);
              const yearlyPrice = (monthlyPrice * 12).toFixed(2);
              
              return (
                <div key={plan.id} className={`relative bg-gradient-to-br ${plan.bgColor} rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                  plan.popular ? 'border-orange-300 scale-105' : plan.borderColor
                } ${
                  selectedPlan === plan.id ? 'ring-4 ring-orange-200' : ''
                } hover:-translate-y-2`}>
                  
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                        ✨ {t('plans.mostPopular') || 'Most Popular'}
                      </span>
                    </div>
                  )}
                  
                  {currentSubscription && currentSubscription.plan_id === plan.id && (
                    <div className="absolute -top-4 right-4">
                      <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        ✓ {language === 'bg' ? 'Активен' : 'Active'}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className={`w-20 h-20 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                      <span className="text-4xl">{plan.icon}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{plan.description}</p>
                    
                    <div className="mb-8">
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-5xl font-bold text-gray-900">€{monthlyPrice}</span>
                        <span className="text-gray-500 ml-2">/{language === 'bg' ? 'месец' : plan.period}</span>
                      </div>
                      
                      {billingCycle === 'yearly' && (
                        <div className="text-center">
                          <div className="text-sm text-gray-500 line-through">€{plan.price.toFixed(2)}/{language === 'bg' ? 'месец' : 'month'}</div>
                          <div className="text-sm font-semibold text-green-600">{language === 'bg' ? `Спестете ${plan.yearlyDiscount}% годишно` : `Save ${plan.yearlyDiscount}% annually`}</div>
                          <div className="text-xs text-gray-500">€{yearlyPrice} {language === 'bg' ? 'фактурира се годишно' : 'billed yearly'}</div>
                        </div>
                      )}
                      
                      <div className={`text-lg font-semibold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent mt-3`}>
                        {plan.savings}
                      </div>
                    </div>
                    
                    <ul className="text-left mb-8 space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 mr-3 ${
                            feature.included 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {feature.included ? '✓' : '✗'}
                          </div>
                          <span className={`text-sm ${
                            feature.included ? 'text-gray-700' : 'text-gray-400'
                          }`}>
                            {feature.text}
                          </span>
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
                          : (language === 'bg' ? `Изберете ${plan.name}` : `Choose ${plan.name}`)}
                    </button>
                    
                    {selectedPlan === plan.id && (
                      <div className="mt-4 text-sm text-green-600 font-semibold">
                        ✓ {language === 'bg' ? 'Планът е избран - Готово за плащане' : 'Plan selected - Ready to checkout'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              {t('plans.comparison.badge') || 'Detailed Comparison'}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('plans.comparison.title') || 'Compare All Features'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'bg' 
                ? 'Вижте точно какво е включено във всеки план, за да направите най-добрия избор за вашия начин на живот'
                : 'See exactly what\'s included in each plan to make the best choice for your lifestyle'}
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      {t('plans.comparison.featuresAndBenefits') || 'Features & Benefits'}
                    </th>
                    <th className="px-8 py-6 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl mb-2">🌱</span>
                        {language === 'bg' ? 'Основен' : 'Essential'}
                      </div>
                    </th>
                    <th className="px-8 py-6 text-center text-sm font-bold text-orange-600 uppercase tracking-wider bg-orange-50">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl mb-2">🔥</span>
                        {language === 'bg' ? 'Премиум' : 'Premium'}
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full mt-1">{t('plans.popular') || 'Popular'}</span>
                      </div>
                    </th>
                    <th className="px-8 py-6 text-center text-sm font-bold text-purple-600 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl mb-2">👑</span>
                        {language === 'bg' ? 'VIP Елит' : 'VIP Elite'}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {features.map((feature, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {feature.name}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-center text-gray-700 font-medium">
                        {feature.basic}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-center font-semibold bg-orange-50/50">
                        <span className="text-orange-600">{feature.premium}</span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-center text-purple-600 font-semibold">
                        {feature.vip}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t('plans.faq.title')}
            </h2>
          </div>
          
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('plans.faq.changePlan.question') || 'Can I change my plan anytime?'}
              </h3>
              <p className="text-gray-600">
                {t('plans.faq.changePlan.answer') || 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences.'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('plans.faq.satisfaction.question') || 'What happens if I\'m not satisfied?'}
              </h3>
              <p className="text-gray-600">
                {t('plans.faq.satisfaction.answer') || 'We offer a 30-day money-back guarantee. If you\'re not completely satisfied with your BOOM Card experience, we\'ll refund your membership fee.'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
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
      <div className="bg-gradient-to-r from-orange-500 to-red-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('plans.cta.title') || 'Ready to Start Saving?'}
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
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
              className="bg-white hover:bg-gray-100 text-orange-600 font-bold py-4 px-8 rounded-xl text-lg transition-colors">
              {t('plans.cta.startMembership') || 'Start Your Membership'}
            </button>
            <button 
              onClick={() => window.open('https://apps.apple.com/app/boom-card', '_blank')}
              className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-bold py-4 px-8 rounded-xl text-lg transition-colors">
              📱 {t('plans.cta.downloadApp') || 'Download App'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}