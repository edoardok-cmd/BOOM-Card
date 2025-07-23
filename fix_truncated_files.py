#!/usr/bin/env python3
"""
Fix the remaining truncated files in BOOM Card project
"""

import os

def fix_database_migrate_js():
    """Fix the database/migrate.js file"""
    content = """const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'boom_card',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigrations() {
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter(f => f.endsWith('.sql')).sort();

    // Get executed migrations
    const { rows: executedMigrations } = await pool.query(
      'SELECT filename FROM migrations'
    );
    const executed = new Set(executedMigrations.map(row => row.filename));

    // Run pending migrations
    for (const file of migrationFiles) {
      if (!executed.has(file)) {
        console.log(`Running migration: ${file}`);
        const sqlPath = path.join(migrationsDir, file);
        const sql = await fs.readFile(sqlPath, 'utf8');
        
        await pool.query('BEGIN');
        try {
          await pool.query(sql);
          await pool.query(
            'INSERT INTO migrations (filename) VALUES ($1)',
            [file]
          );
          await pool.query('COMMIT');
          console.log(`Migration ${file} completed successfully`);
        } catch (error) {
          await pool.query('ROLLBACK');
          throw error;
        }
      }
    }

    console.log('All migrations completed');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
"""
    
    with open("database/migrate.js", "w") as f:
        f.write(content)
    print("Fixed: database/migrate.js")

def fix_frontend_components():
    """Fix truncated frontend component files"""
    
    # Fix Header.tsx
    header_content = """import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaUser, FaShoppingCart, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../common/Logo';
import Button from '../common/Button';

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      transparent ? 'bg-transparent' : 'bg-white shadow-md'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/partners" className="text-gray-700 hover:text-purple-600">
              {t('navigation.partners')}
            </Link>
            <Link to="/deals" className="text-gray-700 hover:text-purple-600">
              {t('navigation.deals')}
            </Link>
            <Link to="/how-it-works" className="text-gray-700 hover:text-purple-600">
              {t('navigation.howItWorks')}
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-purple-600">
              {t('navigation.about')}
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <FaSearch />
            </button>
            
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full">
                  <FaUser />
                  <span className="hidden md:inline">{user.firstName}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    {t('header.profile')}
                  </Link>
                  <Link to="/my-cards" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    {t('header.myCards')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {t('header.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Button
                variant="primary"
                size="small"
                onClick={() => navigate('/login')}
              >
                {t('header.login')}
              </Button>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="container mx-auto px-4 py-4">
            <Link
              to="/partners"
              className="block py-2 text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.partners')}
            </Link>
            <Link
              to="/deals"
              className="block py-2 text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.deals')}
            </Link>
            <Link
              to="/how-it-works"
              className="block py-2 text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.howItWorks')}
            </Link>
            <Link
              to="/about"
              className="block py-2 text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.about')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
"""
    
    with open("frontend/src/components/layout/Header.tsx", "w") as f:
        f.write(header_content)
    print("Fixed: frontend/src/components/layout/Header.tsx")
    
    # Fix PartnerCard.tsx
    partner_card_content = """import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import { Partner } from '../../types';
import Card from '../common/Card';

interface PartnerCardProps {
  partner: Partner;
  variant?: 'default' | 'compact' | 'featured';
}

const PartnerCard: React.FC<PartnerCardProps> = ({ partner, variant = 'default' }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (variant === 'compact') {
    return (
      <Link to={`/partners/${partner.id}`}>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <img
              src={partner.logo}
              alt={partner.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{partner.name}</h3>
              <p className="text-gray-600 text-sm">{partner.category}</p>
            </div>
            <div className="text-right">
              <div className="text-purple-600 font-bold text-lg">
                {partner.discount}% OFF
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/partners/${partner.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
        <div className="relative">
          <img
            src={partner.imageUrl}
            alt={partner.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {partner.isFeatured && (
            <span className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
              Featured
            </span>
          )}
          <div className="absolute bottom-2 left-2 bg-white rounded-full px-3 py-1 shadow-md">
            <span className="text-purple-600 font-bold">{partner.discount}% OFF</span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{partner.name}</h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <FaMapMarkerAlt className="mr-1" />
            <span>{partner.location.city}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {renderStars(partner.rating)}
              <span className="ml-2 text-sm text-gray-600">
                ({partner.reviewCount})
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <FaTag className="mr-1" />
              <span>{partner.category}</span>
            </div>
          </div>
          
          {partner.description && (
            <p className="mt-3 text-gray-600 text-sm line-clamp-2">
              {partner.description}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default PartnerCard;
"""
    
    with open("frontend/src/components/partner/PartnerCard.tsx", "w") as f:
        f.write(partner_card_content)
    print("Fixed: frontend/src/components/partner/PartnerCard.tsx")

def fix_backend_middleware():
    """Fix backend middleware index.ts file"""
    
    middleware_content = """import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { config } from '../config';

// Error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};

// Request validation middleware
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  
  next();
};

// Rate limiting middleware factory
export const rateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  const requests = new Map();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - options.windowMs;
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key).filter((timestamp: number) => timestamp > windowStart);
    
    if (userRequests.length >= options.max) {
      return res.status(429).json({
        success: false,
        error: options.message || 'Too many requests',
      });
    }
    
    userRequests.push(now);
    requests.set(key, userRequests);
    next();
  };
};

// CORS middleware
export const cors = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', config.cors.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
};

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });
  
  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
};

export default {
  errorHandler,
  authenticate,
  validateRequest,
  rateLimiter,
  cors,
  requestLogger,
  securityHeaders,
};
"""
    
    with open("backend/src/middleware/index.ts", "w") as f:
        f.write(middleware_content)
    print("Fixed: backend/src/middleware/index.ts")

def main():
    """Fix all truncated files"""
    print("Fixing truncated files in BOOM Card project...")
    
    # Create directories if they don't exist
    os.makedirs("database", exist_ok=True)
    os.makedirs("frontend/src/components/layout", exist_ok=True)
    os.makedirs("frontend/src/components/partner", exist_ok=True)
    os.makedirs("backend/src/middleware", exist_ok=True)
    
    # Fix files
    fix_database_migrate_js()
    fix_frontend_components()
    fix_backend_middleware()
    
    print("\nCompleted fixing truncated files!")

if __name__ == "__main__":
    main()