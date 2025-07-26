const fs = require('fs');
const path = require('path');

// Read the original TypeScript files and convert them properly
const filesToFix = [
  {
    src: '/Users/administrator/ai-automation-platform/user_projects/admin/proj_20250724_140011_4d773584/imported/BOOM_Card_Pre_Phase1/frontend/src/pages/faq.tsx',
    dest: './src/pages/faq.js'
  },
  {
    src: '/Users/administrator/ai-automation-platform/user_projects/admin/proj_20250724_140011_4d773584/imported/BOOM_Card_Pre_Phase1/frontend/src/pages/how-it-works.tsx',
    dest: './src/pages/how-it-works.js'
  },
  {
    src: '/Users/administrator/ai-automation-platform/user_projects/admin/proj_20250724_140011_4d773584/imported/BOOM_Card_Pre_Phase1/frontend/src/pages/partners.tsx',
    dest: './src/pages/partners.js'
  }
];

function convertTypeScriptToJavaScript(content) {
  // Remove interface declarations
  content = content.replace(/interface\s+\w+\s*{[^}]*}/g, '');
  
  // Remove type annotations from function parameters and variables
  content = content.replace(/:\s*string(\[\])?/g, '');
  content = content.replace(/:\s*number(\[\])?/g, '');
  content = content.replace(/:\s*boolean(\[\])?/g, '');
  content = content.replace(/:\s*any(\[\])?/g, '');
  content = content.replace(/:\s*void/g, '');
  content = content.replace(/:\s*undefined/g, '');
  content = content.replace(/:\s*null/g, '');
  content = content.replace(/:\s*Function/g, '');
  
  // Remove generic type parameters
  content = content.replace(/<[^>]+>(\s*\()/g, '$1');
  content = content.replace(/useState<[^>]+>/g, 'useState');
  
  // Remove type assertions
  content = content.replace(/\s+as\s+\w+/g, '');
  
  // Fix categoryMapping and categoryEmoji type declarations
  content = content.replace(/:\s*{\s*\[key:\s*string\]:\s*string\s*}/g, '');
  
  // Remove FAQItem[] type
  content = content.replace(/:\s*FAQItem\[\]/g, '');
  
  // Clean up any remaining TypeScript-specific syntax
  content = content.replace(/export\s+type\s+/g, 'export ');
  content = content.replace(/import\s+type\s+/g, 'import ');
  
  return content;
}

filesToFix.forEach(({ src, dest }) => {
  try {
    console.log(`Converting ${path.basename(src)} to ${dest}...`);
    
    // Read the TypeScript file
    const content = fs.readFileSync(src, 'utf8');
    
    // Convert TypeScript to JavaScript
    const jsContent = convertTypeScriptToJavaScript(content);
    
    // Write the JavaScript file
    fs.writeFileSync(dest, jsContent, 'utf8');
    
    console.log(`✓ Successfully converted ${path.basename(dest)}`);
  } catch (error) {
    console.error(`✗ Error converting ${path.basename(src)}:`, error.message);
  }
});

console.log('\nConversion complete!');