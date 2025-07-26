import { create } from 'zustand';
import { partnerService } from '../services/partnerService';
import { Partner, PartnerFilters, Favorite } from '../types';

interface PartnerState {
  // Data
  partners: Partner[];
  featuredPartners: Partner[];
  categories: string[];
  favorites: Favorite[];
  selectedPartner: Partner | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  
  // Filters
  filters: PartnerFilters;
  
  // Loading states
  isLoading: boolean;
  isFeaturedLoading: boolean;
  isCategoriesLoading: boolean;
  isFavoritesLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  loadPartners: (page?: number) => Promise<void>;
  loadFeaturedPartners: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  setFilters: (filters: Partial<PartnerFilters>) => void;
  setSelectedPartner: (partner: Partner | null) => void;
  toggleFavorite: (partnerId: string) => Promise<void>;
  clearError: () => void;
}

export const usePartnerStore = create<PartnerState>((set, get) => ({
  // Initial state
  partners: [],
  featuredPartners: [],
  categories: [],
  favorites: [],
  selectedPartner: null,
  currentPage: 1,
  totalPages: 0,
  totalCount: 0,
  pageSize: 12,
  filters: {
    sortBy: 'rating'
  },
  isLoading: false,
  isFeaturedLoading: false,
  isCategoriesLoading: false,
  isFavoritesLoading: false,
  error: null,

  // Load partners with current filters
  loadPartners: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters, pageSize } = get();
      const response = await partnerService.getPartners({
        ...filters,
        page,
        pageSize
      });
      
      set({
        partners: response.data,
        currentPage: response.page,
        totalPages: response.totalPages,
        totalCount: response.total,
        isLoading: false
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to load partners'
      });
    }
  },

  // Load featured partners
  loadFeaturedPartners: async () => {
    set({ isFeaturedLoading: true });
    try {
      const partners = await partnerService.getFeaturedPartners();
      set({
        featuredPartners: partners,
        isFeaturedLoading: false
      });
    } catch (error: any) {
      set({
        isFeaturedLoading: false,
        error: error.message || 'Failed to load featured partners'
      });
    }
  },

  // Load categories
  loadCategories: async () => {
    set({ isCategoriesLoading: true });
    try {
      const categories = await partnerService.getCategories();
      set({
        categories,
        isCategoriesLoading: false
      });
    } catch (error: any) {
      set({
        isCategoriesLoading: false,
        error: error.message || 'Failed to load categories'
      });
    }
  },

  // Load user favorites
  loadFavorites: async () => {
    set({ isFavoritesLoading: true });
    try {
      const favorites = await partnerService.getFavorites();
      set({
        favorites,
        isFavoritesLoading: false
      });
    } catch (error: any) {
      set({
        isFavoritesLoading: false,
        error: error.message || 'Failed to load favorites'
      });
    }
  },

  // Update filters and reload
  setFilters: (newFilters: Partial<PartnerFilters>) => {
    const currentFilters = get().filters;
    set({
      filters: { ...currentFilters, ...newFilters }
    });
    // Automatically reload partners when filters change
    get().loadPartners(1);
  },

  // Set selected partner for detail view
  setSelectedPartner: (partner: Partner | null) => {
    set({ selectedPartner: partner });
  },

  // Toggle favorite status
  toggleFavorite: async (partnerId: string) => {
    const { favorites } = get();
    const isFavorite = favorites.some(f => f.partnerId === partnerId);
    
    try {
      if (isFavorite) {
        await partnerService.removeFromFavorites(partnerId);
        set({
          favorites: favorites.filter(f => f.partnerId !== partnerId)
        });
      } else {
        await partnerService.addToFavorites(partnerId);
        // Reload favorites to get the updated list
        get().loadFavorites();
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update favorites'
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));