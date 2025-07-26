import React from 'react';
import Head from 'next/head';
import { useLanguage } from '../contexts/LanguageContext';
import Layout from '../components/Layout';

export default function Debug() {
  const { language, setLanguage, t } = useLanguage();
  const [searchOpen, setSearchOpen] = React.useState(false);
  
  return (
    <Layout>
      <Head>
        <title>Debug Page - BOOM Card</title>
      </Head>
      
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
        
        <div className="space-y-8">
          {/* Language System */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Language System</h2>
            <div className="space-y-2">
              <p><strong>Current Language:</strong> {language}</p>
              <p><strong>Translation test:</strong> {t('common.welcome')}</p>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setLanguage('en')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Set English
                </button>
                <button
                  onClick={() => setLanguage('bg')}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Set Bulgarian
                </button>
              </div>
            </div>
          </section>
          
          {/* Search State */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Search State</h2>
            <div className="space-y-2">
              <p><strong>Search Open:</strong> {searchOpen ? 'Yes' : 'No'}</p>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Toggle Search
              </button>
            </div>
          </section>
          
          {/* Environment Variables */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment</h2>
            <div className="space-y-2">
              <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
              <p><strong>Node Env:</strong> {process.env.NODE_ENV}</p>
            </div>
          </section>
          
          {/* Test Components */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Components</h2>
            <div className="space-y-4">
              <div className="p-4 border rounded">
                <h3 className="font-medium mb-2">Button States</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
                    Primary
                  </button>
                  <button className="px-4 py-2 border border-orange-600 text-orange-600 rounded hover:bg-orange-50">
                    Secondary
                  </button>
                  <button className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed" disabled>
                    Disabled
                  </button>
                </div>
              </div>
              
              <div className="p-4 border rounded">
                <h3 className="font-medium mb-2">Card Preview</h3>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-lg max-w-sm">
                  <h4 className="text-xl font-bold">BOOM Card</h4>
                  <p className="mt-2">Premium Member</p>
                  <p className="text-sm mt-4">Member ID: DEBUG-001</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}