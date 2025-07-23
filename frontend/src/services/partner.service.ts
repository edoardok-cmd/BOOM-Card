import { axiosInstance } from './api';
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
