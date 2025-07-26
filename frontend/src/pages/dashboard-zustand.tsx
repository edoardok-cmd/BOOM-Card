import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { usePartnerStore } from '../store/partnerStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useAuthCheck } from '../hooks/useAuthCheck';
import { useLanguage } from '../contexts/LanguageContext';
import Layout from '../components/Layout';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/format';

export default function DashboardZustand() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Authentication check
  useAuthCheck();
  
  // Zustand stores
  const { user } = useAuthStore();
  const { 
    stats, activities, achievements, qrCode,
    loadStats, loadActivities, loadAchievements, loadQrCode, regenerateQrCode,
    isStatsLoading, isActivitiesLoading, isAchievementsLoading, isQrLoading
  } = useUserStore();
  
  const { favorites, loadFavorites, isFavoritesLoading } = usePartnerStore();
  const { currentSubscription, loadCurrentSubscription, isSubscriptionLoading } = useSubscriptionStore();

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadStats();
      loadActivities();
      loadAchievements();
      loadFavorites();
      loadCurrentSubscription();
      loadQrCode();
    }
  }, [user]);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">{t('dashboard.thisMonth') || 'This month'}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isStatsLoading ? '...' : formatCurrency(stats?.totalSavings || 0)}
          </p>
          <p className="text-sm text-gray-600 mt-1">{t('dashboard.totalSavings') || 'Total Savings'}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">{t('dashboard.thisMonth') || 'This month'}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isStatsLoading ? '...' : stats?.visitsThisMonth || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">{t('dashboard.partnerVisits') || 'Partner Visits'}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">{t('dashboard.lifetime') || 'Lifetime'}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isStatsLoading ? '...' : user?.discountsUsed || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">{t('dashboard.discountsUsed') || 'Discounts Used'}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">{t('dashboard.current') || 'Current'}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isStatsLoading ? '...' : stats?.pointsBalance || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">{t('dashboard.pointsBalance') || 'Points Balance'}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('dashboard.recentActivity') || 'Recent Activity'}
        </h3>
        {isActivitiesLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'discount_used' ? 'bg-green-100' :
                  activity.type === 'partner_visit' ? 'bg-blue-100' :
                  'bg-purple-100'
                }`}>
                  {activity.type === 'discount_used' && (
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {activity.type === 'partner_visit' && (
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  )}
                  {activity.type === 'points_earned' && (
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(activity.timestamp)}
                    {activity.points && ` • +${activity.points} points`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {t('dashboard.noRecentActivity') || 'No recent activity'}
          </p>
        )}
      </div>
    </div>
  );

  const renderMembershipTab = () => (
    <div className="space-y-6">
      {/* Membership Card */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              {user?.membershipType?.toUpperCase()} {t('dashboard.member') || 'Member'}
            </h3>
            <p className="text-orange-100">
              {t('dashboard.memberSince') || 'Member since'} {formatDate(user?.joinedDate || new Date())}
            </p>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <p className="text-sm">{t('dashboard.memberNumber') || 'Member #'}</p>
            <p className="font-mono font-bold">{user?.id?.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        
        {currentSubscription && (
          <div className="space-y-2">
            <p className="text-sm text-orange-100">
              {t('dashboard.validUntil') || 'Valid until'}: {formatDate(currentSubscription.endDate)}
            </p>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                {currentSubscription.status === 'active' ? t('dashboard.active') || 'Active' : t('dashboard.expired') || 'Expired'}
              </span>
              {currentSubscription.autoRenew && (
                <span className="text-sm text-orange-100">
                  {t('dashboard.autoRenewOn') || 'Auto-renew ON'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('dashboard.membershipQR') || 'Membership QR Code'}
          </h3>
          <button
            onClick={regenerateQrCode}
            disabled={isQrLoading}
            className="text-sm text-orange-600 hover:text-orange-700 disabled:opacity-50"
          >
            {t('dashboard.regenerate') || 'Regenerate'}
          </button>
        </div>
        
        <div className="flex justify-center">
          {isQrLoading ? (
            <div className="w-64 h-64 bg-gray-100 animate-pulse rounded-lg"></div>
          ) : qrCode ? (
            <img src={qrCode} alt="Membership QR Code" className="w-64 h-64" />
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">{t('dashboard.noQrCode') || 'No QR code available'}</p>
            </div>
          )}
        </div>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          {t('dashboard.showQrAtPartner') || 'Show this code at partner locations to claim your discount'}
        </p>
      </div>
    </div>
  );

  return (
    <Layout>
      <Head>
        <title>{t('dashboard.title') || 'Dashboard'} - BOOM Card</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.welcome') || 'Welcome back'}, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            {t('dashboard.subtitle') || 'Track your savings and manage your membership'}
          </p>
        </div>

        {/* Tab Navigation */}
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
              onClick={() => setActiveTab('membership')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'membership'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('dashboard.membership') || 'Membership'}
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
              {achievements.filter(a => !a.unlockedAt).length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {achievements.filter(a => !a.unlockedAt).length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'membership' && renderMembershipTab()}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isAchievementsLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))
            ) : (
              achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`bg-white rounded-xl shadow-sm p-6 ${
                    achievement.unlockedAt ? '' : 'opacity-60'
                  }`}
                >
                  <div className="text-3xl mb-4">{achievement.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-1">{achievement.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  
                  {achievement.unlockedAt ? (
                    <p className="text-xs text-green-600">
                      {t('dashboard.unlockedOn') || 'Unlocked on'} {formatDate(achievement.unlockedAt)}
                    </p>
                  ) : (
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all"
                          style={{ width: `${(achievement.progress / (achievement.target || 100)) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {achievement.progress} / {achievement.target || 100}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}