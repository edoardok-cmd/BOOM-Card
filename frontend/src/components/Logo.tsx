import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  variant?: 'default' | 'footer';
}

export default function Logo({ size = 'md', showText = true, className = '', variant = 'default' }: LogoProps) {
  // Size configurations to match your image style
  const sizeConfigs = {
    sm: {
      container: 'w-8 h-8',
      text: 'text-lg',
      brandText: 'text-xl'
    },
    md: {
      container: 'w-12 h-12',
      text: 'text-xl',
      brandText: 'text-2xl'
    },
    lg: {
      container: 'w-16 h-16',
      text: 'text-2xl',
      brandText: 'text-3xl'
    }
  };

  const config = sizeConfigs[size];

  // Different text gradient for footer variant
  const textGradient = variant === 'footer' 
    ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent';

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Updated logo to match your image - more rounded, iOS-style */}
      <div className={`${config.container} bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg`}>
        <span className={`text-white ${config.text} font-bold tracking-tight`}>B</span>
      </div>
      
      {showText && (
        <span className={`${config.brandText} font-bold ${textGradient}`}>
          BOOM Card
        </span>
      )}
    </div>
  );
}