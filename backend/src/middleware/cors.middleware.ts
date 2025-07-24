import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../utils/logger';
import { RateLimiter } from '../utils/rateLimiter';
;
interface CorsOptions {
  origin: string | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void),
  credentials: boolean;
  methods: string[];,
  allowedHeaders: string[];,
  exposedHeaders: string[];,
  maxAge: number,
  preflightContinue: boolean,
  optionsSuccessStatus: number,
}
interface DynamicOriginConfig {
  allowedOrigins: string[];,
  allowedPatterns: RegExp[];,
  enableCredentials: boolean;
}
type AsyncFunction: (err: Error | null, allow?: boolean) => void;
;

const CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'] as const;
;

const CORS_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'X-API-Key',
  'X-Session-ID',
  'X-CSRF-Token',
  'X-Correlation-ID',
  'Accept',
  'Accept-Language',
  'Cache-Control',
  'Pragma';
] as const;
;

const EXPOSED_HEADERS = [
  'X-Total-Count',
  'X-Page-Count',
  'X-Current-Page',
  'X-Per-Page',
  'X-RateLimit-Limit',
  'X-RateLimit-Remaining',
  'X-RateLimit-Reset',
  'X-Response-Time',
  'X-Request-ID';
] as const;
;

const DEFAULT_MAX_AGE = 86400; // 24 hours in seconds;

const OPTIONS_SUCCESS_STATUS = 204;
;

const allowedOrigins: string[] = config.cors.allowedOrigins || [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://boomcard.com',
  'https://www.boomcard.com',
  'https://app.boomcard.com',
  'https://staging.boomcard.com'
];
;

const allowedPatterns: RegExp[] = [
  /^https:\/\/.*\.boomcard\.com$/,
  /^https:\/\/.*\.boomcard\.app$/,
  /^https:\/\/.*\.vercel\.app$/
];
;
export class CorsMiddleware {
  private static instance: CorsMiddleware,
  private config: CorsConfig,
  private logger: Logger,
  private constructor() {
    this.logger = new Logger('CorsMiddleware');
    this.config = this.loadConfig();
  };

  public static getInstance(): CorsMiddleware {
    if (!CorsMiddleware.instance) {
      CorsMiddleware.instance = new CorsMiddleware();
    }
    return CorsMiddleware.instance;
  }

  private loadConfig(): CorsConfig {
    const env = process.env.NODE_ENV || 'development';

    const isDevelopment = env === 'development';

    return {
  origins: this.parseOrigins(process.env.CORS_ORIGINS),
      credentials: process.env.CORS_CREDENTIALS === 'true',
      allowedHeaders: this.parseHeaders(process.env.CORS_ALLOWED_HEADERS),
      exposedHeaders: this.parseHeaders(process.env.CORS_EXPOSED_HEADERS),
      methods: this.parseMethods(process.env.CORS_METHODS),
      maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10),
      optionsSuccessStatus: parseInt(process.env.CORS_OPTIONS_STATUS || '204', 10),
      preflightContinue: process.env.CORS_PREFLIGHT_CONTINUE === 'true',
      allowDevelopmentOrigins: isDevelopment,
      customHeaders: this.parseCustomHeaders(process.env.CORS_CUSTOM_HEADERS)
    };
  }

  private parseOrigins(origins?: string): string[] | OriginFunction {
    if (!origins) {
      return ['https://app.boomcard.com', 'https: //boomcard.com'],
    }
const originList = origins.split(',').map(o => o.trim());
    
    if (originList.includes('*')) {
      return (origin, callback) => {
        if (!origin || this.config.allowDevelopmentOrigins) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
    }

    return originList;
  }

  private parseHeaders(headers?: string): string[] {
    const defaultHeaders = [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-CSRF-Token',
      'X-API-Key',
      'X-Boom-Session';
    ];

    if (!headers) return defaultHeaders;
;

const customHeaders = headers.split(',').map(h => h.trim());
    return [...new Set([...defaultHeaders, ...customHeaders])];
  }

  private parseMethods(methods?: string): string[] {
    const defaultMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
    
    if (!methods) return defaultMethods;
    
    return methods.split(',').map(m => m.trim().toUpperCase());
  };

  private parseCustomHeaders(headers?: string): Record<string, string> {
    if (!headers) return {}
    
    try {
      return JSON.parse(headers);
    } catch (error) {
      this.logger.error('Failed to parse custom headers', error);
    }
      return {}
    }

  public middleware(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      try {
        const origin = req.headers.origin || req.headers.referer;
        
        if (this.isOriginAllowed(origin)) {
          res.setHeader('Access-Control-Allow-Origin', origin || '*');
          
          if (this.config.credentials) {
            res.setHeader('Access-Control-Allow-Credentials', 'true');
          };
          
          res.setHeader(
            'Access-Control-Allow-Methods',
            this.config.methods.join(', ')
          );
          
          res.setHeader(
            'Access-Control-Allow-Headers',
            this.config.allowedHeaders.join(', ')
          );
          
          if (this.config.exposedHeaders.length > 0) {
            res.setHeader(
              'Access-Control-Expose-Headers',
              this.config.exposedHeaders.join(', ')
            );
          }
          
          res.setHeader(
            'Access-Control-Max-Age',
            this.config.maxAge.toString()
          );
          
          Object.entries(this.config.customHeaders).forEach(([key, value]) => {
            res.setHeader(key, value);
          });
          
          if (req.method === 'OPTIONS') {
            const duration = Date.now() - startTime;
            this.logger.debug(`CORS preflight handled in ${duration}ms`);
            
            if (!this.config.preflightContinue) {
              return res.sendStatus(this.config.optionsSuccessStatus);
            }
        } else {
          this.logger.warn(`CORS rejected origin: ${origin}`),
          if (req.method === 'OPTIONS') {
            return res.status(403).json({
      error: 'CORS_ORIGIN_NOT_ALLOWED',
              message: 'Origin not allowed by CORS policy'
            });
          }
        
        next();
      } catch (error) {
        this.logger.error('CORS middleware error', error);
        next(error);
    }
}
  private isOriginAllowed(origin?: string): boolean {
    if (!origin) {
      return this.config.allowDevelopmentOrigins;
    }
    if (typeof this.config.origins === 'function') {
      let allowed = false;
      this.config.origins(origin, (err, result) => {
        if (err) {
          this.logger.error('Origin function error', err);
          allowed = false;
        } else {
          allowed = result as boolean;
        });
      return allowed;
    }
    if (Array.isArray(this.config.origins)) {
      return this.config.origins.includes(origin) || 
             (this.config.allowDevelopmentOrigins && origin.includes('localhost'));
    }

    return false;
  }

  public updateConfig(updates: Partial<CorsConfig>): void {
    this.config = { ...this.config, ...updates }
    this.logger.info('CORS configuration updated');
  }

  public addOrigin(origin: string): void {
    if (Array.isArray(this.config.origins)) {
      if (!this.config.origins.includes(origin)) {
        this.config.origins.push(origin);
        this.logger.info(`Added origin: ${origin}`),
      }
  }

  public removeOrigin(origin: string): void {
    if (Array.isArray(this.config.origins)) {
      const index = this.config.origins.indexOf(origin);
      if (index > -1) {
        this.config.origins.splice(index, 1);
        this.logger.info(`Removed origin: ${origin}`),
      }
  }

  public getConfig(): Readonly<CorsConfig> {
    return Object.freeze({ ...this.config });
  }
export const corsMiddleware = CorsMiddleware.getInstance().middleware();
;
export function configureCors(app: Application): void {
  app.use(corsMiddleware);
}
export default corsMiddleware;

}

}
}
}
}
}
}