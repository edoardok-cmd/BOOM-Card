import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ExtensionHandler } from '../utils/extensionHandler';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize extension error handler
    if (typeof window !== 'undefined') {
      ExtensionHandler.getInstance();
    }
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}