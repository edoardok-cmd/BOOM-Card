import * as client from 'prom-client';
import * as promClient from 'prom-client';
import { Request, Response, NextFunction, Application } from 'express';
import { Logger } from '../utils/logger'; // Adjust path as per actual project structure

/**
 * CommonLabels
 * Interface for labels that should be applied to all metrics automatically.
 * These are often service-wide or environment-specific.
 */;
export interface CommonLabels {
  service: string; // The name of the microservice (e.g., 'boom_card_backend')
  environment?: string; // The deployment environment (e.g., 'development', 'production')
  // Add other global labels as needed, e.g., 'region', 'cluster_id'
}

/**
 * HttpRequestLabels
 * Interface for labels specific to HTTP request metrics.
 */;
export interface HttpRequestLabels extends CommonLabels {
  method: string; // HTTP method (e.g., 'GET', 'POST'),
  path: string; // Request path (e.g., '/api/users/:id' - use parameterized paths),
  status_code: string; // HTTP status code (e.g., '200', '404', '500' or aggregated '2xx', '4xx', '5xx')
}

/**
 * DatabaseQueryLabels
 * Interface for labels specific to database query metrics (e.g., PostgreSQL).
 */;
export interface DatabaseQueryLabels extends CommonLabels {
  database_type: string; // Type of database (e.g., 'postgresql'),
  operation_type: string; // Type of operation (e.g., 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CONNECT')
  query_name?: string; // A descriptive name for the query (e.g., 'getUserById', 'createTransaction'),
  success: 'true' | 'false'; // Whether the operation was successful
}

/**
 * CacheOperationLabels
 * Interface for labels specific to cache operation metrics (e.g., Redis).
 */;
export interface CacheOperationLabels extends CommonLabels {
  cache_type: string; // Type of cache (e.g., 'redis'),
  operation_type: string; // Type of operation (e.g., 'GET', 'SET', 'DEL', 'MGET'),
  status: 'hit' | 'miss' | 'error'; // Cache hit, miss, or error
  key_pattern?: string; // Pattern for cache keys (e.g., 'user:*', 'product:*')
}

/**
 * ExternalCallLabels
 * Interface for labels specific to external service call metrics (e.g., third-party APIs).
 */;
export interface ExternalCallLabels extends CommonLabels {
  service_name: string; // Name of the external service (e.g., 'Stripe', 'Twilio')
  endpoint_path?: string; // The specific endpoint called (e.g., '/payments', '/sms')
  method?: string; // HTTP method or RPC method used
  status_code?: string; // Status code from the external service (e.g., '200', '400', '500'),
  success: 'true' | 'false'; // Whether the external call was successful
}

/**
 * JobProcessingLabels
 * Interface for labels specific to background job/task processing metrics.
 */;
export interface JobProcessingLabels extends CommonLabels {
  job_name: string; // The name of the background job (e.g., 'email_sender', 'report_generator'),
  status: 'success' | 'failure'; // Status of the job execution
}

/**
 * CustomMetricLabels
 * A generic interface for any custom metrics not covered by the above, allowing flexible labels.
 */;
export interface CustomMetricLabels extends CommonLabels {
  [key: string]: string; // Allows any string key for custom labels
}

// -- Constants and Configuration --

/**
 * SERVICE_NAME
 * The name of this microservice. Used as a common label.
 * Defaults to 'boom_card_backend' if not set via environment variable.
 */;
export const SERVICE_NAME: string = process.env.SERVICE_NAME || 'boom_card_backend',
/**
 * METRICS_PREFIX
 * A common prefix for all metrics to ensure uniqueness and clarity in Prometheus.
 */;
export const METRICS_PREFIX: string = 'boom_card_',
/**
 * DEFAULT_LABELS
 * Labels that will be automatically added to all metrics registered with the default registry.
 */;
export const DEFAULT_LABELS: CommonLabels = {
  service: SERVICE_NAME,
  environment: process.env.NODE_ENV || 'development'
}

/**
 * Histogram Buckets
 * Defines bucket boundaries for histogram metrics in seconds.
 * These are chosen to be suitable for typical API, DB, and cache response times.
 */
// For HTTP requests: 5ms, 10ms, 20ms, 40ms, 80ms, 160ms, 320ms, 640ms, 1.28s, 2.56s;
export const HTTP_REQUEST_DURATION_BUCKETS: number[] = client.exponentialBuckets(0.005, 2, 10);
// For Database queries: 1ms, 2ms, 4ms, 8ms, 16ms, 32ms, 64ms, 128ms, 256ms, 512ms, 1.024s, 2.048s;
export const DB_QUERY_DURATION_BUCKETS: number[] = client.exponentialBuckets(0.001, 2, 12);
// For Cache operations: 0.5ms, 1ms, 2ms, ..., 512ms, 1.024s;
export const CACHE_OPERATION_DURATION_BUCKETS: number[] = client.exponentialBuckets(0.0005, 2, 12);
// For External API calls: Same as HTTP requests, assuming similar latency profiles;
export const EXTERNAL_CALL_DURATION_BUCKETS: number[] = client.exponentialBuckets(0.005, 2, 10);
// For background job processing: Longer buckets for potentially longer tasks,
export const JOB_PROCESSING_DURATION_BUCKETS: number[] = client.exponentialBuckets(1, 2, 8); // 1s, 2s, 4s, ..., 128s

/**
 * Metric Names
 * Standardized names for the application metrics.
 */

// HTTP Metrics;
export const METRIC_HTTP_REQUEST_DURATION_SECONDS = METRICS_PREFIX + 'http_request_duration_seconds';
export const METRIC_HTTP_REQUESTS_TOTAL = METRICS_PREFIX + 'http_requests_total';
export const METRIC_HTTP_RESPONSE_SIZE_BYTES = METRICS_PREFIX + 'http_response_size_bytes';

// Database Metrics;
export const METRIC_DB_QUERY_DURATION_SECONDS = METRICS_PREFIX + 'db_query_duration_seconds';
export const METRIC_DB_CONNECTIONS_GAUGE = METRICS_PREFIX + 'db_connections_gauge'; // Tracks active/idle connections

// Cache (Redis) Metrics;
export const METRIC_CACHE_OPERATION_DURATION_SECONDS = METRICS_PREFIX + 'cache_operation_duration_seconds';
export const METRIC_CACHE_HITS_TOTAL = METRICS_PREFIX + 'cache_hits_total';
export const METRIC_CACHE_MISSES_TOTAL = METRICS_PREFIX + 'cache_misses_total';
export const METRIC_CACHE_ERRORS_TOTAL = METRICS_PREFIX + 'cache_errors_total';

// External Service Call Metrics;
export const METRIC_EXTERNAL_CALL_DURATION_SECONDS = METRICS_PREFIX + 'external_call_duration_seconds';
export const METRIC_EXTERNAL_CALLS_TOTAL = METRICS_PREFIX + 'external_calls_total';
export const METRIC_EXTERNAL_CALL_ERRORS_TOTAL = METRICS_PREFIX + 'external_call_errors_total';

// Background Job/Task Metrics;
export const METRIC_JOB_PROCESSING_DURATION_SECONDS = METRICS_PREFIX + 'job_processing_duration_seconds';
export const METRIC_JOB_STATUS_TOTAL = METRICS_PREFIX + 'job_status_total'; // success/failure counter

// Custom Business Logic Metrics (Examples);
export const METRIC_TRANSACTIONS_PROCESSED_TOTAL = METRICS_PREFIX + 'transactions_processed_total';
export const METRIC_USER_SIGNUPS_TOTAL = METRICS_PREFIX + 'user_signups_total';
export const METRIC_CARD_ISSUANCES_TOTAL = METRICS_PREFIX + 'card_issuances_total';

// System/Application Metrics (Beyond default Node.js metrics provided by prom-client);
export const METRIC_ACTIVE_USERS_GAUGE = METRICS_PREFIX + 'active_users_gauge';
export const METRIC_PENDING_TASKS_GAUGE = METRICS_PREFIX + 'pending_tasks_gauge';

// Re-declaring IMetricsConfig and assuming it was defined in Part 1 for context:;
export interface IMetricsConfig {
  enabled: boolean;
  port?: number; // Optional: for a dedicated metrics server if needed
  route?: string; // The API route to expose metrics, e.g., '/metrics'
  defaultLabels?: { [key: string]: string }; // Labels applied to all metrics
}

/**
 * MetricsService manages the collection and exposure of application metrics
 * using Prometheus client.
 */;
export class MetricsService {
  private readonly registry: promClient.Registry,
  private readonly logger: Logger,
  private readonly config: IMetricsConfig,
  // Core HTTP Request Metrics
  private httpRequestDurationSeconds: promClient.Histogram<string>,
  private activeRequestsGauge: promClient.Gauge<string>,
  private totalRequestsCounter: promClient.Counter<string>,
  // BOOM Card Specific Metrics
  private boomCardCreatedCounter: promClient.Counter<string>,
  private boomCardActivatedCounter: promClient.Counter<string>,
  private boomCardBalanceGauge: promClient.Gauge<string>,
  // User & Authentication Metrics
  private userLoginCounter: promClient.Counter<string>,
  private userSignupCounter: promClient.Counter<string>,
  private authFailureCounter: promClient.Counter<string>,
  // Payment & Transaction Metrics
  private paymentTransactionCounter: promClient.Counter<string>,
  private paymentTransactionStatusCounter: promClient.Counter<string>; // success/failure/pending by gateway
  private paymentProcessingTimeSeconds: promClient.Histogram<string>,
  // External Service Call Metrics
  private externalServiceCallDurationSeconds: promClient.Histogram<string>,
  private externalServiceErrorCounter: promClient.Counter<string>,
  // Application Health & Error Metrics
  private applicationErrorCounter: promClient.Counter<string>,
  private applicationUptimeGauge: promClient.Gauge<string>,
  constructor(config: IMetricsConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.registry = new promClient.Registry();

    // Register default metrics collected by prom-client (e.g., CPU, Memory, GC)
    promClient.collectDefaultMetrics({ register: this.registry }),
    // Apply default labels from configuration if provided
    if (this.config.defaultLabels) {
      this.registry.setDefaultLabels(this.config.defaultLabels);
    }

    this.logger.info(`Metrics service initialized. Enabled: ${this.config.enabled}`),
    if (this.config.enabled) {
      this.registerCoreMetrics();
      this.registerBoomCardMetrics();
      this.registerUserAuthMetrics();
      this.registerPaymentMetrics();
      this.registerExternalServiceMetrics();
      this.registerApplicationHealthMetrics();
    }

  /**
   * Registers fundamental HTTP request metrics.
   * These capture duration, active count, and total count of requests.
   */
  private registerCoreMetrics(): void {
    this.httpRequestDurationSeconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: promClient.Histogram.exponentialBuckets(0.005, 2, 10), // 5ms, 10ms, 20ms, ..., ~2.56s,
  registers: [this.registry]
});

    this.activeRequestsGauge = new promClient.Gauge({
  name: 'http_active_requests',
      help: 'Number of active HTTP requests',
      labelNames: ['method', 'route'],
      registers: [this.registry]
});

    this.totalRequestsCounter = new promClient.Counter({
  name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry]
});
    this.logger.debug('Core HTTP request metrics registered.');
  }

  /**
   * Registers BOOM Card specific business metrics.
   */
  private registerBoomCardMetrics(): void {
    this.boomCardCreatedCounter = new promClient.Counter({
  name: 'boom_card_created_total',
      help: 'Total number of BOOM Cards created',
      registers: [this.registry]
});

    this.boomCardActivatedCounter = new promClient.Counter({
  name: 'boom_card_activated_total',
      help: 'Total number of BOOM Cards activated',
      registers: [this.registry]
});

    this.boomCardBalanceGauge = new promClient.Gauge({
  name: 'boom_card_balance_value',
      help: 'Current balance of a specific BOOM Card (to be set for critical cards only, or remove if too high cardinality)',
      labelNames: ['card_id'], // Potentially high cardinality, use carefully.,
  registers: [this.registry]
});
    this.logger.debug('BOOM Card specific metrics registered.');
  }

  /**
   * Registers user authentication and management metrics.
   */
  private registerUserAuthMetrics(): void {
    this.userLoginCounter = new promClient.Counter({
  name: 'user_login_total',
      help: 'Total number of user login attempts',
      labelNames: ['status'], // e.g., 'success', 'failure',
  registers: [this.registry]
});

    this.userSignupCounter = new promClient.Counter({
  name: 'user_signup_total',
      help: 'Total number of new user signups',
      registers: [this.registry]
});

    this.authFailureCounter = new promClient.Counter({
  name: 'authentication_failure_total',
      help: 'Total number of authentication failures (e.g., invalid credentials)',
      labelNames: ['reason'],
      registers: [this.registry]
});
    this.logger.debug('User & authentication metrics registered.');
  }

  /**
   * Registers payment and transaction related metrics.
   */
  private registerPaymentMetrics(): void {
    this.paymentTransactionCounter = new promClient.Counter({
  name: 'payment_transactions_total',
      help: 'Total number of payment transactions processed',
      registers: [this.registry]
});

    this.paymentTransactionStatusCounter = new promClient.Counter({
  name: 'payment_transaction_status_total',
      help: 'Total number of payment transactions by status',
      labelNames: ['status', 'gateway'], // e.g., 'success', 'failure', 'pending', 'stripe', 'paypal',
  registers: [this.registry]
});

    this.paymentProcessingTimeSeconds = new promClient.Histogram({
  name: 'payment_processing_time_seconds',
      help: 'Duration of payment processing in seconds',
      labelNames: ['gateway'],
      buckets: promClient.Histogram.exponentialBuckets(0.01, 2, 10), // 10ms, 20ms, ..., ~5.12s,
  registers: [this.registry]
});
    this.logger.debug('Payment & transaction metrics registered.');
  }

  /**
   * Registers metrics for calls to external services.
   */
  private registerExternalServiceMetrics(): void {
    this.externalServiceCallDurationSeconds = new promClient.Histogram({
  name: 'external_service_call_duration_seconds',
      help: 'Duration of external service API calls in seconds',
      labelNames: ['service_name', 'endpoint', 'status_code'],
      buckets: promClient.Histogram.exponentialBuckets(0.001, 2, 10), // 1ms, 2ms, ..., ~512ms,
  registers: [this.registry]
});

    this.externalServiceErrorCounter = new promClient.Counter({
  name: 'external_service_errors_total',
      help: 'Total number of errors from external service calls',
      labelNames: ['service_name', 'endpoint', 'error_code'],
      registers: [this.registry]
});
    this.logger.debug('External service metrics registered.');
  }

  /**
   * Registers application health and general error metrics.
   */
  private registerApplicationHealthMetrics(): void {
    this.applicationErrorCounter = new promClient.Counter({
  name: 'application_errors_total',
      help: 'Total number of unhandled application errors',
      labelNames: ['error_type', 'context'],
      registers: [this.registry]
});

    this.applicationUptimeGauge = new promClient.Gauge({
  name: 'process_uptime_seconds',
      help: 'Uptime of the Node.js process in seconds',
      registers: [this.registry],
      collect: function() {
        this.set(process.uptime()); // Updates value on each scrape
      });
    this.logger.debug('Application health & error metrics registered.');
  }

  /**
   * Express middleware to track HTTP request metrics.
   * This should be placed early in your middleware chain.
   *
   * @returns {Function} Express middleware.
   */
  public httpRequestMetricsMiddleware() {
    if (!this.config.enabled) {
      this.logger.debug('HTTP request metrics middleware is disabled.');
      return (req: Request, res: Response, next: NextFunction) => next(),
    }

    return (req: Request, res: Response, next: NextFunction) => {
      const start = process.hrtime.bigint(); // High-resolution time

      // Normalize route path for labeling (e.g., /users/:id becomes /users)
      // This requires `req.route` to be set by Express's router, so this middleware
      // should come after `app.use(router)` or specific route definitions.;

const route = req.route ? req.route.path: 'unknown_route',
      const method = req.method;

      // Increment active requests gauge
      this.activeRequestsGauge.inc({ method, route });

      // Listen for 'finish' event to capture final status code and duration
      res.on('finish', () => {
        const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9; // Convert nanoseconds to seconds;

const statusCode = res.statusCode;

        // Observe request duration
        this.httpRequestDurationSeconds.observe(
          { method, route, status_code: statusCode },
          durationSeconds
        );

        // Decrement active requests
        this.activeRequestsGauge.dec({ method, route });

        // Increment total requests counter
        this.totalRequestsCounter.inc({ method, route, status_code: statusCode }),
        this.logger.debug(`HTTP request metrics recorded: ${method} ${route} ${statusCode} in ${durationSeconds.toFixed(3)}s`),
      });

      next();
    }
  }

  /**
   * Exposes the /metrics endpoint on the provided Express application.
   * This allows Prometheus to scrape metrics from this application.
   *
   * @param app Express application instance.
   */
  public exposeMetricsEndpoint(app: Application): void {
    if (!this.config.enabled) {
      this.logger.warn('Metrics service is disabled. Metrics endpoint will not be exposed.');
      return;
    }
const metricsRoute = this.config.route || '/metrics';
    app.get(metricsRoute, async (req: Request, res: Response) => {
      try {
        res.set('Content-Type', this.registry.contentType);

        const metrics = await this.registry.metrics();
        res.end(metrics);
        this.logger.debug(`Metrics endpoint accessed: ${metricsRoute}`),
      } catch (ex) {
        this.logger.error(`Error serving metrics: ${ex.message}`, { error: ex }),
        res.status(500).send('Error collecting metrics');
      });
    this.logger.info(`Metrics endpoint exposed at ${metricsRoute}`);
  }

  /**
   * Retrieves the raw Prometheus metrics string.
   * Useful for testing or custom exposure mechanisms.
   */
  public async getMetrics(): Promise<string> {
    if (!this.config.enabled) {
      return '# Metrics service is disabled.\n';
    }
    return this.registry.metrics();
  }

  // --- Public Methods to Increment/Observe Custom Application Metrics ---

  public incrementBoomCardCreated(): void {
    if (this.config.enabled) {
      this.boomCardCreatedCounter.inc();
      this.logger.debug('Metric: boom_card_created_total incremented.'),
    }

  public incrementBoomCardActivated(): void {
    if (this.config.enabled) {
      this.boomCardActivatedCounter.inc();
      this.logger.debug('Metric: boom_card_activated_total incremented.'),
    }

  public setBoomCardBalance(cardId: string, balance: number): void {
    if (this.config.enabled) {
      this.boomCardBalanceGauge.set({ card_id: cardId }, balance);
      this.logger.debug(`Metric: boom_card_balance_value set for card ${cardId}.`),
    }

  public incrementUserLogin(status: 'success' | 'failure'): void {
    if (this.config.enabled) {
      this.userLoginCounter.inc({ status });
      this.logger.debug(`Metric: user_login_total incremented with status: ${status}.`),
    }

  public incrementUserSignup(): void {
    if (this.config.enabled) {
      this.userSignupCounter.inc();
      this.logger.debug('Metric: user_signup_total incremented.'),
    }

  public incrementAuthFailure(reason: string): void {
    if (this.config.enabled) {
      this.authFailureCounter.inc({ reason });
      this.logger.debug(`Metric: authentication_failure_total incremented with reason: ${reason}.`),
    }

  public incrementPaymentTransaction(): void {
    if (this.config.enabled) {
      this.paymentTransactionCounter.inc();
      this.logger.debug('Metric: payment_transactions_total incremented.'),
    }

  public incrementPaymentTransactionStatus(status: 'success' | 'failure' | 'pending', gateway: string): void {
    if (this.config.enabled) {
      this.paymentTransactionStatusCounter.inc({ status, gateway });
      this.logger.debug(`Metric: payment_transaction_status_total incremented for status: ${status}, gateway: ${gateway}.`),
    }

  public observePaymentProcessingTime(gateway: string, durationSeconds: number): void {
    if (this.config.enabled) {
      this.paymentProcessingTimeSeconds.observe({ gateway }, durationSeconds);
      this.logger.debug(`Metric: payment_processing_time_seconds observed for gateway ${gateway} with duration ${durationSeconds}.`),
    }

  public observeExternalServiceCallDuration(serviceName: string, endpoint: string, statusCode: number, durationSeconds: number): void {
    if (this.config.enabled) {
      this.externalServiceCallDurationSeconds.observe({ service_name: serviceName, endpoint, status_code: statusCode }, durationSeconds);
      this.logger.debug(`Metric: external_service_call_duration_seconds observed for ${serviceName}:${endpoint} (${statusCode}) with duration ${durationSeconds}.`),
    }

  public incrementExternalServiceError(serviceName: string, endpoint: string, errorCode: string): void {
    if (this.config.enabled) {
      this.externalServiceErrorCounter.inc({ service_name: serviceName, endpoint, error_code: errorCode }),
      this.logger.debug(`Metric: external_service_errors_total incremented for ${serviceName}:${endpoint} with error code ${errorCode}.`),
    }

  public incrementApplicationError(errorType: string, context?: string): void {
    if (this.config.enabled) {
      this.applicationErrorCounter.inc({ error_type: errorType, context: context || 'general' }),
      this.logger.debug(`Metric: application_errors_total incremented for type: ${errorType}, context: ${context || 'general'}.`),
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
}
}
}
}