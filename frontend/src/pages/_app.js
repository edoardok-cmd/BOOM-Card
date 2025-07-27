import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Hide any initial loading spinners
    if (typeof window !== 'undefined') {
      // Remove all possible spinners
      const spinners = document.querySelectorAll('.app-loading, .loading-spinner, #root .app-loading');
      spinners.forEach(spinner => {
        spinner.remove();
      });
      
      // Also check for root div with spinner
      const root = document.getElementById('root');
      if (root) {
        const appLoading = root.querySelector('.app-loading');
        if (appLoading) {
          appLoading.remove();
        }
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
