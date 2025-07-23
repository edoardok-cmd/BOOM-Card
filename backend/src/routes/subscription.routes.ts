import { Router } from 'express';
import { pool } from '../database/init';
import { createSubscriptionController } from '../controllers/subscription.controller';

// Simple auth middleware for testing
const simpleAuthMiddleware = (req: any, res: any, next: any) => {
  // For testing, we'll simulate an authenticated user
  // In production, this should validate JWT tokens
  req.user = {
    id: 'a9961504-ef22-423c-b34b-0824f7c16303', // Valid UUID from database
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
    id: 'a9961504-ef22-423c-b34b-0824f7c16303', // Valid UUID from database
    email: 'admin@example.com',
    role: 'admin'
  };
  next();
};

// Create router
const router = Router();
const subscriptionController = createSubscriptionController(pool);

// Public routes - get subscription plans
router.get('/plans', subscriptionController.getAllPlans);
router.get('/plans/:id', subscriptionController.getPlanById);

// Authenticated user routes
router.post('/', simpleAuthMiddleware, subscriptionController.createSubscription);
router.get('/me', simpleAuthMiddleware, subscriptionController.getMySubscription);
router.get('/me/history', simpleAuthMiddleware, subscriptionController.getMySubscriptionHistory);
router.put('/:id', simpleAuthMiddleware, subscriptionController.updateSubscription);
router.delete('/:id', simpleAuthMiddleware, subscriptionController.cancelSubscription);
router.post('/:id/renew', simpleAuthMiddleware, subscriptionController.renewSubscription);

// Admin routes
router.post('/check-expired', simpleAdminMiddleware, subscriptionController.checkExpiredSubscriptions);

export default router;