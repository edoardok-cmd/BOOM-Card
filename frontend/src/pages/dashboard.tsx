import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SearchBar from '../components/SearchBar';
import UserProfileDropdown from '../components/UserProfileDropdown';
import Logo from '../components/Logo';
import MobileMenu from '../components/MobileMenu';
import { useAuth } from '../contexts/AuthContext';

const recentActivity = [
  {
    id: 1,
    partner: 'The Sofia Grand',
    category: 'Fine Dining',
    icon: '🍽️',
    saved: 67,
    discount: 30,
    date: '2 days ago',
    color: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-50'
  },
  {
    id: 2,
    partner: 'Emerald Resort & Spa',
    category: 'Luxury Hotels',
    icon: '🏨',
    saved: 180,
    discount: 40,
    date: '5 days ago',
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50'
  },
  {
    id: 3,
    partner: 'Serenity Wellness',
    category: 'Spa & Wellness',
    icon: '💆',
    saved: 95,
    discount: 35,
    date: '1 week ago',
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-50'
  },
  {
    id: 4,
    partner: 'Marina Bay Restaurant',
    category: 'Fine Dining',
    icon: '🍽️',
    saved: 45,
    discount: 25,
    date: '2 weeks ago',
    color: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-50'
  }
];

const favoritePartners = [
  {
    name: 'The Sofia Grand',
    icon: '🍽️',
    visits: 12,
    totalSaved: 420,
    color: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-50'
  },
  {
    name: 'Coffee Central',
    icon: '☕',
    visits: 28,
    totalSaved: 168,
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50'
  },
  {
    name: 'Emerald Resort',
    icon: '🏨',
    visits: 4,
    totalSaved: 640,
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50'
  },
  {
    name: 'Serenity Wellness',
    icon: '💆',
    visits: 8,
    totalSaved: 380,
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-50'
  }
];

const achievements = [
  {
    titleKey: 'dashboard.achievements.savingsChampion',
    descriptionKey: 'dashboard.achievements.savedOver1000',
    icon: '🏆',
    earned: true,
    progress: 100
  },
  {
    titleKey: 'dashboard.achievements.explorer',
    descriptionKey: 'dashboard.achievements.visited50Partners',
    icon: '🌍',
    earned: true,
    progress: 100
  },
  {
    titleKey: 'dashboard.achievements.vipMember',
    descriptionKey: 'dashboard.achievements.reachVipStatus',
    icon: '👑',
    earned: false,
    progress: 75
  },
  {
    titleKey: 'dashboard.achievements.socialSaver',
    descriptionKey: 'dashboard.achievements.refer10Friends',
    icon: '🤝',
    earned: false,
    progress: 40
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFrame, setTimeFrame] = useState('month');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [userFavorites, setUserFavorites] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [userStats, setUserStats] = useState({ totalSaved: 0, visitsThisYear: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

  // Fetch QR code, activity, favorites, and achievements on mount
  useEffect(() => {
    fetchQrCode();
    fetchUserActivity();
    fetchUserFavorites();
    fetchUserAchievements();
    fetchUserStats();
  }, []);

  // Fetch QR code
  const fetchQrCode = async () => {
    if (!user) return;
    
    setLoadingQr(true);
    try {
      const response = await fetch(`${API_BASE_URL}/qr/membership`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.qrCode) {
          setQrCodeUrl(result.data.qrCode);
        }
      }
    } catch (error) {
      console.error('Failed to fetch QR code:', error);
    } finally {
      setLoadingQr(false);
    }
  };

  // Fetch user activity
  const fetchUserActivity = async () => {
    if (!user) return;
    
    setLoadingActivity(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/activity?limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setUserActivities(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  // Fetch user favorites
  const fetchUserFavorites = async () => {
    if (!user) return;
    
    setLoadingFavorites(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/favorites?limit=8`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setUserFavorites(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user favorites:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Fetch user achievements
  const fetchUserAchievements = async () => {
    if (!user) return;
    
    setLoadingAchievements(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/achievements`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setUserAchievements(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user achievements:', error);
    } finally {
      setLoadingAchievements(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    if (!user) return;
    
    setLoadingStats(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setUserStats({
            totalSaved: result.data.totalSaved || 0,
            visitsThisYear: result.data.visitsThisYear || 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>{t('dashboard.title')}</title>
        <meta name="description" content={t('dashboard.description')} />
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
                <a href="/" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('dashboard.nav.home')}</a>
                <a href="/partners" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('dashboard.nav.partners')}</a>
                <a href="/subscriptions" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('dashboard.nav.plans')}</a>
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
      <div className="relative overflow-hidden py-16 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-white">
              <div className="mb-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  {t('dashboard.hero.memberBadge')}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {t('dashboard.hero.welcomeBack')}<br />
                <span className="bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                  {user ? `${user.firstName} ${user.lastName}!` : 'User!'}
                </span>
              </h1>
              <p className="text-xl text-orange-100 mb-8 max-w-lg">
                {t('dashboard.hero.subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 font-bold py-3 px-6 rounded-xl transition-all">
                  {t('dashboard.hero.findPartners')}
                </button>
                <button className="bg-white hover:bg-gray-100 text-orange-600 font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl">
                  {t('dashboard.hero.openApp')}
                </button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-8 lg:mt-0 grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/30">
                <div className="text-3xl font-bold mb-2">
                  {loadingStats ? '...' : `€${userStats.totalSaved}`}
                </div>
                <div className="text-sm text-orange-100">{t('dashboard.hero.totalSaved')}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-white/30">
                <div className="text-3xl font-bold mb-2">
                  {loadingStats ? '...' : userStats.visitsThisYear}
                </div>
                <div className="text-sm text-orange-100">{t('dashboard.hero.visitsThisYear')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', name: t('dashboard.tabs.overview'), icon: '📊' },
              { id: 'activity', name: t('dashboard.tabs.activity'), icon: '⚡' },
              { id: 'favorites', name: t('dashboard.tabs.favorites'), icon: '❤️' },
              { id: 'achievements', name: t('dashboard.tabs.achievements'), icon: '🏆' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Time Frame Filter */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.overview.title')}</h2>
                <div className="flex space-x-2 bg-gray-100 rounded-xl p-2">
                  {['week', 'month', 'year'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setTimeFrame(period)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        timeFrame === period
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t(`dashboard.overview.${period}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">💰</span>
                    </div>
                    <div className="text-sm text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">
                      {t('dashboard.overview.vsLastMonth')}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">€1,847</div>
                  <div className="text-gray-600 font-medium">{t('dashboard.overview.totalSavedYear')}</div>
                  <div className="text-sm text-gray-500 mt-2">{t('dashboard.overview.averageMonth')}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <div className="text-sm text-blue-600 font-semibold bg-blue-100 px-3 py-1 rounded-full">
                      {t('dashboard.overview.thisWeek')}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">52</div>
                  <div className="text-gray-600 font-medium">{t('dashboard.overview.partnerVisits')}</div>
                  <div className="text-sm text-gray-500 mt-2">{t('dashboard.overview.acrossLocations')}</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">🔥</span>
                    </div>
                    <div className="text-sm text-purple-600 font-semibold bg-purple-100 px-3 py-1 rounded-full">
                      {t('dashboard.overview.premium')}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">24%</div>
                  <div className="text-gray-600 font-medium">{t('dashboard.overview.averageDiscount')}</div>
                  <div className="text-sm text-gray-500 mt-2">{t('dashboard.overview.upToAvailable')}</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">🏆</span>
                    </div>
                    <div className="text-sm text-orange-600 font-semibold bg-orange-100 px-3 py-1 rounded-full">
                      {t('dashboard.overview.newAchievements')}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">8</div>
                  <div className="text-gray-600 font-medium">{t('dashboard.overview.achievements')}</div>
                  <div className="text-sm text-gray-500 mt-2">{t('dashboard.overview.moreToUnlock')}</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Digital Card */}
                <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{t('dashboard.card.title')}</h3>
                    <button className="text-orange-600 hover:text-orange-700 font-semibold text-sm">
                      {t('dashboard.card.refresh')}
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="text-sm opacity-90 mb-2">{t('dashboard.card.premiumMember')}</div>
                        <div className="text-2xl font-bold">{user ? `${user.firstName} ${user.lastName}` : 'Loading...'}</div>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-2xl font-bold">B</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs opacity-75 mb-1">{t('dashboard.card.memberId')}</div>
                        <div className="text-lg font-mono">BC-2024-5847</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-75 mb-1">{t('dashboard.card.validUntil')}</div>
                        <div className="text-sm">12/2024</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      {loadingQr ? (
                        <div className="text-gray-400">
                          <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="Membership QR Code" className="w-full h-full rounded-lg" />
                      ) : (
                        <div className="w-24 h-24 bg-black rounded-lg flex items-center justify-center">
                          <div className="text-white text-xs font-mono">QR CODE</div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {t('dashboard.card.qrCodeText')}
                    </p>
                    <button 
                      onClick={fetchQrCode}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                      {t('dashboard.card.openInApp')}
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.highlights.title')}</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-2xl">👍</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{t('dashboard.highlights.bestMonth')}</div>
                          <div className="text-sm text-gray-600">{t('dashboard.highlights.highestSavings')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">€387</div>
                        <div className="text-xs text-gray-500">{t('dashboard.highlights.saved')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-2xl">🎆</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{t('dashboard.highlights.newDiscovery')}</div>
                          <div className="text-sm text-gray-600">{t('dashboard.highlights.newPartners')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">5</div>
                        <div className="text-xs text-gray-500">{t('dashboard.highlights.locations')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-2xl">⭐</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{t('dashboard.highlights.vipProgress')}</div>
                          <div className="text-sm text-gray-600">{t('dashboard.highlights.towardsVip')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">75%</div>
                        <div className="text-xs text-gray-500">{t('dashboard.highlights.complete')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('dashboard.activity.title')}</h2>
              
              {loadingActivity ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-600">Loading your activity...</p>
                </div>
              ) : userActivities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Recent Activity</h3>
                  <p className="text-gray-600">Start using your BOOM Card to see your activity here!</p>
                </div>
              ) : (
                userActivities.map((activity) => (
                  <div key={activity.id} className={`${activity.bgColor} rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-shadow`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-16 h-16 bg-gradient-to-r ${activity.color} rounded-2xl flex items-center justify-center mr-6`}>
                          <span className="text-3xl">{activity.icon}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{activity.partner}</h3>
                          <p className="text-gray-600 mb-2">{activity.category}</p>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">{activity.date}</span>
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${activity.color} text-white`}>
                              {activity.discount}% OFF
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900 mb-1">€{activity.saved}</div>
                        <div className="text-sm text-gray-500">{t('dashboard.activity.saved')}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('dashboard.favorites.title')}</h2>
              
              {loadingFavorites ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-600">Loading your favorites...</p>
                </div>
              ) : userFavorites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💝</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Favorites Yet</h3>
                  <p className="text-gray-600">Visit and review partners to see your favorites here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userFavorites.map((partner, index) => (
                    <div key={partner.slug || index} className={`${partner.bgColor} rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-shadow`}>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className={`w-16 h-16 bg-gradient-to-r ${partner.color} rounded-2xl flex items-center justify-center mr-4`}>
                            <span className="text-3xl">{partner.icon}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{partner.name}</h3>
                            <p className="text-gray-600">{partner.visits} {t('dashboard.favorites.visits')}</p>
                          </div>
                        </div>
                        <button className="w-10 h-10 bg-white hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors shadow-md hover:shadow-lg">
                          ❤️
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">€{partner.totalSaved}</div>
                          <div className="text-sm text-gray-600">{t('dashboard.favorites.totalSaved')}</div>
                        </div>
                        <button 
                          onClick={() => router.push(`/partners/${partner.slug}`)}
                          className={`bg-gradient-to-r ${partner.color} text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-xl transition-all transform hover:scale-105`}>
                          {t('dashboard.favorites.visitAgain')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('dashboard.achievements.title')}</h2>
              
              {loadingAchievements ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-600">Loading your achievements...</p>
                </div>
              ) : userAchievements.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Achievements Yet</h3>
                  <p className="text-gray-600">Start using your BOOM Card to unlock achievements!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userAchievements.map((achievement, index) => (
                    <div key={achievement.category || index} className={`bg-white rounded-3xl p-8 border-2 transition-all ${
                      achievement.earned 
                        ? 'border-green-200 bg-green-50/50' 
                        : 'border-gray-200 hover:border-orange-200'
                    }`}>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mr-4 ${
                            achievement.earned 
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                              : 'bg-gray-100'
                          }`}>
                            <span className="text-3xl">{achievement.icon}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{t(achievement.titleKey)}</h3>
                            <p className="text-gray-600">{t(achievement.descriptionKey)}</p>
                          </div>
                        </div>
                        {achievement.earned && (
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {t('dashboard.achievements.earned')}
                          </div>
                        )}
                      </div>
                      
                      {!achievement.earned && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">{t('dashboard.achievements.progress')}</span>
                            <span className="text-sm font-semibold text-gray-900">{achievement.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${achievement.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}