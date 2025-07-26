import React from 'react';

export default function Logo({ size = 'md', showText = true, className = '', variant = 'default' }) {
  const sizeConfigs = {
    sm: {
      container: 'w-10 h-10',
      text: 'text-lg',
      brandText: 'text-lg'
    },
    md: {
      container: 'w-12 h-12',
      text: 'text-xl',
      brandText: 'text-xl'
    },
    lg: {
      container: 'w-16 h-16',
      text: 'text-2xl',
      brandText: 'text-2xl'
    }
  };

  const config = sizeConfigs[size];

  // Different text gradient for footer variant
  const textGradient = variant === 'footer' 
    ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent';

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${config.container} bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg flex items-center justify-center`}>
        <span className={`${config.text} font-black text-white`}>B</span>
      </div>
      {showText && (
        <span className={`${config.brandText} font-bold ${textGradient}`}>
          BOOM Card
        </span>
      )}
    </div>
  );
}
