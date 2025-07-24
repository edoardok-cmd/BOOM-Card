const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/__tests__/integration/auth.integration.test.ts');
console.log('Final fix for auth.integration.test.ts...');

let content = fs.readFileSync(filePath, 'utf8');

// Remove duplicate response declarations
content = content.replace(/const response = await request\(app\)\s*const response = await request\(app\)/g, 
  'const response = await request(app)');

// Fix the .send().expect() pattern
content = content.replace(/\.send\([^)]+\);\s*\/\/ TODO: Move to proper scope\s*\.expect\((\d+)\);/g, 
  '.send($1)\n        .expect($2);');

// Fix the specific pattern where .send() is followed by comment and .expect()
content = content.replace(/\.send\(weakPasswordData\);\s*\/\/ TODO: Move to proper scope\s*\.expect\(400\);/g,
  '.send(weakPasswordData)\n        .expect(400);');

content = content.replace(/\.send\(invalidEmailData\);\s*\/\/ TODO: Move to proper scope\s*\.expect\(400\);/g,
  '.send(invalidEmailData)\n        .expect(400);');

content = content.replace(/\.send\(noTermsData\);\s*\/\/ TODO: Move to proper scope\s*\.expect\(400\);/g,
  '.send(noTermsData)\n        .expect(400);');

// Fix missing semicolon after redisClient.del
content = content.replace(/await redisClient\.del\(`email_verification: \$\{verificationToken\}`\),/g,
  'await redisClient.del(`email_verification: ${verificationToken}`);');

// Fix object closing braces
content = content.replace(/message: 'Verification email sent'\s*}\);/g,
  "message: 'Verification email sent'\n        }\n      });");

// Fix duplicate const response declarations
const lines = content.split('\n');
const fixedLines = [];
let inTestBlock = false;
let hasResponseDeclaration = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('test(') || line.includes('it(')) {
    inTestBlock = true;
    hasResponseDeclaration = false;
  }
  
  if (line.includes('});') && inTestBlock) {
    inTestBlock = false;
    hasResponseDeclaration = false;
  }
  
  // Skip duplicate const response declarations
  if (inTestBlock && line.trim().startsWith('const response = await request(app)')) {
    if (hasResponseDeclaration) {
      continue; // Skip this line
    }
    hasResponseDeclaration = true;
  }
  
  fixedLines.push(line);
}

content = fixedLines.join('\n');

// Fix the ending of the file - remove extra closing braces
content = content.replace(/\n}\n}\n}\n}\n}\n}\n}\n}\n}\n}\n}\n}\n$/, '\n  });\n});\n');

// Ensure proper closing
if (!content.trim().endsWith('});')) {
  content = content.trimEnd() + '\n});\n';
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Fixed auth.integration.test.ts');