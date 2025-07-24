const fs = require('fs');
const path = require('path');

function fixTypeScriptSyntax(content) {
  let fixed = content;
  
  // Fix semicolons in interfaces
  fixed = fixed.replace(/^(\s*interface\s+\w+\s*\{[^}]*?)(\n\s*)(\w+\s*:\s*[^,;]+),(\s*\/\/.*)?$/gm, '$1$2$3;$4');
  fixed = fixed.replace(/^(\s*export\s+interface\s+\w+\s*\{[^}]*?)(\n\s*)(\w+\s*:\s*[^,;]+),(\s*\/\/.*)?$/gm, '$1$2$3;$4');
  
  // Fix arrow function syntax
  fixed = fixed.replace(/export\s+const\s+(\w+):\s*async\s*\(/g, 'export const $1 = async (');
  fixed = fixed.replace(/const\s+(\w+):\s*async\s*\(/g, 'const $1 = async (');
  
  // Fix missing semicolons after const declarations
  fixed = fixed.replace(/^(\s*const\s+\w+\s*=\s*[^{]+\{[^}]+\})(\s*)$/gm, '$1;$2');
  
  // Fix return statements
  fixed = fixed.replace(/return\s+\{([^}]+)\}(\s*})(\s*$)/gm, 'return {$1};$2$3');
  
  // Fix duplicate const declarations
  fixed = fixed.replace(/const\s+(\w+)\s*=\s*[^;]+;\s*const\s+\1\s*=/g, 'const $1 =');
  
  // Fix extra closing braces
  fixed = fixed.replace(/\}\s*\}\s*\}\s*$/g, '}\n}');
  
  // Fix missing closing parentheses
  fixed = fixed.replace(/\.expect\((\d+)\);(\s*\.expect)/g, '.expect($1)\n        $2');
  
  // Fix .post() calls
  fixed = fixed.replace(/\.post\(\/api\/auth\/([^']+)'\)/g, ".post('/api/auth/$1')");
  
  // Fix expect object syntax
  fixed = fixed.replace(/expect\(response\.body\)\.toMatchObject\(\{\s*success:\s*(\w+),/g, 'expect(response.body).toMatchObject({\n        success: $1,');
  
  // Fix missing braces
  fixed = fixed.replace(/data:\s*\{\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^,}]+),\s*(\w+):\s*([^}]+)\s*}\);/g, 
    'data: {\n          $1: $2,\n          $3: $4,\n          $5: $6\n        }\n      });');
  
  // Fix error object syntax
  fixed = fixed.replace(/error:\s*\{\s*code:\s*'([^']+)',\s*message:\s*'([^']+)'\s*}\);/g,
    'error: {\n          code: \'$1\',\n          message: \'$2\'\n        }\n      });');
  
  // Remove duplicate response declarations
  fixed = fixed.replace(/const response = await request\(app\)\s*const response = await request\(app\)/g, 
    'const response = await request(app)');
  
  // Fix missing closing braces at end of file
  if (fixed.includes('describe(') && !fixed.trim().endsWith('});')) {
    // Count open and close braces
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    const diff = openBraces - closeBraces;
    
    if (diff > 0) {
      fixed = fixed.trimEnd() + '\n' + '}'.repeat(diff) + ');\n';
    }
  }
  
  return fixed;
}

function fixFile(filePath) {
  console.log(`Processing ${path.basename(filePath)}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;
    
    content = fixTypeScriptSyntax(content);
    
    if (content.length !== originalLength) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed ${path.basename(filePath)}`);
    } else {
      console.log(`  No changes needed for ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${path.basename(filePath)}: ${error.message}`);
  }
}

// Find all TypeScript files
function findTypeScriptFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.includes('node_modules') && !item.startsWith('.')) {
          walk(fullPath);
        } else if (stat.isFile() && item.endsWith('.ts') && !item.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentDir}: ${error.message}`);
    }
  }
  
  walk(dir);
  return files;
}

// Main execution
const srcPath = path.join(__dirname, 'src');
console.log('Finding TypeScript files to fix...\n');

const tsFiles = findTypeScriptFiles(srcPath);
console.log(`Found ${tsFiles.length} TypeScript files\n`);

// Process files in batches to avoid overwhelming the system
const batchSize = 10;
for (let i = 0; i < tsFiles.length; i += batchSize) {
  const batch = tsFiles.slice(i, i + batchSize);
  batch.forEach(fixFile);
}

console.log('\nTypeScript syntax fixes complete!');