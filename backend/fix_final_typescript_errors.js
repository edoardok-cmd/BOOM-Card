const fs = require('fs');
const path = require('path');

// Files that need specific fixes
const filesToFix = {
    'src/controllers/admin.controller.ts': [
        {
            find: /const asyncHandler = \(fn: AsyncFunction\) =>\s*\n\s*const product/g,
            replace: 'const asyncHandler = (fn: AsyncFunction) => {\n      const product'
        },
        {
            find: /type AsyncFunction:/g,
            replace: 'type AsyncFunction ='
        },
        {
            find: /const asyncHandler = \(fn: AsyncFunction\) =>\s*\n\s*\(/g,
            replace: 'const asyncHandler = (fn: AsyncFunction) =>\n    ('
        }
    ],
    
    'src/controllers/auth.controller.ts': [
        {
            find: /const formatUserResponse = \(user: any\) =>\s*\n\s*if/g,
            replace: 'const formatUserResponse = (user: any) => {\n    if'
        },
        {
            find: /return\s*{([^}]+)}\s*;\s*\n\s*}/g,
            replace: 'return {$1};\n};'
        }
    ],
    
    'src/controllers/category.controller.ts': [
        {
            find: /export const (\w+): \(/g,
            replace: 'export const $1 = ('
        },
        {
            find: /const user =/g,
            replace: 'const user: any ='
        }
    ],
    
    'src/controllers/discount.controller.ts': [
        {
            find: /const asyncHandler = \(fn: Function\) =>\s*\n\s*Promise/g,
            replace: 'const asyncHandler = (fn: Function) => {\n    return (req: Request, res: Response, next: NextFunction) => {\n        Promise'
        },
        {
            find: /\.catch\(next\);\s*\n\s*};\s*\n\s*export/g,
            replace: '.catch(next);\n    };\n};\n\nexport'
        }
    ],
    
    'src/controllers/index.ts': [
        {
            find: /type AsyncFunction:/g,
            replace: 'type AsyncFunction ='
        },
        {
            find: /type AuthenticatedAsyncFunction:/g,
            replace: 'type AuthenticatedAsyncFunction ='
        }
    ],
    
    'src/controllers/pos.controller.ts': [
        {
            find: /static processTransaction = async/g,
            replace: 'static refundTransaction = async'
        },
        {
            find: /const sendErrorResponse =\s*\n/g,
            replace: 'const sendErrorResponse = (res: Response, statusCode: number, message: string, error?: any): void => {\n'
        },
        {
            find: /export const refundPayment = async/g,
            replace: function(match, offset, string) {
                const before = string.substring(0, offset);
                const count = (before.match(/export const refundPayment = async/g) || []).length;
                
                if (count === 0) return 'export const processPayment = async';
                if (count === 1) return 'export const createOrder = async';
                if (count === 2) return match; // Keep refundPayment
                if (count === 3) return 'export const voidPayment = async';
                
                return match;
            }
        }
    ],
    
    'src/services/audit-logger.service.ts': [
        {
            find: /const skip =\s*\n/g,
            replace: 'const skip = (page - 1) * limit;\n'
        },
        {
            find: /const query: any = {}\s*\n\s*if/g,
            replace: 'const query: any = {};\n    if'
        },
        {
            find: /query\.timestamp = {}\s*\n\s*if/g,
            replace: 'query.timestamp = {};\n      if'
        },
        {
            find: /const sort: any = /g,
            replace: 'const sort: any = '
        }
    ],
    
    'src/server-ts.ts': [
        {
            find: /}\s*\n\s*if \(db\)/g,
            replace: '};\n  \n  if (db)'
        }
    ],
    
    'src/controllers/auth.controller.clean.ts': [
        {
            find: /const\s+:\s+res\.locals\./g,
            replace: 'const userId: string = res.locals.'
        },
        {
            find: /const\s+:\s+await/g,
            replace: 'const result = await'
        }
    ]
};

// Process each file
Object.entries(filesToFix).forEach(([filePath, fixes]) => {
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
        try {
            let content = fs.readFileSync(fullPath, 'utf8');
            const originalContent = content;
            
            // Apply each fix
            fixes.forEach(fix => {
                if (typeof fix.replace === 'function') {
                    content = content.replace(fix.find, fix.replace);
                } else {
                    content = content.replace(fix.find, fix.replace);
                }
            });
            
            // Additional generic fixes
            // Fix if statements with commas
            content = content.replace(/,\s*\n(\s*)if\s*\(/g, '\n$1}\n$1if (');
            
            // Fix closing braces for methods
            content = content.replace(/}\s*,\s*\n(\s*)(async\s+)?(\w+)\s*[:(]/g, '},\n$1$2$3$3');
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`✓ Fixed ${filePath}`);
            } else {
                console.log(`  No changes needed for ${filePath}`);
            }
        } catch (error) {
            console.error(`✗ Error processing ${filePath}:`, error.message);
        }
    } else {
        console.log(`  File not found: ${filePath}`);
    }
});

// Fix remaining common issues in all TypeScript files
function fixCommonIssues(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
            fixCommonIssues(filePath);
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            try {
                let content = fs.readFileSync(filePath, 'utf8');
                const originalContent = content;
                
                // Fix missing semicolons in if statements
                content = content.replace(/}\s*\n(\s*)if\s*\(/g, '}\n$1if (');
                
                // Fix missing closing braces for arrow functions
                content = content.replace(/=>\s*\n\s*([a-zA-Z])/g, '=> {\n    $1');
                
                // Fix object/array at end of file
                content = content.replace(/}\s*\n\s*}\s*\n\s*}\s*$/g, '}\n}');
                
                if (content !== originalContent) {
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`✓ Fixed common issues in ${path.relative(__dirname, filePath)}`);
                }
            } catch (error) {
                // Ignore errors for individual files
            }
        }
    });
}

console.log('Applying final TypeScript fixes...\n');
console.log('Fixing specific files...');

// Apply common fixes to src directory
console.log('\nApplying common fixes...');
fixCommonIssues(path.join(__dirname, 'src'));

console.log('\n✅ Final fixes complete!');