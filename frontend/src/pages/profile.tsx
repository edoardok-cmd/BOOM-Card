import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import Logo from '../components/Logo';
import MobileMenu from '../components/MobileMenu';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
  const [reviewData, setReviewData] = useState({
    rating: 5,
    partner: '',
    content: ''
  });
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userData, setUserData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    birthDate: '',
    address: '',
    memberSince: '',
    membershipType: user?.membershipType || 'Basic',
    cardNumber: '',
    validUntil: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newsletterSubscription: true,
    partnerUpdates: true,
    language: 'en',
    currency: 'BGN'
  });

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          birthDate: userData.birthDate,
          address: userData.address,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update local state with the response data
        if (result.data) {
          setUserData(prev => ({
            ...prev,
            ...result.data,
          }));
        }
        setIsEditing(false);
        // You could show a success notification here
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Show QR code modal or redirect to 2FA setup page
        alert(language === 'bg' 
          ? 'Двуфакторната автентикация е активирана успешно! Моля, конфигурирайте вашето приложение за автентикация.'
          : '2FA has been enabled successfully! Please configure your authenticator app.');
        
        // In a real implementation, you would show a QR code here
        console.log('2FA Secret:', result.data?.secret);
        console.log('QR Code URL:', result.data?.qrCodeUrl);
      } else {
        const error = await response.json();
        alert(error.message || (language === 'bg' ? 'Неуспешно активиране на 2FA' : 'Failed to enable 2FA'));
      }
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      alert(language === 'bg' ? 'Неуспешно активиране на 2FA' : 'Failed to enable 2FA');
    }
  };

  // Handle navigation from homepage with hash
  useEffect(() => {
    if (router.asPath.includes('#reviews')) {
      setActiveSection('reviews');
    }
  }, [router.asPath]);

  // Update userData when user object changes
  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        membershipType: user.membershipType || prev.membershipType,
      }));
    }
  }, [user]);

  // Check authentication and redirect if needed
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  // Fetch user profile on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    }
  }, []);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setUserData(prev => ({
            ...prev,
            firstName: result.data.firstName || prev.firstName,
            lastName: result.data.lastName || prev.lastName,
            email: result.data.email || prev.email,
            phone: result.data.phone || prev.phone,
            birthDate: result.data.birthDate ? result.data.birthDate.split('T')[0] : prev.birthDate,
            address: result.data.address || prev.address,
            membershipType: result.data.membershipType || prev.membershipType,
            cardNumber: result.data.cardNumber || prev.cardNumber,
            validUntil: result.data.validUntil ? new Date(result.data.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }).replace(/\//g, '/') : '',
            memberSince: result.data.memberSince ? new Date(result.data.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : prev.memberSince,
          }));
        }
        setProfileLoading(false);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setProfileLoading(false);
    }
  };

  // Fetch user reviews
  const fetchUserReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setUserReviews(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Fetch reviews when component mounts or section changes
  useEffect(() => {
    if (activeSection === 'reviews') {
      fetchUserReviews();
    }
  }, [activeSection]);

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to submit a review');
        setSubmittingReview(false);
        return;
      }

      // Validate partner selection
      if (!reviewData.partner) {
        alert('Please select a partner to review');
        setSubmittingReview(false);
        return;
      }

      // Validate review content length
      if (reviewData.content.length < 10) {
        alert('Review content must be at least 10 characters long');
        setSubmittingReview(false);
        return;
      }

      // Map partner ID to partner name
      const partnerNames: { [key: string]: string } = {
        'restaurant-paradise': 'Restaurant Paradise',
        'fitness-first-gym': 'Fitness First Gym',
        'spa-relaxation-center': 'Spa Relaxation Center',
        'coffee-central': 'Coffee Central',
        'emerald-resort-spa': 'Emerald Resort & Spa',
        'marina-bay-restaurant': 'Marina Bay Restaurant'
      };
      const partnerName = partnerNames[reviewData.partner] || reviewData.partner;

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          partnerId: reviewData.partner,
          partnerName: partnerName,
          rating: reviewData.rating,
          content: reviewData.content,
        }),
      });

      if (response.ok) {
        // Review submitted successfully
        setShowReviewForm(false);
        setReviewData({ rating: 5, partner: '', content: '' });
        alert('Review submitted successfully!');
        // Refresh reviews list
        fetchUserReviews();
      } else {
        const error = await response.json();
        console.error('Review submission failed:', error);
        if (error.error === 'INVALID_TOKEN') {
          alert('Your session has expired. Please log in again.');
        } else if (error.details && Array.isArray(error.details)) {
          const validationErrors = error.details.map((detail: any) => detail.msg).join(', ');
          alert(`Validation error: ${validationErrors}`);
        } else {
          alert(error.message || 'Failed to submit review');
        }
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      console.error('Review data:', reviewData);
      console.error('API URL:', API_BASE_URL);
      alert('Failed to submit review. Please check your internet connection and try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Show loading state while checking authentication
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>{t('profile.title')}</title>
        <meta name="description" content={t('profile.description')} />
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
                <a href="/" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('profile.nav.home')}</a>
                <a href="/partners" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('profile.nav.partners')}</a>
                <a href="/subscriptions" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('profile.nav.plans')}</a>
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
      <div className="relative overflow-hidden py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-32 h-32 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-5xl font-bold text-white">AS</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {userData.firstName} {userData.lastName}
                </h1>
                <p className="text-blue-100 text-lg">{t('profile.hero.premiumMember')} {userData.memberSince}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gold-400/20 text-gold-200 border border-gold-400/30">
                    <span className="w-2 h-2 bg-gold-400 rounded-full mr-2 animate-pulse"></span>
                    {userData.membershipType} {t('profile.hero.member')}
                  </span>
                  <span className="text-blue-200 text-sm">ID: {userData.cardNumber}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 font-bold py-3 px-6 rounded-xl transition-all"
            >
              {isEditing ? t('profile.hero.saveChanges') : t('profile.hero.editProfile')}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <nav className="space-y-2">
                {[
                  { id: 'personal', nameKey: 'profile.sidebar.personalInfo', icon: '👤' },
                  { id: 'membership', nameKey: 'profile.sidebar.membership', icon: '💳' },
                  { id: 'preferences', nameKey: 'profile.sidebar.preferences', icon: '⚙️' },
                  { id: 'security', nameKey: 'profile.sidebar.security', icon: '🔒' },
                  { id: 'billing', nameKey: 'profile.sidebar.billing', icon: '💰' },
                  { id: 'reviews', nameKey: 'profile.sidebar.reviews', icon: '⭐' }
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3">{section.icon}</span>
                    {t(section.nameKey)}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Personal Information */}
              {activeSection === 'personal' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.personal.title')}</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.personal.firstName')}</label>
                      <input
                        type="text"
                        value={userData.firstName}
                        onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.personal.lastName')}</label>
                      <input
                        type="text"
                        value={userData.lastName}
                        onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.personal.email')}</label>
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.personal.phone')}</label>
                      <input
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.personal.birthDate')}</label>
                      <input
                        type="date"
                        value={userData.birthDate}
                        onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.personal.address')}</label>
                      <input
                        type="text"
                        value={userData.address}
                        onChange={(e) => setUserData({...userData, address: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                  {isEditing && (
                    <div className="mt-6 flex space-x-4">
                      <button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                      >
                        {t('profile.personal.saveChanges')}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
                      >
                        {t('profile.personal.cancel')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Membership Section */}
              {activeSection === 'membership' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.membership.title')}</h2>
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{userData.membershipType} {t('profile.membership.membership')}</h3>
                        <p className="text-blue-100 mb-4">{t('profile.membership.memberSince')} {userData.memberSince}</p>
                        <div className="space-y-2">
                          <p><span className="text-blue-200">{t('profile.membership.cardNumber')}</span> {userData.cardNumber}</p>
                          <p><span className="text-blue-200">{t('profile.membership.validUntil')}</span> {userData.validUntil}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold mb-2">€19.99</div>
                        <div className="text-blue-200">{t('profile.membership.perMonth')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">€1,847</div>
                      <div className="text-gray-600">{t('profile.membership.totalSaved')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">52</div>
                      <div className="text-gray-600">{t('profile.membership.partnerVisits')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">24%</div>
                      <div className="text-gray-600">{t('profile.membership.avgDiscount')}</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                      {t('profile.membership.upgradeToVip')}
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Section */}
              {activeSection === 'preferences' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.preferences.title')}</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.preferences.notifications')}</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.emailNotifications}
                            onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-700">{t('profile.preferences.emailNotifications')}</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.smsNotifications}
                            onChange={(e) => setPreferences({...preferences, smsNotifications: e.target.checked})}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-700">{t('profile.preferences.smsNotifications')}</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.newsletterSubscription}
                            onChange={(e) => setPreferences({...preferences, newsletterSubscription: e.target.checked})}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-700">{t('profile.preferences.newsletterSubscription')}</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.partnerUpdates}
                            onChange={(e) => setPreferences({...preferences, partnerUpdates: e.target.checked})}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-700">{t('profile.preferences.partnerUpdates')}</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.preferences.regionalSettings')}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.preferences.language')}</label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="en">{t('profile.preferences.english')}</option>
                            <option value="bg">{t('profile.preferences.bulgarian')}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.preferences.currency')}</label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="BGN">BGN (лв)</option>
                            <option value="EUR">EUR (€)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.security.title')}</h2>
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <p className="text-yellow-800">{t('profile.security.twoFactorWarning')}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            console.log('2FA button clicked');
                            handleEnable2FA();
                          }}
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer focus:outline-none focus:ring-4 focus:ring-yellow-300"
                          style={{ minWidth: '150px' }}>
                          {t('accountSettings.enable2FA') || 'Enable 2FA'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.security.changePassword')}</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.security.currentPassword')}</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.security.newPassword')}</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.security.confirmNewPassword')}</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                          {t('profile.security.updatePassword')}
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.security.loginHistory')}</h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Chrome on macOS</p>
                              <p className="text-sm text-gray-500">Sofia, Bulgaria • 192.168.1.1</p>
                            </div>
                            <p className="text-sm text-gray-500">2 hours ago</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Mobile App on iOS</p>
                              <p className="text-sm text-gray-500">Sofia, Bulgaria • 192.168.1.2</p>
                            </div>
                            <p className="text-sm text-gray-500">Yesterday</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Section */}
              {activeSection === 'billing' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.billing.title')}</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.billing.paymentMethod')}</h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-16 h-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg mr-4"></div>
                            <div>
                              <p className="font-medium">•••• •••• •••• 4242</p>
                              <p className="text-sm text-gray-500">{t('profile.billing.expires')} 12/2025</p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 font-medium">{t('profile.billing.update')}</button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.billing.billingHistory')}</h3>
                      <div className="space-y-3">
                        {[
                          { date: '2024-07-01', amount: '€19.99', status: 'Paid' },
                          { date: '2024-06-01', amount: '€19.99', status: 'Paid' },
                          { date: '2024-05-01', amount: '€19.99', status: 'Paid' }
                        ].map((invoice, index) => (
                          <div key={index} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{invoice.date}</p>
                              <p className="text-sm text-gray-500">{t('profile.billing.premiumMembership')}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-lg font-semibold">{invoice.amount}</span>
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">{t('profile.billing.paid')}</span>
                              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">{t('profile.billing.download')}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              {activeSection === 'reviews' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.reviews.title')}</h2>
                  
                  {!showReviewForm ? (
                    <div>
                      {/* Your Reviews */}
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">{t('profile.reviews.yourReviews')}</h3>
                          <button 
                            onClick={() => setShowReviewForm(true)}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                            {t('profile.reviews.writeReview')}
                          </button>
                        </div>
                        
                        {/* Placeholder for existing reviews */}
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-xl p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-semibold text-gray-900">The Sofia Grand</h4>
                                <div className="flex items-center mt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className="text-yellow-400">★</span>
                                  ))}
                                  <span className="ml-2 text-sm text-gray-500">2 weeks ago</span>
                                </div>
                              </div>
                              <button className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-gray-600">
                              Excellent dining experience! The 30% discount made this Michelin-starred restaurant affordable. Service was impeccable.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Review Form */
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">{t('profile.reviews.writeNewReview')}</h3>
                        <button 
                          onClick={() => setShowReviewForm(false)}
                          className="text-gray-500 hover:text-gray-700">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <form onSubmit={handleSubmitReview}>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('profile.reviews.selectPartner')}
                            </label>
                            <select 
                              value={reviewData.partner}
                              onChange={(e) => setReviewData({...reviewData, partner: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required>
                              <option value="">{t('profile.reviews.choosePlaceholder')}</option>
                              <option value="restaurant-paradise">Restaurant Paradise</option>
                              <option value="fitness-first-gym">Fitness First Gym</option>
                              <option value="spa-relaxation-center">Spa Relaxation Center</option>
                              <option value="coffee-central">Coffee Central</option>
                              <option value="emerald-resort-spa">Emerald Resort & Spa</option>
                              <option value="marina-bay-restaurant">Marina Bay Restaurant</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('profile.reviews.rating')}
                            </label>
                            <div className="flex space-x-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewData({...reviewData, rating: star})}
                                  className={`text-3xl ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}>
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('profile.reviews.yourReview')}
                            </label>
                            <textarea
                              value={reviewData.content}
                              onChange={(e) => setReviewData({...reviewData, content: e.target.value})}
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={t('profile.reviews.reviewPlaceholder')}
                              required
                            />
                          </div>
                          
                          <div className="flex space-x-4">
                            <button 
                              type="submit"
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-all">
                              {t('profile.reviews.submitReview')}
                            </button>
                            <button 
                              type="button"
                              onClick={() => setShowReviewForm(false)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all">
                              {t('profile.reviews.cancel')}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}