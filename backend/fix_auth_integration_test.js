const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/__tests__/integration/auth.integration.test.ts');
console.log('Fixing auth.integration.test.ts...');

let content = fs.readFileSync(filePath, 'utf8');

// Specific fixes for this file
const fixes = [
  // Fix the const declaration at line 113-114
  { from: /\/\/ const TEST_CONFIG = \{\s*DATABASE_URL:/g, to: 'const TEST_CONFIG = {\n  DATABASE_URL:' },
  
  // Fix missing closing brace for TEST_CONFIG
  { from: /OTP_EXPIRY_TIME: 5 \* 60 \* 1000, \/\/ 5 minutes\s*}/g, to: 'OTP_EXPIRY_TIME: 5 * 60 * 1000, // 5 minutes\n};' },
  
  // Fix misplaced semicolon after app.use
  { from: /app\.use\(express\.urlencoded\(\{ extended: true \}\)\),/g, to: 'app.use(express.urlencoded({ extended: true }));' },
  
  // Fix authRouter declaration
  { from: /\/\/ const authRouter = new AuthRouter\(authService\); \/\/ TODO: Move to proper scope/g, to: 'const authRouter = new AuthRouter(authService);' },
  
  // Fix const declaration in tests
  { from: /\/\/ const response = await request\(app\)\s*\.post/g, to: 'const response = await request(app)\n        .post' },
  
  // Fix incomplete request statements
  { from: /\.send\(validRegistrationData\); \/\/ TODO: Move to proper scope\s*\.expect\(201\);/g, to: '.send(validRegistrationData)\n        .expect(201);' },
  
  // Fix const declarations in test blocks
  { from: /\/\/ const sentEmails = mockEmailProvider\.getSentEmails\(\); \/\/ TODO: Move to proper scope/g, to: 'const sentEmails = mockEmailProvider.getSentEmails();' },
  
  // Fix missing request initialization
  { from: /\s*\.post\('/g, to: '\n      const response = await request(app)\n        .post(' },
  
  // Fix const declarations for test data
  { from: /\/\/ const weakPasswordData = \{/g, to: 'const weakPasswordData = {' },
  { from: /\/\/ const invalidEmailData = \{/g, to: 'const invalidEmailData = {' },
  { from: /\/\/ const noTermsData = \{/g, to: 'const noTermsData = {' },
  { from: /\/\/ const userCredentials = \{/g, to: 'const userCredentials = {' },
  
  // Fix closing braces
  { from: /\}\s*\.send\(weakPasswordData\); \/\/ TODO: Move to proper scope/g, to: '};\n\n      const response = await request(app)\n        .post(\'/api/auth/register\')\n        .send(weakPasswordData)' },
  { from: /\}\s*\.send\(invalidEmailData\); \/\/ TODO: Move to proper scope/g, to: '};\n\n      const response = await request(app)\n        .post(\'/api/auth/register\')\n        .send(invalidEmailData)' },
  { from: /\}\s*\.send\(noTermsData\); \/\/ TODO: Move to proper scope/g, to: '};\n\n      const response = await request(app)\n        .post(\'/api/auth/register\')\n        .send(noTermsData)' },
  
  // Fix acceptedTerms line
  { from: /acceptedTerms: true; \/\/ TODO: Move to proper scope/g, to: 'acceptedTerms: true' },
  
  // Fix beforeEach async arrow function
  { from: /beforeEach\(async \(\) => \{/g, to: 'beforeEach(async () => {' },
  
  // Fix misplaced request statements in Email Verification Flow
  { from: /\/\/ Register a user\s*\.post/g, to: '// Register a user\n      const response = await request(app)\n        .post' },
  
  // Fix token extraction
  { from: /\/\/ const verificationEmail = sentEmails\[0\]; \/\/ TODO: Move to proper scope/g, to: 'const sentEmails = mockEmailProvider.getSentEmails();\n      const verificationEmail = sentEmails[0];' },
  { from: /\/\/ const tokenMatch = verificationEmail\.body\.match\(\/token: \(\[a-zA-Z0-9-_\]\+\)\/\),; \/\/ TODO: Move to proper scope/g, to: 'const tokenMatch = verificationEmail.body.match(/token: ([a-zA-Z0-9-_]+)/);' },
  
  // Fix test blocks missing response declaration
  { from: /test\('should verify email with valid token', async \(\) => \{\s*\.post/g, to: 'test(\'should verify email with valid token\', async () => {\n      const response = await request(app)\n        .post' },
  { from: /test\('should reject invalid verification token', async \(\) => \{\s*\.post/g, to: 'test(\'should reject invalid verification token\', async () => {\n      const response = await request(app)\n        .post' },
  
  // Fix user retrieval
  { from: /\/\/ const user = await userService\.getUserById\(userId\); \/\/ TODO: Move to proper scope/g, to: 'const user = await userService.getUserById(userId);' },
  
  // Fix missing closing braces
  { from: /acceptedTerms: true\s*\}\s*\n/g, to: 'acceptedTerms: true\n        }' }
];

// Apply fixes
fixes.forEach(fix => {
  const before = content.length;
  content = content.replace(fix.from, fix.to);
  const after = content.length;
  if (before !== after) {
    console.log(`Applied fix: ${fix.from.toString().substring(0, 50)}...`);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Fixed auth.integration.test.ts');