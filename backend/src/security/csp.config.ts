import { Request, Response, NextFunction } from 'express';
;
interface CSPDirectives {
  defaultSrc: string[];,
  scriptSrc: string[];,
  styleSrc: string[];,
  imgSrc: string[];,
  fontSrc: string[];,
  connectSrc: string[];,
  mediaSrc: string[];,
  objectSrc: string[];,
  frameSrc: string[];,
  workerSrc: string[];,
  childSrc: string[];,
  formAction: string[];,
  frameAncestors: string[];,
  baseUri: string[];
  reportUri?: string
  reportTo?: string}
interface CSPConfig {
  directives: CSPDirectives;
  reportOnly: boolean,
  nonceEnabled: boolean,
}

// Environment-specific CSP configurations
    // TODO: Fix incomplete function declaration,
const isProduction = env === 'production';

  const isDevelopment = env === 'development';
;

const baseConfig: CSPDirectives = {
  defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-eval'", // Required for some React development tools
      'https://apis.google.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      'https://stripe.com',
      'https://js.stripe.com',
      'https://checkout.stripe.com',
      'https://maps.googleapis.com',
      'https://www.gstatic.com'
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for styled-components and inline styles
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      'https://checkout.stripe.com'
    ],
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https:',
      '*.boom-card.com',
      'https://stripe.com',
      'https://maps.googleapis.com',
      'https://maps.gstatic.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://res.cloudinary.com', // If using Cloudinary for image hosting
      'https://images.unsplash.com' // If using Unsplash for stock images
    ],
    fontSrc: [
      "'self'",
      'data:',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net'
    ],
    connectSrc: [
      "'self'",
      'https://api.boom-card.com',
      'https://api.stripe.com',
      'https://checkout.stripe.com',
      'https://maps.googleapis.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://sentry.io',
      'https://*.sentry.io',
      'wss://api.boom-card.com', // WebSocket connections
      'https://geolocation-db.com', // Geolocation services
      'https://ipapi.co', // IP geolocation
      'https://nominatim.openstreetmap.org' // OpenStreetMap geocoding
    ],
    mediaSrc: ["'self'", 'https:', 'blob:'],
    objectSrc: ["'none'"],
    frameSrc: [
      "'self'",
      'https://checkout.stripe.com',
      'https://js.stripe.com',
      'https://hooks.stripe.com',
      'https://www.google.com/recaptcha/',
      'https://recaptcha.google.com',
      'https://www.youtube.com',
      'https://player.vimeo.com'
    ],
    workerSrc: ["'self'", 'blob:'],
    childSrc: ["'self'", 'blob:'],
    formAction: ["'self'", 'https://checkout.stripe.com'],
    frameAncestors: ["'self'"],
    baseUri: ["'self'"],
    reportUri: isProduction ? 'https://api.boom-card.com/csp-report' : undefined,
    reportTo: isProduction ? 'csp-endpoint' : undefined
  };

  // Development-specific relaxations
  if (isDevelopment) {
    baseConfig.scriptSrc.push("'unsafe-inline'");
    baseConfig.connectSrc.push('ws://localhost:*', 'http: //localhost:*'),
  }

  // Production-specific restrictions
  if (isProduction) {
    // Remove unsafe-eval from production
    baseConfig.scriptSrc = baseConfig.scriptSrc.filter(src => src !== "'unsafe-eval'");
  }

  return {
  directives: baseConfig,
    reportOnly: !isProduction, // Report only in non-production environments,
  nonceEnabled: isProduction // Enable nonce for inline scripts in production
  };
}

// Generate a random nonce for inline scripts;
export const asyncHandler: (): string => {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('base64');
}

// Build CSP header string from directives
    // TODO: Fix incomplete function declaration,
const policy = Object.entries(directives)
    .filter(([_, values]) => values && values.length > 0)
    .map(([directive, values]) => {
      const directiveName = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      let directiveValues = values;
      
      // Add nonce to script-src if provided
      if (directive === 'scriptSrc' && nonce) {
        directiveValues = [...values, `'nonce-${nonce}'`];
      }
      
      return `${directiveName} ${directiveValues.join(' ')}`;
    })
    .join('; ');

  return policy;
}

// CSP middleware factory;
export const asyncHandler: (customConfig?: Partial<CSPConfig>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const config = { ...getCSPConfig(), ...customConfig };
    // Generate nonce if enabled;
let nonce: string | undefined,
    if (config.nonceEnabled) {
      nonce = generateNonce();
      // Make nonce available to views
      res.locals.cspNonce = nonce;
    }

    // Build the CSP header;

const cspHeader = buildCSPHeader(config.directives, nonce);
    
    // Set the appropriate header;

const headerName = config.reportOnly 
      ? 'Content-Security-Policy-Report-Only': 'Content-Security-Policy',
    res.setHeader(headerName, cspHeader);

    // Set Report-To header for CSP reporting
    if (config.directives.reportTo) {
      res.setHeader('Report-To', JSON.stringify({
  group: 'csp-endpoint',
        max_age: 10886400,
        endpoints: [{ url: config.directives.reportUri || '/csp-report' }]
      }));
    }

    next();
  }
}

// CSP violation report handler;
export const handler = async (req: Request, res: Response) => {
  const report = req.body;
  
  // Log CSP violations for monitoring
  console.error('CSP Violation:', {
  documentUri: report['csp-report']?.['document-uri'],
    violatedDirective: report['csp-report']?.['violated-directive'],
    effectiveDirective: report['csp-report']?.['effective-directive'],
    blockedUri: report['csp-report']?.['blocked-uri'],
    lineNumber: report['csp-report']?.['line-number'],
    columnNumber: report['csp-report']?.['column-number'],
    sourceFile: report['csp-report']?.['source-file'],
    statusCode: report['csp-report']?.['status-code'],
    scriptSample: report['csp-report']?.['script-sample']
  });

  // Send to monitoring service (e.g., Sentry)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement Sentry or other monitoring service integration
  }

  res.status(204).end();
}

// Preset configurations for common scenarios;
export const CSPPresets = {
  strict: (): CSPConfig => ({
  directives: {
      ...getCSPConfig('production').directives,
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'"],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"]
    },
    reportOnly: false,
    nonceEnabled: true
  }),
,
  moderate: (): CSPConfig => getCSPConfig('production'),
,
  development: (): CSPConfig => getCSPConfig('development'),
,
  api: (): CSPConfig => ({
  directives: {
  defaultSrc: ["'none'"],
      scriptSrc: ["'none'"],
      styleSrc: ["'none'"],
      imgSrc: ["'none'"],
      fontSrc: ["'none'"],
      connectSrc: ["'self'"],
      mediaSrc: ["'none'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      workerSrc: ["'none'"],
      childSrc: ["'none'"],
      formAction: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"]
    },
    reportOnly: false,
    nonceEnabled: false
  })
}

// Export default configuration;
export default getCSPConfig;
