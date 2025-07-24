import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Debug() {
  const { language, setLanguage, t } = useLanguage();
  const [searchOpen, setSearchOpen] = React.useState(false);
  
  return (
    
      Debug Page

        Language System
        Current Language
        Translation test)}
        
           setLanguage('en')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Set English
          
           setLanguage('bg')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Set Bulgarian

        Search Test
        Search Open
         setSearchOpen(!searchOpen)}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Toggle Search

        Video Path Test
        BOOM Card Video Path
        Your video should be in
        NOT in

  );
}