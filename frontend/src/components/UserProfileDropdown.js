import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function UserProfileDropdown({ className = '' }: UserProfileDropdownProps) {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  // If user is not logged in, show login button
  if (!user) {
    return (
       router.push('/login')}
        className="bg-gradient-to-r from-orange-500 to-red-500 hover
      >
        {t('auth.login')}
      
    );
  }

  return (
    
      {/* User Avatar Button */}
       setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover
      >
        
          {getInitials()}

      {/* Dropdown Menu */}
      {isOpen && (
        
          {/* User Info Header */}

                {getInitials()}

                {user.firstName} {user.lastName}
                {user.email}

          {/* Menu Items */}
          
             handleNavigation('/profile')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover
            >

              {t('nav.profile')}

             handleNavigation('/account-settings')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover
            >

              {t('nav.accountSettings')}

             handleNavigation('/dashboard')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover
            >

              {t('nav.dashboard')}

             {
                setIsOpen(false);
                router.push('/profile#security');
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover
            >

              {t('accountSettings.enable2FA') || 'Enable 2FA'}

              {t('auth.logout')}

      )}
    
  );
}