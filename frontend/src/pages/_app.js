import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
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