import { Router } from 'express';
import { Pool } from 'pg';
import { createReviewController } from '../controllers/review.controller';
import { authenticateToken } from '../middleware/auth.middleware';

export const createReviewRoutes = (pool: Pool): Router => {
  const router = Router();
  const reviewController = createReviewController(pool);

  // Public routes
  router.get('/partner/:partnerId', reviewController.getPartnerReviews);
  router.get('/stats/:partnerId', reviewController.getPartnerStats);
  router.get('/recent', reviewController.getRecentReviews);

  // Protected routes (require authentication)
  router.use(authenticateToken);
  
  router.post('/', reviewController.createReview);
  router.get('/my-reviews', reviewController.getMyReviews);
  router.get('/:id', reviewController.getReviewById);
  router.put('/:id', reviewController.updateReview);
  router.delete('/:id', reviewController.deleteReview);

  return router;
};