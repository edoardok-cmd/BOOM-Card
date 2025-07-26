import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useDebounce } from '../hooks/usePerformance'
import { partnerService } from '../services/partnerService'
import { Partner } from '../types'

interface AdvancedSearchProps {
  onSearchResults?: (results: Partner[]) => void
  className?: string
}

interface SearchFilters {
  query: string
  category: string
  minDiscount: number
  maxDistance: number
  city: string
  sortBy: 'relevance' | 'discount' | 'distance' | 'popularity'
  onlyOpen: boolean
  onlyFavorites: boolean
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  onSearchResults,
  className = '' 
}) => {
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    minDiscount: 0,
    maxDistance: 50,
    city: '',
    sortBy: 'relevance',
    onlyOpen: false,
    onlyFavorites: false
  })
  
  const [suggestions, setSuggestions] = useState<Partner[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const debouncedQuery = useDebounce(filters.query, 300)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Search when query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch()
    } else {
      setSuggestions([])
    }
  }, [debouncedQuery, filters.category, filters.minDiscount])

  const performSearch = async () => {
    setIsSearching(true)
    
    try {
      const results = await partnerService.searchPartners({
        query: debouncedQuery,
        category: filters.category,
        minDiscount: filters.minDiscount,
        maxDistance: filters.maxDistance,
        city: filters.city,
        sortBy: filters.sortBy,
        onlyOpen: filters.onlyOpen,
        onlyFavorites: filters.onlyFavorites
      })
      
      setSuggestions(results.slice(0, 5))
      
      if (onSearchResults) {
        onSearchResults(results)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (filters.query.trim()) {
      // Save to recent searches
      const updated = [filters.query, ...recentSearches.filter(s => s !== filters.query)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      
      // Navigate to search results
      router.push({
        pathname: '/partners',
        query: {
          search: filters.query,
          category: filters.category,
          minDiscount: filters.minDiscount > 0 ? filters.minDiscount : undefined,
          sortBy: filters.sortBy !== 'relevance' ? filters.sortBy : undefined
        }
      })
      
      setShowSuggestions(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      minDiscount: 0,
      maxDistance: 50,
      city: '',
      sortBy: 'relevance',
      onlyOpen: false,
      onlyFavorites: false
    })
    setSuggestions([])
  }

  const categories = [
    'Restaurants', 'Shopping', 'Entertainment', 'Health & Beauty',
    'Sports & Fitness', 'Travel', 'Education', 'Services'
  ]

  const cities = [
    'Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 
    'Stara Zagora', 'Pleven', 'Veliko Tarnovo'
  ]

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <input
              ref={searchRef}
              type="text"
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search partners, categories, or locations..."
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            
            {isSearching && (
              <div className="absolute right-3 top-3.5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-3 bg-gray-100 border-t border-b border-gray-300 hover:bg-gray-200 focus:outline-none"
            aria-label="Toggle advanced filters"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Search
          </button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (filters.query || recentSearches.length > 0) && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
            {/* Recent Searches */}
            {!filters.query && recentSearches.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Recent Searches</h3>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleFilterChange('query', search)}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                  >
                    <svg className="inline-block w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-600 p-4 pb-2">Suggestions</h3>
                {suggestions.map((partner) => (
                  <button
                    key={partner.id}
                    onClick={() => router.push(`/partners/${partner.id}`)}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <img
                        src={partner.logoUrl || '/images/partner-placeholder.png'}
                        alt={partner.name}
                        className="w-10 h-10 rounded object-cover mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{partner.name}</p>
                        <p className="text-sm text-gray-600">
                          {partner.category} • {partner.discount}% discount
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </form>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Minimum Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Discount
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={filters.minDiscount}
                  onChange={(e) => handleFilterChange('minDiscount', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-center font-medium">
                  {filters.minDiscount}%
                </span>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="relevance">Relevance</option>
                <option value="discount">Highest Discount</option>
                <option value="distance">Nearest First</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>

            {/* Max Distance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Distance
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={filters.maxDistance}
                  onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-center font-medium">
                  {filters.maxDistance}km
                </span>
              </div>
            </div>

            {/* Toggle Options */}
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.onlyOpen}
                  onChange={(e) => handleFilterChange('onlyOpen', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Open Now</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.onlyFavorites}
                  onChange={(e) => handleFilterChange('onlyFavorites', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Favorites Only</span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch