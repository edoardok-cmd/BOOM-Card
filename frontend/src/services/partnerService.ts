import { boomApi } from './boomApi';
import { 
  Partner, 
  PartnerFilters,
  PaginatedResponse,
  Transaction,
  Favorite,
  ReviewForm
} from '../types';
import { AppError } from '../utils/errorHandler';

class PartnerService {
  private partnersCache: Map<string, Partner> = new Map();
  private featuredPartnersCache: Partner[] | null = null;
  private categoriesCache: string[] | null = null;
  private favoritesCache: Favorite[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 600000; // 10 minutes

  // Get partners with filters
  async getPartners(filters?: PartnerFilters): Promise<PaginatedResponse<Partner>> {
    try {
      const response = await boomApi.getPartners(filters);
      
      // Cache individual partners
      response.data.forEach(partner => {
        this.partnersCache.set(partner.id, partner);
      });
      
      return response;
    } catch (error) {
      throw new AppError('Failed to load partners', 'PARTNERS_LOAD_FAILED', 400);
    }
  }

  // Get single partner
  async getPartner(id: string, forceRefresh: boolean = false): Promise<Partner> {
    // Check cache first
    if (!forceRefresh && this.partnersCache.has(id)) {
      return this.partnersCache.get(id)!;
    }
    
    try {
      const partner = await boomApi.getPartner(id);
      
      // Update cache
      this.partnersCache.set(id, partner);
      
      return partner;
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        throw error;
      }
      throw new AppError('Failed to load partner details', 'PARTNER_LOAD_FAILED', 400);
    }
  }

  // Get featured partners
  async getFeaturedPartners(forceRefresh: boolean = false): Promise<Partner[]> {
    const now = Date.now();
    
    // Return cached data if available and not expired
    if (!forceRefresh && 
        this.featuredPartnersCache && 
        (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.featuredPartnersCache;
    }
    
    try {
      const partners = await boomApi.getFeaturedPartners();
      
      // Update caches
      this.featuredPartnersCache = partners;
      this.cacheTimestamp = now;
      
      // Also cache individual partners
      partners.forEach(partner => {
        this.partnersCache.set(partner.id, partner);
      });
      
      return partners;
    } catch (error) {
      throw new AppError('Failed to load featured partners', 'FEATURED_LOAD_FAILED', 400);
    }
  }

  // Get partner categories
  async getCategories(forceRefresh: boolean = false): Promise<string[]> {
    if (!forceRefresh && this.categoriesCache) {
      return this.categoriesCache;
    }
    
    try {
      const categories = await boomApi.getPartnerCategories();
      this.categoriesCache = categories;
      return categories;
    } catch (error) {
      throw new AppError('Failed to load categories', 'CATEGORIES_LOAD_FAILED', 400);
    }
  }

  // Search partners
  async searchPartners(query: string): Promise<Partner[]> {
    if (!query.trim()) {
      return [];
    }
    
    try {
      const partners = await boomApi.searchPartners(query);
      
      // Cache results
      partners.forEach(partner => {
        this.partnersCache.set(partner.id, partner);
      });
      
      return partners;
    } catch (error) {
      throw new AppError('Search failed', 'SEARCH_FAILED', 400);
    }
  }

  // Get user favorites
  async getFavorites(forceRefresh: boolean = false): Promise<Favorite[]> {
    if (!forceRefresh && this.favoritesCache) {
      return this.favoritesCache;
    }
    
    try {
      const favorites = await boomApi.getFavorites();
      this.favoritesCache = favorites;
      return favorites;
    } catch (error) {
      console.error('Failed to load favorites:', error);
      return [];
    }
  }

  // Add to favorites
  async addToFavorites(partnerId: string): Promise<void> {
    try {
      await boomApi.addFavorite(partnerId);
      
      // Clear favorites cache to force refresh
      this.favoritesCache = null;
      
      // Update partner in cache if exists
      const partner = this.partnersCache.get(partnerId);
      if (partner) {
        partner.featured = true; // Mark as favorited
      }
    } catch (error) {
      throw new AppError('Failed to add to favorites', 'ADD_FAVORITE_FAILED', 400);
    }
  }

  // Remove from favorites
  async removeFromFavorites(partnerId: string): Promise<void> {
    try {
      await boomApi.removeFavorite(partnerId);
      
      // Clear favorites cache
      this.favoritesCache = null;
      
      // Update partner in cache if exists
      const partner = this.partnersCache.get(partnerId);
      if (partner) {
        partner.featured = false;
      }
    } catch (error) {
      throw new AppError('Failed to remove from favorites', 'REMOVE_FAVORITE_FAILED', 400);
    }
  }

  // Check if partner is favorited
  async isFavorited(partnerId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some(fav => fav.partnerId === partnerId);
  }

  // Use discount at partner
  async useDiscount(partnerId: string, discountCode?: string): Promise<{
    transactionId: string;
    savings: number;
  }> {
    try {
      const result = await boomApi.useDiscount(partnerId, discountCode);
      
      // Clear caches that might be affected
      this.favoritesCache = null;
      
      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to use discount', 'DISCOUNT_USE_FAILED', 400);
    }
  }

  // Submit review for partner
  async submitReview(data: ReviewForm): Promise<void> {
    try {
      await boomApi.submitReview(data);
      
      // Clear partner cache to force refresh with new rating
      const partner = this.partnersCache.get(data.partner);
      if (partner) {
        this.partnersCache.delete(data.partner);
      }
    } catch (error) {
      throw new AppError('Failed to submit review', 'REVIEW_SUBMIT_FAILED', 400);
    }
  }

  // Get partner by category
  async getPartnersByCategory(category: string): Promise<Partner[]> {
    const response = await this.getPartners({ category });
    return response.data;
  }

  // Get partner by location
  async getPartnersByLocation(location: string): Promise<Partner[]> {
    const response = await this.getPartners({ location });
    return response.data;
  }

  // Get nearby partners (if location services are available)
  async getNearbyPartners(maxDistance: number = 5): Promise<Partner[]> {
    if (!navigator.geolocation) {
      throw new AppError('Geolocation not supported', 'GEOLOCATION_NOT_SUPPORTED', 400);
    }
    
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // This would typically send coordinates to the API
            // For now, just return filtered partners
            const response = await this.getPartners({ 
              sortBy: 'name' // Would be 'distance' with real coordinates
            });
            resolve(response.data);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(new AppError(
            'Failed to get location',
            'LOCATION_ACCESS_DENIED',
            403
          ));
        }
      );
    });
  }

  // Clear all caches
  clearCache(): void {
    this.partnersCache.clear();
    this.featuredPartnersCache = null;
    this.categoriesCache = null;
    this.favoritesCache = null;
    this.cacheTimestamp = 0;
  }

  // Get partner recommendations based on user activity
  async getRecommendations(limit: number = 6): Promise<Partner[]> {
    try {
      // Get user's favorite categories and recent transactions
      const [favorites, transactions] = await Promise.all([
        this.getFavorites(),
        boomApi.getTransactions({ status: 'completed' })
      ]);
      
      // Extract categories from favorites and transactions
      const categories = new Set<string>();
      favorites.forEach(fav => categories.add(fav.category));
      transactions.slice(0, 10).forEach(t => {
        // Would need to fetch partner details to get category
        // For now, just use featured partners
      });
      
      // Get featured partners as recommendations
      return await this.getFeaturedPartners();
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      // Fallback to featured partners
      return await this.getFeaturedPartners();
    }
  }
}

// Export singleton instance
export const partnerService = new PartnerService();

// Export the class for testing
export default PartnerService;