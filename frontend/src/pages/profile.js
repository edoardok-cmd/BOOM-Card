import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import Logo from '../components/Logo';
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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const [reviewData, setReviewData] = useState({
    rating: 5,
    partner: '',
    content: ''
  });
  const [userReviews, setUserReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    memberSince: new Date().toLocaleDateString(),
    membershipType: "Premium",
    cardNumber: "XXXX-XXXX-XXXX",
    validUntil: new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString()
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
        method: 'POST',
        headers: {
        },
        body: JSON.stringify({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone,
          birthDate: userData.birthDate,
          address: userData.address
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
      console.error('Failed to update profile', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: {
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Show QR code modal or redirect to 2FA setup page
        alert(language === 'bg' 
          ? 'Двуфакторната автентикация е активирана успешно! Моля, конфигурирайте вашето приложение за автентикация.'
          : '2FA has been enabled successfully! Please configure your authenticator app.');
        
        // In a real implementation, you would show a QR code here
        console.log('2FA Secret', result.data?.secret);
        console.log('QR Code URL', result.data?.qrCodeUrl);
      } else {
        const error = await response.json();
        alert(error.message || (language === 'bg' ? 'Неуспешно активиране на 2FA' : 'Failed to enable 2FA'));
      }
    } catch (error) {
      console.error('Failed to enable 2FA', error);
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
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        membershipType: user.membershipType || "Premium",
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
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setUserData(prev => ({
            ...prev,
            firstName: result.data.firstName || "",
            lastName: result.data.lastName || "",
            email: result.data.email || "",
            phone: result.data.phone || prev.phone,
            birthDate: result.data.birthDate || prev.birthDate,
            address: result.data.address || prev.address,
            membershipType: result.data.membershipType || prev.membershipType,
            cardNumber: result.data.cardNumber || prev.cardNumber,
            validUntil: result.data.validUntil || prev.validUntil,
            memberSince: result.data.memberSince || prev.memberSince,
          }));
        }
        setProfileLoading(false);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      setProfileLoading(false);
    }
  };

  // Fetch user reviews
  const fetchUserReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
        headers: {
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setUserReviews(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
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
  const handleSubmitReview = async (e) => {
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
        alert('Review must be at least 10 characters long');
        setSubmittingReview(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        alert('Review submitted successfully!');
        setReviewData({ rating: 5, partner: '', content: '' });
        setShowReviewForm(false);
        fetchUserReviews();
      } else {
        const error = await response.json();
        if (error.errors) {
          const errorMessages = error.errors.map(detail => detail.msg).join(', ');
          alert(`Validation error: ${errorMessages}`);
        } else {
          alert(error.message || 'Failed to submit review');
        }
      }
    } catch (error) {
      console.error('Failed to submit review', error);
      console.error('Review data', reviewData);
      console.error('API URL', API_BASE_URL);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{t('profile.title') || 'My Profile - BOOM Card'}</title>
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
                <Link href="/">
                  <a className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    {t('nav.home') || 'Home'}
                  </a>
                </Link>
                <Link href="/profile">
                  <a className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold">
                    {t('nav.profile') || 'Profile'}
                  </a>
                </Link>
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
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                  {userData.firstName?.charAt(0) || 'A'}{userData.lastName?.charAt(0) || 'S'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    {userData.firstName} {userData.lastName}
                  </h1>
                  <p className="text-white/80">
                    {t('profile.hero.premiumMember') || 'Premium Member since'} {userData.memberSince}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-sm text-white/80">{t('profile.hero.membership') || 'Membership'}</p>
                  <p className="text-xl font-semibold">
                    {userData.membershipType} {t('profile.hero.member') || 'Member'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/80">{t('profile.hero.cardNumber') || 'Card Number'}</p>
                  <p className="text-xl font-semibold">{userData.cardNumber || 'XXXX-XXXX-XXXX'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              {isEditing ? t('profile.hero.saveChanges') || 'Save Changes' : t('profile.hero.editProfile') || 'Edit Profile'}
            </button>
          </div>
        </div>
      </section>

      {/* Profile Sections */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4">
                {[
                  { id: 'personal', nameKey: 'profile.sidebar.personal', icon: '👤' },
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
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {t(section.nameKey) || section.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-8">
                {/* Personal Information */}
                {activeSection === 'personal' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">
                      {t('profile.personal.title') || 'Personal Information'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profile.personal.firstName') || 'First Name'}
                        </label>
                        <input
                          type="text"
                          value={userData.firstName}
                          onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profile.personal.lastName') || 'Last Name'}
                        </label>
                        <input
                          type="text"
                          value={userData.lastName}
                          onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profile.personal.email') || 'Email'}
                        </label>
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) => setUserData({...userData, email: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profile.personal.phone') || 'Phone'}
                        </label>
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) => setUserData({...userData, phone: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profile.personal.birthDate') || 'Birth Date'}
                        </label>
                        <input
                          type="date"
                          value={userData.birthDate}
                          onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profile.personal.address') || 'Address'}
                        </label>
                        <input
                          type="text"
                          value={userData.address}
                          onChange={(e) => setUserData({...userData, address: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>

                    </div>
                    {isEditing && (
                      <div className="mt-6 flex justify-end space-x-4">
                        <button
                          onClick={handleSave}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                        >
                          {t('profile.personal.saveChanges') || 'Save Changes'}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-all"
                        >
                          {t('profile.personal.cancel') || 'Cancel'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

              {/* Membership Section */}
              {activeSection === 'membership' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    {t('profile.membership.title') || 'Membership Information'}
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-2">
                        {userData.membershipType} {t('profile.membership.membership') || 'Membership'}
                      </h3>
                      <p className="text-white/80 mb-4">
                        {t('profile.membership.memberSince') || 'Member since'} {userData.memberSince}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-white/80">{t('profile.membership.cardNumber') || 'Card Number'}</p>
                          <p className="font-semibold">{userData.cardNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/80">{t('profile.membership.validUntil') || 'Valid Until'}</p>
                          <p className="font-semibold">{userData.validUntil}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <h4 className="text-2xl font-bold text-orange-600">€19.99</h4>
                        <p className="text-gray-600">{t('profile.membership.perMonth') || 'Per Month'}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <h4 className="text-2xl font-bold text-green-600">€1,847</h4>
                        <p className="text-gray-600">{t('profile.membership.totalSaved') || 'Total Saved'}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <h4 className="text-2xl font-bold text-blue-600">52</h4>
                        <p className="text-gray-600">{t('profile.membership.partnerVisits') || 'Partner Visits'}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <h4 className="text-2xl font-bold text-purple-600">24%</h4>
                        <p className="text-gray-600">{t('profile.membership.avgDiscount') || 'Avg Discount'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Section */}
              {activeSection === 'preferences' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    {t('profile.preferences.title') || 'Preferences'}
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {t('profile.preferences.notifications') || 'Notifications'}
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.emailNotifications}
                            onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700">
                            {t('profile.preferences.emailNotifications') || 'Email notifications'}
                          </span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.smsNotifications}
                            onChange={(e) => setPreferences({...preferences, smsNotifications: e.target.checked})}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700">
                            {t('profile.preferences.smsNotifications') || 'SMS notifications'}
                          </span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.newsletterSubscription}
                            onChange={(e) => setPreferences({...preferences, newsletterSubscription: e.target.checked})}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700">
                            {t('profile.preferences.newsletterSubscription') || 'Newsletter subscription'}
                          </span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.partnerUpdates}
                            onChange={(e) => setPreferences({...preferences, partnerUpdates: e.target.checked})}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700">
                            {t('profile.preferences.partnerUpdates') || 'Partner updates'}
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {t('profile.preferences.regionalSettings') || 'Regional Settings'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('profile.preferences.language') || 'Language'}
                          </label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                            <option value="en">{t('profile.preferences.english') || 'English'}</option>
                            <option value="bg">{t('profile.preferences.bulgarian') || 'Bulgarian'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('profile.preferences.currency') || 'Currency'}
                          </label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
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
                  <h2 className="text-2xl font-bold mb-6">
                    {t('profile.security.title') || 'Security'}
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication</h3>
                          <p className="text-gray-600">
                            {t('profile.security.twoFactorWarning') || 'Add an extra layer of security to your account'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            console.log('2FA button clicked');
                            handleEnable2FA();
                          }}
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-lg font-medium"
                          style={{ minWidth: '150px' }}
                        >
                          {t('accountSettings.enable2FA') || 'Enable 2FA'}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {t('profile.security.changePassword') || 'Change Password'}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('profile.security.currentPassword') || 'Current Password'}
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('profile.security.newPassword') || 'New Password'}
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('profile.security.confirmNewPassword') || 'Confirm New Password'}
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {t('profile.security.loginHistory') || 'Login History'}
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Chrome on macOS</p>
                              <p className="text-sm text-gray-600">Sofia, Bulgaria • 192.168.1.1</p>
                            </div>
                            <span className="text-sm text-gray-500">2 hours ago</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Mobile App on iOS</p>
                              <p className="text-sm text-gray-600">Sofia, Bulgaria • 192.168.1.2</p>
                            </div>
                            <span className="text-sm text-gray-500">Yesterday</span>
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
                  <h2 className="text-2xl font-bold mb-6">
                    {t('profile.billing.title') || 'Billing'}
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {t('profile.billing.paymentMethod') || 'Payment Method'}
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            VISA
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-600">{t('profile.billing.expires') || 'Expires'} 12/2025</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          Update
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {t('profile.billing.billingHistory') || 'Billing History'}
                      </h3>
                      <div className="space-y-3">
                        {[
                          { date: '2024-01-01', amount: '€19.99', status: 'paid' },
                          { date: '2023-12-01', amount: '€19.99', status: 'paid' },
                          { date: '2023-11-01', amount: '€19.99', status: 'paid' }
                        ].map((invoice, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                            <div>
                              <p className="font-medium">{invoice.date}</p>
                              <p className="text-sm text-gray-600">{t('profile.billing.premiumMembership') || 'Premium Membership'}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{invoice.amount}</p>
                              <p className="text-sm text-green-600">{t('profile.billing.paid') || 'Paid'}</p>
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
                  <h2 className="text-2xl font-bold mb-6">
                    {t('profile.reviews.title') || 'Reviews'}
                  </h2>
                  
                  {!showReviewForm ? (
                    <div>
                      {/* Your Reviews */}
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">
                          {t('profile.reviews.yourReviews') || 'Your Reviews'}
                        </h3>
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium"
                        >
                          {t('profile.reviews.writeReview') || 'Write Review'}
                        </button>
                      </div>
                      
                      {/* Placeholder for existing reviews */}
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">The Sofia Grand</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className="text-yellow-500">★</span>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">2 weeks ago</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700">
                            Excellent dining experience! The 30% discount made this Michelin-starred restaurant affordable. Service was impeccable.
                          </p>
                        </div>
                      </div>
                    </div>

                  ) : (
                    /* Review Form */
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">
                          {t('profile.reviews.writeNewReview') || 'Write New Review'}
                        </h3>
                        <button
                          onClick={() => setShowReviewForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <form onSubmit={handleSubmitReview} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('profile.reviews.selectPartner') || 'Select Partner'}
                          </label>
                          <select
                            value={reviewData.partner}
                            onChange={(e) => setReviewData({...reviewData, partner: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                          >
                            <option value="">{t('profile.reviews.choosePlaceholder') || 'Choose a partner...'}</option>
                            <option value="restaurant-paradise">Restaurant Paradise</option>
                            <option value="fitness-first">Fitness First Gym</option>
                            <option value="spa-relaxation">Spa Relaxation Center</option>
                            <option value="coffee-central">Coffee Central</option>
                            <option value="emerald-resort">Emerald Resort & Spa</option>
                            <option value="marina-bay">Marina Bay Restaurant</option>
                          </select>
                        </div>
                        
                        <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('profile.reviews.rating') || 'Rating'}
                              </label>
                              <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewData({...reviewData, rating: star})}
                                    className={`text-3xl ${star <= reviewData.rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 transition-colors`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('profile.reviews.yourReview') || 'Your Review'}
                              </label>
                              <textarea
                                value={reviewData.content}
                                onChange={(e) => setReviewData({...reviewData, content: e.target.value})}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder={t('profile.reviews.reviewPlaceholder') || 'Share your experience...'}
                                required
                              />
                            </div>
                            <div className="flex justify-end space-x-4">
                              <button
                                type="button"
                                onClick={() => setShowReviewForm(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                              >
                                {t('profile.reviews.cancel') || 'Cancel'}
                              </button>
                              <button
                                type="submit"
                                disabled={submittingReview}
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
                              >
                                {submittingReview ? t('profile.reviews.submitting') || 'Submitting...' : t('profile.reviews.submit') || 'Submit Review'}
                              </button>
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
      </section>
    </div>
  );
}