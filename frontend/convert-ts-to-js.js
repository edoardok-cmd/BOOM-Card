const fs = require('fs');
const path = require('path');

function convertTsToJs(filePath) {
  console.log(`Converting ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove TypeScript type annotations
  content = content.replace(/:\s*any\b/g, '');
  content = content.replace(/:\s*string\b/g, '');
  content = content.replace(/:\s*number\b/g, '');
  content = content.replace(/:\s*boolean\b/g, '');
  content = content.replace(/:\s*void\b/g, '');
  content = content.replace(/:\s*undefined\b/g, '');
  content = content.replace(/:\s*null\b/g, '');
  content = content.replace(/:\s*never\b/g, '');
  content = content.replace(/:\s*unknown\b/g, '');
  content = content.replace(/:\s*object\b/g, '');
  content = content.replace(/:\s*Function\b/g, '');
  content = content.replace(/:\s*\([^)]*\)\s*=>\s*[^,;\n]*/g, '');
  
  // Remove interface declarations
  content = content.replace(/interface\s+\w+\s*{[^}]*}/g, '');
  
  // Remove type declarations
  content = content.replace(/type\s+\w+\s*=\s*[^;\n]+;/g, '');
  
  // Remove angle brackets (generics)
  content = content.replace(/<[^>]+>/g, '');
  
  // Remove 'as' type assertions
  content = content.replace(/\s+as\s+\w+/g, '');
  
  // Remove export/import type
  content = content.replace(/export\s+type\s+/g, '');
  content = content.replace(/import\s+type\s+/g, 'import ');
  
  // Clean up any remaining TypeScript-specific syntax
  content = content.replace(/\{\s*\[key:\s*string\]\s*:\s*\w+\s*\}/g, '{}');
  
  // Save the converted file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Converted ${filePath}`);
}

// Convert the three problematic files
const files = [
  './src/pages/faq.js',
  './src/pages/how-it-works.js',
  './src/pages/partners.js'
];

files.forEach(file => {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    convertTsToJs(fullPath);
  } else {
    console.error(`File not found: ${fullPath}`);
  }
});

console.log('Conversion complete!');