import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function SimpleLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}