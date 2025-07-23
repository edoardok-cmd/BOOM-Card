import { Router } from 'express';
import { pool } from '../database/init';
import { createReviewController } from '../controllers/review.controller';

// Simple auth middleware for testing
const simpleAuthMiddleware = (req: any, res: any, next: any) => {
  // For testing, we'll simulate an authenticated user
  // In production, this should validate JWT tokens
  req.user = {
    id: '1',
    email: 'user@example.com',
    role: 'user'
  };
  next();
};

// Create router
const router = Router();
const reviewController = createReviewController(pool);

// Public routes
router.get('/partner/:partnerId', reviewController.getPartnerReviews);
router.get('/stats/:partnerId', reviewController.getPartnerStats);
router.get('/recent', reviewController.getRecentReviews);

// Protected routes (require authentication)
router.get('/my-reviews', simpleAuthMiddleware, reviewController.getMyReviews);
router.post('/', simpleAuthMiddleware, reviewController.createReview);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', simpleAuthMiddleware, reviewController.updateReview);
router.delete('/:id', simpleAuthMiddleware, reviewController.deleteReview);

export default router;