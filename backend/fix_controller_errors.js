const fs = require('fs');
const path = require('path');

// Specific fixes for controller files
const controllerFixes = {
  'pos.controller.ts': [
    // Fix semicolons in interfaces
    { from: /^(\s*interface\s+\w+\s*\{[^}]*?)(\n\s*)(\w+\s*:\s*[^,;]+),(\s*\/\/.*)?$/gm, to: '$1$2$3;$4' },
    { from: /^(\s*interface\s+\w+\s*\{[^}]*?)(\n\s*)(\w+\s*:\s*[^,;]+),(\s*)$/gm, to: '$1$2$3;$4' },
    // Fix export interface semicolons
    { from: /^(\s*export\s+interface\s+\w+\s*\{[^}]*?)(\n\s*)(\w+\s*:\s*[^,;]+),(\s*\/\/.*)?$/gm, to: '$1$2$3;$4' },
    // Fix arrow function syntax
    { from: /export const (\w+): async \(/g, to: 'export const $1 = async (' },
    // Fix missing closing braces in interfaces
    { from: /^(\s*interface\s+\w+\s*\{[^}]+)(\n\s*\}\s*;)/gm, to: '$1\n}' },
    // Fix duplicate imports
    { from: /import { ApiError } from '\.\.\/utils\/apiError';\s*import { ApiError } from '\.\.\/utils\/ApiError';/g, to: "import { ApiError } from '../utils/ApiError';" },
    // Fix invalid JSON in responses
    { from: /res\.status\(\d+\)\.json\(\{\s*success: true;/g, to: 'res.status($1).json({\n      success: true,' },
    // Fix const declarations
    { from: /const (\w+) = \{\s*(\w+):\s*([^,}]+),/g, to: 'const $1 = {\n  $2: $3,' },
    // Fix misplaced semicolons after properties
    { from: /(\w+):\s*([^,;]+);\s*$/gm, to: '$1: $2,' },
    // Fix service object syntax
    { from: /const (\w+) = \{\s*(\w+):\s*async\s*\([^)]*\)\s*:\s*Promise<[^>]+>\s*=>\s*\{,/g, to: 'const $1 = {\n  $2: async ($3): Promise<$4> => {' },
    // Fix catch blocks
    { from: /\} catch \(error\) \{\s*}\s*}/g, to: '} catch (error) {\n        next(error);\n    }' },
    // Fix missing closing braces
    { from: /^(\s*)\}\s*\)\s*;?\s*$/gm, to: '$1}' }
  ],
  'database.cloud.ts': [
    // Fix semicolons in interfaces
    { from: /^(\s*interface\s+\w+\s*\{[^}]*?)(\n\s*)(\w+\s*:\s*[^,;]+),(\s*\/\/.*)?$/gm, to: '$1$2$3;$4' },
    // Fix object syntax
    { from: /export default \{\s*(\w+),\s*(\w+),\s*(\w+),\s*(\w+),\s*(\w+)\s*\}/g, to: 'export default {\n  $1,\n  $2,\n  $3,\n  $4,\n  $5\n}' },
    // Fix extra closing braces
    { from: /\}\s*\}\s*\}\s*$/g, to: '}\n}' },
    // Fix missing semicolons after const declarations
    { from: /^(\s*const\s+\w+\s*=\s*\{[^}]+\})(\s*)$/gm, to: '$1;$2' },
    // Fix return statements
    { from: /return\s*\{([^}]+)\}(\s*\n\s*\})/g, to: 'return {$1};$2' }
  ],
  'category.controller.ts': [
    // Fix semicolons in interfaces
    { from: /^(\s*interface\s+\w+\s*\{[^}]*?)(\n\s*)(\w+\s*:\s*[^,;]+),(\s*\/\/.*)?$/gm, to: '$1$2$3;$4' },
    { from: /^(\s*export\s+interface\s+\w+\s*\{[^}]*?)(\n\s*)(\w+\s*:\s*[^,;]+),(\s*\/\/.*)?$/gm, to: '$1$2$3;$4' },
    // Fix duplicate imports
    { from: /import\s+\{\s*ApiError\s*\}\s+from\s+'[^']+';[\s\n]*import\s+ApiError\s+from\s+'[^']+';/g, to: "import { ApiError } from '../utils/ApiError';" },
    { from: /import\s+HttpStatus\s+from\s+'http-status';[\s\n]*import\s+httpStatus\s+from\s+'http-status';/g, to: "import HttpStatus from 'http-status';" },
    // Fix missing closing parentheses
    { from: /\(req as any\)\.user = \{ id: 'user123', role: 'admin' \}/g, to: "(req as any).user = { id: 'user123', role: 'admin' };" },
    // Fix const declarations
    { from: /const\s+(\w+)\s*=\s*\{([^}]+)\}\s*$/gm, to: 'const $1 = {$2};' }
  ],
  'auth.controller.ts': [
    // Fix semicolons in interfaces
    { from: /^(\s*interface\s+\w+\s*\{[^}]*?)(\n\s*)(\w+\s*:\s*[^,;]+),(\s*\/\/.*)?$/gm, to: '$1$2$3;$4' },
    // Fix missing closing braces
    { from: /\} catch \(error\) \{\s*}\s*}\s*}/g, to: '} catch (error) {\n            next(error);\n        }\n    }' },
    // Fix duplicate closing braces
    { from: /\}\s*\}\s*\}\s*\}\s*$/gm, to: '    }\n}' },
    // Fix res.clearCookie syntax
    { from: /res\.clearCookie\('refreshToken', \{ httpOnly: true, secure: process\.env\.NODE_ENV === 'production', sameSite: 'strict' \}\),/g, to: "res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });" },
    // Fix return statements
    { from: /return\s+\{([^}]+)\}(\s*\n\s*\})/g, to: 'return {$1};$2' }
  ],
  'admin.controller.ts': [
    // Fix semicolons in interfaces
    { from: /^(\s*interface\s+\w+\s*\{[^}]*?)(\n\s*)(\w+\s*:\s*[^,;]+),(\s*\/\/.*)?$/gm, to: '$1$2$3;$4' },
    // Fix chained method calls
    { from: /const order = await Order\.findById\(orderId\);\s*\.populate/g, to: 'const order = await Order.findById(orderId)\n      .populate' },
    { from: /\.populate\('user', 'name email'\);\s*\.populate/g, to: ".populate('user', 'name email')\n      .populate" },
    { from: /\.sort\(\{ createdAt: -1 \}\);\s*\.limit/g, to: '.sort({ createdAt: -1 })\n      .limit' },
    { from: /\.limit\(5\);\s*\.populate/g, to: ".limit(5)\n      .populate" },
    // Fix return statements
    { from: /return\s+\{([^}]+)\}(\s*})(\s*$)/gm, to: 'return {$1};$2$3' },
    // Fix missing semicolons
    { from: /^(\s*const\s+\w+\s*=\s*await\s+[^;]+)$/gm, to: '$1;' },
    // Fix extra closing brace
    { from: /\}\s*export\s*\{\s*AdminController\s*\}\s*$/g, to: '}\n\nexport { AdminController };' }
  ]
};

function fixControllerFile(filePath) {
  console.log(`Fixing ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  // Apply specific fixes for this file
  if (controllerFixes[fileName]) {
    controllerFixes[fileName].forEach(fix => {
      const before = content.length;
      content = content.replace(fix.from, fix.to);
      const after = content.length;
      if (before !== after) {
        console.log(`  Applied fix: ${fix.from.toString().substring(0, 50)}...`);
      }
    });
  }
  
  // Apply general fixes to all files
  const generalFixes = [
    // Fix interface property semicolons (more comprehensive)
    { from: /(\w+)\s*:\s*([^,;{}]+),(\s*)(\/\/[^\n]*)?(\s*\n\s*})/g, to: '$1: $2;$3$4$5' },
    // Fix const declarations missing semicolons
    { from: /^(\s*const\s+\w+\s*=\s*[^{]+\{[^}]+\})(\s*)$/gm, to: '$1;$2' },
    // Fix export statements
    { from: /^(\s*export\s+\{\s*[^}]+\})(\s*)$/gm, to: '$1;$2' },
    // Fix import statements
    { from: /^(\s*import\s+[^;]+)(\s*)$/gm, to: '$1;$2' },
    // Remove trailing commas before closing braces
    { from: /,(\s*\n\s*\})/g, to: '$1' },
    // Fix empty catch blocks
    { from: /catch\s*\(\s*error\s*\)\s*\{\s*\}/g, to: 'catch (error) {\n        // Error handling\n    }' }
  ];
  
  generalFixes.forEach(fix => {
    content = content.replace(fix.from, fix.to);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed ${fileName}`);
}

// Fix controller files
const controllersPath = path.join(__dirname, 'src', 'controllers');
const configPath = path.join(__dirname, 'src', 'config');

const filesToFix = [
  path.join(controllersPath, 'pos.controller.ts'),
  path.join(controllersPath, 'category.controller.ts'),
  path.join(controllersPath, 'auth.controller.ts'),
  path.join(controllersPath, 'admin.controller.ts'),
  path.join(configPath, 'database.cloud.ts')
];

console.log('Starting controller-specific fixes...\n');

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fixControllerFile(file);
    } catch (error) {
      console.error(`Error fixing ${path.basename(file)}:`, error.message);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('\nController fixes complete!');