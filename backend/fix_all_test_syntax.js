const fs = require('fs');
const path = require('path');

function fixTestFileSyntax(filePath) {
  console.log(`Fixing ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changesMade = false;
  
  // Fix missing const response declarations
  content = content.replace(/(\s+)\.post\((['"`]\/[^'"`]+['"`])\)\s*\n/g, '$1const response = await request(app)\n$1  .post($2)\n');
  content = content.replace(/(\s+)\.get\((['"`]\/[^'"`]+['"`])\)\s*\n/g, '$1const response = await request(app)\n$1  .get($2)\n');
  content = content.replace(/(\s+)\.put\((['"`]\/[^'"`]+['"`])\)\s*\n/g, '$1const response = await request(app)\n$1  .put($2)\n');
  content = content.replace(/(\s+)\.delete\((['"`]\/[^'"`]+['"`])\)\s*\n/g, '$1const response = await request(app)\n$1  .delete($2)\n');
  
  // Fix duplicate const response declarations
  content = content.replace(/const response = await request\(app\)\s*const response = await request\(app\)/g, 
    'const response = await request(app)');
  
  // Fix missing closing parentheses and semicolons
  content = content.replace(/\.expect\((\d+)\)\s*expect\(/g, '.expect($1);\n      expect(');
  
  // Fix object property syntax
  content = content.replace(/(\w+):\s*([^,;{}]+),\s*$/gm, '$1: $2,');
  
  // Fix interface property semicolons
  content = content.replace(/^(\s*interface\s+\w+\s*\{[^}]*?)(\n\s*)(\w+\s*:\s*[^,;]+),(\s*\/\/.*)?$/gm, '$1$2$3;$4');
  
  // Fix missing semicolons after statements
  content = content.replace(/^(\s*await\s+[^;]+)$/gm, '$1;');
  content = content.replace(/^(\s*const\s+\w+\s*=\s*[^{][^;]+)$/gm, '$1;');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed ${path.basename(filePath)}`);
}

// Find test files
function findTestFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.includes('node_modules') && !item.startsWith('.')) {
          walk(fullPath);
        } else if (stat.isFile() && (item.endsWith('.test.ts') || item.endsWith('.spec.ts'))) {
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
const srcPath = path.join(__dirname, 'src/__tests__');
console.log('Fixing test file syntax issues...\n');

const testFiles = findTestFiles(srcPath);
console.log(`Found ${testFiles.length} test files\n`);

// Focus on integration test files first
const integrationTests = testFiles.filter(f => f.includes('integration'));
integrationTests.forEach(file => {
  try {
    fixTestFileSyntax(file);
  } catch (error) {
    console.error(`Error fixing ${path.basename(file)}: ${error.message}`);
  }
});

console.log('\nTest syntax fixes complete!');