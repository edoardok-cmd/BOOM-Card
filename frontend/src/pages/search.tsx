import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import Logo from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';

export default function Search() {
  const { t } = useLanguage();
  const router = useRouter();
  const { q } = router.query;
  const searchQuery = q as string || '';
  
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003/api';

  // Category emoji mapping
  const categoryEmoji: { [key: string]: string } = {
    'Fine Dining': '🍽️',
    'Restaurants': '🍽️',
    'Hotels & Resorts': '🏨',
    'Luxury Hotels': '🏨',
    'Spa & Wellness': '💆',
    'Wellness & Spa': '💆',
    'Entertainment': '🎭',
    'Cafes & Bakeries': '☕',
    'Seafood': '🦐',
    'Fitness & Sports': '🏋️'
  };

  useEffect(() => {
    if (searchQuery) {
      searchPartners(searchQuery);
    }
  }, [searchQuery]);

  const searchPartners = async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/partners?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPartners(data.data || []);
      } else {
        setError(data.message || 'Failed to search partners');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search partners');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>Search Results - BOOM Card</title>
        <meta name="description" content="Search BOOM Card partners and deals" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Logo size="md" showText={true} />
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-1">
                <a href="/" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">Home</a>
                <a href="/partners" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">Partners</a>
                <a href="/subscriptions" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">Plans</a>
                <a href="/dashboard" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">Dashboard</a>
                <a href="/profile" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">Profile</a>
                <div className="pl-4 ml-4 border-l border-gray-200 flex items-center space-x-3">
                  <SearchBar />
                  <LanguageSwitcher />
                  <UserProfileDropdown />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          {searchQuery && (
            <p className="text-lg text-gray-600">
              {loading ? 'Searching for' : `${partners.length} results found for`} "{searchQuery}"
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No results found</h3>
            <p className="text-gray-600 mb-8">Try searching with different keywords</p>
            <button 
              onClick={() => router.push('/partners')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
              Browse All Partners
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partners.map((partner) => {
              const emoji = categoryEmoji[partner.category] || '🏢';
              
              return (
                <div key={partner.id} className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg">
                          <span className="text-3xl">{emoji}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{partner.name}</h3>
                          <p className="text-sm text-gray-500 mb-1">{partner.category}</p>
                          <p className="text-sm text-orange-600 font-medium">📍 {partner.city}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-400 mr-1">⭐</span>
                          <span className="text-sm font-semibold text-gray-700">{partner.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                          {partner.discount_percentage}% OFF
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">{partner.description}</p>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => router.push(`/partners/${partner.slug}`)}
                        className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:shadow-lg text-white font-bold py-3 px-6 rounded-xl text-sm transition-all">
                        View Details
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl text-sm transition-colors">
                        ❤️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}