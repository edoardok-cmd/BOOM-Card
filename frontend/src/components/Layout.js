import React from 'react';
import { useRouter } from 'next/router';
import Footer from './Footer';

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  // Don't show the default footer on homepage as it has its own custom footer
  const showFooter = router.pathname !== '/';
  
  return (

        {children}
      
      {showFooter && }
    
  );
}