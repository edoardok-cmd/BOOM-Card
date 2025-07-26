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
  const searchQuery = q || '';
  
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // Category emoji mapping
  const categoryEmoji = {
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

  const searchPartners = async (query) => {
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
      console.error('Search error', err);
      setError('Failed to search partners');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Search Results - BOOM Card</title>
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
                <SearchBar />
                <LanguageSwitcher />
                <UserProfileDropdown />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">
            Search Results
          </h1>
          {searchQuery && (
            <p className="text-gray-600">
              {loading ? 'Searching for' : `${partners.length} results found for`} "{searchQuery}"
            </p>
          )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No results found</h2>
            <p className="text-gray-600 mb-6">Try searching with different keywords</p>
            <button
              onClick={() => router.push('/partners')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all mt-4"
            >
              Browse All Partners
            </button>
          </div>

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => {
              const emoji = categoryEmoji[partner.category] || '🏢';
              
              return (
                <div key={partner.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start mb-4">
                      <div className="text-4xl mr-4">{emoji}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{partner.name}</h3>
                        <p className="text-sm text-gray-600">{partner.category}</p>
                        <p className="text-sm text-gray-500">📍 {partner.city}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          <span className="text-yellow-400 mr-1">⭐</span>
                          <span className="font-semibold">{partner.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                          {partner.discount_percentage}% OFF
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{partner.description}</p>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => router.push(`/partners/${partner.slug}`)}
                        className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-all"
                      >
                        View Details
                      </button>
                    </div>

              );
            })}
          </div>
        )}
        </div>
      </section>
    </div>
  );
}