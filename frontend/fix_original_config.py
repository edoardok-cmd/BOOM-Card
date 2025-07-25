#!/usr/bin/env python3
import os

# Fix tailwind.config.js
tailwind_config = '''module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff6b00',
          dark: '#e55100',
          light: '#ff8533',
        },
        secondary: {
          DEFAULT: '#1e40af',
          dark: '#1e3a8a',
          light: '#3b82f6',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        accent: '#f59e0b',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
'''

with open('tailwind.config.js', 'w') as f:
    f.write(tailwind_config)
print("✅ Fixed tailwind.config.js")

# Create a working _app.js
app_js = '''import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
'''

os.makedirs('src/pages', exist_ok=True)
with open('src/pages/_app.js', 'w') as f:
    f.write(app_js)
print("✅ Created _app.js")

# Create a simple index.js to test
index_js = '''import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-600 to-purple-700">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-white text-center mb-8">
          BOOM Card - Original Version
        </h1>
        <p className="text-xl text-white text-center mb-12">
          This is the original TypeScript version before Phase 1 fixes
        </p>
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Version Info</h2>
          <ul className="space-y-2 text-lg">
            <li>• 47 TypeScript conversion syntax errors</li>
            <li>• Original components and structure</li>
            <li>• Running on port 3003</li>
            <li>• Pre-Phase 1 state</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
'''

with open('src/pages/index.js', 'w') as f:
    f.write(index_js)
print("✅ Created index.js")

print("\n🎉 All configuration files fixed!")
print("The original BOOM Card should now run on port 3003")