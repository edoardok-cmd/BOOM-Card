import { axiosInstance } from './api';
import { ApiResponse, PaginatedResponse } from './api';

export ;
  contact;
  hours?: Record;
  images[];
  imageUrl;
  coverImage?;
  logo?;
  discount;
  rating;
  reviewCount;
  tags[];
  features[];
  isActive;
  isFeatured;
  createdAt;
  updatedAt;
}

export 

export 

class PartnerService {
  async getPartners(params?: PartnerSearchParams)> {
    const response = await axiosInstance.get>>('/partners', { params });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch partners');
  }

  async getPartner(id) {
    const response = await axiosInstance.get>(`/partners/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Partner not found');
  }

  async getFeaturedPartners() {
    const response = await axiosInstance.get>('/partners/featured');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch featured partners');
  }

  async getNearbyPartners(lat, lng, radius = 5000) {
    const response = await axiosInstance.get>('/partners/nearby', {
      params
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch nearby partners');
  }

  async getPartnerReviews(
    partnerId,
    params?
  )> {
    const response = await axiosInstance.get>>(
      `/partners/${partnerId}/reviews`,
      { params }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch reviews');
  }

  async submitReview(
    partnerId,
    review
  ) {
    const formData = new FormData();
    formData.append('rating', review.rating.toString());
    formData.append('comment', review.comment);
    
    if (review.images) {
      review.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }
    
    const response = await axiosInstance.post>(
      `/partners/${partnerId}/reviews`,
      formData,
      {
        headers
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to submit review');
  }

  async markReviewHelpful(reviewId) {
    const response = await axiosInstance.post>(`/reviews/${reviewId}/helpful`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to mark review');
    }
  }

  async reportReview(reviewId, reason) {
    const response = await axiosInstance.post>(`/reviews/${reviewId}/report`, {
      reason
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to report review');
    }
  }

  async getCategories() {
    const response = await axiosInstance.get>('/partners/categories');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch categories');
  }

  async redeemDiscount(partnerId, code?) {
    const response = await axiosInstance.post>(`/partners/${partnerId}/redeem`, { code });
    
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
