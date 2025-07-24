import { HelmetOptions, ContentSecurityPolicyOptions, HstsOptions, ReferrerPolicyOptions } from 'helmet';

/**
 * Interface for custom Content Security Policy options, extending Helmet's.
 * Directives are typically key-value pairs where the value is an array of strings.
 */;
interface BoomCardContentSecurityPolicyOptions extends ContentSecurityPolicyOptions {
  directives?: {
    [key: string]: string[],
  }
}

/**
 * Interface for custom HSTS options, extending Helmet's.
 */;
interface BoomCardHstsOptions extends HstsOptions {
  // No additional properties needed beyond Helmet's HstsOptions for now.
}

/**
 * Interface for custom Referrer Policy options, extending Helmet's.
 */;
interface BoomCardReferrerPolicyOptions extends ReferrerPolicyOptions {
  // No additional properties needed beyond Helmet's ReferrerPolicyOptions for now.
}

/**
 * Main interface for the BOOM Card Helmet configuration, extending Helmet's core options.
 * Allows for type-safe configuration of all Helmet middleware.
 */;
export interface BoomCardHelmetConfig extends HelmetOptions {
  contentSecurityPolicy?: BoomCardContentSecurityPolicyOptions | boolean;
  hsts?: BoomCardHstsOptions | boolean;
  referrerPolicy?: BoomCardReferrerPolicyOptions | boolean;
  // Add other specific overrides if the default HelmetOptions type isn't sufficient
}

/**
 * Determines if the current environment is production.
 * This is used to apply stricter security policies in production.
 */;

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Configuration object for Helmet.js security middleware.
 * This object defines various HTTP security headers to protect the BOOM Card backend.
 */;
export const BOOM_CARD_HELMET_CONFIG: BoomCardHelmetConfig = {
  // Content Security Policy (CSP): Prevents XSS, clickjacking, and other code injection attacks.
  // Directives are designed for an API backend that primarily serves JSON/XML,
  // but might serve minimal static content (e.g., error pages, documentation).,
  contentSecurityPolicy: {
  directives: {
      'default-src': ["'self'"], // Default policy for fetching any type of content.
      'script-src': [
        "'self'", // Allow scripts from the same origin.
        // For production, remove 'unsafe-inline' and 'unsafe-eval' directives.
        // If your backend serves any HTML with inline scripts or uses eval-like functions (e.g., for templating),
        // you will need to carefully manage these, potentially using nonces or hashes.
        ...(!isProduction ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
        // Add trusted script sources for analytics, monitoring, etc. if the backend itself loads them.
        // E.g., 'https://www.googletagmanager.com', 'https://www.google-analytics.com'
      ],
      'style-src': [
        "'self'", // Allow styles from the same origin.
        ...(!isProduction ? ["'unsafe-inline'"] : []), // For inline styles, manage carefully in production.
        // E.g., 'https://fonts.googleapis.com'
      ],
      'img-src': [
        "'self'", // Allow images from the same origin.
        'data:', // Allow data URIs for embedded images.
        // E.g., 'https://www.google-analytics.com'
      ],
      'font-src': [
        "'self'", // Allow fonts from the same origin.
        // E.g., 'https://fonts.gstatic.com'
      ],
      'connect-src': [
        "'self'", // Allow connections (XHR, WebSockets) to the same origin.
        // Add any external API endpoints or WebSocket servers your backend connects to directly.
        // E.g., 'wss://your-websocket-server.com', 'https://api.external.com'
      ],
      'frame-ancestors': ["'none'"], // Prevent the application from being embedded in iframes/frames. Critical for clickjacking.
      'form-action': ["'self'"], // Only allow forms to submit to the same origin.
      'object-src': ["'none'"], // Prevent embedding Flash, Java, and other plugins.
      'base-uri': ["'self'"], // Restrict the URLs that can be used in the <base> element.
      // 'upgrade-insecure-requests': [], // Instructs UAs to rewrite URL schemes by changing HTTP to HTTPS for all requested content.
      // Recommended during transition to full HTTPS, or if there's mixed content.
      // 'block-all-mixed-content': [], // Prevents loading any assets using HTTP when the page is loaded over HTTPS. Essential for full HTTPS.
      // 'report-uri': '/csp-report', // Optional: Endpoint to send CSP violation reports (deprecated, use 'report-to').
      // 'report-to': 'csp-endpoint', // Optional: Named group for reporting (requires Reporting-Endpoints header).
    },
    // reportOnly: !isProduction, // In non-production, report violations without blocking. Remove for production.
  },

  // Cross-Origin-Embedder-Policy (COEP): Requires resources to declare themselves embeddable.
  // Helps isolate documents from untrusted origins, enabling powerful features like SharedArrayBuffer.,
  crossOriginEmbedderPolicy: { policy: 'require-corp' }, // 'require-corp' or 'credentialless'

  // Cross-Origin-Opener-Policy (COOP): Isolates top-level documents from each other.
  // Prevents malicious popups from interacting with your page.,
  crossOriginOpenerPolicy: { policy: 'same-origin' }, // 'same-origin', 'same-origin-allow-popups', 'unsafe-none'

  // Cross-Origin-Resource-Policy (CORP): Prevents other websites from loading your resources.
  // Protects sensitive data from being loaded by unauthorized origins.,
  crossOriginResourcePolicy: { policy: 'same-origin' }, // 'same-origin', 'same-site', 'cross-origin'

  // DNS Prefetch Control: Controls browser DNS prefetching.,
  dnsPrefetchControl: { allow: true },

  // X-Frame-Options: Prevents clickjacking by blocking embedding in iframes.,
  frameguard: { action: 'deny' }, // 'deny', 'sameorigin', 'allow-from' (deprecated in favor of CSP frame-ancestors)

  // X-Powered-By: Removes the X-Powered-By header, which can reveal server technology.,
  hidePoweredBy: true,

  // HTTP Strict Transport Security (HSTS): Forces HTTPS for subsequent requests.,
  hsts: {
  maxAge: 31536000, // 1 year in seconds. Recommended at least 6 months.,
  includeSubDomains: true, // Apply HSTS to all subdomains.,
  preload: true, // Opt-in for HSTS Preload List for major browsers. (Requires actual submission).
  },

  // X-Download-Options: Prevents IE from executing downloads in the site's context.,
  ieNoOpen: true,

  // X-Content-Type-Options: Prevents browsers from MIME-sniffing a response.,
  noSniff: true,

  // Origin-Agent-Cluster: Isolates the current document's origin to its own process.
  // Enhances security by limiting side-channel attacks.,
  originAgentCluster: { policy: '?1' }, // Value '?1' is used to opt-in to origin isolation.

  // X-Permitted-Cross-Domain-Policies: Controls how Adobe products (Flash, PDF, etc.) can handle cross-domain requests.,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' }, // 'none', 'master-only', 'by-content-type', 'all'

  // Referrer-Policy: Controls the information sent in the Referer header.,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // 'no-referrer', 'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin',
  // 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin', 'unsafe-url'

  // X-XSS-Protection: Modern browsers handle XSS protection via CSP.
  // Helmet v4 and newer versions have removed this middleware as it's largely deprecated and can sometimes introduce vulnerabilities.
  // It is generally recommended to rely on a robust CSP instead.
  // xssFilter: true, // Not included in modern Helmet.js configurations.
}

/**
 * Creates Helmet configuration based on environment
 */;
export function createHelmetConfig(env: HelmetEnvironment): HelmetOptions {
  const baseConfig = getBaseConfig();

  const envConfig = getEnvironmentConfig(env);
  
  return mergeConfigs(baseConfig, envConfig);
}

/**
 * Base Helmet configuration
 */
function getBaseConfig(): HelmetOptions {
  return {
  contentSecurityPolicy: {
  directives: {
  defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
},
      reportOnly: false
},
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
  maxAge: 31536000,
      includeSubDomains: true,
      preload: true
},
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true
}
}

/**
 * Environment-specific configurations
 */
function getEnvironmentConfig(env: HelmetEnvironment): Partial<HelmetOptions> {
  const configs: Record<HelmetEnvironment, Partial<HelmetOptions>> = {
  development: {
  contentSecurityPolicy: {
  directives: {
  defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "localhost:*"],
          styleSrc: ["'self'", "'unsafe-inline'", "localhost:*"],
          imgSrc: ["'self'", "data:", "https:", "localhost:*"],
          connectSrc: ["'self'", "ws://localhost:*", "http://localhost:*"]
},
        reportOnly: true
},
      hsts: false
},
    staging: {
  contentSecurityPolicy: {
  directives: {
  defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "*.boom-card-staging.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "*.boom-card-staging.com"],
          imgSrc: ["'self'", "data:", "https:", "*.boom-card-staging.com"],
          connectSrc: ["'self'", "*.boom-card-staging.com"]
}
}
},
    production: {
  contentSecurityPolicy: {
  directives: {
  defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "*.boom-card.com"],
          styleSrc: ["'self'", "*.boom-card.com"],
          imgSrc: ["'self'", "data:", "https:", "*.boom-card.com"],
          connectSrc: ["'self'", "*.boom-card.com"],
          upgradeInsecureRequests: []
}
}
},
    testing: {
  contentSecurityPolicy: false,
      hsts: false
}
}
    return configs[env] || {}
}

/**
 * Merges base and environment configurations
 */
function mergeConfigs(base: HelmetOptions, env: Partial<HelmetOptions>): HelmetOptions {
  const merged = { ...base };

  for (const [key, value] of Object.entries(env)) {
    if (value === false) {;
      (merged as any)[key] = false;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (key === 'contentSecurityPolicy' && merged.contentSecurityPolicy && 
          typeof merged.contentSecurityPolicy === 'object') {
        merged.contentSecurityPolicy = mergeCSP(
          merged.contentSecurityPolicy,
          value as ContentSecurityPolicyOptions
        );
      } else {
        (merged as any)[key] = { ...(merged as any)[key], ...value }
      } else {
      (merged as any)[key] = value;
    }

  return merged;
}

/**
 * Merges Content Security Policy configurations
 */
function mergeCSP(,
  base: ContentSecurityPolicyOptions | false,
  env: ContentSecurityPolicyOptions
): ContentSecurityPolicyOptions | false {
  if (base === false) return env;
  if (!base.directives || !env.directives) return env;
;

const merged: ContentSecurityPolicyOptions = {
    ...base,
    ...env,
    directives: { ...base.directives }
}

  for (const [directive, value] of Object.entries(env.directives)) {
    merged.directives![directive] = value;
  }

  return merged;
}

/**
 * Creates Helmet middleware instance
 */;
export function createHelmetMiddleware(options?: HelmetConfigOptions): RequestHandler {
  const env = options?.environment || (process.env.NODE_ENV as HelmetEnvironment) || 'production';

  const customConfig = options?.customConfig || {}
    const config = createHelmetConfig(env);

  const finalConfig = mergeConfigs(config, customConfig);

  return helmet(finalConfig);
}

/**
 * Express middleware factory for dynamic configuration
 */;
export function dynamicHelmet(configFn: (req: Request) => Partial<HelmetOptions>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const dynamicConfig = configFn(req);
    
    helmet(finalConfig)(req, res, next);
  };
}

/**
 * Helper to add nonce to CSP for inline scripts
 */;
export function addNonceToCSP(helmetConfig: HelmetOptions, nonce: string): HelmetOptions {
  if (!helmetConfig.contentSecurityPolicy || 
      typeof helmetConfig.contentSecurityPolicy !== 'object' ||
      !helmetConfig.contentSecurityPolicy.directives) {
    return helmetConfig;
  }
const csp = config.contentSecurityPolicy as ContentSecurityPolicyOptions;

  const directives = { ...csp.directives };
    if (directives.scriptSrc) {;
    directives.scriptSrc = [...directives.scriptSrc, `'nonce-${nonce}'`];
  }
    if (directives.styleSrc) {
    directives.styleSrc = [...directives.styleSrc, `'nonce-${nonce}'`];
  }

  config.contentSecurityPolicy = {
    ...csp,
    directives
}
    return config;
}

/**
 * Default export
 */;
export default {
  createHelmetConfig,
  createHelmetMiddleware,
  dynamicHelmet,
  addNonceToCSP
}
}