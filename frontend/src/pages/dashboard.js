import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

export default function Dashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  
  // State for dashboard data
  const [stats, setStats] = useState({
    totalSavings: 1847,
    partnerVisits: 52,
    avgDiscount: 24,
    membershipDays: 180
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingOffers, setUpcomingOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !user) {
      router.push('/login');
      return;
    }
    
    // Fetch dashboard data
    fetchDashboardData(
  );
}, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // In a real app, these would be separate API calls
      // For now, we'll use mock data
      setTimeout(() => {
        setRecentActivity([
          {
            id: 1,
            type: 'discount',
            partner: 'The Sofia Grand',
            amount: '30%',
            savings: '€45.00',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            type: 'visit',
            partner: 'Fitness First Gym',
            amount: '20%',
            savings: '€12.00',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            type: 'booking',
            partner: 'Spa Relaxation Center',
            amount: '25%',
            savings: '€30.00',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
        
        setUpcomingOffers([
          {
            id: 1,
            partner: 'Restaurant Paradise',
            offer: '35% off dinner',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'dining'
          },
          {
            id: 2,
            partner: 'Marina Bay Hotel',
            offer: '40% off weekend stays',
            validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'hotels'
          },
          {
            id: 3,
            partner: 'Urban Fitness',
            offer: 'Free personal training session',
            validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'fitness'
          }
        ]);
        
        setLoading(false
  );
}, 1000
  );
} catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false
  );
}
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('dashboard.today') || 'Today';
    if (diffDays === 1) return t('dashboard.yesterday') || 'Yesterday';
    if (diffDays < 7) return `${diffDays} ${t('dashboard.daysAgo') || 'days ago'}`;
    
    return date.toLocaleDateString(
  );
};

  const getCategoryIcon = (category) => {
    const icons = {
      dining: '🍽️',
      hotels: '🏨',
      fitness: '💪',
      shopping: '🛍️',
      entertainment: '🎭',
      wellness: '🧘'
    };
    return icons[category] || '🎁';
  };

  if (loading) {
    return (
    <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('dashboard.loading') || 'Loading dashboard...'}</p>
          </div>
        </div>
      </Layout>
  );
}

  return (
    <Layout>
      <Head>
        <title>{t('dashboard.title') || 'Dashboard'} - BOOM Card</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.welcome') || 'Welcome back'}, {user?.firstName || 'Member'}!
          </h1>
          <p className="text-gray-600 mt-2">
            {t('dashboard.subtitle') || 'Here\'s your BOOM Card activity overview'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.stats.totalSavings') || 'Total Savings'}</p>
                <p className="text-2xl font-bold text-green-600">€{stats.totalSavings}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.stats.partnerVisits') || 'Partner Visits'}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.partnerVisits}</p>
              </div>
              <div className="text-3xl">🏪</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.stats.avgDiscount') || 'Avg. Discount'}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgDiscount}%</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.stats.memberDays') || 'Member Days'}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.membershipDays}</p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{t('dashboard.recentActivity.title') || 'Recent Activity'}</h2>
            </div>
            <div className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">
                          {activity.type === 'discount' ? '🏷️' : activity.type === 'visit' ? '📍' : '📅'}
                        </div>
                        <div>
                          <p className="font-medium">{activity.partner}</p>
                          <p className="text-sm text-gray-600">
                            {activity.amount} {t('dashboard.recentActivity.discount') || 'discount'} • 
                            {t('dashboard.recentActivity.saved') || 'Saved'} {activity.savings}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {t('dashboard.recentActivity.empty') || 'No recent activity'}
                </p>
              )}
              
              <Link href="/activity" className="block mt-4 text-center text-orange-600 hover:text-orange-700">
                {t('dashboard.recentActivity.viewAll') || 'View all activity'} →
              </Link>
            </div>
          </div>

          {/* Upcoming Offers */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{t('dashboard.upcomingOffers.title') || 'Exclusive Offers'}</h2>
            </div>
            <div className="p-6">
              {upcomingOffers.length > 0 ? (
                <div className="space-y-4">
                  {upcomingOffers.map((offer) => (
                    <div key={offer.id} className="p-4 border rounded-lg hover:border-orange-500 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{getCategoryIcon(offer.category)}</div>
                          <div>
                            <p className="font-medium">{offer.partner}</p>
                            <p className="text-sm text-gray-600">{offer.offer}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t('dashboard.upcomingOffers.validUntil') || 'Valid until'} {new Date(offer.validUntil).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button className="text-orange-600 hover:text-orange-700 text-sm">
                          {t('dashboard.upcomingOffers.useNow') || 'Use'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {t('dashboard.upcomingOffers.empty') || 'No offers available'}
                </p>
              )}
              
              <Link href="/partners" className="block mt-4 text-center text-orange-600 hover:text-orange-700">
                {t('dashboard.upcomingOffers.viewAll') || 'Browse all partners'} →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">{t('dashboard.quickActions.title') || 'Quick Actions'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/partners" className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-colors">
              <div className="text-3xl mb-2">🔍</div>
              <p className="font-medium">{t('dashboard.quickActions.findPartners') || 'Find Partners'}</p>
            </Link>
            <Link href="/card" className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-colors">
              <div className="text-3xl mb-2">💳</div>
              <p className="font-medium">{t('dashboard.quickActions.viewCard') || 'View Card'}</p>
            </Link>
            <Link href="/profile#reviews" className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-colors">
              <div className="text-3xl mb-2">⭐</div>
              <p className="font-medium">{t('dashboard.quickActions.writeReview') || 'Write Review'}</p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}