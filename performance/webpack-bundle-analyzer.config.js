const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');
const fs = require('fs');

// Webpack Bundle Analyzer Configuration for BOOM Card Platform
module.exports = {
  // Enable bundle analyzer plugin
  plugins: [
    new BundleAnalyzerPlugin({
      // Mode of operation
      // 'server' - Starts interactive server
      // 'static' - Generates HTML file
      // 'json' - Generates JSON file
      // 'disabled' - Disables analyzer
      analyzerMode: process.env.ANALYZE_MODE || 'static',
      
      // Host for analyzer server
      analyzerHost: process.env.ANALYZER_HOST || '127.0.0.1',
      
      // Port for analyzer server
      analyzerPort: process.env.ANALYZER_PORT || 8888,
      
      // Path to generated report file
      reportFilename: path.join(
        process.cwd(),
        'performance',
        'reports',
        `bundle-report-${new Date().toISOString().split('T')[0]}.html`
      ),
      
      // Module sizes to show
      // 'stat' - Input file sizes before transformations
      // 'parsed' - Output file sizes of processed files
      // 'gzip' - Gzip compressed sizes
      defaultSizes: 'gzip',
      
      // Automatically open report in browser
      openAnalyzer: process.env.NODE_ENV !== 'production',
      
      // Generate report file
      generateStatsFile: true,
      
      // Stats file location
      statsFilename: path.join(
        process.cwd(),
        'performance',
        'stats',
        `bundle-stats-${new Date().toISOString().split('T')[0]}.json`
      ),
      
      // Options for stats.toJson()
      statsOptions: {
        source: false,
        reasons: false,
        chunks: true,
        chunkGroups: true,
        chunkModules: true,
        chunkOrigins: true,
        modules: true,
        moduleTrace: true,
        publicPath: true,
        usedExports: true,
        providedExports: true,
        optimizationBailout: true,
        errorDetails: true,
        timings: true,
        performance: true,
        assets: true,
        assetsSort: 'size',
        version: true,
        hash: true,
        builtAt: true,
        entrypoints: true
      },
      
      // Exclude patterns for bundle analysis
      excludeAssets: [
        // Exclude source maps
        /\.map$/,
        // Exclude license files
        /LICENSE/,
        // Exclude test files
        /\.test\.(js|ts|tsx)$/,
        // Exclude storybook files
        /\.stories\.(js|ts|tsx)$/
      ],
      
      // Log level
      // 'info' - All messages
      // 'warn' - Warnings and errors
      // 'error' - Only errors
      // 'silent' - No output
      logLevel: process.env.ANALYZER_LOG_LEVEL || 'info'
    })
  ],
  
  // Custom webpack configuration for optimization
  optimization: {
    // Split vendor chunks
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // React and related libraries
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
          name: 'react-vendor',
          priority: 20,
          enforce: true
        },
        
        // UI libraries (Material-UI, Ant Design, etc.)
        ui: {
          test: /[\\/]node_modules[\\/](@mui|@ant-design|@headlessui)[\\/]/,
          name: 'ui-vendor',
          priority: 19,
          enforce: true
        },
        
        // State management and utilities
        utils: {
          test: /[\\/]node_modules[\\/](redux|@reduxjs|zustand|lodash|axios|date-fns)[\\/]/,
          name: 'utils-vendor',
          priority: 18,
          enforce: true
        },
        
        // i18n libraries
        i18n: {
          test: /[\\/]node_modules[\\/](i18next|react-i18next|i18next-browser-languagedetector)[\\/]/,
          name: 'i18n-vendor',
          priority: 17,
          enforce: true
        },
        
        // Map and location libraries
        maps: {
          test: /[\\/]node_modules[\\/](leaflet|react-leaflet|mapbox-gl)[\\/]/,
          name: 'maps-vendor',
          priority: 16,
          enforce: true
        },
        
        // Payment processing libraries
        payments: {
          test: /[\\/]node_modules[\\/](@stripe|stripe)[\\/]/,
          name: 'payments-vendor',
          priority: 15,
          enforce: true
        },
        
        // QR code libraries
        qr: {
          test: /[\\/]node_modules[\\/](qrcode|react-qr-code|qr-scanner)[\\/]/,
          name: 'qr-vendor',
          priority: 14,
          enforce: true
        },
        
        // Analytics libraries
        analytics: {
          test: /[\\/]node_modules[\\/](react-ga|@sentry|mixpanel)[\\/]/,
          name: 'analytics-vendor',
          priority: 13,
          enforce: true
        },
        
        // Default vendor chunk
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10,
          enforce: true
        },
        
        // Common shared modules
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          name: 'common'
        }
    },
    
    // Use deterministic module ids for long term caching
    moduleIds: 'deterministic',
    
    // Runtime chunk optimization
    runtimeChunk: {
      name: 'runtime'
    },
    
    // Enable aggressive minification
    minimize: process.env.NODE_ENV === 'production',
    
    // Side effects optimization
    sideEffects: false,
    
    // Used exports optimization
    usedExports: true,
    
    // Inner graph optimization
    innerGraph: true,
    
    // Module concatenation
    concatenateModules: true
  },
  
  // Performance hints configuration
  performance: {
    // Warning threshold for asset size
    maxAssetSize: 512000, // 500 KB
    
    // Warning threshold for entrypoint size
    maxEntrypointSize: 1024000, // 1 MB
    
    // Show warnings
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    
    // Filter assets for performance hints
    assetFilter: function(assetFilename) {
      // Only check JS and CSS files
      return /\.(js|css)$/.test(assetFilename) && !/\.map$/.test(assetFilename);
    }
};

// Helper function to create report directories
function ensureReportDirectories() {
  const dirs = [
    path.join(process.cwd(), 'performance'),
    path.join(process.cwd(), 'performance', 'reports'),
    path.join(process.cwd(), 'performance', 'stats')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    });
}

// Create directories on module load
ensureReportDirectories();

// Export additional utilities
module.exports.utils = {
  // Clean old reports
  cleanOldReports: function(daysToKeep = 7) {
    const reportsDir = path.join(process.cwd(), 'performance', 'reports');
    const statsDir = path.join(process.cwd(), 'performance', 'stats');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    [reportsDir, statsDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
          });
      });
  },
  
  // Generate comparison report
  compareReports: function(oldStatsFile, newStatsFile) {
    const oldStats = JSON.parse(fs.readFileSync(oldStatsFile, 'utf8'));
    const newStats = JSON.parse(fs.readFileSync(newStatsFile, 'utf8'));
    
    const comparison = {
      date: new Date().toISOString(),
      oldBuild: {
        hash: oldStats.hash,
        time: oldStats.builtAt,
        size: oldStats.assets.reduce((sum, asset) => sum + asset.size, 0)
      },
      newBuild: {
        hash: newStats.hash,
        time: newStats.builtAt,
        size: newStats.assets.reduce((sum, asset) => sum + asset.size, 0)
      },
      sizeDiff: 0,
      percentChange: 0,
      assetChanges: []
    };
    
    comparison.sizeDiff = comparison.newBuild.size - comparison.oldBuild.size;
    comparison.percentChange = ((comparison.sizeDiff / comparison.oldBuild.size) * 100).toFixed(2);
    
    // Compare individual assets
    const oldAssetMap = new Map(oldStats.assets.map(a => [a.name, a]));
    const newAssetMap = new Map(newStats.assets.map(a => [a.name, a]));
    
    newAssetMap.forEach((newAsset, name) => {
      const oldAsset = oldAssetMap.get(name);
      
      if (oldAsset) {
        const diff = newAsset.size - oldAsset.size;
        if (Math.abs(diff) > 1000) { // Only report changes > 1KB
          comparison.assetChanges.push({
            name,
            oldSize: oldAsset.size,
            newSize: newAsset.size,
            diff,
            percentChange: ((diff / oldAsset.size) * 100).toFixed(2)
          });
        } else {
        comparison.assetChanges.push({
          name,
          oldSize: 0,
          newSize: newAsset.size,
          diff: newAsset.size,
          percentChange: 'NEW'
        });
      });
    
    // Check for removed assets
    oldAssetMap.forEach((oldAsset, name) => {
      if (!newAssetMap.has(name)) {
        comparison.assetChanges.push({
          name,
          oldSize: oldAsset.size,
          newSize: 0,
          diff: -oldAsset.size,
          percentChange: 'REMOVED'
        });
      });
    
    // Sort by absolute size difference
    comparison.assetChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    
    return comparison;
  },
  
  // Get bundle size limits
  getBundleLimits: function() {
    return {
      // Main bundles
      'main': 300000, // 300KB
      'runtime': 10000, // 10KB
      
      // Vendor bundles
      'react-vendor': 150000, // 150KB
      'ui-vendor': 250000, // 250KB
      'utils-vendor': 100000, // 100KB
      'i18n-vendor': 50000, // 50KB
      'maps-vendor': 200000, // 200KB
      'payments-vendor': 100000, // 100KB
      'qr-vendor': 50000, // 50KB
      'analytics-vendor': 50000, // 50KB
      'vendor': 500000, // 500KB
      'common': 100000, // 100KB
      
      // Page-specific bundles
      'pages/home': 50000, // 50KB
      'pages/search': 75000, // 75KB
      'pages/partner': 100000, // 100KB
      'pages/profile': 75000, // 75KB
      'pages/admin': 150000, // 150KB
      
      // Total bundle size
      'total': 2000000 // 2MB
    };
  };

}
}
}
}
}
}
}
}
}
