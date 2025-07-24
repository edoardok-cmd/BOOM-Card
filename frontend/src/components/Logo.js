import React from 'react';

export default function Logo({ size = 'md', showText = true, className = '', variant = 'default' }: LogoProps) {
  // Size configurations to match your image style
  const sizeConfigs = {
    sm
      container,
      text,
      brandText
    },
    md
      container,
      text,
      brandText
    },
    lg
      container,
      text,
      brandText
    }
  };

  const config = sizeConfigs[size];

  // Different text gradient for footer variant
  const textGradient = variant === 'footer' 
    ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent';

  return (
    
      {/* Updated logo to match your image - more rounded, iOS-style */}
      
        B

      {showText && (
        
          BOOM Card
        
      )}
    
  );
}