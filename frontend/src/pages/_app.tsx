import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // Minimal app with no providers or hooks to avoid router issues
  return <Component {...pageProps} />;
}