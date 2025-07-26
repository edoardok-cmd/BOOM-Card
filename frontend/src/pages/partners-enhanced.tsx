import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Logo from '../components/Logo';
import SearchBar from '../components/SearchBar';
import UserProfileDropdown from '../components/UserProfileDropdown';
import MobileMenu from '../components/MobileMenu';
import { partnerService } from '../services/partnerService';
import { authService } from '../services/authService';
import { usePaginatedApi, useDebounce } from '../hooks';
import { formatPercentage } from '../utils/format';
import { showErrorToast } from '../utils/errorHandler';
import { Partner, PartnerFilters } from '../types';

export default function PartnersEnhanced() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<PartnerFilters['sortBy']>('rating');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Check if user is authenticated for favorites
  const isAuthenticated = authService.isAuthenticated();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Build filters object
  const filters: PartnerFilters = {
    ...(selectedCategory && { category: selectedCategory }),
    ...(selectedLocation && { location: selectedLocation }),
    ...(debouncedSearch && { search: debouncedSearch }),
    sortBy
  };

  // Use paginated API hook
  const {
    data: partners,
    page,
    totalPages,
    total,
    hasMore,
    isLoading,
    loadPage,
    refresh
  } = usePaginatedApi(
    (params) => partnerService.getPartners({ ...filters, ...params }),
    12 // Items per page
  );

  // Load categories
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  // Reload when filters change
  useEffect(() => {
    loadPage(1);
  }, [selectedCategory, selectedLocation, debouncedSearch, sortBy]);

  const loadCategories = async () => {
    try {
      const cats = await partnerService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await partnerService.getFavorites();
      setFavorites(new Set(favs.map(f => f.partnerId)));
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const toggleFavorite = async (partnerId: string) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/partners');
      return;
    }

    try {
      if (favorites.has(partnerId)) {
        await partnerService.removeFromFavorites(partnerId);
        setFavorites(prev => {
          const updated = new Set(prev);
          updated.delete(partnerId);
          return updated;
        });
      } else {
        await partnerService.addToFavorites(partnerId);
        setFavorites(prev => new Set(prev).add(partnerId));
      }
    } catch (error) {
      showErrorToast('Failed to update favorites');
    }
  };

  const handlePartnerClick = (partner: Partner) => {
    router.push(`/partners/${partner.id}`);
  };

  // Mock locations for now
  const locations = ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{t('partners.title') || 'Partners'} - BOOM Card</title>
        <meta name="description" content={t('partners.description') || 'Discover exclusive discounts at premium partners'} />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Logo />
              <div className="hidden md:block ml-10">
                <SearchBar 
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={t('partners.searchPlaceholder') || 'Search partners...'}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {isAuthenticated && <UserProfileDropdown />}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('partners.heading') || 'Exclusive Partners'}
          </h1>
          <p className="text-gray-600">
            {t('partners.subheading') || 'Discover premium experiences with amazing discounts'}
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">{t('partners.allCategories') || 'All Categories'}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">{t('partners.allLocations') || 'All Locations'}</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as PartnerFilters['sortBy'])}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="rating">{t('partners.sortByRating') || 'Top Rated'}</option>
              <option value="discount">{t('partners.sortByDiscount') || 'Highest Discount'}</option>
              <option value="name">{t('partners.sortByName') || 'Name A-Z'}</option>
              <option value="newest">{t('partners.sortByNewest') || 'Newest'}</option>
            </select>

            {/* Mobile Search */}
            <div className="md:hidden w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('partners.searchPlaceholder') || 'Search partners...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Results Count */}
            <div className="ml-auto text-sm text-gray-600">
              {total > 0 && `${total} ${t('partners.partnersFound') || 'partners found'}`}
            </div>
          </div>
        </div>

        {/* Partners Grid */}
        {isLoading && partners.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : partners.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handlePartnerClick(partner)}
                >
                  {/* Partner Image */}
                  <div className="relative h-48 bg-gray-200">
                    {partner.image ? (
                      <img
                        src={partner.image}
                        alt={partner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {partner.discount}% OFF
                    </div>

                    {/* Favorite Button */}
                    {isAuthenticated && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(partner.id);
                        }}
                        className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                      >
                        <svg
                          className={`w-5 h-5 ${favorites.has(partner.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Partner Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{partner.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{partner.category}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">{partner.location}</span>
                      </div>
                      
                      {partner.rating && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700 ml-1">{partner.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {partner.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{partner.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => loadPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('partners.previous') || 'Previous'}
                  </button>
                  
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => loadPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          pageNum === page
                            ? 'bg-orange-500 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => loadPage(page + 1)}
                    disabled={!hasMore}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('partners.next') || 'Next'}
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('partners.noResults') || 'No partners found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('partners.tryDifferentFilters') || 'Try adjusting your filters or search terms'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedLocation('');
                  setSearchQuery('');
                  refresh();
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                {t('partners.clearFilters') || 'Clear filters'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}