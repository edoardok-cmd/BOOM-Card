#!/usr/bin/env node
/**
 * Convert TypeScript files to JavaScript by removing TS syntax
 */

const fs = require('fs');
const path = require('path');

function convertTsToJs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove TypeScript type imports
  content = content.replace(/import\s+type\s+\{[^}]+\}\s+from[^;]+;?\n?/g, '');
  
  // Remove interface definitions  
  content = content.replace(/interface\s+\w+\s*\{[^}]*\}(\s*\n)*/g, '');
  
  // Remove type annotations from function parameters
  content = content.replace(/(\w+):\s*[^,)=\n]+/g, '$1');
  
  // Remove generic type parameters
  content = content.replace(/]+>/g, '');
  
  // Remove return type annotations
  content = content.replace(/\):\s*[^{=\n]+\s*=>/g, ') =>');
  content = content.replace(/\):\s*[^{=\n]+\s*\{/g, ') {');
  
  // Remove variable type annotations
  content = content.replace(/:\s*[^=,;\n)]+(\s*=)/g, '$1');
  
  // Remove ReactNode import
  content = content.replace(/, ReactNode/g, '');
  
  // Clean up extra whitespace
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  fs.writeFileSync(filePath, content);
  console.log(`Converted: ${filePath}`);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      // Process JS files that might have TS remnants
      convertTsToJs(filePath);
    }
  }
}

console.log('🔄 Converting TypeScript syntax to JavaScript...');

// Process source directories
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  processDirectory(srcDir);
}

console.log('✅ Conversion complete!');