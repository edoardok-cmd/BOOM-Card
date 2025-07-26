import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log('BOOM Card App loaded successfully');
    console.log('Current page:', Component.name);
    
    // Log any errors
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
    });
    
    // Check if page is actually loading
    console.log('Document ready state:', document.readyState);
  }, [Component]);

  return <Component {...pageProps} />;
}