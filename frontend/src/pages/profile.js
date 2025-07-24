import React, { useState, useEffect } from 'react';
import Head from 'next/head';
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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http
  const [reviewData, setReviewData] = useState({
    rating,
    partner,
    content
  });
  const [userReviews, setUserReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userData, setUserData] = useState({
    firstName,
    lastName,
    email,
    phone,
    birthDate,
    address,
    memberSince,
    membershipType,
    cardNumber,
    validUntil
  });

  const [preferences, setPreferences] = useState({
    emailNotifications,
    smsNotifications,
    newsletterSubscription,
    partnerUpdates,
    language,
    currency
  });

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method,
        headers
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body
          firstName,
          lastName,
          email,
          phone,
          birthDate,
          address,
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
      console.error('Failed to update profile, error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/enable`, {
        method,
        headers
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
        console.log('2FA Secret, result.data?.secret);
        console.log('QR Code URL, result.data?.qrCodeUrl);
      } else {
        const error = await response.json();
        alert(error.message || (language === 'bg' ? 'Неуспешно активиране на 2FA' : 'Failed to enable 2FA'));
      }
    } catch (error) {
      console.error('Failed to enable 2FA, error);
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
        firstName,
        lastName,
        email,
        membershipType,
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
        headers
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setUserData(prev => ({
            ...prev,
            firstName,
            lastName,
            email,
            phone,
            birthDate)[0] : prev.birthDate,
            address,
            membershipType,
            cardNumber,
            validUntil).toLocaleDateString('en-US', { year, month).replace(/\//g, '/') : '',
            memberSince).toLocaleDateString('en-US', { year, month) : prev.memberSince,
          }));
        }
        setProfileLoading(false);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user profile, error);
      setProfileLoading(false);
    }
  };

  // Fetch user reviews
  const fetchUserReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
        headers
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setUserReviews(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews, error);
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
      if (reviewData.content.length  detail.msg).join(', ');
          alert(`Validation error);
        } else {
          alert(error.message || 'Failed to submit review');
        }
      }
    } catch (error) {
      console.error('Failed to submit review, error);
      console.error('Review data, reviewData);
      console.error('API URL, API_BASE_URL);
      alert('Failed to submit review. Please check your internet connection and try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Show loading state while checking authentication
  if (profileLoading) {
    return (

          Loading profile...

    );
  }

  return (

        {t('profile.title')}

      {/* Navigation */}

                {t('profile.nav.profile')}

      {/* Hero Section */}

                AS

                  {userData.firstName} {userData.lastName}
                
                {t('profile.hero.premiumMember')} {userData.memberSince}

                    {userData.membershipType} {t('profile.hero.member')}
                  
                  ID

             setIsEditing(!isEditing)}
              className="bg-white/20 backdrop-blur-sm hover
            >
              {isEditing ? t('profile.hero.saveChanges') : t('profile.hero.editProfile')}

      {/* Profile Sections */}
      
          {/* Sidebar */}

                {[
                  { id, nameKey, icon,
                  { id, nameKey, icon,
                  { id, nameKey, icon,
                  { id, nameKey, icon,
                  { id, nameKey, icon,
                  { id, nameKey, icon
                ].map((section) => (
                   setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover
                    }`}
                  >
                    {section.icon}
                    {t(section.nameKey)}
                  
                ))}

          {/* Main Content */}

              {/* Personal Information */}
              {activeSection === 'personal' && (
                
                  {t('profile.personal.title')}

                      {t('profile.personal.firstName')}
                       setUserData({...userData, firstName)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus
                      />

                      {t('profile.personal.lastName')}
                       setUserData({...userData, lastName)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus
                      />

                      {t('profile.personal.email')}
                       setUserData({...userData, email)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus
                      />

                      {t('profile.personal.phone')}
                       setUserData({...userData, phone)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus
                      />

                      {t('profile.personal.birthDate')}
                       setUserData({...userData, birthDate)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus
                      />

                      {t('profile.personal.address')}
                       setUserData({...userData, address)}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus
                      />

                  {isEditing && (

                        {t('profile.personal.saveChanges')}
                      
                       setIsEditing(false)}
                        className="bg-gray-200 hover
                      >
                        {t('profile.personal.cancel')}

                  )}
                
              )}

              {/* Membership Section */}
              {activeSection === 'membership' && (
                
                  {t('profile.membership.title')}

                        {userData.membershipType} {t('profile.membership.membership')}
                        {t('profile.membership.memberSince')} {userData.memberSince}
                        
                          {t('profile.membership.cardNumber')} {userData.cardNumber}
                          {t('profile.membership.validUntil')} {userData.validUntil}

                        €19.99
                        {t('profile.membership.perMonth')}

                      €1,847
                      {t('profile.membership.totalSaved')}

                      52
                      {t('profile.membership.partnerVisits')}

                      24%
                      {t('profile.membership.avgDiscount')}

              )}

              {/* Preferences Section */}
              {activeSection === 'preferences' && (
                
                  {t('profile.preferences.title')}

                      {t('profile.preferences.notifications')}

                           setPreferences({...preferences, emailNotifications)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus
                          />
                          {t('profile.preferences.emailNotifications')}

                           setPreferences({...preferences, smsNotifications)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus
                          />
                          {t('profile.preferences.smsNotifications')}

                           setPreferences({...preferences, newsletterSubscription)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus
                          />
                          {t('profile.preferences.newsletterSubscription')}

                           setPreferences({...preferences, partnerUpdates)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus
                          />
                          {t('profile.preferences.partnerUpdates')}

                      {t('profile.preferences.regionalSettings')}

                          {t('profile.preferences.language')}
                          {t('profile.preferences.english')}
                            {t('profile.preferences.bulgarian')}

                          {t('profile.preferences.currency')}
                          BGN (лв)
                            EUR (€)

              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                
                  {t('profile.security.title')}

                          {t('profile.security.twoFactorWarning')}
                        
                         {
                            console.log('2FA button clicked');
                            handleEnable2FA();
                          }}
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover
                          style={{ minWidth
                          {t('accountSettings.enable2FA') || 'Enable 2FA'}

                      {t('profile.security.changePassword')}

                          {t('profile.security.currentPassword')}

                          {t('profile.security.newPassword')}

                          {t('profile.security.confirmNewPassword')}

                      {t('profile.security.loginHistory')}

                              Chrome on macOS
                              Sofia, Bulgaria • 192.168.1.1
                            
                            2 hours ago

                              Mobile App on iOS
                              Sofia, Bulgaria • 192.168.1.2
                            
                            Yesterday

              )}

              {/* Billing Section */}
              {activeSection === 'billing' && (
                
                  {t('profile.billing.title')}

                      {t('profile.billing.paymentMethod')}

                              •••• •••• •••• 4242
                              {t('profile.billing.expires')} 12/2025

                      {t('profile.billing.billingHistory')}
                      
                        {[
                          { date, amount, status,
                          { date, amount, status,
                          { date, amount, status
                        ].map((invoice, index) => (

                              {invoice.date}
                              {t('profile.billing.premiumMembership')}

                              {invoice.amount}
                              {t('profile.billing.paid')}

                        ))}

              )}

              {/* Reviews Section */}
              {activeSection === 'reviews' && (
                
                  {t('profile.reviews.title')}
                  
                  {!showReviewForm ? (
                    
                      {/* Your Reviews */}

                          {t('profile.reviews.yourReviews')}
                           setShowReviewForm(true)}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover
                            {t('profile.reviews.writeReview')}

                        {/* Placeholder for existing reviews */}

                                The Sofia Grand
                                
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    ★
                                  ))}
                                  2 weeks ago

                              Excellent dining experience! The 30% discount made this Michelin-starred restaurant affordable. Service was impeccable.

                  ) : (
                    /* Review Form */

                        {t('profile.reviews.writeNewReview')}
                         setShowReviewForm(false)}
                          className="text-gray-500 hover

                              {t('profile.reviews.selectPartner')}
                            
                             setReviewData({...reviewData, partner)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus
                              required>
                              {t('profile.reviews.choosePlaceholder')}
                              Restaurant Paradise
                              Fitness First Gym
                              Spa Relaxation Center
                              Coffee Central
                              Emerald Resort & Spa
                              Marina Bay Restaurant

                              {t('profile.reviews.rating')}

                              {[1, 2, 3, 4, 5].map((star) => (
                                 setReviewData({...reviewData, rating)}
                                  className={`text-3xl ${star 
                              ))}

                              {t('profile.reviews.yourReview')}
                            
                             setReviewData({...reviewData, content)}
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus
                              placeholder={t('profile.reviews.reviewPlaceholder')}
                              required
                            />

                             setShowReviewForm(false)}
                              className="bg-gray-200 hover
                              {t('profile.reviews.cancel')}

                  )}
                
              )}

  );
}