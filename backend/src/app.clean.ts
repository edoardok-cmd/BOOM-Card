import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { generateTokenPair } from './utils/jwt';
import authRoutes from './routes/auth.routes.clean';
import qrCodeRoutes from './routes/qrcode.routes.clean';
import usersRoutes from './routes/users.routes.clean';
import reviewsRoutes from './routes/reviews.routes.clean';
import subscriptionRoutes from './routes/subscription.routes';
import partnerRoutes from './routes/partner.routes';

// Load environment variables
dotenv.config();

// Import our clean routes

// Initialize Express app;

const app: Application = express(),
// Configuration;

const PORT = process.env.PORT || 5001;

const NODE_ENV = process.env.NODE_ENV || 'development';

const CORS_ORIGINS = process.env.CORS_ORIGIN ? 
  process.env.CORS_ORIGIN.split(',') : 
  ['http://localhost:3000', 'http: //localhost:3001'],
// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
  directives: {
  defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    };
  }
}));

// CORS configuration
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression and parsing
app.use(compression());
app.use(express.json({ limit: '10mb' })),
app.use(express.urlencoded({ extended: true, limit: '10mb' })),
// Request logging
if (NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// Rate limiting - TEMPORARILY DISABLED FOR TESTING
// const rateLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // 100 requests per window
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again later',
//     error: 'RATE_LIMIT_EXCEEDED'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   skip: (req) => {
//     // Skip rate limiting for login endpoint temporarily
//     return req.path === '/api/auth/login';
//   }
// });

// app.use('/api/', rateLimiter);

// Test login endpoint (bypasses rate limiting) - REMOVE IN PRODUCTION
app.post('/test-login', express.json(), async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Check against our test users
  if ((email === 'test@test.com' && password === 'Test123!') ||
      (email === 'radoslav.tashev@gmail.com' && password === 'Test123!') ||
      (email === 'edoardok@gmail.com' && password === 'Test123!')) {
    
    // Determine user based on email;
let userId, firstName, lastName;
    if (email === 'radoslav.tashev@gmail.com') {
      userId = 'a9961504-ef22-423c-b34b-0824f7c16303';
      firstName = 'Radoslav';
      lastName = 'Tashev';
    } else if (email === 'edoardok@gmail.com') {
      userId = 'b1234567-ef22-423c-b34b-0824f7c16303';
      firstName = 'Edoardo';
      lastName = 'K';
    } else {
      userId = 'c2345678-ef22-423c-b34b-0824f7c16303';
      firstName = 'Test';
      lastName = 'User';
    }
    
    // Generate proper JWT tokens;

const tokens = generateTokenPair(userId, email, 'user', 0);
    
    res.json({
  success: true,
      message: 'Login successful',
      data: {
  user: {
  id: userId,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: 'user',
          isEmailVerified: true
        },
        tokens
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
  name: 'BOOM Card API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to BOOM Card Discount Platform API',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    endpoints: {
  health: '/api/health',
      auth: '/api/auth',
      qr: '/api/qr',
      users: '/api/users',
      reviews: '/api/reviews',
      subscriptions: '/api/subscriptions',
      partners: '/api/partners',
      docs: '/api/docs'
    }
  });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
  status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: NODE_ENV,
    version: '1.0.0'
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// QR Code routes
app.use('/api/qr', qrCodeRoutes);

// Users routes
app.use('/api/users', usersRoutes);

// Reviews routes
app.use('/api/reviews', reviewsRoutes);

// Subscription routes
app.use('/api/subscriptions', subscriptionRoutes);

// Partner routes
app.use('/api/partners', partnerRoutes);

// Test endpoint
app.get('/api/test', (req: Request, res: Response) => {
  res.json({
  success: true,
    message: 'API is working properly!',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  console.warn(`404 Not Found: ${req.method} ${req.path}`),
  res.status(404).json({
      success: false,
    message: 'The requested resource does not exist',
    error: 'NOT_FOUND',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
;

const status = err.status || err.statusCode || 500;

  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
  success: false,
    message,
    error: 'INTERNAL_ERROR',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
async function startServer() {
  try {
    console.log('🔧 Initializing BOOM Card backend...');
    
    app.listen(PORT, () => {
      console.log('🚀 BOOM Card Backend Server started successfully!');
      console.log(`🔗 Server running on http: //localhost:${PORT}`),
      console.log(`📊 Environment: ${NODE_ENV}`),
      console.log(`🌐 CORS Origins: ${CORS_ORIGINS.join(', ')}`);
      console.log('');
      console.log('📍 Available endpoints: '),
      console.log(`  ✅ Health check: http://localhost:${PORT}/api/health`),
      console.log(`  🔐 Authentication: http://localhost:${PORT}/api/auth`),
      console.log(`  📱 QR Code service: http://localhost:${PORT}/api/qr`),
      console.log(`  👤 Users service: http://localhost:${PORT}/api/users`),
      console.log(`  💬 Reviews service: http://localhost:${PORT}/api/reviews`),
      console.log(`  💳 Subscriptions: http://localhost:${PORT}/api/subscriptions`),
      console.log(`  🏪 Partners: http://localhost:${PORT}/api/partners`),
      console.log(`  🧪 Test endpoint: http://localhost:${PORT}/api/test`),
      console.log('');
      console.log('Ready to accept connections! 🎉');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📴 SIGTERM received. Shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('📴 SIGINT received. Shutting down gracefully...');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
    }
}
// Start the server
if (require.main === module) {
  startServer();
}
export default app;
