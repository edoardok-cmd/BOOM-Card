import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SearchBar from '../components/SearchBar';
import UserProfileDropdown from '../components/UserProfileDropdown';
import Logo from '../components/Logo';
import MobileMenu from '../components/MobileMenu';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { partnerService } from '../services/partnerService';
import { subscriptionService } from '../services/subscriptionService';
import { useApi } from '../hooks/useApi';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/format';
import { showErrorToast } from '../utils/errorHandler';
import { User, UserStats, Activity, Achievement, Favorite, Subscription } from '../types';

export default function DashboardEnhanced() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFrame, setTimeFrame] = useState('month');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login?redirect=/dashboard');
    }
  }, [router]);

  // Get cached user
  const user = authService.getUser();

  // API calls using our hooks
  const { data: userStats, isLoading: loadingStats, execute: fetchStats } = useApi(
    () => userService.getUserStats()
  );

  const { data: activities, isLoading: loadingActivities, execute: fetchActivities } = useApi(
    () => userService.getRecentActivities(10)
  );

  const { data: favorites, isLoading: loadingFavorites, execute: fetchFavorites } = useApi(
    () => partnerService.getFavorites()
  );

  const { data: achievements, isLoading: loadingAchievements, execute: fetchAchievements } = useApi(
    () => userService.getAchievements()
  );

  const { data: qrCode, isLoading: loadingQr, execute: fetchQrCode } = useApi(
    () => userService.getQRCode()
  );

  const { data: subscription, isLoading: loadingSubscription, execute: fetchSubscription } = useApi(
    () => subscriptionService.getCurrentSubscription()
  );

  // Fetch all data on mount
  useEffect(() => {
    if (user) {
      fetchStats();
      fetchActivities();
      fetchFavorites();
      fetchAchievements();
      fetchQrCode();
      fetchSubscription();
    }
  }, [user]);

  // Calculate savings summary
  const { data: savingsSummary, execute: fetchSavingsSummary } = useApi(
    () => userService.getSavingsSummary()
  );

  useEffect(() => {
    if (user && timeFrame) {
      fetchSavingsSummary();
    }
  }, [user, timeFrame]);

  // Handle QR code regeneration
  const handleRegenerateQr = async () => {
    try {
      await userService.regenerateQRCode();
      fetchQrCode();
      showErrorToast('QR code regenerated successfully');
    } catch (error) {
      showErrorToast(error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{t('dashboard.title') || 'Dashboard'} - BOOM Card</title>
        <meta name="description" content={t('dashboard.description') || 'Manage your BOOM Card membership'} />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Logo />
              <div className="hidden md:block ml-10">
                <SearchBar />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <UserProfileDropdown />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.welcome') || 'Welcome back'}, {user.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            {t('dashboard.subtitle') || 'Here\'s your membership overview'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className="text-sm border-gray-200 rounded-lg"
              >
                <option value="today">{t('dashboard.today') || 'Today'}</option>
                <option value="week">{t('dashboard.thisWeek') || 'This Week'}</option>
                <option value="month">{t('dashboard.thisMonth') || 'This Month'}</option>
                <option value="year">{t('dashboard.thisYear') || 'This Year'}</option>
              </select>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {t('dashboard.totalSaved') || 'Total Saved'}
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {loadingStats ? '...' : formatCurrency(
                timeFrame === 'today' ? savingsSummary?.today || 0 :
                timeFrame === 'week' ? savingsSummary?.thisWeek || 0 :
                timeFrame === 'month' ? savingsSummary?.thisMonth || 0 :
                savingsSummary?.thisYear || 0
              )}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏪</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {t('dashboard.visitsThisMonth') || 'Visits This Month'}
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {loadingStats ? '...' : userStats?.visitsThisMonth || 0}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {t('dashboard.membershipType') || 'Membership'}
            </h3>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {user.membershipType}
            </p>
            {subscription && (
              <p className="text-xs text-gray-500 mt-1">
                {t('dashboard.expiresIn') || 'Expires in'} {subscriptionService.getSubscriptionDaysRemaining()} {t('dashboard.days') || 'days'}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {t('dashboard.pointsBalance') || 'Points Balance'}
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {loadingStats ? '...' : userStats?.pointsBalance || 0}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('dashboard.overview') || 'Overview'}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('dashboard.activity') || 'Activity'}
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'favorites'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('dashboard.favorites') || 'Favorites'}
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'achievements'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('dashboard.achievements') || 'Achievements'}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* QR Code */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">{t('dashboard.membershipCard') || 'Membership Card'}</h2>
                <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm opacity-90">{t('dashboard.member') || 'Member'}</p>
                      <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {user.membershipType.toUpperCase()}
                    </span>
                  </div>
                  {loadingQr ? (
                    <div className="bg-white/20 rounded-lg h-32 flex items-center justify-center">
                      <span className="text-sm">{t('dashboard.loadingQr') || 'Loading...'}</span>
                    </div>
                  ) : qrCode ? (
                    <div className="bg-white rounded-lg p-2">
                      <img src={qrCode.qrCode} alt="QR Code" className="w-full" />
                    </div>
                  ) : (
                    <div className="bg-white/20 rounded-lg h-32 flex items-center justify-center">
                      <button
                        onClick={fetchQrCode}
                        className="text-sm underline"
                      >
                        {t('dashboard.generateQr') || 'Generate QR Code'}
                      </button>
                    </div>
                  )}
                  <p className="text-xs mt-4 opacity-75">
                    {t('dashboard.memberSince') || 'Member since'} {formatDate(user.joinedDate || new Date().toISOString(), 'medium')}
                  </p>
                </div>
                {qrCode && (
                  <button
                    onClick={handleRegenerateQr}
                    className="mt-4 w-full text-sm text-gray-600 hover:text-gray-800"
                  >
                    {t('dashboard.regenerateQr') || 'Regenerate QR Code'}
                  </button>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">{t('dashboard.recentActivity') || 'Recent Activity'}</h2>
                {loadingActivities ? (
                  <div className="text-center py-8 text-gray-500">
                    {t('dashboard.loading') || 'Loading...'}
                  </div>
                ) : activities && activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white">
                            {activity.type === 'discount_used' ? '💰' : 
                             activity.type === 'partner_visit' ? '🏪' :
                             activity.type === 'points_earned' ? '⭐' : '🎯'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
                          </div>
                        </div>
                        {activity.points && (
                          <span className="text-sm font-medium text-green-600">+{activity.points} pts</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {t('dashboard.noActivity') || 'No recent activity'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">{t('dashboard.allActivity') || 'All Activity'}</h2>
            {loadingActivities ? (
              <div className="text-center py-8 text-gray-500">
                {t('dashboard.loading') || 'Loading...'}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white">
                        {activity.type === 'discount_used' ? '💰' : 
                         activity.type === 'partner_visit' ? '🏪' :
                         activity.type === 'points_earned' ? '⭐' : '🎯'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
                      </div>
                    </div>
                    {activity.points && (
                      <span className="text-sm font-medium text-green-600">+{activity.points} pts</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t('dashboard.noActivity') || 'No activity yet'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">{t('dashboard.favoritePartners') || 'Favorite Partners'}</h2>
            {loadingFavorites ? (
              <div className="text-center py-8 text-gray-500">
                {t('dashboard.loading') || 'Loading...'}
              </div>
            ) : favorites && favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900">{favorite.partnerName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{favorite.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">{favorite.discount}% OFF</span>
                      {favorite.lastVisited && (
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(favorite.lastVisited)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t('dashboard.noFavorites') || 'No favorite partners yet'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">{t('dashboard.achievements') || 'Achievements'}</h2>
            {loadingAchievements ? (
              <div className="text-center py-8 text-gray-500">
                {t('dashboard.loading') || 'Loading...'}
              </div>
            ) : achievements && achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`border rounded-xl p-4 ${
                      achievement.unlockedAt
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50 opacity-75'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        {achievement.target && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                            />
                          </div>
                        )}
                        {achievement.unlockedAt && (
                          <p className="text-xs text-green-600 mt-2">
                            {t('dashboard.unlockedOn') || 'Unlocked on'} {formatDate(achievement.unlockedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t('dashboard.noAchievements') || 'No achievements yet'}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}