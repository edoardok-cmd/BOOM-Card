import { Router } from 'express';
import { pool } from '../database/init';
import { createPartnerController } from '../controllers/partner.controller';

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

// Simple admin middleware for testing
const simpleAdminMiddleware = (req: any, res: any, next: any) => {
  // For testing, we'll simulate an admin user
  // In production, this should check user role
  req.user = {
    id: '1',
    email: 'admin@example.com',
    role: 'admin'
  };
  next();
};

// Create router
const router = Router();
const partnerController = createPartnerController(pool);

// Public routes
router.get('/categories', partnerController.getCategories);
router.get('/cities', partnerController.getCities);
router.get('/featured', partnerController.getFeaturedPartners);
router.get('/', partnerController.getPartners);
router.get('/slug/:slug', partnerController.getPartnerBySlug);
router.get('/:id', partnerController.getPartnerById);

// Admin routes (require admin role)
router.post('/', simpleAdminMiddleware, partnerController.createPartner);
router.put('/:id', simpleAdminMiddleware, partnerController.updatePartner);
router.delete('/:id', simpleAdminMiddleware, partnerController.deactivatePartner);

export default router;