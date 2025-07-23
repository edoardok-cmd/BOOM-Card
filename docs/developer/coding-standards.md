# BOOM Card Platform - Coding Standards & Best Practices

## Table of Contents
1. [General Principles](#general-principles)
2. [TypeScript Standards](#typescript-standards)
3. [React/Next.js Standards](#reactnextjs-standards)
4. [Node.js/Express Standards](#nodejsexpress-standards)
5. [Database Standards](#database-standards)
6. [API Design Standards](#api-design-standards)
7. [Security Standards](#security-standards)
8. [Testing Standards](#testing-standards)
9. [Documentation Standards](#documentation-standards)
10. [Git Workflow](#git-workflow)
11. [Performance Guidelines](#performance-guidelines)
12. [Internationalization (i18n)](#internationalization-i18n)

## General Principles

### Clean Code Philosophy
- **DRY (Don't Repeat Yourself)**: Avoid code duplication through abstraction
- **KISS (Keep It Simple, Stupid)**: Prefer simple, readable solutions
- **YAGNI (You Aren't Gonna Need It)**: Don't implement features until they're needed
- **SOLID Principles**: Follow object-oriented design principles

### Code Organization
```
src/
├── components/          # Reusable UI components
├── features/           # Feature-specific modules
├── hooks/              # Custom React hooks
├── services/           # Business logic and API calls
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── config/             # Configuration files
└── styles/             # Global styles and themes
```

## TypeScript Standards

### Type Definitions
```typescript
// ✅ Good: Use explicit types
interface Partner {
  id: string;
  name: string;
  category: PartnerCategory;
  discountPercentage: number;
  location: Location;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ❌ Bad: Avoid any type
const processData = (data: any) => { ... }

// ✅ Good: Use proper type narrowing
const processPartner = (partner: Partner | null): string => {
  if (!partner) {
    return 'No partner found';
  }
  return partner.name;
}
```

### Enum Usage
```typescript
// Use const enums for better performance
export const enum PartnerCategory {
  RESTAURANT = 'RESTAURANT',
  CAFE = 'CAFE',
  BAR = 'BAR',
  HOTEL = 'HOTEL',
  SPA = 'SPA',
  ENTERTAINMENT = 'ENTERTAINMENT'
}

// For objects that need runtime access
export const DISCOUNT_TIERS = {
  BRONZE: { min: 5, max: 10 },
  SILVER: { min: 11, max: 20 },
  GOLD: { min: 21, max: 30 },
  PLATINUM: { min: 31, max: 50 }
} as const;
```

### Generic Types
```typescript
// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  error: ApiError | null;
  meta: {
    timestamp: number;
    version: string;
  };
}

// Pagination interface
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

## React/Next.js Standards

### Component Structure
```typescript
// components/PartnerCard/PartnerCard.tsx
import { FC, memo } from 'react';
import { useTranslation } from 'next-i18next';
import { Partner } from '@/types';
import styles from './PartnerCard.module.css';

interface PartnerCardProps {
  partner: Partner;
  onSelect?: (partnerId: string) => void;
  variant?: 'default' | 'compact';
}

export const PartnerCard: FC<PartnerCardProps> = memo(({ 
  partner, 
  onSelect,
  variant = 'default' 
}) => {
  const { t } = useTranslation('common');
  
  // Component logic here
  
  return (
    <article 
      className={styles.card}
      data-variant={variant}
      onClick={() => onSelect?.(partner.id)}
    >
      {/* Component JSX */}
    </article>
  );
});

PartnerCard.displayName = 'PartnerCard';
```

### Custom Hooks
```typescript
// hooks/usePartners.ts
import { useState, useEffect, useCallback } from 'react';
import { Partner, ApiError } from '@/types';
import { partnersService } from '@/services';

interface UsePartnersOptions {
  category?: PartnerCategory;
  location?: string;
  limit?: number;
}

export const usePartners = (options: UsePartnersOptions = {}) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await partnersService.getPartners(options);
      setPartners(data);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  return {
    partners,
    loading,
    error,
    refetch: fetchPartners
  };
};
```

### State Management
```typescript
// Use Zustand for global state
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        logout: () => set({ user: null, isAuthenticated: false })
      }),
      {
        name: 'user-storage'
      }
    )
  )
);
```

## Node.js/Express Standards

### Controller Structure
```typescript
// controllers/partners.controller.ts
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '@/middleware';
import { partnersService } from '@/services';
import { ApiResponse } from '@/types';

export class PartnersController {
  getPartners = asyncHandler(async (
    req: Request,
    res: Response<ApiResponse<Partner[]>>,
    next: NextFunction
  ) => {
    const { category, location, page = 1, limit = 20 } = req.query;
    
    const partners = await partnersService.findAll({
      category: category as PartnerCategory,
      location: location as string,
      pagination: {
        page: Number(page),
        limit: Number(limit)
      }
    });

    res.json({
      data: partners,
      error: null,
      meta: {
        timestamp: Date.now(),
        version: process.env.API_VERSION || '1.0.0'
      }
    });
  });

  createPartner = asyncHandler(async (
    req: Request<{}, {}, CreatePartnerDto>,
    res: Response<ApiResponse<Partner>>,
    next: NextFunction
  ) => {
    const partner = await partnersService.create(req.body);
    
    res.status(201).json({
      data: partner,
      error: null,
      meta: {
        timestamp: Date.now(),
        version: process.env.API_VERSION || '1.0.0'
      }
    });
  });
}
```

### Service Layer
```typescript
// services/partners.service.ts
import { Partner, CreatePartnerDto, UpdatePartnerDto } from '@/types';
import { db } from '@/database';
import { cache } from '@/cache';
import { AppError } from '@/utils/errors';

export class PartnersService {
  private readonly CACHE_TTL = 300; // 5 minutes

  async findAll(options: FindPartnersOptions): Promise<Partner[]> {
    const cacheKey = this.generateCacheKey('partners:all', options);
    const cached = await cache.get<Partner[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const partners = await db.partner.findMany({
      where: {
        category: options.category,
        location: options.location,
        isActive: true
      },
      skip: (options.pagination.page - 1) * options.pagination.limit,
      take: options.pagination.limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    await cache.set(cacheKey, partners, this.CACHE_TTL);
    return partners;
  }

  async create(data: CreatePartnerDto): Promise<Partner> {
    // Validate business rules
    if (data.discountPercentage > 50) {
      throw new AppError('Discount percentage cannot exceed 50%', 400);
    }

    const partner = await db.partner.create({
      data: {
        ...data,
        slug: this.generateSlug(data.name)
      }
    });

    // Invalidate cache
    await cache.invalidate('partners:*');
    
    return partner;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private generateCacheKey(prefix: string, params: any): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }
}

export const partnersService = new PartnersService();
```

### Middleware
```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@/utils/errors';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      id: decoded.sub,
      role: decoded.role
    };

    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
};
```

## Database Standards

### Migration Naming
```
YYYYMMDDHHMMSS_descriptive_name.sql
Example: 20240115143022_create_partners_table.sql
```

### Query Patterns
```typescript
// Use parameterized queries to prevent SQL injection
const query = `
  SELECT p.*, 
         COUNT(DISTINCT t.id) as transaction_count,
         AVG(t.discount_amount) as avg_