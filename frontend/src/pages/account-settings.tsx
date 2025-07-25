import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { buttonHandlers } from '../utils/navigation';

export default function AccountSettings() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  
  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: ''
  });
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    marketingEmails: false
  });

  // Connected accounts state
  const [connectedAccounts, setConnectedAccounts] = useState({
    facebook: { connected: false, userId: null, connectedAt: null },
    instagram: { connected: false, userId: null, connectedAt: null },
    google: { connected: false, userId: null, connectedAt: null }
  });

  // Loading states
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  // Fetch connected accounts on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchConnectedAccounts();
    }
  }, []);

  // Fetch connected accounts
  const fetchConnectedAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/connected-accounts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setConnectedAccounts(result.data);
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch connected accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Download user data
  const handleDownloadData = async () => {
    setLoadingDownload(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/download-data`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `boom-card-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        alert('Your data has been downloaded successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to download data');
      }
    } catch (error) {
      console.error('Failed to download data:', error);
      alert('Failed to download data. Please try again.');
    } finally {
      setLoadingDownload(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone. Your account will be permanently deleted within 30 days.'
    );
    
    if (!confirmed) return;

    setLoadingDelete(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        // Optionally redirect to logout or home page
        router.push('/');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setLoadingDelete(false);
    }
  };

  // Connect social account
  const handleConnectSocial = async (provider: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/connect-social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ provider: provider.toLowerCase() }),
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        // Refresh connected accounts
        fetchConnectedAccounts();
      } else {
        const error = await response.json();
        alert(error.message || `Failed to connect ${provider}`);
      }
    } catch (error) {
      console.error(`Failed to connect ${provider}:`, error);
      alert(`Failed to connect ${provider}. Please try again.`);
    }
  };

  // Disconnect social account
  const handleDisconnectSocial = async (provider: string) => {
    const confirmed = window.confirm(`Are you sure you want to disconnect your ${provider} account?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/disconnect-social/${provider.toLowerCase()}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        // Refresh connected accounts
        fetchConnectedAccounts();
      } else {
        const error = await response.json();
        alert(error.message || `Failed to disconnect ${provider}`);
      }
    } catch (error) {
      console.error(`Failed to disconnect ${provider}:`, error);
      alert(`Failed to disconnect ${provider}. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{t('accountSettings.title')} - BOOM Card</title>
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
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-1">
                <a href="/" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('nav.home')}</a>
                <a href="/partners" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('nav.partners')}</a>
                <a href="/subscriptions" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('nav.plans')}</a>
                <a href="/dashboard" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('nav.dashboard')}</a>
                <a href="/profile" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('nav.profile')}</a>
                <div className="pl-4 ml-4 border-l border-gray-200 flex items-center space-x-3">
                  <SearchBar />
                  <LanguageSwitcher />
                  <UserProfileDropdown />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('accountSettings.title')}</h1>
          <p className="text-gray-600 mt-2">{t('accountSettings.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <nav className="space-y-1 p-4">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === 'personal'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">👤</span>
                    {t('accountSettings.personal')}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">🔒</span>
                    {t('accountSettings.security')}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">🔔</span>
                    {t('accountSettings.notifications')}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === 'billing'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">💳</span>
                    {t('accountSettings.billing')}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === 'privacy'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">🛡️</span>
                    {t('accountSettings.privacy')}
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('accountSettings.personalInfo')}</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('accountSettings.firstName')}
                        </label>
                        <input
                          type="text"
                          value={personalInfo.firstName}
                          onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('accountSettings.lastName')}
                        </label>
                        <input
                          type="text"
                          value={personalInfo.lastName}
                          onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('accountSettings.email')}
                      </label>
                      <input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('accountSettings.phone')}
                      </label>
                      <input
                        type="tel"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <button 
                        onClick={() => buttonHandlers.handleSaveChanges('personal information')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        {t('accountSettings.saveChanges')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('accountSettings.securitySettings')}</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('accountSettings.changePassword')}</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('accountSettings.currentPassword')}
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('accountSettings.newPassword')}
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('accountSettings.confirmPassword')}
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button 
                          onClick={() => buttonHandlers.handleChangePassword()}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          {t('accountSettings.updatePassword')}
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('accountSettings.twoFactorAuth')}</h3>
                      <p className="text-gray-600 mb-4">{t('accountSettings.twoFactorDesc')}</p>
                      <button 
                        onClick={() => router.push('/profile#security')}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        {t('accountSettings.enable2FA')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('accountSettings.notificationPreferences')}</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h3 className="font-semibold text-gray-900">{t('accountSettings.emailAlerts')}</h3>
                        <p className="text-sm text-gray-600">{t('accountSettings.emailAlertsDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailAlerts}
                          onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h3 className="font-semibold text-gray-900">{t('accountSettings.smsAlerts')}</h3>
                        <p className="text-sm text-gray-600">{t('accountSettings.smsAlertsDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.smsAlerts}
                          onChange={(e) => setNotifications({...notifications, smsAlerts: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div>
                        <h3 className="font-semibold text-gray-900">{t('accountSettings.pushNotifications')}</h3>
                        <p className="text-sm text-gray-600">{t('accountSettings.pushNotificationsDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.pushNotifications}
                          onChange={(e) => setNotifications({...notifications, pushNotifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{t('accountSettings.marketingEmails')}</h3>
                        <p className="text-sm text-gray-600">{t('accountSettings.marketingEmailsDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.marketingEmails}
                          onChange={(e) => setNotifications({...notifications, marketingEmails: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="pt-4">
                      <button 
                        onClick={() => buttonHandlers.handleSaveChanges('notification preferences')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        {t('accountSettings.savePreferences')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('accountSettings.billingPayment')}</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-gold-50 to-gold-100 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{t('accountSettings.currentPlan')}</h3>
                        <span className="px-4 py-2 bg-gold-500 text-white rounded-full text-sm font-semibold">
                          Premium
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{t('accountSettings.nextBilling')}: March 15, 2024</p>
                      <p className="text-2xl font-bold text-gray-900">€19.99/{t('accountSettings.month')}</p>
                      <button 
                        onClick={() => router.push('/subscriptions')}
                        className="mt-4 text-blue-600 font-semibold hover:text-blue-700"
                      >
                        {t('accountSettings.changePlan')} →
                      </button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('accountSettings.paymentMethod')}</h3>
                      <div className="bg-gray-50 p-6 rounded-xl flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-16 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                            VISA
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-600">{t('accountSettings.expires')} 12/2025</p>
                          </div>
                        </div>
                        <button className="text-blue-600 font-semibold hover:text-blue-700">
                          {t('accountSettings.update')}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('accountSettings.billingHistory')}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="font-medium text-gray-900">February 15, 2024</p>
                            <p className="text-sm text-gray-600">Premium Plan</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">€19.99</p>
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">{t('accountSettings.downloadInvoice')}</a>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="font-medium text-gray-900">January 15, 2024</p>
                            <p className="text-sm text-gray-600">Premium Plan</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">€19.99</p>
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">{t('accountSettings.downloadInvoice')}</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('accountSettings.privacySettings')}</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">⚠️</span>
                        <h3 className="text-lg font-semibold text-gray-900">{t('accountSettings.dataPrivacy')}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{t('accountSettings.dataPrivacyDesc')}</p>
                      <div className="space-y-3">
                        <button 
                          onClick={handleDownloadData}
                          disabled={loadingDownload}
                          className="text-blue-600 font-semibold hover:text-blue-700 disabled:opacity-50"
                        >
                          {loadingDownload ? 'Downloading...' : `${t('accountSettings.downloadData')} →`}
                        </button>
                        <br />
                        <button 
                          onClick={handleDeleteAccount}
                          disabled={loadingDelete}
                          className="text-red-600 font-semibold hover:text-red-700 disabled:opacity-50"
                        >
                          {loadingDelete ? 'Processing...' : `${t('accountSettings.deleteAccount')} →`}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('accountSettings.connectedAccounts')}</h3>
                      {loadingAccounts ? (
                        <div className="text-center py-4">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <p className="mt-2 text-gray-600">Loading accounts...</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">📘</span>
                              <span className="font-medium text-gray-900">Facebook</span>
                            </div>
                            <button 
                              onClick={() => connectedAccounts.facebook.connected 
                                ? handleDisconnectSocial('facebook') 
                                : handleConnectSocial('facebook')
                              }
                              className={`font-semibold ${
                                connectedAccounts.facebook.connected
                                  ? 'text-red-600 hover:text-red-700'
                                  : 'text-blue-600 hover:text-blue-700'
                              }`}
                            >
                              {connectedAccounts.facebook.connected 
                                ? `${t('accountSettings.disconnect')} ✓` 
                                : t('accountSettings.connect')
                              }
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">📷</span>
                              <span className="font-medium text-gray-900">Instagram</span>
                            </div>
                            <button 
                              onClick={() => connectedAccounts.instagram.connected 
                                ? handleDisconnectSocial('instagram') 
                                : handleConnectSocial('instagram')
                              }
                              className={`font-semibold ${
                                connectedAccounts.instagram.connected
                                  ? 'text-red-600 hover:text-red-700'
                                  : 'text-blue-600 hover:text-blue-700'
                              }`}
                            >
                              {connectedAccounts.instagram.connected 
                                ? `${t('accountSettings.disconnect')} ✓` 
                                : t('accountSettings.connect')
                              }
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">🔷</span>
                              <span className="font-medium text-gray-900">Google</span>
                            </div>
                            <button 
                              onClick={() => connectedAccounts.google.connected 
                                ? handleDisconnectSocial('google') 
                                : handleConnectSocial('google')
                              }
                              className={`font-semibold ${
                                connectedAccounts.google.connected
                                  ? 'text-red-600 hover:text-red-700'
                                  : 'text-blue-600 hover:text-blue-700'
                              }`}
                            >
                              {connectedAccounts.google.connected 
                                ? `${t('accountSettings.disconnect')} ✓` 
                                : t('accountSettings.connect')
                              }
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}