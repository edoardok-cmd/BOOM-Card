import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { reportWebVitals, sendToAnalytics, observePerformance, performanceMark } from '../utils/webVitals';
import ExtensionHandler from '../utils/extensionHandler';
import '../styles/globals.css';

// Export reportWebVitals for Next.js
export { reportWebVitals };

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Initialize extension handler to filter out extension errors
    const extensionHandler = ExtensionHandler.getInstance();
    extensionHandler.notifyUserAboutExtensions();

    // Start performance monitoring
    observePerformance();

    // Register service worker for PWA and caching
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('Service Worker registered:', registration.scope);
          },
          (error) => {
            console.error('Service Worker registration failed:', error);
          }
        );
      });
    }

    // Track route changes for performance monitoring
    const handleRouteChangeStart = (url: string) => {
      performanceMark.start('route-change');
    };

    const handleRouteChangeComplete = (url: string) => {
      const duration = performanceMark.end('route-change');
      if (duration > 1000) {
        console.warn(`Slow route change to ${url}: ${duration}ms`);
      }
    };

    const handleRouteChangeError = (err: any, url: string) => {
      performanceMark.clear('route-change');
      console.error(`Route change to ${url} failed:`, err);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
      </Head>
      <LanguageProvider>
        <AuthProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AuthProvider>
      </LanguageProvider>
    </>
  );
}