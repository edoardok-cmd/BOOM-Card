import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { MetricsCollector } from './services/MetricsCollector';
import { RealtimeAnalytics } from './services/RealtimeAnalytics';
import { ReportGenerator } from './services/ReportGenerator';
import { DataAggregator } from './services/DataAggregator';
import { PredictiveAnalytics } from './services/PredictiveAnalytics';
import analyticsRoutes from './routes/analytics';
import metricsRoutes from './routes/metrics';
import reportsRoutes from './routes/reports';
import dashboardRoutes from './routes/dashboard';
import exportRoutes from './routes/export';
import { AnalyticsEvent, AnalyticsMetric } from './types';

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigins,
    credentials: true
  });

// Database connections
const pgPool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: config.database.poolSize,
  idleTimeoutMillis: config.database.idleTimeout,
  connectionTimeoutMillis: config.database.connectionTimeout
});

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  });

const pubClient = redis.duplicate();
const subClient = redis.duplicate();

// Initialize services
const metricsCollector = new MetricsCollector(pgPool, redis);
const realtimeAnalytics = new RealtimeAnalytics(io, redis, pubClient, subClient);
const reportGenerator = new ReportGenerator(pgPool, redis);
const dataAggregator = new DataAggregator(pgPool, redis);
const predictiveAnalytics = new PredictiveAnalytics(pgPool);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = req.headers['x-request-id'] as string || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    const checks = {
      server: 'healthy',
      database: 'checking',
      redis: 'checking',
      timestamp: new Date().toISOString()
    };

    // Check database
    try {
      await pgPool.query('SELECT 1');
      checks.database = 'healthy';
    } catch (error) {
      checks.database = 'unhealthy';
      logger.error('Database health check failed:', error);
    }

    // Check Redis
    try {
      await redis.ping();
      checks.redis = 'healthy';
    } catch (error) {
      checks.redis = 'unhealthy';
      logger.error('Redis health check failed:', error);
    }

    const isHealthy = checks.database === 'healthy' && checks.redis === 'healthy';
    res.status(isHealthy ? 200 : 503).json(checks);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({ error: 'Health check failed' });
  });

// API routes
app.use('/api/v1/analytics', rateLimiter, authenticate, analyticsRoutes);
app.use('/api/v1/metrics', rateLimiter, authenticate, metricsRoutes);
app.use('/api/v1/reports', rateLimiter, authenticate, reportsRoutes);
app.use('/api/v1/dashboard', rateLimiter, authenticate, dashboardRoutes);
app.use('/api/v1/export', rateLimiter, authenticate, exportRoutes);

// WebSocket connections for real-time analytics
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    // Verify token and attach user to socket
    const user = await verifyToken(token);
    socket.data.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  });

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Join room based on user permissions
  const userRole = socket.data.user.role;
  socket.join(`role:${userRole}`);
  
  if (socket.data.user.partnerId) {
    socket.join(`partner:${socket.data.user.partnerId}`);
  }

  // Subscribe to real-time metrics
  socket.on('subscribe:metrics', async (data: { metrics: string[], filters?: any }) => {
    try {
      await realtimeAnalytics.subscribeToMetrics(socket, data.metrics, data.filters);
    } catch (error) {
      logger.error('Error subscribing to metrics:', error);
      socket.emit('error', { message: 'Failed to subscribe to metrics' });
    });

  // Unsubscribe from metrics
  socket.on('unsubscribe:metrics', async (data: { metrics: string[] }) => {
    try {
      await realtimeAnalytics.unsubscribeFromMetrics(socket, data.metrics);
    } catch (error) {
      logger.error('Error unsubscribing from metrics:', error);
    });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    realtimeAnalytics.handleDisconnect(socket);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.originalUrl
  });
});

// Start background tasks
const startBackgroundTasks = async () => {
  try {
    // Data aggregation every 5 minutes
    setInterval(async () => {
      try {
        await dataAggregator.aggregateHourlyData();
        await dataAggregator.aggregateDailyData();
        logger.info('Data aggregation completed');
      } catch (error) {
        logger.error('Data aggregation error:', error);
      }, 5 * 60 * 1000);

    // Clean up old data every day
    setInterval(async () => {
      try {
        await dataAggregator.cleanupOldData();
        logger.info('Old data cleanup completed');
      } catch (error) {
        logger.error('Data cleanup error:', error);
      }, 24 * 60 * 60 * 1000);

    // Update predictive models every hour
    setInterval(async () => {
      try {
        await predictiveAnalytics.updateModels();
        logger.info('Predictive models updated');
      } catch (error) {
        logger.error('Model update error:', error);
      }, 60 * 60 * 1000);

  } catch (error) {
    logger.error('Failed to start background tasks:', error);
  };

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, starting graceful shutdown...`);
  
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });

  io.close(() => {
    logger.info('WebSocket server closed');
  });

  try {
    await pgPool.end();
    logger.info('Database connections closed');
    
    redis.disconnect();
    pubClient.disconnect();
    subClient.disconnect();
    logger.info('Redis connections closed');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  };

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Verify token helper function
async function verifyToken(token: string): Promise<any> {
  // Implementation depends on your auth strategy
  // This is a placeholder that should be replaced with actual token verification
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await pgPool.query('SELECT 1');
    logger.info('Database connection established');

    // Test Redis connection
    await redis.ping();
    logger.info('Redis connection established');

    // Initialize services
    await metricsCollector.initialize();
    await realtimeAnalytics.initialize();
    await dataAggregator.initialize();
    await predictiveAnalytics.initialize();

    // Start background tasks
    await startBackgroundTasks();

    // Start HTTP server
    const PORT = config.port || 3003;
    httpServer.listen(PORT, () => {
      logger.info(`Analytics service running on port ${PORT}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`Real-time a
}}}
}
}
}
}
}
}
}
}
}
}
}
}
