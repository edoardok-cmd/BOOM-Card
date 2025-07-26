#!/usr/bin/env python3
import os
import re

def fix_video_background():
    """Fix video background with multiple sources"""
    video_bg_path = 'src/components/VideoBackground.js'
    
    video_content = '''import React, { useState, useEffect } from 'react';

export default function VideoBackground({ 
  sources = [
    'https://cdn.pixabay.com/vimeo/328940142/sunset-24354.mp4?width=1920&hash=premium',
    'https://cdn.coverr.co/videos/coverr-aerial-view-of-city-at-night-1080p.mp4',
    '/videos/premium-bg.mp4'
  ],
  posterUrl = '/images/restaurant-poster.jpg',
  overlay = true,
  overlayOpacity = 0.3
}) {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

  const handleError = () => {
    if (currentSourceIndex < sources.length - 1) {
      setCurrentSourceIndex(currentSourceIndex + 1);
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <video
        key={currentSourceIndex}
        autoPlay
        loop
        muted
        playsInline
        poster={posterUrl}
        className="absolute inset-0 w-full h-full object-cover"
        onError={handleError}
      >
        <source src={sources[currentSourceIndex]} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {overlay && (
        <div 
          className="absolute inset-0 bg-black" 
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {/* Additional gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
    </div>
  );
}
'''
    
    with open(video_bg_path, 'w') as f:
        f.write(video_content)
    print(f"✅ Fixed {video_bg_path}")

def fix_index_page_styling():
    """Fix index page by removing premium-card class and fixing layout"""
    index_path = 'src/pages/index.js'
    
    with open(index_path, 'r') as f:
        content = f.read()
    
    # Remove the premium-card class that's breaking styling
    content = content.replace('group premium-card bg-orange-50', 'group bg-orange-50')
    
    # Fix the nav styling
    content = content.replace(
        '<nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">',
        '<nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200" style="backdrop-filter: blur(10px);">'
    )
    
    # Fix button styling
    content = content.replace(
        'hover:shadow-2xl hover:shadow-gold-500/25',
        'hover:shadow-2xl'
    )
    
    with open(index_path, 'w') as f:
        f.write(content)
    print(f"✅ Fixed {index_path}")

def fix_css_styling():
    """Remove problematic CSS that's breaking the layout"""
    css_path = 'src/styles/globals.css'
    
    with open(css_path, 'r') as f:
        content = f.read()
    
    # Remove the premium-card CSS that's causing issues
    content = re.sub(
        r'/\* Premium card effects \*/.*?\.premium-card:hover::before \{[^}]+\}',
        '',
        content,
        flags=re.DOTALL
    )
    
    with open(css_path, 'w') as f:
        f.write(content)
    print(f"✅ Fixed {css_path}")

def fix_user_profile_dropdown():
    """Fix UserProfileDropdown to show login button properly"""
    dropdown_path = 'src/components/UserProfileDropdown.js'
    
    dropdown_content = '''import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  if (!user) {
    return (
      <button
        onClick={() => router.push('/login')}
        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium px-6 py-2 rounded-full transition-all duration-200 transform hover:scale-105"
      >
        {t('auth.login') || 'Login'}
      </button>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
          {user.firstName?.[0] || 'U'}
        </div>
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
        <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
          {t('nav.profile') || 'Profile'}
        </a>
        <a href="/account-settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
          {t('nav.account') || 'Account Settings'}
        </a>
        <hr className="my-2" />
        <button
          onClick={logout}
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          {t('nav.logout') || 'Logout'}
        </button>
      </div>
    </div>
  );
}
'''
    
    with open(dropdown_path, 'w') as f:
        f.write(dropdown_content)
    print(f"✅ Fixed {dropdown_path}")

def fix_language_switcher():
    """Fix LanguageSwitcher component"""
    lang_path = 'src/components/LanguageSwitcher.js'
    
    lang_content = '''import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        type="button"
      >
        🇬🇧 EN
      </button>
      <button
        onClick={() => setLanguage('bg')}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
          language === 'bg'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        type="button"
      >
        🇧🇬 БГ
      </button>
    </div>
  );
}
'''
    
    with open(lang_path, 'w') as f:
        f.write(lang_content)
    print(f"✅ Fixed {lang_path}")

def main():
    print("🔧 Fixing BOOM Card styling issues...")
    
    # Change to frontend directory
    os.chdir('/Users/administrator/ai-automation-platform/user_projects/25b7e956-816a-410c-b1b5-3c798a9d586c/BOOM Card_20250722_085243/frontend')
    
    # Apply fixes
    fix_video_background()
    fix_user_profile_dropdown()
    fix_language_switcher()
    fix_index_page_styling()
    fix_css_styling()
    
    print("\n✨ Styling fixes complete!")
    print("The app should now display correctly with:")
    print("- Working video background")
    print("- Visible navigation")
    print("- Proper styling")
    print("- Fixed translations")

if __name__ == "__main__":
    main()