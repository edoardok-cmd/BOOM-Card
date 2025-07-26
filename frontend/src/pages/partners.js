import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import VideoBackground from '../components/VideoBackground';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Logo from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { navigationHandlers } from '../utils/navigation';

const getPartnerCategories = (t) => [
  { 
    id: 'restaurants',
    name: t('categories.fineDining'),
    icon: '🍽️',
    count: 125,
    discount: `${t('categories.upTo')} 30% OFF`,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
    description: t('categories.restaurantDescription')
  },
  { 
    id: 'hotels',
    name: t('categories.luxuryHotels'),
    icon: '🏨',
    count: 85,
    discount: `${t('categories.upTo')} 40% OFF`,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
    description: t('categories.hotelDescription')
  },
  { 
    id: 'spas',
    name: t('categories.wellness'),
    icon: '💆',
    count: 65,
    discount: `${t('categories.upTo')} 35% OFF`,
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
    description: t('categories.spaDescription')
  },
  { 
    id: 'entertainment',
    name: t('categories.entertainment'),
    icon: '🎬',
    count: 95,
    discount: `${t('categories.upTo')} 25% OFF`,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
    description: t('categories.entertainmentDescription')
  }
];

const featuredPartners = [
  {
    name: 'The Sofia Grand',
    category: 'Fine Dining',
    location: 'Sofia Center',
    rating: 4.8,
    discount: '30%',
    image: '/images/partners/sofia-grand.jpg',
    description: 'Award-winning restaurant with exquisite Bulgarian and international cuisine.',
    features: ['Michelin Star', 'Wine Pairing', 'Private Dining'],
    color: 'from-orange-500 to-red-500'
  },
  {
    name: 'Mountain Resort Bansko',
    category: 'Hotels & Resorts',
    location: 'Bansko',
    rating: 4.9,
    discount: '40%',
    image: '/images/partners/bansko-resort.jpg',
    description: 'Luxury mountain resort with breathtaking views and world-class amenities.',
    features: ['Mountain Views', 'Ski Access', 'Full Spa'],
    color: 'from-blue-500 to-indigo-500'
  },
  {
    name: 'Spa Relaxation Center',
    category: 'Spa & Wellness',
    location: 'Plovdiv',
    rating: 4.7,
    discount: '35%',
    image: '/images/partners/spa-center.jpg',
    description: 'Premium wellness center offering therapeutic treatments and relaxation.',
    features: ['Hot Springs', 'Massage Therapy', 'Yoga Classes'],
    color: 'from-green-500 to-teal-500'
  },
  {
    name: 'Cultural Arts Center',
    category: 'Entertainment',
    location: 'Varna',
    rating: 4.6,
    discount: '25%',
    image: '/images/partners/arts-center.jpg',
    description: 'Contemporary arts venue featuring performances, exhibitions, and workshops.',
    features: ['Live Performances', 'Art Gallery', 'Workshops'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Marina Bay Restaurant',
    category: 'Fine Dining',
    location: 'Burgas',
    rating: 4.5,
    discount: '30%',
    image: '/images/partners/marina-bay.jpg',
    description: 'Waterfront dining with spectacular sea views and fresh seafood.',
    features: ['Ocean Views', 'Fresh Seafood', 'Wine Selection'],
    color: 'from-orange-500 to-red-500'
  },
  {
    name: 'Emerald Resort & Spa',
    category: 'Hotels & Resorts',
    location: 'Golden Sands',
    rating: 4.8,
    discount: '40%',
    image: '/images/partners/emerald-resort.jpg',
    description: 'Beachfront luxury resort with comprehensive wellness facilities.',
    features: ['Beachfront', 'Luxury Suites', 'Concierge'],
    color: 'from-blue-500 to-indigo-500'
  }
];

export default function Partners() {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [partners, setPartners] = useState([]);
  const [featuredPartnersData, setFeaturedPartnersData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const partnerCategories = getPartnerCategories(t);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // Map backend categories to frontend category IDs
  const categoryMapping = {
    'Fine Dining': 'restaurants',
    'Restaurants': 'restaurants',
    'Hotels & Resorts': 'hotels',
    'Luxury Hotels': 'hotels',
    'Spa & Wellness': 'spas',
    'Wellness & Spa': 'spas',
    'Entertainment': 'entertainment',
    'Cafes & Bakeries': 'restaurants',
    'Seafood': 'restaurants',
    'Fitness & Sports': 'spas'
  };

  // Emoji mapping for categories
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

  // Fetch partners from backend
  useEffect(() => {
    fetchPartners();
    fetchCategories();
    fetchCities();
    fetchFeaturedPartners();
  }, [selectedCategory, searchTerm]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/partners?`;
      
      // Add category filter if not 'all'
      if (selectedCategory !== 'all') {
        // Find the actual category name from our mapping
        const categoryName = Object.entries(categoryMapping)
          .find(([_, id]) => id === selectedCategory)?.[0];
        if (categoryName) {
          url += `category=${encodeURIComponent(categoryName)}&`;
        }
      }
      
      // Add search filter
      if (searchTerm) {
        url += `search=${encodeURIComponent(searchTerm)}&`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPartners(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch partners');
      }
    } catch (err) {
      console.error('Error fetching partners', err);
      setError('Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedPartners = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/partners/featured`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setFeaturedPartnersData(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching featured partners', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/partners/categories`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/partners/cities`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCities(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching cities', err);
    }
  };

  // Use backend data if available, otherwise fall back to hardcoded data
  const displayPartners = partners.length > 0 ? partners : featuredPartners;
  const displayFeaturedPartners = featuredPartnersData.length > 0 ? featuredPartnersData : featuredPartners;

  return (

        {t('partners.title')}

      {/* Navigation */}

                {t('partners.nav.partners')}

                   navigationHandlers.startMembership(router)}
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover
                    {t('partners.nav.getStarted')}

      {/* Hero Section */}
      
        {/* Video Background */}

        {/* Gradient overlay - same design */}

              {t('partners.hero.badge')}

              {t('partners.hero.title1')}

              {t('partners.hero.title2')}

          {/* Search Bar */}

               setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 text-lg rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus
              />

      {/* Partner Categories */}

              {t('partners.categories.subtitle')}

          {/* Category Filter */}
          
             setSelectedCategory('all')}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover
              }`}
            >
              {t('partners.categories.allPartners')}
            
            {partnerCategories.map((category) => (
               setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover
                }`}
              >
                {category.icon} {category.name}
              
            ))}

           (
              
                  {category.icon}
                  
                  {category.name}
                  {category.count} Premium Partners
                  {category.description}
                  
                    {category.discount}
                  
                   setSelectedCategory(category.id)}
                    className="bg-white/80 hover
                    {t('partners.categories.explorePartners')} →

            ))}

      {/* Featured Partners */}

              {t('partners.featured.title')}

              {t('partners.featured.description')}

                Loading partners...
              
            ) : error ? (
              
                {error}
              
            ) === 0 ? (
              
                No partners found matching your criteria
              
            ) : (
              displayPartners.map((partner, index) => {
                // Map backend data to frontend format
                const mappedPartner = {
                  name,
                  category,
                  location,
                  rating,
                  discount,
                  description,
                  features,
                  image,
                  color,
                  slug
                };

                return (

                        {mappedPartner.image}

                          {mappedPartner.name}
                          {mappedPartner.category}
                          📍 {mappedPartner.location}

                          ⭐
                          {mappedPartner.rating.toFixed(1)}

                          {mappedPartner.discount}

                    {mappedPartner.description}

                      {mappedPartner.features.map((feature, idx) => (
                        
                          {feature}
                        
                      ))}

                       mappedPartner.slug && router.push(`/partners/${mappedPartner.slug}`)}
                        className={`flex-1 bg-gradient-to-r ${mappedPartner.color} hover
                        {t('partners.featured.viewDetails')}

              );
            })
            )}

          {displayPartners.length === 0 && (
            
              🔍
              No partners found
              Try adjusting your search or category filter
            
          )}

      {/* CTA Section */}

            {t('partners.cta.subtitle')}
          
           router.push('/subscriptions')}
              className="bg-white hover
              {t('partners.cta.choosePlan')}
            
             window.open('https, '_blank')}
              className="border-2 border-white text-white hover
              📱 {t('partners.cta.downloadApp')}

  );
}