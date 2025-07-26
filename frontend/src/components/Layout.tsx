import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [showFooter, setShowFooter] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use useEffect to handle router-dependent logic on client side only
  useEffect(() => {
    if (mounted && router.isReady) {
      // Don't show the default footer on homepage as it has its own custom footer
      setShowFooter(router.pathname !== '/');
    }
  }, [mounted, router.isReady, router.pathname]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}