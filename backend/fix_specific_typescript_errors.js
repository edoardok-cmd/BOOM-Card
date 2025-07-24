const fs = require('fs');
const path = require('path');

// Target specific files with known issues
const specificFixes = {
    'src/controllers/admin.controller.ts': function(content) {
        // Fix incomplete function declarations
        content = content.replace(/\/\/ TODO: Fix incomplete function declaration/g, 'const asyncHandler = (fn: AsyncFunction) =>');
        
        // Fix the specific line issues
        content = content.replace(/^\s*},$/gm, function(match, offset, string) {
            // Check if next non-empty line is an if statement
            const nextLines = string.substring(offset).split('\n').slice(1, 3);
            for (let line of nextLines) {
                if (line.trim().startsWith('if (')) {
                    return match.replace('},', '}');
                }
            }
            return match;
        });
        
        return content;
    },
    
    'src/controllers/auth.controller.ts': function(content) {
        // Fix incomplete function declarations
        content = content.replace(/\/\/ TODO: Fix incomplete function declaration/g, 'const formatUserResponse = (user: any) =>');
        
        // Fix import statement
        content = content.replace(/^import\s*{\s*$/m, 'import {');
        
        // Fix missing closing braces in import
        content = content.replace(/import\s*{[\s\S]*?from\s*'[^']+'/g, function(match) {
            if (!match.includes('}')) {
                return match.replace(/from/, '} from');
            }
            return match;
        });
        
        return content;
    },
    
    'src/controllers/category.controller.ts': function(content) {
        // Fix duplicate function names
        content = content.replace(/export const asyncHandler = /g, function(match, offset, string) {
            // Count occurrences before this match
            const before = string.substring(0, offset);
            const count = (before.match(/export const asyncHandler = /g) || []).length;
            
            if (count === 0) return 'export const authenticateUser = ';
            if (count === 1) return 'export const authorizeAdmin = ';
            if (count === 2) return 'export const validateCreateCategoryInput = ';
            if (count === 3) return 'export const validateUpdateCategoryInput = ';
            if (count === 4) return 'export const validateCategoryId = ';
            
            return match;
        });
        
        // Fix missing const declaration
        content = content.replace(/^\s*const\s*:\s*/gm, '    const user =');
        
        return content;
    },
    
    'src/controllers/discount.controller.ts': function(content) {
        // Fix incomplete function declaration
        content = content.replace(/\/\/ TODO: Fix incomplete function declaration/g, 'const asyncHandler = (fn: Function) =>');
        content = content.replace(/const\s+sendErrorResponse\s*=\s*\(/g, 'const sendErrorResponse = (res: Response, statusCode: number, message: string, error?: any): void => {');
        
        return content;
    },
    
    'src/controllers/index.ts': function(content) {
        // Fix duplicate type declarations
        content = content.replace(/type AsyncFunction = /g, function(match, offset, string) {
            const before = string.substring(0, offset);
            const count = (before.match(/type AsyncFunction = /g) || []).length;
            
            if (count === 0) return match;
            if (count === 1) return 'type AuthenticatedAsyncFunction = ';
            
            return '// ' + match; // Comment out additional duplicates
        });
        
        // Fix missing function name
        content = content.replace(/^\s*:\s*\(/gm, '    validateCreateCard: (');
        
        return content;
    },
    
    'src/controllers/pos.controller.ts': function(content) {
        // Fix incomplete function declarations
        content = content.replace(/\/\/ TODO: Fix incomplete function declaration/g, 'const sendErrorResponse = ');
        content = content.replace(/static\s+:\s*\(/g, 'static validateTransactionInput = (');
        content = content.replace(/static\s+:\s*async/g, 'static processTransaction = async');
        content = content.replace(/export const\s+:\s*async/g, 'export const refundPayment = async');
        
        return content;
    },
    
    'src/services/audit-logger.service.ts': function(content) {
        // Fix incomplete const declaration
        content = content.replace(/\/\/ TODO: Fix incomplete function declaration/g, 'const skip = ');
        
        return content;
    },
    
    'src/config/database.cloud.ts': function(content) {
        // Add missing closing brace at end of file
        if (!content.trim().endsWith('}')) {
            content = content.trim() + '\n}\n';
        }
        return content;
    },
    
    'src/controllers/auth.controller.clean.ts': function(content) {
        // Fix const declarations in methods
        content = content.replace(/const\s+:\s+res\.locals\./g, 'const userId = res.locals.');
        content = content.replace(/const\s+:\s+await/g, 'const result = await');
        
        return content;
    }
};

// Fix common patterns across all files
function fixCommonPatterns(content, filePath) {
    // Fix if statements with comma instead of closing brace
    content = content.replace(/}\s*,\s*\n\s*if\s*\(/g, '}\n    if (');
    
    // Fix semicolons at end of if blocks before else/next statement
    content = content.replace(/}\s*;\s*\n\s*(else|if|return|const|let|var|async|public|private|protected)/g, '}\n    $1');
    
    // Fix catch blocks missing closing braces
    content = content.replace(/} catch \((error|e|err)\) \{([^}]*)\n\s*}\s*,/g, '} catch ($1) {$2\n    }');
    
    // Fix object method syntax
    content = content.replace(/(\w+)\s*=\s*(async\s*)?\(/g, function(match, name, async) {
        // Don't change if it's a variable assignment
        if (match.includes('const ') || match.includes('let ') || match.includes('var ')) {
            return match;
        }
        return `${name}: ${async || ''}(`;
    });
    
    return content;
}

// Process a single file
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Apply common fixes
        content = fixCommonPatterns(content, filePath);
        
        // Apply specific fixes if available
        const relativePath = path.relative(path.join(__dirname), filePath).replace(/\\/g, '/');
        if (specificFixes[relativePath]) {
            content = specificFixes[relativePath](content);
        }
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Fixed ${relativePath}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('Starting targeted TypeScript error fixes...\n');

// Process specific problem files first
const problemFiles = Object.keys(specificFixes).map(f => path.join(__dirname, f));
let fixedCount = 0;

console.log('Processing known problem files...');
problemFiles.forEach(file => {
    if (fs.existsSync(file) && processFile(file)) {
        fixedCount++;
    }
});

console.log(`\n✅ Fixed ${fixedCount} files with specific patterns.`);

// Now process all TypeScript files for common patterns
const srcDir = path.join(__dirname, 'src');
function findTypeScriptFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
            findTypeScriptFiles(filePath, fileList);
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

console.log('\nApplying common pattern fixes to all TypeScript files...');
const allTsFiles = findTypeScriptFiles(srcDir);
let commonFixCount = 0;

allTsFiles.forEach(file => {
    if (!problemFiles.includes(file) && processFile(file)) {
        commonFixCount++;
    }
});

console.log(`\n✅ Total files processed: ${allTsFiles.length}`);
console.log(`✅ Specific fixes applied: ${fixedCount}`);
console.log(`✅ Common pattern fixes applied: ${commonFixCount}`);