const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix common TypeScript syntax errors
function fixTypeScriptErrors(content, filePath) {
  let fixed = content;
  
  // Fix missing import statement start
  fixed = fixed.replace(/\n\s*RegisterDto,/g, '\nimport {\n  RegisterDto,');
  
  // Fix semicolons after interface/type declarations
  fixed = fixed.replace(/}\s*;\s*$/gm, '}');
  fixed = fixed.replace(/}\s*;\s*\n/g, '}\n');
  
  // Fix semicolons in object literals
  fixed = fixed.replace(/,\s*;/g, ',');
  
  // Fix function declarations with colon instead of equals
  fixed = fixed.replace(/:\s*async\s*\(/g, ' = async (');
  fixed = fixed.replace(/export\s+const\s+(\w+):\s*async/g, 'export const $1 = async');
  fixed = fixed.replace(/static\s+(\w+):\s*async/g, 'static $1 = async');
  
  // Fix arrow function declarations
  fixed = fixed.replace(/=>\s*{;/g, '=> {');
  fixed = fixed.replace(/const\s+(\w+):\s*async/g, 'const $1 = async');
  
  // Fix duplicate semicolons
  fixed = fixed.replace(/;;\s*/g, ';');
  
  // Fix semicolons after variable declarations before const
  fixed = fixed.replace(/;\s*\n(\s*)const/g, ';\n\n$1const');
  fixed = fixed.replace(/}\s*;\s*\n(\s*)const/g, '}\n\n$1const');
  
  // Fix missing commas in interfaces
  fixed = fixed.replace(/(\w+)\s*:\s*(['"].*?['"]|true|false|null|\d+|\w+)\s*\n\s*(\w+)\s*:/g, '$1: $2,\n  $3:');
  
  // Fix trailing semicolons in interfaces
  fixed = fixed.replace(/interface\s+\w+\s*{([^}]+)}/g, (match, body) => {
    const fixedBody = body.replace(/;\s*$/gm, '').replace(/,\s*;/g, ';');
    return match.replace(body, fixedBody);
  });
  
  // Fix missing closing braces in specific patterns
  fixed = fixed.replace(/}\s*}\s*}\s*$/g, '}\n}\n}');
  
  // Fix extra closing braces
  if (filePath.includes('controller')) {
    const openBraces = (fixed.match(/{/g) || []).length;
    const closeBraces = (fixed.match(/}/g) || []).length;
    
    if (closeBraces > openBraces) {
      // Remove extra closing braces from the end
      const diff = closeBraces - openBraces;
      for (let i = 0; i < diff; i++) {
        fixed = fixed.replace(/}\s*$/, '');
      }
    }
  }
  
  // Fix duplicate const declarations
  fixed = fixed.replace(/(const\s+delay\s*=.*?\n)(\s*const\s+delay\s*=.*?\n)+/g, '$1');
  
  // Fix missing semicolons after statements
  fixed = fixed.replace(/(\w+)\s*\n(\s*const\s+)/g, '$1;\n$2');
  fixed = fixed.replace(/(\))\s*\n(\s*const\s+)/g, '$1;\n$2');
  
  // Fix incorrect semicolons in JSON response formatting
  fixed = fixed.replace(/res\.status\(\d+\)\.json\(\{\s*\n\s*(\w+):/g, (match) => {
    return match.replace(/\{\s*\n\s*/, '{\n      ');
  });
  
  // Fix specific database.cloud.ts issues
  if (filePath.includes('database.cloud.ts')) {
    // Remove duplicate const delay declarations
    fixed = fixed.replace(/const delay = Math\.min\(times \* 50, 2000\);\s*\n\s*const delay = Math\.min\(times \* 50, 2000\);/g, 
      'const delay = Math.min(times * 50, 2000);');
    
    // Fix duplicate autoConfig declarations
    fixed = fixed.replace(/const autoConfig = autoConfigureDatabase\(url\);\s*\n\s*const autoConfig = autoConfigureRedis\(url\);/g,
      'const autoConfig = autoConfigureDatabase(url);');
  }
  
  // Fix specific auth.controller.ts issues
  if (filePath.includes('auth.controller.ts')) {
    // Fix missing import statement
    fixed = fixed.replace(/\/\/ 1\. All import statements\s*\n\s*\n\s*RegisterDto,/, 
      '// 1. All import statements\nimport {\n  RegisterDto,');
    
    // Fix extra closing braces
    fixed = fixed.replace(/}\s*\n\s*}\s*\n\s*}\s*\n\s*}\s*$/g, '}\n}');
    
    // Fix incorrect semicolons after interface properties
    fixed = fixed.replace(/,\s*}\s*$/gm, '\n  }');
  }
  
  // Fix POS controller specific issues
  if (filePath.includes('pos.controller.ts')) {
    // Fix missing closing braces for validation
    fixed = fixed.replace(/return res\.status\(400\)\.json\({ success: false, message: 'Validation Error: Transaction must include at least one item\.' }\);\s*\n\s*},/g,
      'return res.status(400).json({ success: false, message: \'Validation Error: Transaction must include at least one item.\' });\n    }');
    
    // Fix incomplete if statements
    fixed = fixed.replace(/}\s*\n\s*if \(!payment/g, '}\n    }\n    if (!payment');
    
    // Fix service object syntax
    fixed = fixed.replace(/processPayment\s*=\s*async/g, 'processPayment: async');
    fixed = fixed.replace(/refundPayment\s*=\s*async/g, 'refundPayment: async');
    fixed = fixed.replace(/voidPayment\s*=\s*async/g, 'voidPayment: async');
    fixed = fixed.replace(/createOrder\s*=\s*async/g, 'createOrder: async');
    
    // Fix missing commas in return statements
    fixed = fixed.replace(/return { success: false, status: 'failed', message: '.*?' },/g, (match) => {
      return match.replace(/},/, '}');
    });
  }
  
  // Fix admin controller specific issues
  if (filePath.includes('admin.controller.ts')) {
    // Fix incorrect syntax in aggregation pipelines
    fixed = fixed.replace(/totalRevenue: { \$sum: '\$totalPrice' }\s*}\s*;/g, 
      'totalRevenue: { $sum: \'$totalPrice\' }\n        }\n      }');
    
    // Fix missing commas and semicolons
    fixed = fixed.replace(/const totalRevenue = .*?;;\s*/g, (match) => {
      return match.replace(/;;/, ';');
    });
    
    // Fix arrow function syntax
    fixed = fixed.replace(/const asyncHandler = \(fn: AsyncFunction\) =>;\s*\(/g,
      'const asyncHandler = (fn: AsyncFunction) =>\n  (');
  }
  
  // Fix category controller specific issues
  if (filePath.includes('category.controller.ts')) {
    // Remove trailing text after closing braces
    fixed = fixed.replace(/}\s*\n\s*\/\/ All controller functions.*$/s, '}');
    
    // Fix validation schema syntax
    fixed = fixed.replace(/const categorySchema = Joi\.object\(\{/, 'const categorySchema = Joi.object({');
    fixed = fixed.replace(/const categoryUpdateSchema = Joi\.object\(\{/, 'const categoryUpdateSchema = Joi.object({');
  }
  
  return fixed;
}

// Get all TypeScript files
const tsFiles = glob.sync('src/**/*.ts', { 
  ignore: ['**/*.backup', '**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'] 
});

console.log(`Found ${tsFiles.length} TypeScript files to check`);

let fixedCount = 0;

tsFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const fixed = fixTypeScriptErrors(content, file);
    
    if (content !== fixed) {
      // Create backup
      fs.writeFileSync(file + '.backup', content);
      
      // Write fixed content
      fs.writeFileSync(file, fixed);
      console.log(`✅ Fixed ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✅ Fixed ${fixedCount} files!`);
console.log('Backup files created with .backup extension');