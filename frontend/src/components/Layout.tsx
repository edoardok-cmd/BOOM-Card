import React, { useEffect, useState } from 'react';
import { useSafeRouter, isRouterReady } from '../utils/safeRouter';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [showFooter, setShowFooter] = useState(true);
  const router = useSafeRouter();
  
  // Use useEffect to handle router-dependent logic on client side only
  useEffect(() => {
    if (isRouterReady(router)) {
      // Don't show the default footer on homepage as it has its own custom footer
      setShowFooter(router.pathname !== '/');
    }
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}