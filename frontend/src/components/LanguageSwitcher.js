import React from 'react';
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
