import { Request, Response } from 'express';
import { Pool } from 'pg';
import { getPartnerService } from '../services/partner.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';

// Extend Request to include user from auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class PartnerController {
  private partnerService;

  constructor(pool: Pool) {
    this.partnerService = getPartnerService(pool);
  }

  /**
   * Create a new partner (admin only)
   * POST /api/partners
   */
  createPartner = asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      category,
      description,
      logo,
      coverImage,
      address,
      city,
      phone,
      email,
      website,
      discountPercentage,
      discountDescription,
      terms,
      isFeatured
    } = req.body;

    // Validate required fields
    if (!name || !category || !description || !address || !city || !discountPercentage || !discountDescription) {
      throw new AppError('Missing required fields', 400);
    }

    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new AppError('Discount percentage must be between 0 and 100', 400);
    }

    const partner = await this.partnerService.createPartner({
      name,
      category,
      description,
      logo,
      coverImage,
      address,
      city,
      phone,
      email,
      website,
      discountPercentage,
      discountDescription,
      terms,
      isFeatured
    });

    res.status(201).json({
      success: true,
      data: partner
    });
  });

  /**
   * Get all partners with filters
   * GET /api/partners
   */
  getPartners = asyncHandler(async (req: Request, res: Response) => {
    const {
      category,
      city,
      minDiscount,
      search,
      featured
    } = req.query;

    const partners = await this.partnerService.getPartners({
      category: category as string,
      city: city as string,
      minDiscount: minDiscount ? parseInt(minDiscount as string) : undefined,
      searchTerm: search as string,
      isFeatured: featured === 'true' ? true : undefined
    });

    res.json({
      success: true,
      data: partners,
      count: partners.length
    });
  });

  /**
   * Get partner by ID
   * GET /api/partners/:id
   */
  getPartnerById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const partner = await this.partnerService.getPartnerById(parseInt(id));

    if (!partner) {
      throw new AppError('Partner not found', 404);
    }

    res.json({
      success: true,
      data: partner
    });
  });

  /**
   * Get partner by slug
   * GET /api/partners/slug/:slug
   */
  getPartnerBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const partner = await this.partnerService.getPartnerBySlug(slug);

    if (!partner) {
      throw new AppError('Partner not found', 404);
    }

    res.json({
      success: true,
      data: partner
    });
  });

  /**
   * Update partner (admin only)
   * PUT /api/partners/:id
   */
  updatePartner = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    // Validate discount percentage if provided
    if (updateData.discountPercentage !== undefined && 
        (updateData.discountPercentage < 0 || updateData.discountPercentage > 100)) {
      throw new AppError('Discount percentage must be between 0 and 100', 400);
    }

    const partner = await this.partnerService.updatePartner(
      parseInt(id),
      updateData
    );

    res.json({
      success: true,
      data: partner
    });
  });

  /**
   * Deactivate partner (admin only)
   * DELETE /api/partners/:id
   */
  deactivatePartner = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await this.partnerService.deactivatePartner(parseInt(id));

    res.json({
      success: true,
      message: 'Partner deactivated successfully'
    });
  });

  /**
   * Get all categories
   * GET /api/partners/categories
   */
  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await this.partnerService.getCategories();

    res.json({
      success: true,
      data: categories
    });
  });

  /**
   * Get all cities
   * GET /api/partners/cities
   */
  getCities = asyncHandler(async (req: Request, res: Response) => {
    const cities = await this.partnerService.getCities();

    res.json({
      success: true,
      data: cities
    });
  });

  /**
   * Get featured partners
   * GET /api/partners/featured
   */
  getFeaturedPartners = asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;

    const partners = await this.partnerService.getFeaturedPartners(limit);

    res.json({
      success: true,
      data: partners
    });
  });
}

// Export controller factory function
export const createPartnerController = (pool: Pool) => {
  return new PartnerController(pool);
};