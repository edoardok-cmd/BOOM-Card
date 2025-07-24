import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { Pool } from 'pg';
import session from 'express-session';
import connectRedis from 'connect-redis';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import expressWinston from 'express-winston';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import path from 'path';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import cardRouter from './routes/card.routes';
import contactRouter from './routes/contact.routes';
import analyticsRouter from './routes/analytics.routes';
import nfcRouter from './routes/nfc.routes';
import qrRouter from './routes/qr.routes';
import adminRouter from './routes/admin.routes';
import webhookRouter from './routes/webhook.routes';
import healthRouter from './routes/health.routes';
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { validationMiddleware } from './middleware/validation.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import { corsMiddleware } from './middleware/cors.middleware';

// Route imports

// Middleware imports

// Interfaces;
interface AppConfig {
  port: number;
  nodeEnv: string,
  apiVersion: string,
  corsOrigins: string[];,
  sessionSecret: string,
  redisUrl: string,
  postgresUrl: string,
  jwtSecret: string,
  jwtExpiresIn: string,
  refreshTokenExpiresIn: string,
  rateLimitWindowMs: number,
  rateLimitMax: number,
  slowDownWindowMs: number,
  slowDownDelayAfter: number,
  slowDownDelayMs: number,
  uploadLimit: string,
  trustProxy: boolean,
}
interface SessionData {
  userId?: string
  email?: string
  role?: string
  lastActivity?: Date}
interface CustomRequest extends Request {
  user?: {
  id: string,
  email: string,
  role: string,
    permissions?: string[];
  },
    sessionID: string,
  requestId: string,
  startTime?: number;
}
interface ErrorResponse {
  success: false;
  error: {
  message: string,
    code?: string,
  statusCode: number,
    details?: any},
    requestId: string,
  timestamp: string,
}
interface SuccessResponse<T = any> {
  success: true,
  data: T,
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  },
    requestId: string,
  timestamp: string,
}

// Constants;

const API_PREFIX = '/api/v1';

const STATIC_PATH = path.join(__dirname, '../public');

const UPLOADS_PATH = path.join(__dirname, '../uploads');

const LOGS_PATH = path.join(__dirname, '../logs');
;

const DEFAULT_PORT = 3000;

const DEFAULT_NODE_ENV = 'development';

const DEFAULT_RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes;

const DEFAULT_RATE_LIMIT_MAX = 100;

const DEFAULT_SLOW_DOWN_WINDOW = 15 * 60 * 1000; // 15 minutes;

const DEFAULT_SLOW_DOWN_DELAY_AFTER = 50;

const DEFAULT_SLOW_DOWN_DELAY_MS = 500;

const DEFAULT_UPLOAD_LIMIT = '10mb';

// Configuration
dotenv.config();
;

const config: AppConfig = {
  port: parseInt(process.env.PORT || '') || DEFAULT_PORT,
  nodeEnv: process.env.NODE_ENV || DEFAULT_NODE_ENV,
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
  sessionSecret: process.env.SESSION_SECRET || uuidv4(),
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  postgresUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/boomcard',
  jwtSecret: process.env.JWT_SECRET || uuidv4(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '') || DEFAULT_RATE_LIMIT_WINDOW,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '') || DEFAULT_RATE_LIMIT_MAX,
  slowDownWindowMs: parseInt(process.env.SLOW_DOWN_WINDOW_MS || '') || DEFAULT_SLOW_DOWN_WINDOW,
  slowDownDelayAfter: parseInt(process.env.SLOW_DOWN_DELAY_AFTER || '') || DEFAULT_SLOW_DOWN_DELAY_AFTER,
  slowDownDelayMs: parseInt(process.env.SLOW_DOWN_DELAY_MS || '') || DEFAULT_SLOW_DOWN_DELAY_MS,
  uploadLimit: process.env.UPLOAD_LIMIT || DEFAULT_UPLOAD_LIMIT,
  trustProxy: process.env.TRUST_PROXY === 'true'
};

// Redis client configuration;

const redisClient = new Redis(config.redisUrl, {
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
  enableReadyCheck: true,
  maxRetriesPerRequest: 3;
});

// PostgreSQL pool configuration;

const pgPool = new Pool({
  connectionString: config.postgresUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000;
});

// Session store;

const RedisStore = connectRedis(session);

const sessionStore = new RedisStore({ client: redisClient }),
// Rate limiter configuration;

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: new (require('rate-limit-redis'))({
  client: redisClient,
    prefix: 'rl:'
});
});

// Slow down configuration;

const speedLimiter = slowDown({
  windowMs: config.slowDownWindowMs,
  delayAfter: config.slowDownDelayAfter,
  delayMs: config.slowDownDelayMs,
  maxDelayMs: 20000,
  skipSuccessfulRequests: false,
  store: new (require('express-slow-down/lib/redis-store'))({
  client: redisClient,
    prefix: 'sd:'
});
});

// Logger configuration;

const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(LOGS_PATH, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(LOGS_PATH, 'combined.log') }),
  ];
});

if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
  format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Swagger configuration;

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
  openapi: '3.0.0',
    info: {
  title: 'BOOM Card API',
      version: config.apiVersion,
      description: 'Digital business card platform API',
      contact: {
  name: 'BOOM Card Support',
        email: 'support@boomcard.com'
}
},
    servers: [
      {
  url: `http://localhost:${config.port}${API_PREFIX}`,
        description: 'Development server'
},
      {
  url: `https://api.boomcard.com${API_PREFIX}`,
        description: 'Production server'
},
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
  apis: ['./src/routes/*.ts', './src/models/*.ts']
}
    const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Express app configuration;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })),
app.use(express.static('public'));

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() }),
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' }),
});

// Start server;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
;
export default app;

}