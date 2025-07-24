import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { errorHandler } from '../middleware/errorHandler';
import { corsMiddleware } from '../middleware/cors';
import { loggerMiddleware } from '../middleware/logger';
import authRoutes from './auth';
import userRoutes from './users';
import cardRoutes from './cards';
import transactionRoutes from './transactions';
import walletRoutes from './wallets';
import paymentRoutes from './payments';
import merchantRoutes from './merchants';
import rewardsRoutes from './rewards';
import notificationRoutes from './notifications';
import analyticsRoutes from './analytics';
import adminRoutes from './admin';
import webhookRoutes from './webhooks';
import healthRoutes from './health';
import configRoutes from './config';
import reportRoutes from './reports';
import { Request, Response, NextFunction } from 'express';
import { RouteConfig, RouteMetadata, APIVersion } from '../types/routes';
import { RateLimitConfig } from '../types/middleware';
import { RoutesManager } from '../core/RoutesManager';
import { RouteMetadata } from '../types/routes';
import { Logger } from '../utils/logger';
import { ValidationError, NotFoundError } from '../utils/errors';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';
import { corsHandler } from '../middleware/cors';
import { compression } from 'compression';
import helmet from 'helmet';

// Route imports

// Types

// Interfaces;
interface RouteRegistration {
  path: string,
  router: Router,
  middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>,
  version?: APIVersion
  deprecated?: boolean
  rateLimit?: RateLimitConfig}
interface RouteGroup {
  prefix: string,
  routes: RouteRegistration[],
  middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>,
}
interface RouterConfig {
  apiPrefix: string,
  defaultVersion: APIVersion,
  enableVersioning: boolean,
  enableMetrics: boolean,
  enableDocs: boolean,
  strictMode: boolean,
}

// Constants;

const API_PREFIX = '/api';

const DEFAULT_API_VERSION: APIVersion = 'v1',
const SUPPORTED_VERSIONS: APIVersion[] = ['v1', 'v2'];
;

const ROUTE_GROUPS: Record<string, RouteGroup> = {
  public: {
  prefix: '/public',
    routes: [],
    middleware: [corsMiddleware, loggerMiddleware]
  },
  authenticated: {
  prefix: '/auth',
    routes: [],
    middleware: [corsMiddleware, loggerMiddleware, authenticateToken]
  },
  admin: {
  prefix: '/admin',
    routes: [],
    middleware: [corsMiddleware, loggerMiddleware, authenticateToken]
  },
  webhook: {
  prefix: '/webhooks',
    routes: [],
    middleware: [loggerMiddleware]
  }
    const ROUTER_CONFIG: RouterConfig = {
  apiPrefix: API_PREFIX,
  defaultVersion: DEFAULT_API_VERSION,
  enableVersioning: true,
  enableMetrics: true,
  enableDocs: true,
  strictMode: true
}

// Route metadata decorators;

const routeMetadata = new Map<string, RouteMetadata>();
;
export function Route(metadata: RouteMetadata) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const routeKey = `${target.constructor.name}.${propertyKey}`;
    routeMetadata.set(routeKey, metadata);
    return descriptor;
  }
}
export function Deprecated(message?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const existing = routeMetadata.get(routeKey) || {}
    routeMetadata.set(routeKey, {
      ...existing,
      deprecated: true,
      deprecationMessage: message;
    });
    return descriptor;
  }
}
export function RateLimit(config: RateLimitConfig) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    routeMetadata.set(routeKey, {
      ...existing,
      rateLimit: config
    });
    return descriptor;
  }
}
const logger = new Logger('RoutesIndex');
;
export class RouteAggregator {
  private router: Router,
  private routesManager: RoutesManager,
  private registeredRoutes: Map<string, RouteMetadata>;

  constructor() {
    this.router = Router();
    this.routesManager = new RoutesManager();
    this.registeredRoutes = new Map();
    this.setupGlobalMiddleware();
  }

  private setupGlobalMiddleware(): void {
    this.router.use(helmet());
    this.router.use(compression());
    this.router.use(corsHandler);
    this.router.use(express.json({ limit: '10mb' })),
    this.router.use(express.urlencoded({ extended: true, limit: '10mb' })),
  }

  public async initialize(): Promise<void> {
    try {
      await this.loadRoutes();
      this.setupRoutes();
      this.setupErrorHandlers();
      logger.info('Route aggregator initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize route aggregator', error);
      throw error;
    }
    }
    private async loadRoutes(): Promise<void> {
    const routeModules = await this.routesManager.discoverRoutes();
    
    for (const module of routeModules) {
      try {
        const routes = await this.routesManager.loadRouteModule(module);
        this.registerRoutes(routes);
      } catch (error) {
    }
        logger.error(`Failed to load route module: ${module}`, error);
      }
  }

  private registerRoutes(routes: RouteMetadata[]): void {
    for (const route of routes) {
      const key = `${route.method}:${route.path}`;
      
      if (this.registeredRoutes.has(key)) {
        logger.warn(`Route already registered: ${key}`),
        continue;
      }

      this.registeredRoutes.set(key, route);
      this.createRoute(route);
    }

  private createRoute(route: RouteMetadata): void {
    const middlewares = this.buildMiddlewareStack(route);

    const handler = asyncHandler(route.handler);

    switch (route.method.toLowerCase()) {
      case 'get':
        this.router.get(route.path, ...middlewares, handler);
        break;
      case 'post':
        this.router.post(route.path, ...middlewares, handler);
        break;
      case 'put':
        this.router.put(route.path, ...middlewares, handler);
        break;
      case 'patch':
        this.router.patch(route.path, ...middlewares, handler);
        break;
      case 'delete':
        this.router.delete(route.path, ...middlewares, handler);
        break;,
  default: logger.warn(`Unsupported HTTP method: ${route.method}`),
    }

    logger.debug(`Registered route: ${route.method} ${route.path}`),
  }

  private buildMiddlewareStack(route: RouteMetadata): RequestHandler[] {
    const middlewares: RequestHandler[] = [],
    if (route.rateLimit) {
      middlewares.push(rateLimiter(route.rateLimit));
    }
    if (route.auth) {
      middlewares.push(authenticate(route.auth));
    }
    if (route.validation) {
      middlewares.push(validateRequest(route.validation));
    }
    if (route.middlewares) {
      middlewares.push(...route.middlewares);
    }

    return middlewares;
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.router.get('/health', (req, res) => {
      res.json({
  status: 'ok',
        timestamp: new Date().toISOString(),
        routes: this.registeredRoutes.size
      });
    });

    // Route documentation endpoint
    this.router.get('/routes', authenticate({ required: true }), (req, res) => {
  method: route.method,
        path: route.path,
        description: route.description,
        auth: route.auth ? 'required' : 'none',
        rateLimit: route.rateLimit
      }));

      res.json({ routes });
    });
  }

  private setupErrorHandlers(): void {
    // 404 handler
    this.router.use((req, res, next) => {
      next(new NotFoundError(`Route not found: ${req.method} ${req.path}`)),
    });

    // Global error handler
    this.router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error('Unhandled error', {
  error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });

      if (error instanceof ValidationError) {
        return res.status(400).json({
      error: 'Validation Error',
          message: error.message,
          details: error.details
        });
      }
      if (error instanceof NotFoundError) {
        return res.status(404).json({
      error: 'Not Found',
          message: error.message
        });
      }

      res.status(500).json({
      error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : error.message
      });
    });
  }

  public getRouter(): Router {
    return this.router;
  }

  public getRegisteredRoutes(): RouteMetadata[] {
    return Array.from(this.registeredRoutes.values());
  }

  public reloadRoutes(): Promise<void> {
    this.registeredRoutes.clear();
    return this.loadRoutes();
  }

// Create and export singleton instance;
export const routeAggregator = new RouteAggregator();

// Export initialization function;
export async function initializeRoutes(app: Express): Promise<void> {
  await routeAggregator.initialize();
  app.use('/api', routeAggregator.getRouter());
  logger.info('Routes mounted on /api');
}

// Export utility functions;
export function registerDynamicRoute(route: RouteMetadata): void {
  routeAggregator['registerRoutes']([route]);
}
export function getRouteMetrics(): Record<string, any> {
  return {
  total: routes.length,
    byMethod: routes.reduce((acc, route) => {
      acc[route.method] = (acc[route.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    authenticated: routes.filter(r => r.auth).length,
    rateLimited: routes.filter(r => r.rateLimit).length
  }
}
}
}