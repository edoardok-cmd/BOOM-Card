import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

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
    phone: user?.phone || ''
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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleUpdatePersonalInfo = async (e) => {
    e.preventDefault();
    // TODO: Implement API call to update personal info
    alert(t('accountSettings.personal.updateSuccess') || 'Personal information updated successfully!');
  };

  const handleUpdateNotifications = async (e) => {
    e.preventDefault();
    // TODO: Implement API call to update notifications
    alert(t('accountSettings.notifications.updateSuccess') || 'Notification preferences updated!');
  };

  const handleDownloadData = async () => {
    setLoadingDownload(true);
    try {
      // TODO: Implement API call to download user data
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(t('accountSettings.privacy.downloadSuccess') || 'Your data has been downloaded successfully!');
    } finally {
      setLoadingDownload(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      t('accountSettings.privacy.deleteConfirm') || 
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setLoadingDelete(true);
    try {
      // TODO: Implement API call to delete account
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(t('accountSettings.privacy.deleteSuccess') || 'Account deletion requested. You will receive a confirmation email.');
      router.push('/');
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleConnectSocial = async (provider) => {
    // TODO: Implement OAuth flow
    alert(`Connecting to ${provider}...`);
  };

  const handleDisconnectSocial = async (provider) => {
    const confirmed = window.confirm(`Disconnect ${provider}?`);
    if (!confirmed) return;
    
    setConnectedAccounts(prev => ({
      ...prev,
      [provider.toLowerCase()]: { connected: false, userId: null, connectedAt: null }
    }));
  };

  const tabs = [
    { id: 'personal', name: t('accountSettings.tabs.personal') || 'Personal Info', icon: '👤' },
    { id: 'notifications', name: t('accountSettings.tabs.notifications') || 'Notifications', icon: '🔔' },
    { id: 'security', name: t('accountSettings.tabs.security') || 'Security', icon: '🔒' },
    { id: 'privacy', name: t('accountSettings.tabs.privacy') || 'Privacy', icon: '🛡️' },
    { id: 'connected', name: t('accountSettings.tabs.connected') || 'Connected Accounts', icon: '🔗' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{t('accountSettings.title') || 'Account Settings'} - BOOM Card</title>
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="flex items-center space-x-4">
              <SearchBar />
              <LanguageSwitcher />
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('accountSettings.title') || 'Account Settings'}</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <form onSubmit={handleUpdatePersonalInfo} className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">
                {t('accountSettings.personal.title') || 'Personal Information'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('accountSettings.personal.firstName') || 'First Name'}
                  </label>
                  <input
                    type="text"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('accountSettings.personal.lastName') || 'Last Name'}
                  </label>
                  <input
                    type="text"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('accountSettings.personal.email') || 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('accountSettings.personal.phone') || 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
              >
                {t('accountSettings.personal.update') || 'Update Information'}
              </button>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleUpdateNotifications} className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">
                {t('accountSettings.notifications.title') || 'Notification Preferences'}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {t('accountSettings.notifications.emailAlerts') || 'Email Alerts'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('accountSettings.notifications.emailAlertsDesc') || 'Receive important updates via email'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailAlerts}
                    onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
                    className="h-4 w-4 text-orange-600 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {t('accountSettings.notifications.smsAlerts') || 'SMS Alerts'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('accountSettings.notifications.smsAlertsDesc') || 'Get text messages for urgent notifications'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.smsAlerts}
                    onChange={(e) => setNotifications({...notifications, smsAlerts: e.target.checked})}
                    className="h-4 w-4 text-orange-600 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {t('accountSettings.notifications.pushNotifications') || 'Push Notifications'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('accountSettings.notifications.pushDesc') || 'Receive notifications on your device'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.pushNotifications}
                    onChange={(e) => setNotifications({...notifications, pushNotifications: e.target.checked})}
                    className="h-4 w-4 text-orange-600 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {t('accountSettings.notifications.marketingEmails') || 'Marketing Emails'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('accountSettings.notifications.marketingDesc') || 'Receive promotional offers and news'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.marketingEmails}
                    onChange={(e) => setNotifications({...notifications, marketingEmails: e.target.checked})}
                    className="h-4 w-4 text-orange-600 rounded"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
              >
                {t('accountSettings.notifications.save') || 'Save Preferences'}
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">
                {t('accountSettings.security.title') || 'Security Settings'}
              </h2>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2">
                    {t('accountSettings.security.password') || 'Change Password'}
                  </h3>
                  <button className="text-orange-600 hover:text-orange-700">
                    {t('accountSettings.security.changePassword') || 'Update password'}
                  </button>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2">
                    {t('accountSettings.security.twoFactor') || 'Two-Factor Authentication'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {t('accountSettings.security.twoFactorDesc') || 'Add an extra layer of security to your account'}
                  </p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    {t('accountSettings.security.enable2FA') || 'Enable 2FA'}
                  </button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">
                    {t('accountSettings.security.sessions') || 'Active Sessions'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {t('accountSettings.security.sessionsDesc') || 'Manage devices where you\'re signed in'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">
                {t('accountSettings.privacy.title') || 'Privacy Settings'}
              </h2>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium mb-2">
                    {t('accountSettings.privacy.dataDownload') || 'Download Your Data'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {t('accountSettings.privacy.dataDownloadDesc') || 'Get a copy of all your BOOM Card data'}
                  </p>
                  <button
                    onClick={handleDownloadData}
                    disabled={loadingDownload}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loadingDownload
                      ? t('accountSettings.privacy.downloading') || 'Downloading...'
                      : t('accountSettings.privacy.downloadData') || 'Download Data'
                    }
                  </button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2 text-red-600">
                    {t('accountSettings.privacy.deleteAccount') || 'Delete Account'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {t('accountSettings.privacy.deleteAccountDesc') || 'Permanently delete your account and all data'}
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loadingDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {loadingDelete
                      ? t('accountSettings.privacy.deleting') || 'Processing...'
                      : t('accountSettings.privacy.deleteAccountBtn') || 'Delete Account'
                    }
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Connected Accounts Tab */}
          {activeTab === 'connected' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">
                {t('accountSettings.connected.title') || 'Connected Accounts'}
              </h2>
              
              <div className="space-y-4">
                {/* Facebook */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      f
                    </div>
                    <div>
                      <h3 className="font-medium">Facebook</h3>
                      {connectedAccounts.facebook.connected && (
                        <p className="text-sm text-gray-500">
                          {t('accountSettings.connected.connectedAs') || 'Connected as'} {connectedAccounts.facebook.userId}
                        </p>
                      )}
                    </div>
                  </div>
                  {connectedAccounts.facebook.connected ? (
                    <button
                      onClick={() => handleDisconnectSocial('Facebook')}
                      className="text-red-600 hover:text-red-700"
                    >
                      {t('accountSettings.connected.disconnect') || 'Disconnect'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnectSocial('Facebook')}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      {t('accountSettings.connected.connect') || 'Connect'}
                    </button>
                  )}
                </div>
                
                {/* Instagram */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      i
                    </div>
                    <div>
                      <h3 className="font-medium">Instagram</h3>
                      {connectedAccounts.instagram.connected && (
                        <p className="text-sm text-gray-500">
                          {t('accountSettings.connected.connectedAs') || 'Connected as'} {connectedAccounts.instagram.userId}
                        </p>
                      )}
                    </div>
                  </div>
                  {connectedAccounts.instagram.connected ? (
                    <button
                      onClick={() => handleDisconnectSocial('Instagram')}
                      className="text-red-600 hover:text-red-700"
                    >
                      {t('accountSettings.connected.disconnect') || 'Disconnect'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnectSocial('Instagram')}
                      className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded hover:opacity-90"
                    >
                      {t('accountSettings.connected.connect') || 'Connect'}
                    </button>
                  )}
                </div>
                
                {/* Google */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white border-2 rounded-full flex items-center justify-center">
                      <span className="text-2xl">G</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Google</h3>
                      {connectedAccounts.google.connected && (
                        <p className="text-sm text-gray-500">
                          {t('accountSettings.connected.connectedAs') || 'Connected as'} {connectedAccounts.google.userId}
                        </p>
                      )}
                    </div>
                  </div>
                  {connectedAccounts.google.connected ? (
                    <button
                      onClick={() => handleDisconnectSocial('Google')}
                      className="text-red-600 hover:text-red-700"
                    >
                      {t('accountSettings.connected.disconnect') || 'Disconnect'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnectSocial('Google')}
                      className="bg-white border-2 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                    >
                      {t('accountSettings.connected.connect') || 'Connect'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}