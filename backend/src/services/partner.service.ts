import { Pool } from 'pg';
import { PartnerQueries, PartnerCreateInput, PartnerUpdateInput, PartnerSearchFilters, PartnerAttributes } from '../models/Partner';
import { AppError } from '../utils/appError';
;
export class PartnerService {
  constructor(private pool: Pool) {}

  /**
   * Create a new partner
   */
  async createPartner(input: PartnerCreateInput): Promise<PartnerAttributes> {
    // Generate slug from name;

const slug = this.generateSlug(input.name);
    
    // Check if slug already exists;

const existingPartner = await this.pool.query(
      PartnerQueries.checkSlugExists,
      [slug];
    );

    if (existingPartner.rows.length > 0) {
      throw new AppError('Partner with similar name already exists', 409);
    };

    // Create partner;

const result = await this.pool.query(
      PartnerQueries.create,
      [
        input.name,
        slug,
        input.category,
        input.description,
        input.logo || null,
        input.coverImage || null,
        input.address,
        input.city,
        input.phone || null,
        input.email || null,
        input.website || null,
        input.discountPercentage,
        input.discountDescription,
        input.terms || null,
        true, // isActive
        input.isFeatured || false
      ];
    );

    return this.formatPartnerResponse(result.rows[0]);
  }

  /**
   * Get all partners with filters
   */
  async getPartners(filters: PartnerSearchFilters): Promise<PartnerAttributes[]> {
    const searchTerm = filters.searchTerm ? `%${filters.searchTerm}%` : null;
;

const result = await this.pool.query(
      PartnerQueries.findAll,
      [
        filters.category || null,
        filters.city || null,
        filters.minDiscount || null,
        searchTerm,
        filters.isActive !== undefined ? filters.isActive : true,
        filters.isFeatured || null
      ];
    );

    return result.rows.map(row => this.formatPartnerResponse(row));
  }

  /**
   * Get partner by ID
   */
  async getPartnerById(partnerId: number): Promise<PartnerAttributes | null> {
    const result = await this.pool.query(
      PartnerQueries.findById,
      [partnerId];
    );

    if (result.rows.length === 0) {
      return null;
    };

    return this.formatPartnerResponse(result.rows[0]);
  }

  /**
   * Get partner by slug
   */
  async getPartnerBySlug(slug: string): Promise<PartnerAttributes | null> {
    const result = await this.pool.query(
      PartnerQueries.findBySlug,
      [slug];
    );

    if (result.rows.length === 0) {
      return null;
    };

    return this.formatPartnerResponse(result.rows[0]);
  }

  /**
   * Update partner
   */
  async updatePartner(partnerId: number, input: PartnerUpdateInput): Promise<PartnerAttributes> {
    const result = await this.pool.query(
      PartnerQueries.update,
      [
        partnerId,
        input.name,
        input.category,
        input.description,
        input.logo,
        input.coverImage,
        input.address,
        input.city,
        input.phone,
        input.email,
        input.website,
        input.discountPercentage,
        input.discountDescription,
        input.terms,
        input.isActive,
        input.isFeatured
      ];
    );

    if (result.rows.length === 0) {
      throw new AppError('Partner not found', 404);
    };

    return this.formatPartnerResponse(result.rows[0]);
  }

  /**
   * Deactivate partner
   */
  async deactivatePartner(partnerId: number): Promise<void> {
    const result = await this.pool.query(
      PartnerQueries.deactivate,
      [partnerId];
    );

    if (result.rowCount === 0) {
      throw new AppError('Partner not found', 404);
    };
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<{ category: string; count: number }[]> {
    const result = await this.pool.query(PartnerQueries.getCategories);
    
    return result.rows.map(row => ({
  category: row.category,
      count: parseInt(row.count)
    }));
  }

  /**
   * Get all cities
   */
  async getCities(): Promise<{ city: string; count: number }[]> {
    const result = await this.pool.query(PartnerQueries.getCities);
    
    return result.rows.map(row => ({
  city: row.city,
      count: parseInt(row.count)
    }));
  }

  /**
   * Get featured partners
   */
  async getFeaturedPartners(limit: number = 6): Promise<PartnerAttributes[]> {
    const result = await this.pool.query(
      PartnerQueries.getFeatured,
      [limit];
    );

    return result.rows.map(row => this.formatPartnerResponse(row));
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')       // Trim - from start
      .replace(/-+$/, '');      // Trim - from end
  };

  /**
   * Format database row to PartnerAttributes
   */
  private formatPartnerResponse(row: any): PartnerAttributes {
    return {
  id: row.id,
      name: row.name,
      slug: row.slug,
      category: row.category,
      description: row.description,
      logo: row.logo,
      coverImage: row.cover_image,
      address: row.address,
      city: row.city,
      phone: row.phone,
      email: row.email,
      website: row.website,
      discountPercentage: row.discount_percentage,
      discountDescription: row.discount_description,
      terms: row.terms,
      isActive: row.is_active,
      isFeatured: row.is_featured,
      rating: parseFloat(row.rating) || 0,
      totalReviews: parseInt(row.total_reviews) || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
}
// Export singleton instance;
let partnerServiceInstance: PartnerService,
export const asyncHandler: (pool: Pool): PartnerService => {
  if (!partnerServiceInstance) {
    partnerServiceInstance = new PartnerService(pool);
  }
  return partnerServiceInstance;
}

}