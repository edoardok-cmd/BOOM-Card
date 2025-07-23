import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { createClient } from 'redis';
import { Pool } from 'pg';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import winston from 'winston';
import 'express-async-errors';

// Route imports will be added here when route files are created

// Middleware imports will be added here when middleware files are created

// Service imports
import { DatabaseService } from './services/database';
import { RedisService } from './services/redis';
import { SocketService } from './services/socket';
import { EmailService } from './services/email';
import { SMSService } from './services/sms';
import { PaymentService } from './services/payment';
import { StorageService } from './services/storage';
import { AnalyticsService } from './services/analytics';
import { NotificationService } from './services/notification';
import { QRCodeService } from './services/qrcode';

// Types and interfaces
interface ServerConfig {
  port: number;
  env: string;
  apiVersion: string;
  corsOrigins: string[];
  sessionSecret: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
}

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  ssl?: {
    rejectUnauthorized: boolean;
    ca?: string;
  };
}

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  ttl: number;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

interface SwaggerConfig {
  definition: {
    openapi: string;
    info: {
      title: string;
      version: string;
      description: string;
      contact: {
        name: string;
        email: string;
        url: string;
      };
      license: {
        name: string;
        url: string;
      };
    };
    servers: Array<{
      url: string;
      description: string;
    }>;
    components: {
      securitySchemes: {
        bearerAuth: {
          type: string;
          scheme: string;
          bearerFormat: string;
        };
      };
    };
    security: Array<{
      bearerAuth: string[];
    }>;
  };
  apis: string[];
}

interface AppLocals {
  db: DatabaseService;
  redis: RedisService;
  socket: SocketService;
  services: {
    email: EmailService;
    sms: SMSService;
    payment: PaymentService;
    storage: StorageService;
    analytics: AnalyticsService;
    notification: NotificationService;
    qrcode: QRCodeService;
  };
}

// Load environment variables
dotenv.config();

// Constants
const SERVER_CONFIG: ServerConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3001').split(','),
  sessionSecret: process.env.SESSION_SECRET || 'boom-card-session-secret',
  jwtSecret: process.env.JWT_SECRET || 'boom-card-jwt-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
};

const DATABASE_CONFIG: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'boom_card',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false,
    ca: process.env.DB_SSL_CA
  } : undefined
};

const REDIS_CONFIG: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'boom:',
  ttl: parseInt(process.env.REDIS_TTL || '3600', 10)
};

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
};

const SWAGGER_CONFIG: SwaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BOOM Card API',
      version: SERVER_CONFIG.apiVersion,
      description: 'Digital business card platform API documentation',
      contact: {
        name: 'BOOM Card Support',
        email: 'support@boomcard.com',
        url: 'https://boomcard.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${SERVER_CONFIG.port}/api/${SERVER_CONFIG.apiVersion}`,
        description: 'Development server'
      },
      {
        url: `https://api.boomcard.com/${SERVER_CONFIG.apiVersion}`,
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts']
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'boom-card-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (SERVER_CONFIG.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// ==============================
// MIDDLEWARE
// ==============================

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || SERVER_CONFIG.corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.windowMs,
  max: RATE_LIMIT_CONFIG.max,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ==============================
// MAIN APPLICATION CLASS
// ==============================

class BoomCardServer {
  private app: Application;
  private server?: any;
  private io?: SocketIOServer;
  private db?: DatabaseService;
  private redis?: RedisService;
  private openai?: any;
  private stripe?: any;
  private claude?: any;
  private logger: winston.Logger;

  constructor() {
    this.app = express();
    this.logger = this.setupLogger();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { service: 'boom-card' },
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        ...(process.env.NODE_ENV !== 'production'
          ? [new winston.transports.Console({
              format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
              )
            })]
          : [])
      ]
    });
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", 'wss:']
        }
      }
    }));
    
    this.app.use(cors(corsOptions));
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());
    
    // Session management
    this.app.use(session({
      secret: SERVER_CONFIG.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: undefined,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }));

    // Request logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message) => this.logger.info(message.trim())
      }));

    // Rate limiting
    this.app.use('/api/', rateLimiter);

    // Static files
    this.app.use(express.static(path.join(__dirname, '../../public')));
  }

  private setupRoutes(): void {
    const apiRouter = express.Router();

    // Health check
    apiRouter.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version
      });
    });

    // Authentication routes
    apiRouter.use('/auth', require('./routes/auth.routes.clean').default);

    // User routes - using clean auth system for profile access
    const { getProfile } = require('./controllers/auth.controller.clean');
    const { authenticateToken } = require('./middleware/auth.middleware.clean');
    
    apiRouter.get('/users/profile', authenticateToken, getProfile);
    apiRouter.put('/users/profile', (req, res) => res.json({ message: 'Update profile endpoint - To be implemented' }));
    apiRouter.delete('/users/account', (req, res) => res.json({ message: 'Delete account endpoint - To be implemented' }));
    apiRouter.get('/users/:id/public', (req, res) => res.json({ message: 'Public profile endpoint - To be implemented' }));

    // Card management routes - handlers to be implemented
    apiRouter.get('/cards', (req, res) => res.json({ message: 'Get cards endpoint' }));
    apiRouter.post('/cards', (req, res) => res.json({ message: 'Create card endpoint' }));
    apiRouter.get('/cards/:id', (req, res) => res.json({ message: 'Get card endpoint' }));
    apiRouter.put('/cards/:id', (req, res) => res.json({ message: 'Update card endpoint' }));
    apiRouter.delete('/cards/:id', (req, res) => res.json({ message: 'Delete card endpoint' }));
    apiRouter.post('/cards/:id/share', (req, res) => res.json({ message: 'Share card endpoint' }));
    apiRouter.post('/cards/:id/analytics', (req, res) => res.json({ message: 'Track card view endpoint' }));

    // AI routes - handlers to be implemented
    apiRouter.post('/ai/generate-card', (req, res) => res.json({ message: 'Generate card endpoint' }));
    apiRouter.post('/ai/optimize-content', (req, res) => res.json({ message: 'Optimize content endpoint' }));
    apiRouter.post('/ai/suggest-design', (req, res) => res.json({ message: 'Suggest design endpoint' }));
    apiRouter.post('/ai/analyze-performance', (req, res) => res.json({ message: 'Analyze performance endpoint' }));

    // Payment routes - handlers to be implemented
    apiRouter.post('/payments/create-subscription', (req, res) => res.json({ message: 'Create subscription endpoint' }));
    apiRouter.post('/payments/cancel-subscription', (req, res) => res.json({ message: 'Cancel subscription endpoint' }));
    apiRouter.get('/payments/subscription', (req, res) => res.json({ message: 'Get subscription endpoint' }));
    apiRouter.post('/payments/webhook', express.raw({ type: 'application/json' }), (req, res) => res.json({ message: 'Webhook endpoint' }));

    // Analytics routes - handlers to be implemented
    apiRouter.get('/analytics/overview', (req, res) => res.json({ message: 'Analytics overview endpoint' }));
    apiRouter.get('/analytics/cards/:id', (req, res) => res.json({ message: 'Card analytics endpoint' }));
    apiRouter.get('/analytics/export', (req, res) => res.json({ message: 'Export analytics endpoint' }));

    // Admin routes - handlers to be implemented
    apiRouter.get('/admin/users', (req, res) => res.json({ message: 'Get all users endpoint' }));
    apiRouter.get('/admin/stats', (req, res) => res.json({ message: 'System stats endpoint' }));
    apiRouter.post('/admin/broadcast', (req, res) => res.json({ message: 'Broadcast message endpoint' }));

    // Mount API router
    this.app.use('/api/v1', apiRouter);

    // Serve React app for all other routes
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../public/index.html'));
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req, res, next) => {
      const error = new Error('Not Found');
      (error as any).statusCode = 404;
      next(error);
    });

    // Global error handler
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      const { statusCode = 500, message = 'Internal Server Error' } = err;
      
      this.logger.error({
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userId: (req as any).user?.id
      });

      res.status(statusCode).json({
        error: {
          message: process.env.NODE_ENV === 'production' && statusCode === 500 
            ? 'Internal Server Error' 
            : message,
          statusCode,
          ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        }
      });
    });
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize database
      this.db = new DatabaseService(DATABASE_CONFIG);
      await this.db.initialize();
      this.logger.info('Database initialized');

      // Initialize Redis
      if (process.env.REDIS_ENABLED === 'true') {
        this.redis = new RedisService(REDIS_CONFIG);
        await this.redis.initialize();
        this.logger.info('Redis initialized');
      }

      // Initialize AI services
      if (process.env.OPENAI_API_KEY) {
        // OpenAI initialization would go here
        this.logger.info('OpenAI initialized');
      }

      if (process.env.ANTHROPIC_API_KEY) {
        // Claude initialization would go here
        this.logger.info('Claude initialized');
      }

      // Initialize Stripe
      if (process.env.STRIPE_SECRET_KEY) {
        // Stripe initialization would go here
        this.logger.info('Stripe initialized');
      }

      // Initialize WebSocket
      if (process.env.WEBSOCKET_ENABLED === 'true') {
        this.setupWebSocket();
      }
    } catch (error) {
      this.logger.error('Failed to initialize services:', error);
      throw error;
    }
  }

  private setupWebSocket(): void {
    this.io = new SocketIOServer(this.server, {
      cors: corsOptions,
      transports: ['websocket', 'polling']
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }
        
        // Token verification to be implemented
        const decoded = { userId: 'test-user-id' };
        socket.data.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.data.userId} connected`);
      
      socket.on('disconnect', () => {
        console.log(`User ${socket.data.userId} disconnected`);
      });
    });
  }

  async start(): Promise<void> {
    try {
      await this.initializeServices();
      
      this.server = this.app.listen(SERVER_CONFIG.port, () => {
        this.logger.info(`Server started on port ${SERVER_CONFIG.port}`);
      });
    } catch (error) {
      this.logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create and start the server
const server = new BoomCardServer();
server.start().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});
