import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import VideoBackground from '../components/VideoBackground';
import SearchBar from '../components/SearchBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserProfileDropdown from '../components/UserProfileDropdown';
import Logo from '../components/Logo';
import MobileMenu from '../components/MobileMenu';
import { useLanguage } from '../contexts/LanguageContext';
import { navigationHandlers } from '../utils/navigation';

const getPartnerCategories = (t: any) => [
  {
    id: 'restaurants',
    name: t('partners.categories.fineDining'),
    icon: '🍽️',
    count: '150+',
    discount: `${t('partners.categories.upTo')} 30% OFF`,
    color: 'from-gold-400 to-gold-500',
    bgColor: 'from-gold-50 to-gold-100',
    description: t('partners.categories.fineDiningDesc')
  },
  {
    id: 'hotels',
    name: t('partners.categories.luxuryHotels'),
    icon: '🏨',
    count: '75+',
    discount: `${t('partners.categories.upTo')} 40% OFF`,
    color: 'from-blue-400 to-blue-500',
    bgColor: 'from-blue-50 to-blue-100',
    description: t('partners.categories.luxuryHotelsDesc')
  },
  {
    id: 'spas',
    name: t('partners.categories.wellness'),
    icon: '💆',
    count: '50+',
    discount: `${t('partners.categories.upTo')} 35% OFF`,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100',
    description: t('partners.categories.wellnessDesc')
  },
  {
    id: 'entertainment',
    name: t('partners.categories.entertainment'),
    icon: '🎭',
    count: '100+',
    discount: `${t('partners.categories.upTo')} 25% OFF`,
    color: 'from-gold-500 to-gold-600',
    bgColor: 'from-gold-50 to-gold-100',
    description: t('partners.categories.entertainmentDesc')
  }
];

const featuredPartners = [
  {
    name: 'The Sofia Grand',
    category: 'Fine Dining',
    location: 'Sofia Center',
    rating: 4.9,
    discount: '30% OFF',
    image: '🍽️',
    description: 'Award-winning restaurant featuring contemporary Bulgarian cuisine with international influences.',
    features: ['Michelin Guide', 'Wine Pairing', 'Private Dining'],
    color: 'from-gold-400 to-gold-500'
  },
  {
    name: 'Emerald Resort & Spa',
    category: 'Luxury Hotels',
    location: 'Bansko',
    rating: 4.8,
    discount: '40% OFF',
    image: '🏨',
    description: 'Exclusive mountain resort offering luxury accommodation and world-class amenities.',
    features: ['5-Star Resort', 'Ski Access', 'Full Spa'],
    color: 'from-blue-400 to-blue-500'
  },
  {
    name: 'Serenity Wellness',
    category: 'Wellness & Spa',
    location: 'Plovdiv',
    rating: 4.9,
    discount: '35% OFF',
    image: '💆',
    description: 'Premium wellness center offering holistic treatments and relaxation experiences.',
    features: ['Thermal Pools', 'Massage Therapy', 'Yoga Classes'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Cultural Experience Hub',
    category: 'Entertainment',
    location: 'Varna',
    rating: 4.7,
    discount: '25% OFF',
    image: '🎭',
    description: 'Immersive cultural experiences including performances, exhibitions, and workshops.',
    features: ['Live Shows', 'Art Gallery', 'Workshops'],
    color: 'from-gold-500 to-gold-600'
  },
  {
    name: 'Marina Bay Restaurant',
    category: 'Fine Dining',
    location: 'Burgas',
    rating: 4.8,
    discount: '25% OFF',
    image: '🍽️',
    description: 'Seaside fine dining with fresh seafood and stunning Black Sea views.',
    features: ['Sea View', 'Fresh Seafood', 'Wine Selection'],
    color: 'from-gold-400 to-gold-500'
  },
  {
    name: 'Mountain Peak Lodge',
    category: 'Luxury Hotels',
    location: 'Borovets',
    rating: 4.9,
    discount: '45% OFF',
    image: '🏨',
    description: 'Boutique mountain lodge with panoramic views and personalized service.',
    features: ['Mountain Views', 'Luxury Suites', 'Concierge'],
    color: 'from-blue-400 to-blue-500'
  }
];

export default function Partners() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [partners, setPartners] = useState<any[]>([]);
  const [featuredPartnersData, setFeaturedPartnersData] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPartners, setTotalPartners] = useState(0);
  
  const partnersPerPage = 6; // Show 6 partners per page
  const partnerCategories = getPartnerCategories(t);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003/api';

  // Map backend categories to frontend category IDs
  const categoryMapping: { [key: string]: string } = {
    'Food & Drink': 'restaurants',
    'Fine Dining': 'restaurants',
    'Restaurants': 'restaurants',
    'Travel': 'hotels',
    'Hotels & Resorts': 'hotels',
    'Luxury Hotels': 'hotels',
    'Beauty & Spa': 'spas',
    'Health & Fitness': 'spas',
    'Spa & Wellness': 'spas',
    'Wellness & Spa': 'spas',
    'Entertainment': 'entertainment',
    'Shopping': 'entertainment',
    'Services': 'entertainment',
    'Education': 'entertainment',
    'Cafes & Bakeries': 'restaurants',
    'Seafood': 'restaurants',
    'Fitness & Sports': 'spas'
  };

  // Emoji mapping for categories
  const categoryEmoji: { [key: string]: string } = {
    'Fine Dining': '🍽️',
    'Restaurants': '🍽️',
    'Food & Drink': '🍽️',
    'Hotels & Resorts': '🏨',
    'Luxury Hotels': '🏨',
    'Travel': '🏨',
    'Spa & Wellness': '💆',
    'Wellness & Spa': '💆',
    'Beauty & Spa': '💆',
    'Health & Fitness': '🏋️',
    'Entertainment': '🎭',
    'Shopping': '🛍️',
    'Services': '🔧',
    'Education': '📚',
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
  }, [selectedCategory, searchTerm, currentPage]);
  
  // Reset to page 1 when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/partners?`;
      
      // Add pagination
      url += `page=${currentPage}&limit=${partnersPerPage}&`;
      
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
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalPartners(data.pagination.total || 0);
        }
      } else {
        setError(data.message || 'Failed to fetch partners');
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
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
      console.error('Error fetching featured partners:', err);
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
      console.error('Error fetching categories:', err);
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
      console.error('Error fetching cities:', err);
    }
  };

  // Use backend data if available, otherwise fall back to hardcoded data
  const displayPartners = partners.length > 0 ? partners : featuredPartners;
  const displayFeaturedPartners = featuredPartnersData.length > 0 ? featuredPartnersData : featuredPartners;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>{t('partners.title')}</title>
        <meta name="description" content={t('partners.description')} />
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
            <div className="hidden lg:block">
              <div className="ml-10 flex items-center space-x-1">
                <a href="/" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('partners.nav.home')}</a>
                <a href="/partners" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold">{t('partners.nav.partners')}</a>
                <a href="/subscriptions" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t('partners.nav.plans')}</a>
                <div className="pl-4 ml-4 border-l border-gray-200 flex items-center space-x-3">
                  <SearchBar />
                  <LanguageSwitcher />
                  <UserProfileDropdown />
                </div>
              </div>
            </div>
            {/* Mobile Navigation */}
            <div className="flex lg:hidden items-center space-x-2">
              <LanguageSwitcher />
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden py-24">
        {/* Video Background */}
        <VideoBackground />
        
        {/* Gradient overlay - same as original design */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-70"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-10 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-white/10 backdrop-blur-sm text-white border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
              {t('partners.hero.badge')}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              {t('partners.hero.title1')}
            </span>
            <br />
            <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">
              {t('partners.hero.title2')}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-4xl mx-auto leading-relaxed">
            {t('partners.hero.subtitle')}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder={t('partners.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 text-lg rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Categories */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('partners.categories.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('partners.categories.subtitle')}
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              {t('partners.categories.allPartners')}
            </button>
            {partnerCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Partners Results */}
      <div className="py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <p className="mt-4 text-gray-600">Loading partners...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : displayPartners.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No partners found matching your criteria</p>
              </div>
            ) : (
              displayPartners.map((partner, index) => {
                // Map backend data to frontend format
                const mappedPartner = {
                  name: partner.name,
                  category: partner.category,
                  location: partner.city || partner.location,
                  rating: partner.rating || 0,
                  discount: partner.discount || `${partner.discount_percentage || 0}% OFF`,
                  description: partner.description,
                  features: partner.features || [],
                  image: partner.logoUrl || categoryEmoji[partner.category] || partner.logo || partner.image || '🏢',
                  color: partner.color || 'from-orange-400 to-orange-500',
                  slug: partner.slug
                };

                return (
                <div key={partner.id || index} className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center">
                        {(mappedPartner.image && (mappedPartner.image.startsWith('/') || mappedPartner.image.startsWith('http'))) ? (
                          <div className="w-16 h-16 mr-4 group-hover:scale-110 transition-transform">
                            <img 
                              src={mappedPartner.image} 
                              alt={mappedPartner.name}
                              className="w-full h-full object-cover rounded-2xl shadow-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement?.parentElement;
                                if (parent) {
                                  const iconDiv = document.createElement('div');
                                  iconDiv.className = `w-16 h-16 bg-gradient-to-r ${mappedPartner.color} rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg`;
                                  iconDiv.innerHTML = `<span class="text-3xl">${categoryEmoji[partner.category] || '🏢'}</span>`;
                                  parent.replaceChild(iconDiv, target.parentElement!);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className={`w-16 h-16 bg-gradient-to-r ${mappedPartner.color} rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg`}>
                            <span className="text-3xl">{mappedPartner.image}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{mappedPartner.name}</h3>
                          <p className="text-sm text-gray-500 mb-1">{mappedPartner.category}</p>
                          <p className="text-sm text-orange-600 font-medium">📍 {mappedPartner.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-400 mr-1">⭐</span>
                          <span className="text-sm font-semibold text-gray-700">{mappedPartner.rating.toFixed(1)}</span>
                        </div>
                        <div className={`text-2xl font-bold bg-gradient-to-r ${mappedPartner.color} bg-clip-text text-transparent`}>
                          {mappedPartner.discount}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">{mappedPartner.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {mappedPartner.features.map((feature, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => mappedPartner.slug && router.push(`/partners/${mappedPartner.slug}`)}
                        className={`flex-1 bg-gradient-to-r ${mappedPartner.color} hover:shadow-lg text-white font-bold py-3 px-6 rounded-xl text-sm transition-all`}>
                        {t('partners.featured.viewDetails')}
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl text-sm transition-colors">
                        ❤️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </div>
          
          {displayPartners.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No partners found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter</p>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center space-x-2">
              {/* Previous button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                ← {language === 'bg' ? 'Предишна' : 'Previous'}
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {/* Show first page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="px-2 text-gray-400">...</span>}
                  </>
                )}
                
                {/* Show pages around current page */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return page === currentPage || 
                           page === currentPage - 1 || 
                           page === currentPage + 1 ||
                           (currentPage <= 3 && page <= 5) ||
                           (currentPage >= totalPages - 2 && page >= totalPages - 4);
                  })
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        page === currentPage
                          ? 'bg-orange-500 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                
                {/* Show last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              {/* Next button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {language === 'bg' ? 'Следваща' : 'Next'} →
              </button>
            </div>
          )}
          
          {/* Results info */}
          {!loading && totalPartners > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              {language === 'bg' 
                ? `Показване на ${(currentPage - 1) * partnersPerPage + 1}-${Math.min(currentPage * partnersPerPage, totalPartners)} от ${totalPartners} партньори`
                : `Showing ${(currentPage - 1) * partnersPerPage + 1}-${Math.min(currentPage * partnersPerPage, totalPartners)} of ${totalPartners} partners`}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('partners.cta.title')}
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            {t('partners.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/subscriptions')}
              className="bg-white hover:bg-gray-100 text-orange-600 font-bold py-4 px-8 rounded-xl text-lg transition-colors">
              {t('partners.cta.choosePlan')}
            </button>
            <button 
              onClick={() => window.open('https://apps.apple.com/app/boom-card', '_blank')}
              className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-bold py-4 px-8 rounded-xl text-lg transition-colors">
              📱 {t('partners.cta.downloadApp')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}