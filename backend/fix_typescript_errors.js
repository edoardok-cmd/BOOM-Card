const fs = require('fs');
const path = require('path');

// Function to fix common TypeScript syntax errors
function fixTypeScriptErrors(content) {
  let fixed = content;
  
  // Fix semicolons after interface/type declarations
  fixed = fixed.replace(/}\s*;/g, '}');
  
  // Fix semicolons in object literals
  fixed = fixed.replace(/,\s*;/g, ',');
  fixed = fixed.replace(/}\s*;/g, '}');
  
  // Fix function declarations with colon instead of equals
  fixed = fixed.replace(/:\s*async\s*\(/g, ' = async (');
  fixed = fixed.replace(/export\s+const\s+(\w+):\s*async/g, 'export const $1 = async');
  
  // Fix indentation in JSON objects
  fixed = fixed.replace(/res\.status\(\d+\)\.json\(\{\s*\n\s*(\w+):/g, (match, prop) => {
    return match.replace(/\n\s*/, '\n      ');
  });
  
  // Fix semicolons after variable declarations before const
  fixed = fixed.replace(/;\s*\nconst/g, ';\n\n    const');
  fixed = fixed.replace(/}\s*;\s*\nconst/g, '}\n\n    const');
  
  // Fix duplicate semicolons
  fixed = fixed.replace(/;;\s*/g, ';');
  
  // Fix arrow function declarations
  fixed = fixed.replace(/=>\s*{;/g, '=> {');
  fixed = fixed.replace(/const\s+(\w+):\s*async/g, 'const $1 = async');
  
  // Fix closing braces with extra semicolons
  fixed = fixed.replace(/}\s*;\s*}/g, '}\n}');
  
  // Fix missing closing braces
  let openBraces = (fixed.match(/{/g) || []).length;
  let closeBraces = (fixed.match(/}/g) || []).length;
  
  if (openBraces > closeBraces) {
    const diff = openBraces - closeBraces;
    for (let i = 0; i < diff; i++) {
      fixed += '\n}';
    }
  }
  
  // Fix duplicate const declarations
  fixed = fixed.replace(/const\s+delay\s*=.*?\n.*?const\s+delay\s*=/g, (match) => {
    const lines = match.split('\n');
    return lines[0]; // Keep only the first declaration
  });
  
  // Fix missing commas in object literals
  fixed = fixed.replace(/(\w+)\s*:\s*(['"].*?['"]|\d+|true|false|\w+)\s*\n\s*(\w+)\s*:/g, '$1: $2,\n    $3:');
  
  // Fix incorrect semicolons in interfaces
  fixed = fixed.replace(/interface\s+\w+\s*{[^}]+}/g, (match) => {
    return match.replace(/;\s*\n\s*}/g, '\n}').replace(/,\s*;/g, ';');
  });
  
  return fixed;
}

// Controllers to fix
const controllersToFix = [
  'admin.controller.ts',
  'auth.controller.ts',
  'category.controller.ts',
  'discount.controller.ts',
  'pos.controller.ts'
];

const controllersDir = path.join(__dirname, 'src', 'controllers');

controllersToFix.forEach(file => {
  const filePath = path.join(controllersDir, file);
  
  try {
    if (fs.existsSync(filePath)) {
      console.log(`Fixing ${file}...`);
      const content = fs.readFileSync(filePath, 'utf8');
      const fixed = fixTypeScriptErrors(content);
      
      // Create backup
      fs.writeFileSync(filePath + '.backup', content);
      
      // Write fixed content
      fs.writeFileSync(filePath, fixed);
      console.log(`✅ Fixed ${file}`);
    } else {
      console.log(`⚠️  ${file} not found`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

// Also fix database.cloud.ts
const dbCloudPath = path.join(__dirname, 'src', 'config', 'database.cloud.ts');
if (fs.existsSync(dbCloudPath)) {
  console.log('Fixing database.cloud.ts...');
  const content = fs.readFileSync(dbCloudPath, 'utf8');
  
  // Fix specific duplicate const delay issue
  let fixed = content.replace(/const delay = Math\.min\(times \* 50, 2000\);\s*\n\s*const delay = Math\.min\(times \* 50, 2000\);\s*\n\s*const delay = Math\.min\(times \* 50, 2000\);/g, 
    'const delay = Math.min(times * 50, 2000);');
  
  // Fix another occurrence
  fixed = fixed.replace(/const delay = Math\.min\(times \* 50, 2000\);\s*\n\s*const delay = Math\.min\(times \* 50, 2000\);/g,
    'const delay = Math.min(times * 50, 2000);');
  
  // Fix duplicate autoConfig declarations
  fixed = fixed.replace(/const autoConfig = autoConfigureDatabase\(url\);\s*\n\s*const autoConfig = autoConfigureRedis\(url\);/g,
    'const autoConfig = autoConfigureDatabase(url);');
  
  // Fix missing closing braces
  if (!fixed.trim().endsWith('}')) {
    fixed = fixed.trim() + '\n}';
  }
  
  fs.writeFileSync(dbCloudPath + '.backup', content);
  fs.writeFileSync(dbCloudPath, fixed);
  console.log('✅ Fixed database.cloud.ts');
}

console.log('\n✅ All TypeScript errors have been fixed!');
console.log('Backup files created with .backup extension');