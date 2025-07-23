module.exports = {
  ci: {
    collect: {
      // Static server configuration for local testing
      staticDistDir: './out',
      
      // URLs to test - both language versions
      url: [
        'http://localhost:3000',
        'http://localhost:3000/en',
        'http://localhost:3000/bg',
        'http://localhost:3000/en/food-drink',
        'http://localhost:3000/bg/food-drink',
        'http://localhost:3000/en/entertainment',
        'http://localhost:3000/bg/entertainment',
        'http://localhost:3000/en/accommodation',
        'http://localhost:3000/bg/accommodation',
        'http://localhost:3000/en/experiences',
        'http://localhost:3000/bg/experiences',
        'http://localhost:3000/en/partners',
        'http://localhost:3000/bg/partners',
        'http://localhost:3000/en/subscription',
        'http://localhost:3000/bg/subscription',
        'http://localhost:3000/en/about',
        'http://localhost:3000/bg/about',
        'http://localhost:3000/en/contact',
        'http://localhost:3000/bg/contact',
        'http://localhost:3000/en/auth/login',
        'http://localhost:3000/bg/auth/login',
        'http://localhost:3000/en/auth/register',
        'http://localhost:3000/bg/auth/register',
        'http://localhost:3000/en/profile',
        'http://localhost:3000/bg/profile',
        'http://localhost:3000/en/search?q=restaurant',
        'http://localhost:3000/bg/search?q=ресторант'
      ],
      
      // Number of runs per URL
      numberOfRuns: 3,
      
      // Chrome flags for consistent results
      settings: {
        preset: 'desktop',
        chromeFlags: [
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-sandbox',
          '--headless'
        ],
        // Throttling settings
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1
        },
        // Screen emulation
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false
        },
      
      // Puppeteer launch options
      puppeteerLaunchOptions: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage'
        ]
      },
      
      // Script to run before each test
      puppeteerScript: './performance/lighthouse-auth.js'
    },
    
    assert: {
      // Performance budgets and assertions
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-meaningful-paint': ['warn', { maxNumericValue: 2000 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Resource budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 350000 }],
        'resource-summary:image:size': ['error', { maxNumericValue: 500000 }],
        'resource-summary:font:size': ['error', { maxNumericValue: 100000 }],
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 150000 }],
        'resource-summary:third-party:size': ['warn', { maxNumericValue: 200000 }],
        
        // Network metrics
        'network-requests': ['warn', { maxNumericValue: 60 }],
        'network-rtt': ['warn', { maxNumericValue: 100 }],
        'network-server-latency': ['warn', { maxNumericValue: 500 }],
        
        // JavaScript metrics
        'mainthread-work-breakdown': ['warn', { maxNumericValue: 4000 }],
        'bootup-time': ['error', { maxNumericValue: 3500 }],
        'unused-javascript': ['warn', { maxNumericValue: 100000 }],
        
        // Image optimization
        'uses-webp-images': ['warn', { minScore: 0.8 }],
        'uses-optimized-images': ['warn', { minScore: 0.8 }],
        'uses-responsive-images': ['warn', { minScore: 0.8 }],
        
        // Caching
        'uses-long-cache-ttl': ['warn', { minScore: 0.8 }],
        
        // Accessibility specific
        'color-contrast': ['error', { minScore: 1 }],
        'image-alt': ['error', { minScore: 1 }],
        'label': ['error', { minScore: 1 }],
        'tabindex': ['error', { minScore: 1 }],
        
        // SEO specific
        'meta-description': ['error', { minScore: 1 }],
        'link-text': ['error', { minScore: 1 }],
        'is-crawlable': ['error', { minScore: 1 }],
        'hreflang': ['error', { minScore: 1 }],
        
        // Security
        'is-on-https': ['error', { minScore: 1 }],
        'redirects-http': ['error', { minScore: 1 }],
        'uses-http2': ['warn', { minScore: 1 }]
      },
      
      // Budget presets for different page types
      budgets: [
        {
          path: '/*',
          resourceSizes: [
            {
              resourceType: 'script',
              budget: 350
            },
            {
              resourceType: 'image',
              budget: 500
            },
            {
              resourceType: 'font',
              budget: 100
            },
            {
              resourceType: 'stylesheet',
              budget: 150
            },
            {
              resourceType: 'total',
              budget: 1500
            }
          ],
          resourceCounts: [
            {
              resourceType: 'script',
              budget: 10
            },
            {
              resourceType: 'image',
              budget: 30
            },
            {
              resourceType: 'font',
              budget: 5
            },
            {
              resourceType: 'stylesheet',
              budget: 3
            },
            {
              resourceType: 'third-party',
              budget: 10
            }
          ]
        }
      ]
    },
    
    upload: {
      // Configuration for uploading results to Lighthouse CI server
      target: 'temporary-public-storage',
      
      // For production, use your own Lighthouse CI server
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.example.com',
      // token: process.env.LHCI_TOKEN,
      
      // GitHub status checks
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
      githubStatusContextSuffix: '/lighthouse',
      
      // Basic auth for server (if needed)
      basicAuth: {
        username: process.env.LHCI_USERNAME,
        password: process.env.LHCI_PASSWORD
      },
    
    // Server configuration for Lighthouse CI server
    server: {
      port: process.env.LHCI_PORT || 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'postgres',
        sqlConnectionUrl: process.env.DATABASE_URL
      }
  },
  
  // Custom Lighthouse configuration
  lighthouseConfig: {
    extends: 'lighthouse:default',
    settings: {
      // Skip audits that don't apply
      skipAudits: [
        'canonical', // Handled by Next.js
        'maskable-icon', // PWA specific
        'valid-source-maps' // Development only
      ],
      
      // Form factor
      formFactor: 'desktop',
      
      // Locale for testing
      locale: 'en-US',
      
      // Maximum wait time
      maxWaitForLoad: 45000,
      
      // Additional trace categories
      additionalTraceCategories: ['devtools.timeline', 'blink.user_timing'],
      
      // Budget details
      budgets: [
        {
          path: '/*',
         
}}}}
}
}
}
