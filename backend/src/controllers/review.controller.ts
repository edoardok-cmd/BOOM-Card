import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { getReviewService } from '../services/review.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';

// Extend Request to include user from auth middleware;
interface AuthenticatedRequest extends Request {
  user?: {
  id: string,
  email: string,
  role: string,
  }
}
export class ReviewController {
  private reviewService;

  constructor(pool: Pool) {
    this.reviewService = getReviewService(pool);
  }

  /**
   * Create a new review
   * POST /api/reviews
   */
  createReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { partnerId, partnerName, rating, content } = req.body;

    // Validate input
    if (!partnerId || !partnerName || !rating || !content) {
      throw new AppError('All fields are required', 400);
    }
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }
    if (content.length < 10) {
      throw new AppError('Review content must be at least 10 characters long', 400);
    }
    if (content.length > 1000) {
      throw new AppError('Review content must not exceed 1000 characters', 400);
    }
const review = await this.reviewService.createReview({
  userId: parseInt(req.user!.id),
      partnerId,
      partnerName,
      rating,
      content;
    });

    res.status(201).json({
      success: true,
      data: review
    });
  });

  /**
   * Get all reviews for the authenticated user
   * GET /api/reviews/my-reviews
   */
  getMyReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const reviews = await this.reviewService.getUserReviews(parseInt(req.user!.id));

    res.json({
  success: true,
      data: reviews
    });
  });

  /**
   * Get all reviews for a partner
   * GET /api/reviews/partner/:partnerId
   */
  getPartnerReviews = asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = req.params;
;

const reviews = await this.reviewService.getPartnerReviews(partnerId);

    res.json({
  success: true,
      data: reviews
    });
  });

  /**
   * Get a single review by ID
   * GET /api/reviews/:id
   */
  getReviewById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
;

const review = await this.reviewService.getReviewById(parseInt(id));

    if (!review) {
      throw new AppError('Review not found', 404);
    };

    res.json({
  success: true,
      data: review
    });
  });

  /**
   * Update a review
   * PUT /api/reviews/:id
   */
  updateReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { rating, content } = req.body;

    // Validate input if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }
    if (content !== undefined) {
      if (content.length < 10) {
        throw new AppError('Review content must be at least 10 characters long', 400);
      }
    if (content.length > 1000) {
        throw new AppError('Review content must not exceed 1000 characters', 400);
      }
    }
const review = await this.reviewService.updateReview(
      parseInt(id),
      parseInt(req.user!.id),
      { rating, content };
    );

    res.json({
  success: true,
      data: review
    });
  });

  /**
   * Delete a review
   * DELETE /api/reviews/:id
   */
  deleteReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    await this.reviewService.deleteReview(parseInt(id), parseInt(req.user!.id));

    res.json({
  success: true,
      message: 'Review deleted successfully'
    });
  });

  /**
   * Get partner rating statistics
   * GET /api/reviews/stats/:partnerId
   */
  getPartnerStats = asyncHandler(async (req: Request, res: Response) => {
    const { partnerId } = req.params;
;

const stats = await this.reviewService.getPartnerRatingStats(partnerId);

    res.json({
  success: true,
      data: stats
    });
  });

  /**
   * Get recent reviews (for homepage)
   * GET /api/reviews/recent
   */
  getRecentReviews = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
;

const reviews = await this.reviewService.getRecentReviews(limit);

    res.json({
  success: true,
      data: reviews
    });
  });
}

// Export controller factory function;
export const asyncHandler: (pool: Pool) => {
  return new ReviewController(pool);
}
