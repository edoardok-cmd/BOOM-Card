import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SearchBar from '../components/SearchBar';
import UserProfileDropdown from '../components/UserProfileDropdown';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

const recentActivity = [
  {
    id,
    partner,
    category,
    icon,
    saved,
    discount,
    date,
    color,
    bgColor
  },
  {
    id,
    partner,
    category,
    icon,
    saved,
    discount,
    date,
    color,
    bgColor
  },
  {
    id,
    partner,
    category,
    icon,
    saved,
    discount,
    date,
    color,
    bgColor
  },
  {
    id,
    partner,
    category,
    icon,
    saved,
    discount,
    date,
    color,
    bgColor
  }
];

const favoritePartners = [
  {
    name,
    icon,
    visits,
    totalSaved,
    color,
    bgColor
  },
  {
    name,
    icon,
    visits,
    totalSaved,
    color,
    bgColor
  },
  {
    name,
    icon,
    visits,
    totalSaved,
    color,
    bgColor
  },
  {
    name,
    icon,
    visits,
    totalSaved,
    color,
    bgColor
  }
];

const achievements = [
  {
    titleKey,
    descriptionKey,
    icon,
    earned,
    progress
  },
  {
    titleKey,
    descriptionKey,
    icon,
    earned,
    progress
  },
  {
    titleKey,
    descriptionKey,
    icon,
    earned,
    progress
  },
  {
    titleKey,
    descriptionKey,
    icon,
    earned,
    progress
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFrame, setTimeFrame] = useState('month');
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [userActivities, setUserActivities] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [userFavorites, setUserFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [userStats, setUserStats] = useState({ totalSaved, visitsThisYear);
  const [loadingStats, setLoadingStats] = useState(false);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http

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
        headers
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
      console.error('Failed to fetch QR code, error);
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
        headers
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
      console.error('Failed to fetch user activity, error);
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
        headers
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
      console.error('Failed to fetch user favorites, error);
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
        headers
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
      console.error('Failed to fetch user achievements, error);
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
        headers
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setUserStats({
            totalSaved,
            visitsThisYear
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch user stats, error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (

        {t('dashboard.title')}

      {/* Navigation */}

                {t('dashboard.nav.dashboard')}

      {/* Hero Section */}

                  {t('dashboard.hero.memberBadge')}

                  {user ? `${user.firstName} ${user.lastName}!` : 'User!'}

                {t('dashboard.hero.subtitle')}

            {/* Quick Stats */}

                  {loadingStats ? '...' : `€${userStats.totalSaved}`}
                
                {t('dashboard.hero.totalSaved')}

                  {loadingStats ? '...' : userStats.visitsThisYear}
                
                {t('dashboard.hero.visitsThisYear')}

      {/* Tab Navigation */}

            {[
              { id, name), icon,
              { id, name), icon,
              { id, name), icon,
              { id, name), icon
            ].map((tab) => (
               setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover
                }`}
              >
                {tab.icon}
                {tab.name}
              
            ))}

      {/* Dashboard Content */}

              {/* Time Frame Filter */}
              
                {t('dashboard.overview.title')}
                
                  {['week', 'month', 'year'].map((period) => (
                     setTimeFrame(period)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        timeFrame === period
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover
                      }`}
                    >
                      {t(`dashboard.overview.${period}`)}
                    
                  ))}

              {/* Enhanced Stats Cards */}

                      💰

                      {t('dashboard.overview.vsLastMonth')}

                  €1,847
                  {t('dashboard.overview.totalSavedYear')}
                  {t('dashboard.overview.averageMonth')}

                      🎯

                      {t('dashboard.overview.thisWeek')}

                  52
                  {t('dashboard.overview.partnerVisits')}
                  {t('dashboard.overview.acrossLocations')}

                      🔥

                      {t('dashboard.overview.premium')}

                  24%
                  {t('dashboard.overview.averageDiscount')}
                  {t('dashboard.overview.upToAvailable')}

                      🏆

                      {t('dashboard.overview.newAchievements')}

                  8
                  {t('dashboard.overview.achievements')}
                  {t('dashboard.overview.moreToUnlock')}

              {/* Quick Actions */}

                    {t('dashboard.card.title')}

                        {t('dashboard.card.premiumMember')}
                        {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}

                        B

                        {t('dashboard.card.memberId')}
                        BC-2024-5847

                        {t('dashboard.card.validUntil')}
                        12/2024

                      {loadingQr ? (

                      ) : qrCodeUrl ? (
                        
                      ) : (
                        
                          QR CODE
                        
                      )}

                      {t('dashboard.card.qrCodeText')}

                {/* Quick Stats */}
                
                  {t('dashboard.highlights.title')}

                          👍

                          {t('dashboard.highlights.bestMonth')}
                          {t('dashboard.highlights.highestSavings')}

                        €387
                        {t('dashboard.highlights.saved')}

                          🎆

                          {t('dashboard.highlights.newDiscovery')}
                          {t('dashboard.highlights.newPartners')}

                        5
                        {t('dashboard.highlights.locations')}

                          ⭐

                          {t('dashboard.highlights.vipProgress')}
                          {t('dashboard.highlights.towardsVip')}

                        75%
                        {t('dashboard.highlights.complete')}

          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            
              {t('dashboard.activity.title')}
              
              {loadingActivity ? (

                  Loading your activity...
                
              ) === 0 ? (
                
                  📊
                  No Recent Activity
                  Start using your BOOM Card to see your activity here!
                
              ) : (
                userActivities.map((activity) => (

                          {activity.icon}

                          {activity.partner}
                          {activity.category}
                          
                            {activity.date}
                            
                              {activity.discount}% OFF

                        €{activity.saved}
                        {t('dashboard.activity.saved')}

                ))
              )}
            
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            
              {t('dashboard.favorites.title')}
              
              {loadingFavorites ? (

                  Loading your favorites...
                
              ) === 0 ? (
                
                  💝
                  No Favorites Yet
                  Visit and review partners to see your favorites here!
                
              ) : (
                 (

                            {partner.icon}

                            {partner.name}
                            {partner.visits} {t('dashboard.favorites.visits')}

                          €{partner.totalSaved}
                          {t('dashboard.favorites.totalSaved')}
                        
                         router.push(`/partners/${partner.slug}`)}
                          className={`bg-gradient-to-r ${partner.color} text-white px-6 py-3 rounded-xl font-semibold shadow-md hover
                          {t('dashboard.favorites.visitAgain')}

                  ))}
                
              )}
            
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            
              {t('dashboard.achievements.title')}
              
              {loadingAchievements ? (

                  Loading your achievements...
                
              ) === 0 ? (
                
                  🏆
                  No Achievements Yet
                  Start using your BOOM Card to unlock achievements!
                
              ) : (
                 (

                            {achievement.icon}

                            {t(achievement.titleKey)}
                            {t(achievement.descriptionKey)}

                        {achievement.earned && (
                          
                            {t('dashboard.achievements.earned')}
                          
                        )}

                      {!achievement.earned && (

                            {t('dashboard.achievements.progress')}
                            {achievement.progress}%

                      )}
                    
                  ))}
                
              )}
            
          )}

  );
}