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
    firstName,
    lastName,
    email,
    phone
  });
  
  const [notifications, setNotifications] = useState({
    emailAlerts,
    smsAlerts,
    pushNotifications,
    marketingEmails
  });

  // Connected accounts state
  const [connectedAccounts, setConnectedAccounts] = useState({
    facebook, userId, connectedAt,
    instagram, userId, connectedAt,
    google, userId, connectedAt
  });

  // Loading states
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http

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
        headers
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
      console.error('Failed to fetch connected accounts, error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Download user data
  const handleDownloadData = async () => {
    setLoadingDownload(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/download-data`, {
        headers
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
      console.error('Failed to download data, error);
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
        method,
        headers
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
      console.error('Failed to delete account, error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setLoadingDelete(false);
    }
  };

  // Connect social account
  const handleConnectSocial = async (provider) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/connect-social`, {
        method,
        headers
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body) }),
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
  const handleDisconnectSocial = async (provider) => {
    const confirmed = window.confirm(`Are you sure you want to disconnect your ${provider} account?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/disconnect-social/${provider.toLowerCase()}`, {
        method,
        headers
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

        {t('accountSettings.title')} - BOOM Card

      {/* Navigation */}

          {t('accountSettings.title')}
          {t('accountSettings.subtitle')}

                 setActiveTab('personal')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === 'personal'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover
                  }`}
                >
                  
                    👤
                    {t('accountSettings.personal')}

                 setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover
                  }`}
                >
                  
                    🔒
                    {t('accountSettings.security')}

                 setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover
                  }`}
                >
                  
                    🔔
                    {t('accountSettings.notifications')}

                 setActiveTab('billing')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === 'billing'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover
                  }`}
                >
                  
                    💳
                    {t('accountSettings.billing')}

                 setActiveTab('privacy')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === 'privacy'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover
                  }`}
                >
                  
                    🛡️
                    {t('accountSettings.privacy')}

          {/* Content */}
          
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                
                  {t('accountSettings.personalInfo')}

                          {t('accountSettings.firstName')}
                        
                         setPersonalInfo({...personalInfo, firstName)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus
                        />

                          {t('accountSettings.lastName')}
                        
                         setPersonalInfo({...personalInfo, lastName)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus
                        />

                        {t('accountSettings.email')}
                      
                       setPersonalInfo({...personalInfo, email)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus
                      />

                        {t('accountSettings.phone')}
                      
                       setPersonalInfo({...personalInfo, phone)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus
                      />

                       buttonHandlers.handleSaveChanges('personal information')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover
                      >
                        {t('accountSettings.saveChanges')}

              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                
                  {t('accountSettings.securitySettings')}

                      {t('accountSettings.changePassword')}

                            {t('accountSettings.currentPassword')}

                            {t('accountSettings.newPassword')}

                            {t('accountSettings.confirmPassword')}

                         buttonHandlers.handleChangePassword()}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover
                        >
                          {t('accountSettings.updatePassword')}

                      {t('accountSettings.twoFactorAuth')}
                      {t('accountSettings.twoFactorDesc')}
                       router.push('/profile#security')}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover
                      >
                        {t('accountSettings.enable2FA')}

              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                
                  {t('accountSettings.notificationPreferences')}

                        {t('accountSettings.emailAlerts')}
                        {t('accountSettings.emailAlertsDesc')}

                         setNotifications({...notifications, emailAlerts)}
                          className="sr-only peer"
                        />

                        {t('accountSettings.smsAlerts')}
                        {t('accountSettings.smsAlertsDesc')}

                         setNotifications({...notifications, smsAlerts)}
                          className="sr-only peer"
                        />

                        {t('accountSettings.pushNotifications')}
                        {t('accountSettings.pushNotificationsDesc')}

                         setNotifications({...notifications, pushNotifications)}
                          className="sr-only peer"
                        />

                        {t('accountSettings.marketingEmails')}
                        {t('accountSettings.marketingEmailsDesc')}

                         setNotifications({...notifications, marketingEmails)}
                          className="sr-only peer"
                        />

                       buttonHandlers.handleSaveChanges('notification preferences')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover
                      >
                        {t('accountSettings.savePreferences')}

              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                
                  {t('accountSettings.billingPayment')}

                        {t('accountSettings.currentPlan')}
                        
                          Premium

                      {t('accountSettings.nextBilling')}: March 15, 2024
                      €19.99/{t('accountSettings.month')}
                       router.push('/subscriptions')}
                        className="mt-4 text-blue-600 font-semibold hover
                      >
                        {t('accountSettings.changePlan')} →

                      {t('accountSettings.paymentMethod')}

                            VISA

                            •••• •••• •••• 4242
                            {t('accountSettings.expires')} 12/2025

                      {t('accountSettings.billingHistory')}

                            February 15, 2024
                            Premium Plan

                            €19.99

                            January 15, 2024
                            Premium Plan

                            €19.99

              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                
                  {t('accountSettings.privacySettings')}

                        ⚠️
                        {t('accountSettings.dataPrivacy')}
                      
                      {t('accountSettings.dataPrivacyDesc')}

                          {loadingDownload ? 'Downloading...' : `${t('accountSettings.downloadData')} →`}

                          {loadingDelete ? 'Processing...' : `${t('accountSettings.deleteAccount')} →`}

                      {t('accountSettings.connectedAccounts')}
                      {loadingAccounts ? (

                          Loading accounts...
                        
                      ) : (

                              📘
                              Facebook
                            
                             connectedAccounts.facebook.connected 
                                ? handleDisconnectSocial('facebook') 
                                : handleConnectSocial('facebook')
                              }
                              className={`font-semibold ${
                                connectedAccounts.facebook.connected
                                  ? 'text-red-600 hover
                                  : 'text-blue-600 hover
                              }`}
                            >
                              {connectedAccounts.facebook.connected 
                                ? `${t('accountSettings.disconnect')} ✓` 
                                : t('accountSettings.connect')
                              }

                              📷
                              Instagram
                            
                             connectedAccounts.instagram.connected 
                                ? handleDisconnectSocial('instagram') 
                                : handleConnectSocial('instagram')
                              }
                              className={`font-semibold ${
                                connectedAccounts.instagram.connected
                                  ? 'text-red-600 hover
                                  : 'text-blue-600 hover
                              }`}
                            >
                              {connectedAccounts.instagram.connected 
                                ? `${t('accountSettings.disconnect')} ✓` 
                                : t('accountSettings.connect')
                              }

                              🔷
                              Google
                            
                             connectedAccounts.google.connected 
                                ? handleDisconnectSocial('google') 
                                : handleConnectSocial('google')
                              }
                              className={`font-semibold ${
                                connectedAccounts.google.connected
                                  ? 'text-red-600 hover
                                  : 'text-blue-600 hover
                              }`}
                            >
                              {connectedAccounts.google.connected 
                                ? `${t('accountSettings.disconnect')} ✓` 
                                : t('accountSettings.connect')
                              }

                      )}

              )}

  );
}