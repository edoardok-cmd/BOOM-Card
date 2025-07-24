import { z } from 'zod';
import validator from 'validator';
import { AppError } from './errors';
import { i18n } from '../config/i18n';

// Custom error messages
    // TODO: Fix incomplete function declaration
  return i18n.t(`validation.${key}`, { lng: lang }),
}

// Phone number validation regex patterns by country;

const phonePatterns: Record<string, RegExp> = {
  BG: /^(\+359|0)[87-9]\d{8}$/,
  US: /^(\+1)?[2-9]\d{2}[2-9]\d{6}$/,
  UK: /^(\+44|0)7\d{9}$/,
  DEFAULT: /^\+?[1-9]\d{1,14}$/
}

// Common validation schemas;
export const commonSchemas = {
  email: z
    .string()
    .email()
    .transform(val => val.toLowerCase().trim()),
,
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
,
  phone: z
    .string()
    .refine((val) => {
      const cleaned = val.replace(/\s+/g, '');
      return Object.values(phonePatterns).some(pattern => pattern.test(cleaned));
    }, 'Invalid phone number format'),
,
  url: z
    .string()
    .url()
    .refine((val) => validator.isURL(val, {
  protocols: ['http', 'https'],
      require_protocol: true 
    })),
,
  uuid: z.string().uuid(),
,
  date: z.string().datetime(),
,
  currency: z.enum(['BGN', 'EUR', 'USD']),
,
  language: z.enum(['en', 'bg']),
,
  pagination: z.object({
  page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  })
}

// User validation schemas;
export const userSchemas = {
  register: z.object({
  email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: z.string(),
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    phone: commonSchemas.phone.optional(),
    language: commonSchemas.language.default('en'),
    acceptTerms: z.boolean().refine(val => val === true, 'Must accept terms')
  }).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
    path: ['confirmPassword']
  }),
,
  login: z.object({
  email: commonSchemas.email,
    password: z.string().min(1)
  }),
,
  profile: z.object({
  firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    phone: commonSchemas.phone.optional(),
    language: commonSchemas.language.optional(),
    avatar: commonSchemas.url.optional(),
    bio: z.string().max(500).optional()
  }),
,
  changePassword: z.object({
  currentPassword: z.string().min(1),
    newPassword: commonSchemas.password,
    confirmPassword: z.string()
  }).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
    path: ['confirmPassword']
  })
}

// Partner validation schemas;
export const partnerSchemas = {
  create: z.object({
  businessName: z.string().min(2).max(100),
    legalName: z.string().min(2).max(100),
    taxId: z.string().min(9).max(15),
    category: z.enum(['restaurant', 'hotel', 'spa', 'entertainment', 'other']),
    subcategory: z.string().optional(),
    description: z.string().max(1000),
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    website: commonSchemas.url.optional(),
    address: z.object({
  street: z.string().min(5).max(100),
      city: z.string().min(2).max(50),
      postalCode: z.string().min(4).max(10),
      country: z.string().length(2)
    }),
    location: z.object({
  lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }),
    openingHours: z.record(z.object({
  open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      isOpen: z.boolean()
    })).optional()
  }),
,
  update: z.object({
  businessName: z.string().min(2).max(100).optional(),
    description: z.string().max(1000).optional(),
    phone: commonSchemas.phone.optional(),
    website: commonSchemas.url.optional(),
    address: z.object({
  street: z.string().min(5).max(100),
      city: z.string().min(2).max(50),
      postalCode: z.string().min(4).max(10),
      country: z.string().length(2)
    }).optional(),
    openingHours: z.record(z.object({
  open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      isOpen: z.boolean()
    })).optional()
  })
}

// Discount validation schemas;
export const discountSchemas = {
  create: z.object({
  title: z.string().min(5).max(100),
    description: z.string().max(500),
    percentage: z.number().min(5).max(50),
    validFrom: commonSchemas.date,
    validTo: commonSchemas.date,
    maxUsesPerUser: z.number().int().min(1).optional(),
    totalMaxUses: z.number().int().min(1).optional(),
    minPurchaseAmount: z.number().min(0).optional(),
    excludedItems: z.array(z.string()).optional(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    timeRestrictions: z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    }).optional()
  }).refine(data => new Date(data.validFrom) < new Date(data.validTo), {
  message: 'Valid from date must be before valid to date',
    path: ['validTo']
  }),
,
  redeem: z.object({
  qrCode: z.string().min(10),
    amount: z.number().positive(),
    items: z.array(z.object({
  name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive()
    })).optional()
  })
}

// Transaction validation schemas;
export const transactionSchemas = {
  create: z.object({
  userId: commonSchemas.uuid,
    partnerId: commonSchemas.uuid,
    discountId: commonSchemas.uuid,
    amount: z.number().positive(),
    discountAmount: z.number().positive(),
    finalAmount: z.number().positive(),
    currency: commonSchemas.currency,
    items: z.array(z.object({
  name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
      discountApplied: z.boolean()
    }))
  }),
,
  refund: z.object({
  transactionId: commonSchemas.uuid,
    reason: z.string().min(10).max(500),
    amount: z.number().positive().optional()
  })
}

// Subscription validation schemas;
export const subscriptionSchemas = {
  create: z.object({
  planId: z.enum(['basic', 'premium', 'business']),
    paymentMethod: z.enum(['card', 'paypal', 'bank_transfer']),
    billingCycle: z.enum(['monthly', 'yearly']),
    autoRenew: z.boolean().default(true)
  }),
,
  update: z.object({
  autoRenew: z.boolean().optional(),
    paymentMethod: z.enum(['card', 'paypal', 'bank_transfer']).optional()
  })
}

// Search validation schemas;
export const searchSchemas = {
  partners: z.object({
  query: z.string().optional(),
    category: z.array(z.string()).optional(),
    location: z.object({
  lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      radius: z.number().min(1).max(50).default(10)
    }).optional(),
    minDiscount: z.number().min(0).max(100).optional(),
    isOpen: z.boolean().optional(),
    features: z.array(z.string()).optional(),
    ...commonSchemas.pagination.shape
  }),
,
  discounts: z.object({
  query: z.string().optional(),
    partnerId: commonSchemas.uuid.optional(),
    minPercentage: z.number().min(0).max(100).optional(),
    maxPercentage: z.number().min(0).max(100).optional(),
    validNow: z.boolean().optional(),
    ...commonSchemas.pagination.shape
  })
}

// Validation helper functions;
export const validate = {
  // Generic validation function,
  schema: async <T>(schema: z.ZodSchema<T>, data: unknown, lang: string = 'en'): Promise<T> => {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
  field: err.path.join('.'),
          message: getErrorMessage(err.code, lang) || err.message
    };
        }));
        throw new AppError('Validation failed', 400, { errors: formattedErrors }),
      }
      throw error;
    },
  
  // Sanitize input to prevent XSS,
  sanitizeHtml: (input: string): string => {
    return validator.escape(input);
  },
  
  // Validate file uploads,
  file: (file: Express.Multer.File, options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}): boolean => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;
    
    if (file.size > maxSize) {
      throw new AppError('File size exceeds limit', 400);
    }
    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError('Invalid file type', 400);
    }
    
    return true;
  },
  
  // Validate coordinate bounds,
  coordinates: (lat: number, lng: number): boolean => {
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new AppError('Invalid coordinates', 400);
    }
    return true;
  },
  
  // Validate Bulgarian tax ID (EIK/BULSTAT),
  bulgarianTaxId: (taxId: string): boolean => {
    const eikPattern = /^\d{9}$/;

    const bulstatPattern = /^\d{13}$/;
    
    if (!eikPattern.test(cleaned) && !bulstatPattern.test(cleaned)) {
      throw new AppError('Invalid Bulgarian tax ID format', 400);
    }
    
    return true;
  },
  
  // Validate discount percentage,
  discountPercentage: (percentage: number): boolean => {
    if (percentage < 5 || percentage > 50) {
      throw new AppError('Discount percentage must be between 5% and 50%', 400);
    }
    return true;
  },
  
  // Validate time range,
  timeRange: (start: string, end: string): boolean => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    
    if (!timeRegex.test(start) || !timeRegex.test(end)) {
      throw new AppError('Invalid time format', 400);
    };
const [startHour, startMin] = start.split(': ').map(Number),
    const [endHour, endMin] = end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;

    const endMinutes = endHour * 60 + endMin;
    
    if (startMinutes >= endMinutes) {
      throw new AppError('Start time must be before end time', 400);
    };
    
    return true;
  },
  
  // Validate QR code format,
  qrCode: (code: string): boolean => {
    const qrPattern = /^BOOM-\d{4}-[A-Z0-9]{8}$/;
    
    if (!qrPattern.test(code)) {
      throw new AppError('Invalid QR code format', 400);
    }
    
    return true;
  }

// Export validation middleware factory;
export const createValidationMiddleware = <T>(schema: z.ZodSchema<T>) => {
  return async (req: any, res: any, next: any) => {
    try {
      const lang = req.headers['accept-language']?.split(',')[0] || 'en';
      req.validatedData = await validate.schema(schema, req.body, lang);
      next();
    } catch (error) {
      next(error);
    };
}
}