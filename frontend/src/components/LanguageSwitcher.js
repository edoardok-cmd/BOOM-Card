import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  
  const handleLanguageChange = (lang) => {
    console.log('Language switcher clicked, lang);
    setLanguage(lang);
  };
  
  return (
    
       handleLanguageChange('en')}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover
        }`}
        type="button"
      >
        🇬🇧 EN
      
       handleLanguageChange('bg')}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
          language === 'bg'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover
        }`}
        type="button"
      >
        🇧🇬 БГ

  );
}