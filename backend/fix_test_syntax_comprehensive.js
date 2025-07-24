const fs = require('fs');
const path = require('path');

function fixIntegrationTestSyntax(filePath) {
  console.log(`Fixing ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix common patterns in integration tests
  
  // Fix missing const response declarations - more comprehensive
  content = content.replace(/(\s+)\.post\((['\"`]\/[^'\"`]+['\"`])\)\s*\n/g, '$1const response = await request(app)\n$1  .post($2)\n');
  content = content.replace(/(\s+)\.get\((['\"`]\/[^'\"`]+['\"`])\)\s*\n/g, '$1const response = await request(app)\n$1  .get($2)\n');
  content = content.replace(/(\s+)\.put\((['\"`]\/[^'\"`]+['\"`])\)\s*\n/g, '$1const response = await request(app)\n$1  .put($2)\n');
  content = content.replace(/(\s+)\.delete\((['\"`]\/[^'\"`]+['\"`])\)\s*\n/g, '$1const response = await request(app)\n$1  .delete($2)\n');
  
  // Fix duplicate const response declarations
  content = content.replace(/const response = await request\(app\)\s*const response = await request\(app\)/g, 
    'const response = await request(app)');
  
  // Fix interface properties - change commas to semicolons
  content = content.replace(/^(\s*)([\w\s]+):\s*([^,\n}]+),(\s*\/\/.*)?$/gm, '$1$2: $3;$4');
  
  // Fix object properties ending with semicolons instead of commas
  content = content.replace(/^(\s*)([\w\s]+):\s*([^,\n}]+);(\s*)$/gm, '$1$2: $3,$4');
  
  // Fix trailing semicolons on object/array closing braces
  content = content.replace(/^(\s*)};\s*$/gm, '$1}');
  content = content.replace(/^(\s*)];$/gm, '$1]');
  
  // Fix orphaned semicolons
  content = content.replace(/^(\s*);$/gm, '');
  
  // Fix missing closing parentheses for method chains
  content = content.replace(/\.expect\((\d+)\)\s*;/g, '.expect($1);');
  
  // Fix chained method calls with missing proper formatting
  content = content.replace(/(\s+)\.post\(([^)]+)\)\s*\.send\(([^)]+)\)\s*\.expect\(([^)]+)\)\s*$/gm, 
    '$1.post($2)\n$1  .send($3)\n$1  .expect($4);');
  
  // Fix broken request chains
  content = content.replace(/const response = await request\(app\)\s*\n\s*\.(\w+)\(/g, 
    'const response = await request(app)\n        .$1(');
  
  // Fix orphaned method calls
  content = content.replace(/^\s*\.(get|post|put|delete|send|expect|set)\(/gm, '        .$1(');
  
  // Fix missing closing parentheses on method calls
  content = content.replace(/\.expect\((\d+)\)\s*expect\(/g, '.expect($1);\n      expect(');
  
  // Clean up multiple newlines
  content = content.replace(/\n\n\n+/g, '\n\n');
  
  // Fix incomplete test structures
  content = content.replace(/it\('([^']+)',\s*async\s*\(\)\s*=>\s*{\s*}\)/g, 
    'it(\'$1\', async () => {\n      // TODO: Implement test\n    })');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed ${path.basename(filePath)}`);
}

// Main execution
const testFiles = [
  '/Users/administrator/ai-automation-platform/user_projects/25b7e956-816a-410c-b1b5-3c798a9d586c/BOOM Card_20250722_085243/backend/src/__tests__/integration/auth.integration.test.ts',
  '/Users/administrator/ai-automation-platform/user_projects/25b7e956-816a-410c-b1b5-3c798a9d586c/BOOM Card_20250722_085243/backend/src/__tests__/integration/payment.integration.test.ts'
];

console.log('Fixing integration test syntax issues...\n');

testFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fixIntegrationTestSyntax(file);
    }
  } catch (error) {
    console.error(`Error fixing ${path.basename(file)}: ${error.message}`);
  }
});

console.log('\nIntegration test syntax fixes complete!');