#!/usr/bin/env python3
"""
Fix the final set of truncated files in BOOM Card project
"""

import os

def fix_search_results_component():
    """Fix SearchResults.tsx component"""
    content = """import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaFilter, FaSort, FaMapMarkerAlt } from 'react-icons/fa';
import PartnerCard from '../partner/PartnerCard';
import SearchFilters from './SearchFilters';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';
import { searchService } from '../../services/search.service';
import { Partner } from '../../types';

const SearchResults: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  const currentPage = parseInt(searchParams.get('page') || '1');
  const pageSize = 12;
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const location = searchParams.get('location') || '';
  const minDiscount = searchParams.get('minDiscount') || '';
  const sortBy = searchParams.get('sortBy') || 'relevance';

  useEffect(() => {
    fetchResults();
  }, [searchParams]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await searchService.searchPartners({
        query,
        category,
        location,
        minDiscount: minDiscount ? parseInt(minDiscount) : undefined,
        sortBy,
        page: currentPage,
        pageSize
      });
      
      setPartners(response.data.items);
      setTotalResults(response.data.total);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: any) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, String(value));
      } else {
        newParams.delete(key);
      }
    });
    
    newParams.set('page', '1'); // Reset to first page
    setSearchParams(newParams);
  };

  const handleSortChange = (newSortBy: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', newSortBy);
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(page));
    setSearchParams(newParams);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <SearchFilters
            onFilterChange={handleFilterChange}
            initialFilters={{
              category,
              location,
              minDiscount: minDiscount ? parseInt(minDiscount) : undefined
            }}
          />
        </aside>

        {/* Results Section */}
        <main className="flex-1">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {query ? (
                <>
                  {t('search.resultsFor')} "{query}"
                </>
              ) : (
                t('search.allPartners')
              )}
              <span className="text-gray-600 text-lg ml-2">
                ({totalResults} {t('search.results')})
              </span>
            </h1>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-md"
              >
                <FaFilter />
                {t('search.filters')}
              </button>

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="relevance">{t('search.sort.relevance')}</option>
                <option value="discount">{t('search.sort.highestDiscount')}</option>
                <option value="rating">{t('search.sort.highestRated')}</option>
                <option value="newest">{t('search.sort.newest')}</option>
                <option value="distance">{t('search.sort.nearest')}</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          {partners.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))}
              </div>

              {/* Pagination */}
              {totalResults > pageSize && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalResults / pageSize)}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {t('search.noResults')}
              </p>
              <button
                onClick={() => setSearchParams({})}
                className="mt-4 text-purple-600 hover:text-purple-700"
              >
                {t('search.clearFilters')}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResults;
"""
    
    with open("frontend/src/components/search/SearchResults.tsx", "w") as f:
        f.write(content)
    print("Fixed: frontend/src/components/search/SearchResults.tsx")

def fix_partner_map_component():
    """Fix PartnerMap.tsx component"""
    content = """import React, { useEffect, useRef, useState } from 'react';
import { Partner } from '../../types';

interface PartnerMapProps {
  partners: Partner[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: number | string;
  onPartnerClick?: (partner: Partner) => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const PartnerMap: React.FC<PartnerMapProps> = ({
  partners,
  center = { lat: 42.6977, lng: 23.3219 }, // Sofia, Bulgaria
  zoom = 12,
  height = 400,
  onPartnerClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, []);

  useEffect(() => {
    if (map && partners) {
      updateMarkers();
    }
  }, [map, partners]);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const googleMap = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(googleMap);
  };

  const updateMarkers = () => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = partners.map(partner => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: partner.location.lat,
          lng: partner.location.lng
        },
        map,
        title: partner.name,
        icon: {
          url: '/images/map-pin.png',
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-4 max-w-xs">
            <h3 class="font-bold text-lg mb-2">${partner.name}</h3>
            <p class="text-gray-600 mb-2">${partner.category}</p>
            <p class="text-purple-600 font-bold">${partner.discount}% OFF</p>
            <p class="text-sm text-gray-500 mt-2">${partner.location.address}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        if (onPartnerClick) {
          onPartnerClick(partner);
        }
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Adjust map bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      map.fitBounds(bounds);
    }
  };

  return (
    <div 
      ref={mapRef} 
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      className="w-full rounded-lg shadow-lg"
    />
  );
};

export default PartnerMap;
"""
    
    with open("frontend/src/components/partner/PartnerMap.tsx", "w") as f:
        f.write(content)
    print("Fixed: frontend/src/components/partner/PartnerMap.tsx")

def fix_partner_details_component():
    """Fix PartnerDetails.tsx component"""
    content = """import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaClock, 
  FaPhone, 
  FaGlobe, 
  FaShare,
  FaHeart,
  FaQrcode 
} from 'react-icons/fa';
import { Partner } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import QRCodeModal from '../common/QRCodeModal';
import ImageGallery from '../common/ImageGallery';
import ReviewList from './ReviewList';
import { usePartner } from '../../hooks/usePartner';
import LoadingSpinner from '../common/LoadingSpinner';

const PartnerDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { partner, loading, error } = usePartner(id!);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t('errors.partnerNotFound')}
          </h2>
          <Button onClick={() => navigate('/partners')}>
            {t('common.goBack')}
          </Button>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: partner.name,
          text: `Check out ${partner.name} on BOOM Card - ${partner.discount}% discount!`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Save to user favorites
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96">
        <img
          src={partner.coverImage || partner.imageUrl}
          alt={partner.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-end justify-between">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">{partner.name}</h1>
                <div className="flex items-center gap-4 text-lg">
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt />
                    {partner.location.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    {partner.rating} ({partner.reviewCount} reviews)
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg px-6 py-4 shadow-lg">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">{t('partner.discount')}</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {partner.discount}% OFF
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="primary"
                onClick={() => setShowQRCode(true)}
                icon={<FaQrcode />}
              >
                {t('partner.showQRCode')}
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                icon={<FaHeart className={isFavorite ? 'text-red-500' : ''} />}
              >
                {isFavorite ? t('partner.saved') : t('partner.save')}
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                icon={<FaShare />}
              >
                {t('partner.share')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">{t('partner.about')}</h2>
              <p className="text-gray-700 leading-relaxed">
                {partner.description}
              </p>
            </Card>

            {/* Gallery */}
            {partner.images && partner.images.length > 0 && (
              <Card>
                <h2 className="text-2xl font-bold mb-4">{t('partner.gallery')}</h2>
                <ImageGallery images={partner.images} />
              </Card>
            )}

            {/* How to Redeem */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">{t('partner.howToRedeem')}</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>{t('partner.redemptionStep1')}</li>
                <li>{t('partner.redemptionStep2')}</li>
                <li>{t('partner.redemptionStep3')}</li>
                <li>{t('partner.redemptionStep4')}</li>
              </ol>
            </Card>

            {/* Reviews */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">{t('partner.reviews')}</h2>
              <ReviewList partnerId={partner.id} />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <h3 className="text-xl font-bold mb-4">{t('partner.contactInfo')}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium">{t('partner.address')}</p>
                    <p className="text-gray-600">{partner.location.address}</p>
                  </div>
                </div>
                
                {partner.phone && (
                  <div className="flex items-start gap-3">
                    <FaPhone className="text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium">{t('partner.phone')}</p>
                      <a href={`tel:${partner.phone}`} className="text-blue-600 hover:underline">
                        {partner.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {partner.website && (
                  <div className="flex items-start gap-3">
                    <FaGlobe className="text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium">{t('partner.website')}</p>
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {partner.website}
                      </a>
                    </div>
                  </div>
                )}
                
                {partner.hours && (
                  <div className="flex items-start gap-3">
                    <FaClock className="text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium">{t('partner.hours')}</p>
                      <div className="text-gray-600">
                        {Object.entries(partner.hours).map(([day, hours]) => (
                          <p key={day}>
                            <span className="capitalize">{day}:</span> {hours}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Map */}
            <Card>
              <h3 className="text-xl font-bold mb-4">{t('partner.location')}</h3>
              <div className="h-64 rounded-lg overflow-hidden">
                {/* Map component would go here */}
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Map View</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        partner={partner}
      />
    </div>
  );
};

export default PartnerDetails;
"""
    
    with open("frontend/src/components/partner/PartnerDetails.tsx", "w") as f:
        f.write(content)
    print("Fixed: frontend/src/components/partner/PartnerDetails.tsx")

def fix_select_component():
    """Fix common/Select.tsx component"""
    content = """import React, { forwardRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'filled';
  icon?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder = 'Select an option',
      size = 'medium',
      variant = 'default',
      icon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2',
      large: 'px-5 py-3 text-lg'
    };

    const variantClasses = {
      default: 'border-gray-300 focus:border-purple-500 bg-white',
      outline: 'border-2 border-gray-300 focus:border-purple-500 bg-transparent',
      filled: 'border-transparent bg-gray-100 focus:bg-white focus:border-purple-500'
    };

    const baseClasses = `
      w-full rounded-lg border appearance-none
      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20
      transition-all duration-200
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
      ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}
      ${icon ? 'pl-10' : ''}
    `;

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <select
            ref={ref}
            disabled={disabled}
            className={`${baseClasses} pr-10`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
            <FaChevronDown />
          </div>
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
"""
    
    with open("frontend/src/components/common/Select.tsx", "w") as f:
        f.write(content)
    print("Fixed: frontend/src/components/common/Select.tsx")

def fix_auth_service():
    """Fix auth.service.ts"""
    content = """import { apiService } from './api';
import { User, AuthTokens, LoginRequest, RegisterRequest } from './api';

class AuthService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';

  async login(credentials: LoginRequest): Promise<User> {
    const response = await apiService.login(credentials);
    
    if (response.success && response.data) {
      const { accessToken, refreshToken, user } = response.data;
      
      // Store tokens
      this.setTokens({ accessToken, refreshToken } as AuthTokens);
      
      // Store user data
      this.setUser(user);
      
      return user;
    }
    
    throw new Error(response.error || 'Login failed');
  }

  async register(data: RegisterRequest): Promise<User> {
    const response = await apiService.register(data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiService.refreshToken(refreshToken);
    
    if (response.success && response.data) {
      this.setTokens(response.data);
    } else {
      throw new Error('Token refresh failed');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await apiService.forgotPassword(email);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to send reset email');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiService.resetPassword({ token, newPassword });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to reset password');
    }
  }

  // Token management
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  // User management
  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Auth state
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getUser();
  }

  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Utility methods
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  hasPermission(permission: string): boolean {
    const user = this.getUser();
    return user?.permissions?.includes(permission) || false;
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export the class for testing
export default AuthService;
"""
    
    with open("frontend/src/services/auth.service.ts", "w") as f:
        f.write(content)
    print("Fixed: frontend/src/services/auth.service.ts")

def fix_user_service():
    """Fix user.service.ts"""
    content = """import { apiService } from './api';
import { User, Card, PaginatedResponse } from './api';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  bio?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  updates: boolean;
  reminders: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: boolean;
}

export interface UserStats {
  totalCards: number;
  totalSavings: number;
  totalTransactions: number;
  memberSince: string;
  lastActive: string;
}

class UserService {
  async getCurrentUser(): Promise<User> {
    const response = await apiService.getCurrentUser();
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch user');
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiService.updateProfile(data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update profile');
  }

  async uploadAvatar(file: File): Promise<string> {
    const response = await apiService.uploadAvatar(file);
    
    if (response.success && response.data) {
      return response.data.url;
    }
    
    throw new Error(response.error || 'Failed to upload avatar');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiService.post('/users/me/password', {
      currentPassword,
      newPassword
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to change password');
    }
  }

  async getUserStats(): Promise<UserStats> {
    const response = await apiService.get<UserStats>('/users/me/stats');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch user stats');
  }

  async getUserCards(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<PaginatedResponse<Card>> {
    const response = await apiService.get<PaginatedResponse<Card>>('/users/me/cards', params);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch user cards');
  }

  async getFavoritePartners(): Promise<Partner[]> {
    const response = await apiService.get<Partner[]>('/users/me/favorites');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch favorite partners');
  }

  async addFavoritePartner(partnerId: string): Promise<void> {
    const response = await apiService.post(`/users/me/favorites/${partnerId}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to add favorite');
    }
  }

  async removeFavoritePartner(partnerId: string): Promise<void> {
    const response = await apiService.delete(`/users/me/favorites/${partnerId}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove favorite');
    }
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await apiService.get<NotificationSettings>('/users/me/notifications');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch notification settings');
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    const response = await apiService.put('/users/me/notifications', settings);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update notification settings');
    }
  }

  async deleteAccount(password: string): Promise<void> {
    const response = await apiService.delete('/users/me', { data: { password } });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete account');
    }
  }

  async exportUserData(): Promise<Blob> {
    const response = await apiService.get('/users/me/export', {
      responseType: 'blob'
    });
    
    if (response.success && response.data) {
      return response.data as Blob;
    }
    
    throw new Error(response.error || 'Failed to export user data');
  }
}

// Export singleton instance
export const userService = new UserService();

// Export the class for testing
export default UserService;
"""
    
    with open("frontend/src/services/user.service.ts", "w") as f:
        f.write(content)
    print("Fixed: frontend/src/services/user.service.ts")

def fix_partner_service():
    """Fix partner.service.ts"""
    content = """import { axiosInstance } from './api';
import { ApiResponse, PaginatedResponse } from './api';

export interface Partner {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    country: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hours?: Record<string, string>;
  images: string[];
  imageUrl: string;
  coverImage?: string;
  logo?: string;
  discount: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  partnerId: string;
  rating: number;
  comment: string;
  images?: string[];
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerSearchParams {
  query?: string;
  category?: string;
  subcategory?: string;
  location?: string;
  minDiscount?: number;
  maxDistance?: number;
  rating?: number;
  tags?: string[];
  sortBy?: 'relevance' | 'discount' | 'rating' | 'distance' | 'newest';
  page?: number;
  pageSize?: number;
}

class PartnerService {
  async getPartners(params?: PartnerSearchParams): Promise<PaginatedResponse<Partner>> {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Partner>>>('/partners', { params });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch partners');
  }

  async getPartner(id: string): Promise<Partner> {
    const response = await axiosInstance.get<ApiResponse<Partner>>(`/partners/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Partner not found');
  }

  async getFeaturedPartners(): Promise<Partner[]> {
    const response = await axiosInstance.get<ApiResponse<Partner[]>>('/partners/featured');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch featured partners');
  }

  async getNearbyPartners(lat: number, lng: number, radius: number = 5000): Promise<Partner[]> {
    const response = await axiosInstance.get<ApiResponse<Partner[]>>('/partners/nearby', {
      params: { lat, lng, radius }
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch nearby partners');
  }

  async getPartnerReviews(
    partnerId: string,
    params?: {
      page?: number;
      pageSize?: number;
      sortBy?: 'newest' | 'helpful' | 'rating';
    }
  ): Promise<PaginatedResponse<PartnerReview>> {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<PartnerReview>>>(
      `/partners/${partnerId}/reviews`,
      { params }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch reviews');
  }

  async submitReview(
    partnerId: string,
    review: {
      rating: number;
      comment: string;
      images?: File[];
    }
  ): Promise<PartnerReview> {
    const formData = new FormData();
    formData.append('rating', review.rating.toString());
    formData.append('comment', review.comment);
    
    if (review.images) {
      review.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }
    
    const response = await axiosInstance.post<ApiResponse<PartnerReview>>(
      `/partners/${partnerId}/reviews`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to submit review');
  }

  async markReviewHelpful(reviewId: string): Promise<void> {
    const response = await axiosInstance.post<ApiResponse<void>>(`/reviews/${reviewId}/helpful`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to mark review as helpful');
    }
  }

  async reportReview(reviewId: string, reason: string): Promise<void> {
    const response = await axiosInstance.post<ApiResponse<void>>(`/reviews/${reviewId}/report`, {
      reason
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to report review');
    }
  }

  async getCategories(): Promise<string[]> {
    const response = await axiosInstance.get<ApiResponse<string[]>>('/partners/categories');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch categories');
  }

  async redeemDiscount(partnerId: string, code?: string): Promise<{
    qrCode: string;
    expiresAt: string;
    discountAmount: number;
  }> {
    const response = await axiosInstance.post<ApiResponse<{
      qrCode: string;
      expiresAt: string;
      discountAmount: number;
    }>>(`/partners/${partnerId}/redeem`, { code });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to redeem discount');
  }
}

// Export singleton instance
export const partnerService = new PartnerService();

// Export the class for testing
export default PartnerService;
"""
    
    with open("frontend/src/services/partner.service.ts", "w") as f:
        f.write(content)
    print("Fixed: frontend/src/services/partner.service.ts")

def fix_api_gateway_routes():
    """Fix api-gateway/src/routes.ts"""
    content = """import { Router, Request, Response, NextFunction } from 'express';
import httpProxy from 'http-proxy-middleware';
import { authenticate } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

const router = Router();

// Service endpoints configuration
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  users: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  partners: process.env.PARTNER_SERVICE_URL || 'http://localhost:3003',
  transactions: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3004',
  notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3006'
};

// Create proxy middleware for each service
const createProxyMiddleware = (target: string) => {
  return httpProxy.createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1': ''
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward user info from JWT
      if ((req as any).user) {
        proxyReq.setHeader('X-User-Id', (req as any).user.id);
        proxyReq.setHeader('X-User-Role', (req as any).user.role);
      }
      
      // Log the request
      logger.info(`Proxying ${req.method} ${req.path} to ${target}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add correlation ID to response
      proxyRes.headers['X-Correlation-Id'] = (req as any).correlationId;
    },
    onError: (err, req, res) => {
      logger.error('Proxy error:', err);
      (res as Response).status(502).json({
        success: false,
        error: 'Service temporarily unavailable'
      });
    }
  });
};

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// Public routes (no authentication required)
router.post('/auth/login', rateLimiter({ max: 5, windowMs: 15 * 60 * 1000 }), createProxyMiddleware(services.auth));
router.post('/auth/register', rateLimiter({ max: 3, windowMs: 60 * 60 * 1000 }), createProxyMiddleware(services.auth));
router.post('/auth/forgot-password', rateLimiter({ max: 3, windowMs: 60 * 60 * 1000 }), createProxyMiddleware(services.auth));
router.post('/auth/reset-password', rateLimiter({ max: 3, windowMs: 60 * 60 * 1000 }), createProxyMiddleware(services.auth));
router.post('/auth/refresh', createProxyMiddleware(services.auth));

// Public partner routes
router.get('/partners', createProxyMiddleware(services.partners));
router.get('/partners/:id', createProxyMiddleware(services.partners));
router.get('/partners/featured', createProxyMiddleware(services.partners));
router.get('/partners/categories', createProxyMiddleware(services.partners));

// Protected routes (authentication required)
router.use('/auth/logout', authenticate, createProxyMiddleware(services.auth));
router.use('/auth/verify-email', authenticate, createProxyMiddleware(services.auth));

// User routes
router.use('/users/me', authenticate, createProxyMiddleware(services.users));
router.use('/users/:id', authenticate, createProxyMiddleware(services.users));

// Partner management routes (authenticated)
router.use('/partners/:id/reviews', authenticate, createProxyMiddleware(services.partners));
router.use('/partners/:id/redeem', authenticate, createProxyMiddleware(services.partners));

// Transaction routes
router.use('/transactions', authenticate, createProxyMiddleware(services.transactions));

// Notification routes
router.use('/notifications', authenticate, createProxyMiddleware(services.notifications));

// Analytics routes
router.use('/analytics', authenticate, createProxyMiddleware(services.analytics));

// Admin routes (require admin role)
router.use('/admin', authenticate, (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
}, createProxyMiddleware(services.users));

// Catch-all route
router.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

export default router;
"""
    
    with open("api-gateway/src/routes.ts", "w") as f:
        f.write(content)
    print("Fixed: api-gateway/src/routes.ts")

def fix_api_gateway_index():
    """Fix api-gateway/src/index.ts"""
    content = """import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { corsOptions } from './config/cors';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

class ApiGateway {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable for API
      crossOriginEmbedderPolicy: false
    }));

    // CORS
    this.app.use(cors(corsOptions));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request ID middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      (req as any).correlationId = req.headers['x-correlation-id'] || uuidv4();
      res.setHeader('X-Correlation-Id', (req as any).correlationId);
      next();
    });

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    }));

    // Custom request logger
    this.app.use(requestLogger);

    // Health check endpoint (before authentication)
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      });
    });
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api/v1', routes);

    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'BOOM Card API Gateway',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString()
      });
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
      });
    });

    // Global error handler
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`API Gateway running on port ${this.port}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Services configured:`, {
        auth: process.env.AUTH_SERVICE_URL,
        users: process.env.USER_SERVICE_URL,
        partners: process.env.PARTNER_SERVICE_URL,
        transactions: process.env.TRANSACTION_SERVICE_URL,
        notifications: process.env.NOTIFICATION_SERVICE_URL,
        analytics: process.env.ANALYTICS_SERVICE_URL
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      process.exit(0);
    });

    // Unhandled errors
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }
}

// Create and start the gateway
const gateway = new ApiGateway();
gateway.start();

export default gateway;
"""
    
    with open("api-gateway/src/index.ts", "w") as f:
        f.write(content)
    print("Fixed: api-gateway/src/index.ts")

def main():
    """Fix all remaining truncated files"""
    print("Fixing remaining truncated files in BOOM Card project...")
    
    # Create directories if they don't exist
    os.makedirs("frontend/src/components/search", exist_ok=True)
    os.makedirs("frontend/src/components/partner", exist_ok=True)
    os.makedirs("frontend/src/components/common", exist_ok=True)
    os.makedirs("frontend/src/services", exist_ok=True)
    os.makedirs("api-gateway/src", exist_ok=True)
    
    # Fix frontend components
    fix_search_results_component()
    fix_partner_map_component()
    fix_partner_details_component()
    fix_select_component()
    
    # Fix frontend services
    fix_auth_service()
    fix_user_service()
    fix_partner_service()
    
    # Fix API Gateway
    fix_api_gateway_routes()
    fix_api_gateway_index()
    
    print("\nAll remaining truncated files have been fixed!")
    print("\nNext steps:")
    print("1. Install dependencies in each directory (npm install)")
    print("2. Create .env files with necessary configuration")
    print("3. Set up databases (PostgreSQL, Redis, Elasticsearch)")
    print("4. Run the services")

if __name__ == "__main__":
    main()