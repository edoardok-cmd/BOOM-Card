import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '../components/Layout';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import ExtensionHandler from '../utils/extensionHandler';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Only initialize extension handler on client side
    if (typeof window !== 'undefined') {
      const extensionHandler = ExtensionHandler.getInstance();
      extensionHandler.notifyUserAboutExtensions();
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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