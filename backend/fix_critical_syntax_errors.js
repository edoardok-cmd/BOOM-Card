const fs = require('fs');
const path = require('path');

// Function to fix common syntax errors
function fixSyntaxErrors(content, filePath) {
    let fixed = content;
    let changes = [];
    
    // Fix malformed interface properties (semicolons after braces)
    fixed = fixed.replace(/\{,$/gm, '{');
    changes.push('Fixed malformed opening braces');
    
    // Fix object literal syntax with semicolons instead of commas
    fixed = fixed.replace(/(['"])([^'"]+)\1\s*:\s*([^,;\n]+);\s*$/gm, '$1$2$1: $3,');
    fixed = fixed.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^,;\n]+);\s*$/gm, '$1: $2,');
    
    // Fix malformed interfaces
    fixed = fixed.replace(/interface\s+(\w+)\s*\{,/g, 'interface $1 {');
    fixed = fixed.replace(/export\s+interface\s+(\w+)\s*\{,/g, 'export interface $1 {');
    
    // Fix enum declarations
    fixed = fixed.replace(/};$/gm, '}');
    fixed = fixed.replace(/export\s+enum\s+(\w+)\s*\{,/g, 'export enum $1 {');
    
    // Fix const declarations with malformed objects
    fixed = fixed.replace(/export\s+const\s+(\w+)\s*=\s*\{,/g, 'export const $1 = {');
    fixed = fixed.replace(/const\s+(\w+)\s*=\s*\{,/g, 'const $1 = {');
    
    // Fix missing closing braces in catch blocks
    const catchBlockRegex = /} catch \(error\) \{[^}]*$/gm;
    if (catchBlockRegex.test(fixed)) {
        fixed = fixed.replace(catchBlockRegex, (match) => {
            if (!match.endsWith('}')) {
                return match + '\n    }';
            }
            return match;
        });
        changes.push('Fixed missing closing braces in catch blocks');
    }
    
    // Fix duplicate closing braces at end of files
    fixed = fixed.replace(/}\s*}\s*}\s*$/m, '}\n}');
    
    // Fix incomplete function declarations
    fixed = fixed.replace(/:\s*async\s*\(/g, ' = async (');
    fixed = fixed.replace(/\)\s*:\s*Promise<void>\s*=>\s*\{$/gm, '): Promise<void> => {');
    
    // Fix semicolons after interface/type declarations
    fixed = fixed.replace(/};\s*$/gm, '}');
    
    // Fix const declarations with missing values
    fixed = fixed.replace(/const\s+(\w+)\s*;$/gm, 'const $1 = undefined;');
    
    // Fix async handler arrow functions
    fixed = fixed.replace(/=\s*asyncHandler\(async\s*\(/g, '= asyncHandler(async (');
    
    // Count actual changes made
    if (fixed !== content) {
        return { content: fixed, changed: true, changes };
    }
    return { content, changed: false, changes: [] };
}

// Function to process a file
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const result = fixSyntaxErrors(content, filePath);
        
        if (result.changed) {
            fs.writeFileSync(filePath, result.content, 'utf8');
            console.log(`✅ Fixed ${filePath}`);
            result.changes.forEach(change => console.log(`   - ${change}`));
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
const priorityFiles = [
    'src/controllers/pos.controller.ts',
    'src/controllers/auth.controller.ts',
    'src/controllers/admin.controller.ts',
    'src/controllers/category.controller.ts',
    'src/config/database.cloud.ts'
];

let totalFixed = 0;

// Fix priority files first
console.log('🔧 Fixing priority controller files...');
priorityFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        if (processFile(fullPath)) {
            totalFixed++;
        }
    }
});

// Then fix all TypeScript files
console.log('\n🔧 Fixing all TypeScript files...');
function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('dist')) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') && !fullPath.endsWith('.d.ts')) {
            if (processFile(fullPath)) {
                totalFixed++;
            }
        }
    });
}

walkDir(path.join(__dirname, 'src'));

console.log(`\n✅ Total files fixed: ${totalFixed}`);