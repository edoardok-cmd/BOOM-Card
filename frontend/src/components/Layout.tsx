import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

export default function Layout({ children, showNavigation = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showNavigation && <Navigation />}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}