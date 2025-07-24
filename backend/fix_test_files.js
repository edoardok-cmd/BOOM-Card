const fs = require('fs');
const path = require('path');

function fixTestFile(filePath) {
  console.log(`Fixing ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changesMade = false;
  
  // Fix interface semicolons
  const interfaceSemicolonFix = content.replace(
    /^(\s*interface\s+\w+\s*\{[^}]*?)(\n\s*)(\w+\s*:\s*[^,;]+),(\s*\/\/.*)?$/gm,
    '$1$2$3;$4'
  );
  if (interfaceSemicolonFix !== content) {
    content = interfaceSemicolonFix;
    changesMade = true;
  }
  
  // Fix export interface semicolons
  const exportInterfaceFix = content.replace(
    /^(\s*export\s+interface\s+\w+\s*\{[^}]*?)(\n\s*)(\w+\s*:\s*[^,;]+),(\s*\/\/.*)?$/gm,
    '$1$2$3;$4'
  );
  if (exportInterfaceFix !== content) {
    content = exportInterfaceFix;
    changesMade = true;
  }
  
  // Fix metadata property specifically
  const metadataFix = content.replace(
    /metadata\?\s*:\s*Record<string,\s*any>;,/g,
    'metadata?: Record<string, any>;'
  );
  if (metadataFix !== content) {
    content = metadataFix;
    changesMade = true;
  }
  
  // Fix variable declarations in describe blocks
  const variableDeclarationFix = content.replace(
    /(\s*)let\s+(\w+)\s*:\s*([^,;]+),(\s*\/\/.*)?$/gm,
    '$1let $2: $3;$4'
  );
  if (variableDeclarationFix !== content) {
    content = variableDeclarationFix;
    changesMade = true;
  }
  
  // Fix async arrow function syntax in tests
  const asyncArrowFix = content.replace(
    /(\s*)(beforeAll|afterAll|beforeEach|afterEach|it|test|describe)\s*\(\s*async\s*\(\)\s*=>\s*\{/g,
    '$1$2(async () => {'
  );
  if (asyncArrowFix !== content) {
    content = asyncArrowFix;
    changesMade = true;
  }
  
  // Fix const declarations that should be in proper scope
  const constScopeFix = content.replace(
    /^(\s*)(const\s+\w+\s*=\s*[^;]+;)$/gm,
    function(match, indent, declaration) {
      // Check if this is inside a proper scope
      const lines = content.split('\n');
      const currentLineIndex = lines.findIndex(line => line.includes(declaration));
      if (currentLineIndex > 0) {
        const prevLine = lines[currentLineIndex - 1];
        // If previous line ends with {, this is properly scoped
        if (prevLine.trim().endsWith('{')) {
          return match;
        }
      }
      // Otherwise, this might be misplaced
      return indent + '// ' + declaration + ' // TODO: Move to proper scope';
    }
  );
  if (constScopeFix !== content) {
    content = constScopeFix;
    changesMade = true;
  }
  
  if (changesMade) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${path.basename(filePath)}`);
  } else {
    console.log(`  No changes needed for ${path.basename(filePath)}`);
  }
}

function findTestFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.startsWith('.')) {
        walk(fullPath);
      } else if (stat.isFile() && (item.includes('.test.ts') || item.includes('.spec.ts'))) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

// Main execution
const srcPath = path.join(__dirname, 'src');
console.log('Finding test files...\n');

const testFiles = findTestFiles(srcPath);
console.log(`Found ${testFiles.length} test files\n`);

testFiles.forEach(file => {
  try {
    fixTestFile(file);
  } catch (error) {
    console.error(`Error fixing ${path.basename(file)}:`, error.message);
  }
});

console.log('\nTest file fixes complete!');