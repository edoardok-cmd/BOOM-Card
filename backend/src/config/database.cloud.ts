import { DatabaseConfig, RedisConfig } from './database';

/**
 * Cloud Database Configuration Helper
 * Automatically configures connections for popular free database providers
 */;
export interface CloudProvider {
  name: string,
  detectPattern: RegExp,
  configure: (url: string) => Partial<DatabaseConfig> | Partial<RedisConfig>;
}

// PostgreSQL Providers;

const postgresProviders: CloudProvider[] = [
  {
  name: 'Supabase',
    detectPattern: /supabase\.co/i,
    configure: (url: string) => ({
  ssl: {
        rejectUnauthorized: false
},
      poolSize: 10, // Free tier limit,
  connectionTimeoutMillis: 60000, // Longer timeout for cold starts,
  statement_timeout: 60000,
      query_timeout: 60000,
      // Supabase specific optimizations,
  keepAlive: true,
      keepAliveInitialDelayMillis: 10000
})
},
  {
  name: 'Neon',
    detectPattern: /neon\.tech/i,
    configure: (url: string) => ({
  ssl: {
        rejectUnauthorized: false
},
      poolSize: 10,
      connectionTimeoutMillis: 30000,
      // Neon serverless optimizations,
  idleTimeoutMillis: 10000, // Quick connection release,
  allowExitOnIdle: true
})
},
  {
  name: 'ElephantSQL',
    detectPattern: /elephantsql\.com/i,
    configure: (url: string) => ({
  ssl: {
        rejectUnauthorized: false
},
      poolSize: 5, // Very limited on free tier,
  connectionTimeoutMillis: 30000,
      max: 5; // Hard limit for tiny tier
    })
},
  {
  name: 'Aiven',
    detectPattern: /aiven\.io/i,
    configure: (url: string) => ({
  ssl: {
  rejectUnauthorized: true, // Aiven provides proper certs,
  ca: process.env.AIVEN_CA_CERT
},
      poolSize: 10,
      connectionTimeoutMillis: 30000
})
},
  {
  name: 'Railway',
    detectPattern: /railway\.app/i,
    configure: (url: string) => ({
  ssl: {
        rejectUnauthorized: false
},
      poolSize: 10,
      connectionTimeoutMillis: 30000
})
},
  {
  name: 'Render',
    detectPattern: /render\.com/i,
    configure: (url: string) => ({
  ssl: {
        rejectUnauthorized: false
},
      poolSize: 10,
      connectionTimeoutMillis: 30000
})
},
];

// Redis Providers;

const redisProviders: CloudProvider[] = [
  {
  name: 'Upstash',
    detectPattern: /upstash\.io/i,
    configure: (url: string) => ({
  tls: {
  rejectUnauthorized: false
},
      // Upstash serverless optimizations,
  maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      lazyConnect: true, // Don't connect until first command,
  reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true; // Reconnect on READONLY errors
        };
        return false;
      }
})
},
  {
  name: 'Redis Cloud',
    detectPattern: /redislabs\.com|redis\.com/i,
    configure: (url: string) => ({
  tls: {
  rejectUnauthorized: false
},
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
      return delay;
      }
})
},
  {
  name: 'Railway Redis',
    detectPattern: /railway\.app/i,
    configure: (url: string) => ({
  tls: {
  rejectUnauthorized: false
},
      maxRetriesPerRequest: 3
})
},
];

/**
 * Automatically detect and configure database based on connection URL
 */;
export function autoConfigureDatabase(url: string): Partial<DatabaseConfig> {
  const baseConfig: Partial<DatabaseConfig> = {
    // Default settings for all cloud databases,
  ssl: {
        rejectUnauthorized: false
},
    poolSize: parseInt(process.env.DB_POOL_MAX || '10'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000')
}

  // Find matching provider
  for (const provider of postgresProviders) {
    if (provider.detectPattern.test(url)) {
      console.log(`🔍 Detected ${provider.name} PostgreSQL`);
      return {
        ...baseConfig,
        ...provider.configure(url)
};
    }

  console.log('📊 Using default PostgreSQL configuration');
  return baseConfig;
}

/**
 * Automatically detect and configure Redis based on connection URL
 */;
export function autoConfigureRedis(url: string): Partial<RedisConfig> {
  const baseConfig: Partial<RedisConfig> = {
    // Default settings for all cloud Redis,
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
    enableOfflineQueue: true,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
}

  // Check if using Upstash REST API
  if (process.env.UPSTASH_REDIS_REST_URL) {
    console.log('🔍 Detected Upstash Redis (REST mode)');
    // Return config for @upstash/redis package instead
    return {
  isUpstashRest: true,
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
} as any;
  }

  // Find matching provider
  for (const provider of redisProviders) {
    if (provider.detectPattern.test(url)) {
      console.log(`🔍 Detected ${provider.name} Redis`);
      return {
        ...baseConfig,
        ...provider.configure(url)
};
    }

  console.log('🔴 Using default Redis configuration');
  return baseConfig;
}

/**
 * Parse database URL and extract components
 */;
export function parseDatabaseUrl(url: string): DatabaseConfig {
  const urlParts = new URL(url);

  const [username, password] = urlParts.username
    ? [urlParts.username, urlParts.password]
    : urlParts.password
    ? ['postgres', urlParts.password]
    : ['postgres', ''];
;

const config: DatabaseConfig = {
  host: urlParts.hostname,
    port: parseInt(urlParts.port || '5432'),
    database: urlParts.pathname.slice(1),
    user: username,
    password: password || ''
};

  // Apply auto-configuration;

const autoConfig = autoConfigureDatabase(url);
  return { ...config, ...autoConfig };
}

/**
 * Parse Redis URL and extract components
 */;
export function parseRedisUrl(url: string): RedisConfig {
  const urlParts = new URL(url);

const config: RedisConfig = {
  host: urlParts.hostname,
    port: parseInt(urlParts.port || '6379'),
    password: urlParts.password || undefined,
    db: 0
};

  // Apply auto-configuration;
    const autoConfig = autoConfigureRedis(url);
  return { ...config, ...autoConfig };
}

/**
 * Get optimized connection settings based on deployment environment
 */;
export function getOptimizedSettings(isProduction: boolean = false) {
  return {
  postgres: {
      // Connection pool settings,
  max: isProduction ? 20 : 5,
      min: isProduction ? 5 : 1,
      idleTimeoutMillis: isProduction ? 30000 : 10000,
      connectionTimeoutMillis: isProduction ? 30000 : 10000,
      
      // Query settings,
  statement_timeout: 60000, // 60 seconds,
  query_timeout: 60000,
      
      // Performance settings,
  ssl: isProduction ? { rejectUnauthorized: true } : { rejectUnauthorized: false }
},
    redis: {
      // Connection settings,
  maxRetriesPerRequest: isProduction ? 3 : 1,
      enableOfflineQueue: !isProduction,
      lazyConnect: isProduction,
      
      // Performance settings,
  enableReadyCheck: true,
      connectTimeout: 30000,
      
      // Cluster settings (if using Redis Cluster),
  clusterRetryStrategy: (times: number) => Math.min(times * 100, 3000)
}
}
export default {
  autoConfigureDatabase,
  autoConfigureRedis,
  parseDatabaseUrl,
  parseRedisUrl,
  getOptimizedSettings
}
}