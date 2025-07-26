import React from 'react';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Always show footer for now to avoid router issues during SSG
  // This can be handled on individual pages if needed
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}