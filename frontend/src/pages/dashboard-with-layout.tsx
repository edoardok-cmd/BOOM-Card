import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

// Import the same mock data and interfaces from the original dashboard
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
  }
];

export default function DashboardWithLayout() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Layout>
      <Head>
        <title>{t('dashboard.title')}</title>
        <meta name="description" content={t('dashboard.description')} />
      </Head>

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
              <h1 className="text-4xl font-bold mb-2">
                {t('dashboard.welcome')}, {user?.firstName || 'Member'}!
              </h1>
              <p className="text-white/80 text-lg">
                {t('dashboard.memberSince')} November 2023
              </p>
              <div className="flex items-center space-x-6 mt-4">
                <div>
                  <div className="text-3xl font-bold">€1,245</div>
                  <div className="text-white/70 text-sm">{t('dashboard.totalSaved')}</div>
                </div>
                <div className="h-12 w-px bg-white/30"></div>
                <div>
                  <div className="text-3xl font-bold">42</div>
                  <div className="text-white/70 text-sm">{t('dashboard.visitsThisYear')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'activity', 'favorites', 'achievements'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t(`dashboard.tabs.${tab}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Activity */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.recentActivity')}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${activity.bgColor} p-3 rounded-xl`}>
                        <span className="text-2xl">{activity.icon}</span>
                      </div>
                      <span className="text-gray-500 text-sm">{activity.date}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{activity.partner}</h3>
                    <p className="text-gray-600 text-sm mb-3">{activity.category}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-green-600 font-semibold">€{activity.saved} saved</div>
                      <div className="text-gray-500 text-sm">{activity.discount}% off</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}