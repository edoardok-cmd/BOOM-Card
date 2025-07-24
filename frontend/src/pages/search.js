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
  
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http

  // Category emoji mapping
  const categoryEmoji= {
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
      console.error('Search error, err);
      setError('Failed to search partners');
    } finally {
      setLoading(false);
    }
  };

  return (

        Search Results - BOOM Card

      {/* Navigation */}

      {/* Search Results */}

            Search Results
          
          {searchQuery && (
            
              {loading ? 'Searching for' : `${partners.length} results found for`} "{searchQuery}"
            
          )}

        {loading ? (

            Searching...
          
        ) : error ? (
          
            {error}
          
        ) === 0 ? (
          
            🔍
            No results found
            Try searching with different keywords
             router.push('/partners')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover
              Browse All Partners

        ) : (
           {
              const emoji = categoryEmoji[partner.category] || '🏢';
              
              return (

                        {emoji}

                          {partner.name}
                          {partner.category}
                          📍 {partner.city}

                          ⭐
                          {partner.rating?.toFixed(1) || '0.0'}

                          {partner.discount_percentage}% OFF

                    {partner.description}

                       router.push(`/partners/${partner.slug}`)}
                        className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 hover
                        View Details

              );
            })}
          
        )}

  );
}