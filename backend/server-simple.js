// Simple JavaScript entry point for production deployment
// This bypasses TypeScript compilation issues for quick deployment

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const Redis = require('ioredis');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connections
let db, redis;

// Initialize PostgreSQL
if (process.env.DATABASE_URL) {
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  console.log('📊 PostgreSQL configured');
}

// Initialize Redis
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    tls: process.env.NODE_ENV === 'production' ? {} : undefined,
    maxRetriesPerRequest: 3
  });
  console.log('🔴 Redis configured');
}

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unknown',
      redis: 'unknown'
    }
  };

  // Check database connection
  if (db) {
    try {
      await db.query('SELECT NOW()');
      health.services.database = 'connected';
    } catch (error) {
      health.services.database = 'error';
      health.status = 'degraded';
    }
  }

  // Check Redis connection
  if (redis) {
    try {
      await redis.ping();
      health.services.redis = 'connected';
    } catch (error) {
      health.services.redis = 'error';
      health.status = 'degraded';
    }
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API status endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'BOOM Card API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test login endpoint (for debugging CORS)
app.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    res.json({
      success: true,
      message: 'Test login successful - CORS working!',
      data: {
        email: email,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Basic auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Placeholder response for now
    res.json({
      success: true,
      message: 'Login endpoint available',
      data: {
        note: 'Full authentication will be implemented after TypeScript compilation is fixed'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Placeholder response for now
    res.json({
      success: true,
      message: 'Registration endpoint available',
      data: {
        note: 'Full registration will be implemented after TypeScript compilation is fixed'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Test database endpoint
app.get('/api/test/db', async (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database not configured'
    });
  }

  try {
    const result = await db.query('SELECT NOW() as current_time, COUNT(*) as user_count FROM users');
    res.json({
      success: true,
      data: {
        current_time: result.rows[0].current_time,
        user_count: result.rows[0].user_count,
        message: 'Database connection successful'
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test Redis endpoint
app.get('/api/test/redis', async (req, res) => {
  if (!redis) {
    return res.status(503).json({
      success: false,
      message: 'Redis not configured'
    });
  }

  try {
    const testKey = 'test:' + Date.now();
    await redis.set(testKey, 'Hello from BOOM Card API!', 'EX', 60);
    const value = await redis.get(testKey);
    await redis.del(testKey);
    
    res.json({
      success: true,
      data: {
        message: 'Redis connection successful',
        test_value: value
      }
    });
  } catch (error) {
    console.error('Redis test error:', error);
    res.status(500).json({
      success: false,
      message: 'Redis connection failed',
      error: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  
  if (db) {
    await db.end();
    console.log('Database connection closed');
  }
  
  if (redis) {
    redis.disconnect();
    console.log('Redis connection closed');
  }
  
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 BOOM Card API Server Started');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API status: http://localhost:${PORT}/api`);
  console.log(`🗄️  Database: ${db ? 'configured' : 'not configured'}`);
  console.log(`🔴 Redis: ${redis ? 'configured' : 'not configured'}`);
});