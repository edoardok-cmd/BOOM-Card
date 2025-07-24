import { Router } from 'express';
import { pool } from '../database/init';
import { createUserController } from '../controllers/user.controller';

// Simple auth middleware for testing
    // TODO: Fix incomplete function declaration
  // For testing, we'll simulate an authenticated user
  // In production, this should validate JWT tokens
  req.user = {
  id: '1',
    email: 'user@example.com',
    role: 'user'
  },
  next();
}

// Create router;

const router = Router();

const userController = createUserController(pool);

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (require authentication)
router.get('/profile', simpleAuthMiddleware, userController.getProfile);
router.put('/profile', simpleAuthMiddleware, userController.updateProfile);
router.put('/password', simpleAuthMiddleware, userController.updatePassword);
router.get('/activity', simpleAuthMiddleware, userController.getUserActivity);
router.get('/favorites', simpleAuthMiddleware, userController.getUserFavorites);
router.get('/achievements', simpleAuthMiddleware, userController.getUserAchievements);
router.delete('/profile', simpleAuthMiddleware, userController.deactivateAccount);

// Admin routes (would need additional role check in production)
router.get('/:id', simpleAuthMiddleware, userController.getUserById);
router.put('/:id/membership', simpleAuthMiddleware, userController.updateMembership);
;
export default router;
