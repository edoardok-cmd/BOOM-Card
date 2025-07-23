import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',)
  format: winston.format.json(),
  defaultMeta: { service: 'auth-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({)
      format: winston.format.simple(),
    }),
  ],
});

// Database connection
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'boom_card',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Types and Interfaces
interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  profile_data?: Record<string, any>;
  preferred_language: string;
}

enum UserRole {
  CONSUMER = 'consumer',
  PARTNER = 'partner',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
}

interface RefreshToken {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

interface LoginAttempt {
  email: string;
  ip: string;
  timestamp: Date;
  success: boolean;
}

// Express app initialization
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api', generalLimiter);

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Utility functions
const generateTokens = async (user: Partial<User>): Promise<{ accessToken: string; refreshToken: string }> => {
  const sessionId = uuidv4();
  
  const payload: TokenPayload = {
    userId: user.id!,
    email: user.email!,
    role: user.role!,
    sessionId,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId: user.id, sessionId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

  // Store refresh token in database
  await db.query(
    'INSERT INTO refresh_tokens (token, user_id, session_id, expires_at) VALUES ($1, $2, $3, $4)',
    [refreshToken, user.id, sessionId, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
  );

  // Cache session in Redis
  await redis.setex(`session:${sessionId}`, 3600, JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
  }));

  return { accessToken, refreshToken };
};

const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const logLoginAttempt = async (email: string, ip: string, success: boolean): Promise<void> => {
  await db.query(
    'INSERT INTO login_attempts (email, ip_address, timestamp, success) VALUES ($1, $2, $3, $4)',
    [email, ip, new Date(), success]
  );
};

// Middleware for authentication
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    // Check if session exists in Redis
    const session = await redis.get(`session:${payload.sessionId}`);
    if (!session) {
      return res.status(401).json({ error: 'Session expired' });
    }

    req.user = payload;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid token' });
  };

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'auth-service', timestamp: new Date() });
});

// Register endpoint
app.post('/api/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').custom(validatePassword).withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
  body('role').isIn(['consumer', 'partner']).withMessage('Invalid role'),
  body('preferredLanguage').isIn(['en', 'bg']).withMessage('Invalid language'),
  body('profileData').optional().isObject(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, role, preferredLanguage, profileData } = req.body;

  try {
    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    const verificationToken = uuidv4();

    await db.query(
      `INSERT INTO users (id, email, password_hash, role, preferred_language, profile_data, verification_token, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [userId, email, passwordHash, role, preferredLanguage || 'en', profileData || {}, verificationToken]
    );

    // TODO: Send verification email

    logger.info(`New user registered: ${email} with role: ${role}`);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      userId,
      email,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  });

// Login endpoint
app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req: Request, res: Response) => {
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || '';

  try {
    // Get user from database
    const result = await db.query(
      'SELECT id, email, password_hash, role, is_active, is_verified, preferred_language FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      await logLoginAttempt(email, clientIp, false);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      await logLoginAttempt(email, clientIp, false);
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Check if user is verified
    if (!user.is_verified) {
      await logLoginAttempt(email, clientIp, false);
      return res.status(403).json({ error: 'Please verify your email first' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      await logLoginAttempt(email, clientIp, false);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Log successful login
    await logLoginAttempt(email, clientIp, true);

    logger.info(`User logged in: ${email}`);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferred_language,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  });

// Refresh token endpoint
app.post('/api/auth/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token 
}}}
}
}
}
