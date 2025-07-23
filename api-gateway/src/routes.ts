import { Router, Request, Response, NextFunction } from 'express';
import httpProxy from 'http-proxy-middleware';
import { authenticate } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

const router = Router();

// Service endpoints configuration
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  users: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  partners: process.env.PARTNER_SERVICE_URL || 'http://localhost:3003',
  transactions: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3004',
  notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3006'
};

// Create proxy middleware for each service
const createProxyMiddleware = (target: string) => {
  return httpProxy.createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1': ''
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward user info from JWT
      if ((req as any).user) {
        proxyReq.setHeader('X-User-Id', (req as any).user.id);
        proxyReq.setHeader('X-User-Role', (req as any).user.role);
      }
      
      // Log the request
      logger.info(`Proxying ${req.method} ${req.path} to ${target}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add correlation ID to response
      proxyRes.headers['X-Correlation-Id'] = (req as any).correlationId;
    },
    onError: (err, req, res) => {
      logger.error('Proxy error:', err);
      (res as Response).status(502).json({
        success: false,
        error: 'Service temporarily unavailable'
      });
    });
};

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// Public routes (no authentication required)
router.post('/auth/login', rateLimiter({ max: 5, windowMs: 15 * 60 * 1000 }), createProxyMiddleware(services.auth));
router.post('/auth/register', rateLimiter({ max: 3, windowMs: 60 * 60 * 1000 }), createProxyMiddleware(services.auth));
router.post('/auth/forgot-password', rateLimiter({ max: 3, windowMs: 60 * 60 * 1000 }), createProxyMiddleware(services.auth));
router.post('/auth/reset-password', rateLimiter({ max: 3, windowMs: 60 * 60 * 1000 }), createProxyMiddleware(services.auth));
router.post('/auth/refresh', createProxyMiddleware(services.auth));

// Public partner routes
router.get('/partners', createProxyMiddleware(services.partners));
router.get('/partners/:id', createProxyMiddleware(services.partners));
router.get('/partners/featured', createProxyMiddleware(services.partners));
router.get('/partners/categories', createProxyMiddleware(services.partners));

// Protected routes (authentication required)
router.use('/auth/logout', authenticate, createProxyMiddleware(services.auth));
router.use('/auth/verify-email', authenticate, createProxyMiddleware(services.auth));

// User routes
router.use('/users/me', authenticate, createProxyMiddleware(services.users));
router.use('/users/:id', authenticate, createProxyMiddleware(services.users));

// Partner management routes (authenticated)
router.use('/partners/:id/reviews', authenticate, createProxyMiddleware(services.partners));
router.use('/partners/:id/redeem', authenticate, createProxyMiddleware(services.partners));

// Transaction routes
router.use('/transactions', authenticate, createProxyMiddleware(services.transactions));

// Notification routes
router.use('/notifications', authenticate, createProxyMiddleware(services.notifications));

// Analytics routes
router.use('/analytics', authenticate, createProxyMiddleware(services.analytics));

// Admin routes (require admin role)
router.use('/admin', authenticate, (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
}, createProxyMiddleware(services.users));

// Catch-all route
router.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

export default router;

}
