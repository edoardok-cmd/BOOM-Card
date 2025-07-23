import { Router } from 'express';
import { pool } from '../database/init';
import { createQRCodeController } from '../controllers/qrcode.controller';

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
const qrCodeController = createQRCodeController(pool);

// Protected routes - all QR code routes require authentication
router.get('/membership', simpleAuthMiddleware, qrCodeController.generateMembershipQR);
router.post('/discount', simpleAuthMiddleware, qrCodeController.generateDiscountQR);
router.post('/partner', simpleAuthMiddleware, qrCodeController.generatePartnerQR);
router.post('/verify', qrCodeController.verifyQR); // Public route for partners to verify
router.get('/download/:type', simpleAuthMiddleware, qrCodeController.downloadQR);

export default router;