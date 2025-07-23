import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { config } from './config';
import { connectDatabase } from './database';
import { connectRedis } from './redis';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import paymentRoutes from './routes/payment.routes';
import subscriptionRoutes from './routes/subscription.routes';
import webhookRoutes from './routes/webhook.routes';
import transactionRoutes from './routes/transaction.routes';
import refundRoutes from './routes/refund.routes';
import invoiceRoutes from './routes/invoice.routes';
import { initializePaymentProviders } from './providers';
import { startMetricsServer } from './metrics';
import { gracefulShutdown } from './utils/gracefulShutdown';
import { initializeMessageQueue } from './queues';
import { validateEnvironment } from './utils/validateEnv';

// Validate environment variables
validateEnvironment();

const app: Application = express();
const server = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = config.cors.allowedOrigins;
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes except webhooks
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/webhooks')) {
    return next();
  }
  return limiter(req, res, next);
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Webhook routes need raw body
app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// Compression
app.use(compression());

// Logging
if (config.env !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'payment-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/v1/payments', authMiddleware, paymentRoutes);
app.use('/api/v1/subscriptions', authMiddleware, subscriptionRoutes);
app.use('/api/v1/transactions', authMiddleware, transactionRoutes);
app.use('/api/v1/refunds', authMiddleware, refundRoutes);
app.use('/api/v1/invoices', authMiddleware, invoiceRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use(errorHandler);

// Initialize services
const initializeServices = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected successfully');

    // Initialize payment providers
    await initializePaymentProviders();
    logger.info('Payment providers initialized successfully');

    // Initialize message queue
    await initializeMessageQueue();
    logger.info('Message queue initialized successfully');

    // Start metrics server
    if (config.metrics.enabled) {
      startMetricsServer();
      logger.info(`Metrics server started on port ${config.metrics.port}`);
    }

    // Start main server
    server.listen(config.port, () => {
      logger.info(`Payment service listening on port ${config.port} in ${config.env} mode`);
    });

  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  };

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown(server, 1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown(server, 1);
});

// Handle termination signals
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received');
  gracefulShutdown(server, 0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received');
  gracefulShutdown(server, 0);
});

// Initialize services
initializeServices();

export { app, server };

}
}
