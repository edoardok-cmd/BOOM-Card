import React from 'react';
import type { AppProps } from 'next/app';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </LanguageProvider>
  );
}