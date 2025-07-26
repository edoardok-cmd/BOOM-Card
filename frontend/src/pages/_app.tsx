import React from 'react';
import type { AppProps } from 'next/app';
import SimpleLayout from '../components/SimpleLayout';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SimpleLayout>
      <Component {...pageProps} />
    </SimpleLayout>
  );
}