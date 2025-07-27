import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Hide any initial loading spinners
    if (typeof window !== 'undefined') {
      const loader = document.querySelector('.app-loading');
      if (loader) {
        loader.style.display = 'none';
      }
    }
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default MyApp;
