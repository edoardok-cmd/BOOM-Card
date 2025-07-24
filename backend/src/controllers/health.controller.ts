import { Request, Response } from 'express';
import { Pool } from 'pg';
import Redis from 'ioredis';

export class HealthController {
  constructor(
    private pgPool: Pool,
    private redisClient: Redis
  ) {}

  /**
   * Basic health check
   */
  async check(req: Request, res: Response) {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  }

  /**
   * Detailed health check including database connections
   */
  async checkDetailed(req: Request, res: Response) {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        api: 'ok',
        postgres: 'checking',
        redis: 'checking'
      },
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };

    try {
      // Check PostgreSQL
      const pgStart = Date.now();
      const pgResult = await this.pgPool.query('SELECT NOW() as time, version() as version');
      const pgLatency = Date.now() - pgStart;
      
      health.services.postgres = 'ok';
      health.postgres = {
        status: 'connected',
        latency: `${pgLatency}ms`,
        time: pgResult.rows[0].time,
        version: pgResult.rows[0].version.split(' ')[1],
        pool: {
          total: this.pgPool.totalCount,
          idle: this.pgPool.idleCount,
          waiting: this.pgPool.waitingCount
        }
      };
    } catch (error) {
      health.status = 'degraded';
      health.services.postgres = 'error';
      health.postgres = {
        status: 'disconnected',
        error: error.message
      };
    }

    try {
      // Check Redis
      const redisStart = Date.now();
      const pong = await this.redisClient.ping();
      const redisLatency = Date.now() - redisStart;
      
      const info = await this.redisClient.info('server');
      const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
      
      health.services.redis = 'ok';
      health.redis = {
        status: 'connected',
        latency: `${redisLatency}ms`,
        response: pong,
        version: version || 'unknown',
        mode: this.redisClient.mode || 'standalone'
      };
    } catch (error) {
      health.status = 'degraded';
      health.services.redis = 'error';
      health.redis = {
        status: 'disconnected',
        error: error.message
      };
    }

    // Determine overall status
    const hasErrors = Object.values(health.services).includes('error');
    if (hasErrors) {
      health.status = 'unhealthy';
      res.status(503);
    }

    res.json(health);
  }

  /**
   * Readiness check for Kubernetes/load balancers
   */
  async ready(req: Request, res: Response) {
    try {
      // Quick checks to ensure the service is ready
      await Promise.all([
        this.pgPool.query('SELECT 1'),
        this.redisClient.ping()
      ]);
      
      res.json({ ready: true });
    } catch (error) {
      res.status(503).json({ 
        ready: false, 
        error: error.message 
      });
    }

  /**
   * Liveness check for Kubernetes/monitoring
   */
  async live(req: Request, res: Response) {
    // Simple check that the process is alive
    res.json({ 
      alive: true,
      pid: process.pid,
      uptime: process.uptime()
    });
  }

// Route setup
export function setupHealthRoutes(app: Express.Application, pgPool: Pool, redisClient: Redis) {
  const controller = new HealthController(pgPool, redisClient);
  
  // Basic endpoints
  app.get('/health', controller.check.bind(controller));
  app.get('/health/detailed', controller.checkDetailed.bind(controller));
  
  // Kubernetes/monitoring endpoints
  app.get('/ready', controller.ready.bind(controller));
  app.get('/live', controller.live.bind(controller));
  
  // Aliases for common monitoring tools
  app.get('/healthz', controller.check.bind(controller));
  app.get('/readyz', controller.ready.bind(controller));
  app.get('/livez', controller.live.bind(controller));
}
}
}
}
