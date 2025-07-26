import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Debug() {
  const { language, setLanguage, t } = useLanguage();
  const [searchOpen, setSearchOpen] = React.useState(false);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Language System</h2>
        <p>Current Language: <strong>{language}</strong></p>
        <p>Translation test: {t('nav.home')}</p>
        <div className="mt-2 space-x-2">
          <button 
            onClick={() => setLanguage('en')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Set English
          </button>
          <button 
            onClick={() => setLanguage('bg')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Set Bulgarian
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Search Test</h2>
        <p>Search Open: <strong>{searchOpen ? 'Yes' : 'No'}</strong></p>
        <button 
          onClick={() => setSearchOpen(!searchOpen)}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Toggle Search
        </button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Video Path Test</h2>
        <p>BOOM Card Video Path: <code>/videos/dvoretsa.mp4</code></p>
        <p>Your video should be in: <code>frontend/public/videos/dvoretsa.mp4</code></p>
        <p>NOT in: <code>/Users/administrator/ai-automation-platform/frontend/public/videos</code></p>
      </div>
    </div>
  );
}
// Force server-side rendering
export async function getServerSideProps() {
  return {
    props: {},
  }
}
