import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { ElasticsearchClient } from '@elastic/elasticsearch';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { performance } from 'perf_hooks';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { Cluster } from '@elastic/elasticsearch/lib/api/types';

dotenv.config();

// Types and Interfaces
interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  pagination?: PaginationParams;
  sort?: SortParams;
  boost?: BoostParams;
  highlight?: boolean;
  fuzzy?: boolean;
  suggest?: boolean;
}

interface SearchFilters {
  categories?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  rating?: number;
  verified?: boolean;
  location?: {
    lat?: number;
    lon?: number;
    radius?: string;
  };
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  tags?: string[];
  merchantId?: string;
  status?: string[];
}

interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

interface BoostParams {
  fields?: string[];
  weights?: Record<string, number>;
}

interface SearchResult {
  id: string;
  score: number;
  source: any;
  highlight?: Record<string, string[]>;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  facets?: Record<string, FacetBucket[]>;
  suggestions?: string[];
  took: number;
  query: string;
}

interface FacetBucket {
  key: string;
  count: number;
}

interface IndexMapping {
  properties: Record<string, any>;
  settings?: any;
}

interface BulkIndexRequest {
  index: string;
  documents: any[];
  refresh?: boolean;
}

interface SearchMetrics {
  queryCount: number;
  avgResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  lastUpdated: Date;
}

interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'LRU' | 'LFU' | 'FIFO';
}

interface ElasticsearchConfig {
  node: string;
  auth?: {
    username: string;
    password: string;
  };
  maxRetries?: number;
  requestTimeout?: number;
  sniffOnStart?: boolean;
}

// Constants
const APP_NAME = 'boom-search-service';
const DEFAULT_PORT = parseInt(process.env.PORT || '3003', 10);
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const CACHE_TTL = 300; // 5 minutes
const SEARCH_TIMEOUT = 30000; // 30 seconds
const MAX_QUERY_LENGTH = 500;
const MIN_QUERY_LENGTH = 2;

const ELASTICSEARCH_INDEX = process.env.ELASTICSEARCH_INDEX || 'boom_cards';
const ELASTICSEARCH_NODE = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
};

const DATABASE_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'boom_card',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const RATE_LIMIT_CONFIG = {
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many search requests, please try again later.',
};

const BOOST_FIELDS = {
  title: 3.0,
  description: 2.0,
  tags: 1.5,
  category: 1.2,
  merchant_name: 1.5,
};

const FACET_FIELDS = [
  'category',
  'tags',
  'price_range',
  'rating',
  'location',
  'merchant_id',
  'status',
];

const SUGGESTION_CONFIG = {
  maxSuggestions: 5,
  minScore: 0.7,
  fuzzyDistance: 2,
};

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};
```


```typescript
// Search Service Implementation
class SearchService {
  private elasticClient: Client;
  private redisClient: Redis;
  private logger: winston.Logger;
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.elasticClient = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTIC_USERNAME || 'elastic',
        password: process.env.ELASTIC_PASSWORD || 'changeme'
      });

    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'search-service.log' })
      ]
    });

    this.circuitBreaker = new CircuitBreaker(
      (query: SearchQuery) => this.performSearch(query),
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000
      }
    );
  }

  async init(): Promise<void> {
    await this.createIndices();
    await this.setupMappings();
    this.logger.info('Search service initialized');
  }

  private async createIndices(): Promise<void> {
    const indices = ['cards', 'merchants', 'transactions', 'users'];
    
    for (const index of indices) {
      const exists = await this.elasticClient.indices.exists({ index });
      if (!exists) {
        await this.elasticClient.indices.create({
          index,
          body: {
            settings: {
              number_of_shards: 3,
              number_of_replicas: 2,
              analysis: {
                analyzer: {
                  custom_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'stop', 'snowball']
                  }
              }
          });
      }
  }

  private async setupMappings(): Promise<void> {
    await this.elasticClient.indices.putMapping({
      index: 'cards',
      body: {
        properties: {
          cardNumber: { type: 'keyword' },
          cardHolder: { type: 'text', analyzer: 'custom_analyzer' },
          status: { type: 'keyword' },
          type: { type: 'keyword' },
          createdAt: { type: 'date' },
          expiryDate: { type: 'date' },
          metadata: { type: 'object', enabled: false }
      });

    await this.elasticClient.indices.putMapping({
      index: 'merchants',
      body: {
        properties: {
          name: { type: 'text', analyzer: 'custom_analyzer' },
          category: { type: 'keyword' },
          location: { type: 'geo_point' },
          rating: { type: 'float' },
          tags: { type: 'keyword' }
      });
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    const cacheKey = this.generateCacheKey(query);
    const cached = await this.getFromCache(cacheKey);
    
    if (cached) {
      this.logger.debug('Cache hit', { query });
      return cached;
    }

    try {
      const result = await this.circuitBreaker.fire(query);
      await this.cacheResult(cacheKey, result);
      return result;
    } catch (error) {
      this.logger.error('Search failed', { error, query });
      throw new Error('Search service unavailable');
    }

  private async performSearch(query: SearchQuery): Promise<SearchResult> {
    const searchBody = this.buildSearchBody(query);
    const start = Date.now();

    const response = await this.elasticClient.search({
      index: query.index || '_all',
      body: searchBody
    });

    const duration = Date.now() - start;
    this.logger.info('Search completed', { duration, hits: response.body.hits.total.value });

    return {
      results: response.body.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        source: hit._source,
        highlight: hit.highlight
      })),
      total: response.body.hits.total.value,
      took: response.body.took,
      aggregations: response.body.aggregations
    };
  }

  private buildSearchBody(query: SearchQuery): any {
    const body: any = {
      query: {
        bool: {
          must: [],
          filter: [],
          should: []
        },
      size: query.size || 10,
      from: query.from || 0
    };

    if (query.query) {
      body.query.bool.must.push({
        multi_match: {
          query: query.query,
          fields: query.fields || ['_all'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        });
    }

    if (query.filters) {
      query.filters.forEach(filter => {
        body.query.bool.filter.push(this.buildFilter(filter));
      });
    }

    if (query.sort) {
      body.sort = query.sort;
    }

    if (query.aggregations) {
      body.aggs = query.aggregations;
    }

    return body;
  }

  private buildFilter(filter: SearchFilter): any {
    switch (filter.type) {
      case 'term':
        return { term: { [filter.field]: filter.value } };
      case 'range':
        return { range: { [filter.field]: filter.value } };
      case 'exists':
        return { exists: { field: filter.field } };
      case 'geo':
        return {
          geo_distance: {
            distance: filter.distance,
            [filter.field]: filter.location
          };
      default:
        return { match_all: {} };
    }

  async suggest(params: SuggestParams): Promise<any> {
      index: params.index || '_all',
      body: {
        suggest: {
          text: params.text,
          completion: {
            field: params.field || 'suggest',
            size: params.size || 5,
            fuzzy: {
              fuzziness: 'AUTO'
            }
        }
    });

    return response.body.suggest;
  }

  async bulkIndex(operations: BulkIndexOperation[]): Promise<void> {
    const body = operations.flatMap(op => [
      { [op.action]: { _index: op.index, _id: op.id } },
      op.document
    ]);


    if (response.body.errors) {
      const errors = response.body.items.filter((item: any) => item.index.error);
      this.logger.error('Bulk index errors', { errors });
      throw new Error('Bulk indexing failed');
    }

  private generateCacheKey(query: SearchQuery): string {
    return `search:${crypto.createHash('md5').update(JSON.stringify(query)).digest('hex')}`;
  }

  private async getFromCache(key: string): Promise<SearchResult | null> {
    return cached ? JSON.parse(cached) : null;
  }

  private async cacheResult(key: string, result: SearchResult): Promise<void> {
    await this.redisClient.setex(key, 300, JSON.stringify(result));
  }

// Express Application Setup
const app = express();
const searchService = new SearchService();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Logging middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    searchService.logger.info('Request completed', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration
    });
  });
  next();
});

// Authentication middleware
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  };

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
});

app.post('/search', authenticate, limiter, async (req, res) => {
  try {
    const query: SearchQuery = req.body;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  });

app.post('/suggest', authenticate, limiter, async (req, res) => {
  try {
    const params: SuggestParams = req.body;
    const suggestions = await searchService.suggest(params);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Suggest failed' });
  });

app.post('/bulk', authenticate, async (req, res) => {
  try {
    const operations: BulkIndexOperation[] = req.body;
    await searchService.bulkIndex(operations);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Bulk operation failed' });
  });

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  searchService.logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    requestId: req.id 
  });
  res.status(500).json({ error: 'Internal server error' });
});

// Server startup
const PORT = process.env.PORT || 3002;

async function start() {
  try {
    await searchService.init();
    app.listen(PORT, () => {
      searchService.logger.info(`Search service running on port ${PORT}`);
    });
  } catch (error) {
    searchService.logger.error('Failed to start service', { error });
    process.exit(1);
  }

// Graceful shutdown
process.on('SIGTERM', async () => {
  searchService.logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

start();

export { SearchService, app };

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
}
}
}
}
}
}
