const fs = require('fs');
const path = require('path');

// Function to fix specific TypeScript syntax errors
function fixTypeScriptSyntax(content, filePath) {
    let fixed = content;
    
    // Fix all malformed object property declarations with semicolons followed by commas
    fixed = fixed.replace(/:\s*([^,;\n{}\[\]]+);\s*,/gm, ': $1,');
    
    // Fix semicolons at the end of interface properties (should not have semicolons)
    fixed = fixed.replace(/^(\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*[^,;\n]+);$/gm, '$1,');
    
    // Fix malformed const/let/var declarations
    fixed = fixed.replace(/^(\s*(?:const|let|var)\s+[a-zA-Z_][a-zA-Z0-9_]*)\s*;$/gm, '$1 = undefined;');
    
    // Fix multiple closing braces without proper formatting
    fixed = fixed.replace(/}\s*}\s*}\s*}\s*$/m, '}\n}\n}');
    
    // Fix missing semicolons after const assignments
    fixed = fixed.replace(/^(\s*(?:const|let|var)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^;]+)$/gm, '$1;');
    
    // Fix arrow function syntax in object methods
    fixed = fixed.replace(/(\w+)\s*=\s*async\s*\(/g, '$1: async (');
    
    // Fix malformed try-catch blocks
    fixed = fixed.replace(/} catch \(error\) \{\s*}\s*}\s*$/gm, '} catch (error) {\n        next(error);\n    }\n}');
    
    // Fix missing closing braces in nested structures
    const openBraces = (fixed.match(/{/g) || []).length;
    const closeBraces = (fixed.match(/}/g) || []).length;
    if (openBraces > closeBraces) {
        const diff = openBraces - closeBraces;
        for (let i = 0; i < diff; i++) {
            fixed += '\n}';
        }
    }
    
    // Fix database.cloud.ts specific issues
    if (filePath.includes('database.cloud.ts')) {
        // Fix missing semicolons and braces
        fixed = fixed.replace(/^(\s*)(const config: DatabaseConfig = {)/gm, '$1$2');
        fixed = fixed.replace(/^(\s*)(const config: RedisConfig = {)/gm, '$1$2');
        fixed = fixed.replace(/return delay;/g, 'const delay = Math.min(times * 50, 2000);\n      return delay;');
        
        // Fix missing URL parsing
        fixed = fixed.replace(/export function parseRedisUrl\(url: string\): RedisConfig \{\s*;/g, 
            'export function parseRedisUrl(url: string): RedisConfig {\n  const urlParts = new URL(url);');
        
        // Fix missing autoConfig variable
        fixed = fixed.replace(/return { \.\.\.config, \.\.\.autoConfig }/g, function(match) {
            const beforeMatch = fixed.substring(0, fixed.indexOf(match));
            if (!beforeMatch.includes('const autoConfig = autoConfigureRedis(url)')) {
                return '  const autoConfig = autoConfigureRedis(url);\n  return { ...config, ...autoConfig }';
            }
            return match;
        });
        
        // Fix extra closing braces at the end
        fixed = fixed.replace(/}\s*}\s*$/, '}');
    }
    
    // Fix auth.controller.ts specific issues
    if (filePath.includes('auth.controller.ts')) {
        // Fix malformed AuthController class
        fixed = fixed.replace(/export class AuthController \{\s*private authService: AuthService,/g,
            'export class AuthController {\n    private authService: AuthService;');
        
        // Fix malformed method results
        fixed = fixed.replace(/const result: IRegisterResponse = await this\.authService\.registerUser\(userData\),/g,
            'const result: IRegisterResponse = await this.authService.registerUser(userData);');
        
        // Fix malformed responses
        fixed = fixed.replace(/res\.status\(200\)\.json\({ message: '[^']+' }\),/g, function(match) {
            return match.replace(/}\),/, '});');
        });
        
        // Fix duplicate closing braces
        fixed = fixed.replace(/}\s*}\s*}\s*}\s*}\s*$/m, '}\n}');
        
        // Fix catch blocks without proper error handling
        fixed = fixed.replace(/} catch \(error\) \{\s*}\s*}\s*}/gm, '} catch (error) {\n            next(error);\n        }\n    }');
    }
    
    // Fix admin.controller.ts specific issues
    if (filePath.includes('admin.controller.ts')) {
        // Fix malformed type declarations
        fixed = fixed.replace(/type AsyncFunction = \(req: Request, res: Response, next: NextFunction\) => Promise<any>,/g,
            'type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;');
        
        // Fix declare statements
        fixed = fixed.replace(/declare const (\w+): AsyncControllerFunction,/g, 'declare const $1: AsyncControllerFunction;');
        
        // Fix aggregate results
        fixed = fixed.replace(/const totalRevenue = revenueResult\.length > 0 \? revenueResult\[0\]\.totalRevenue: 0,/g,
            'const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;');
        
        // Fix missing semicolons in const declarations
        fixed = fixed.replace(/const productsOutOfStock = await Product\.countDocuments\({ stock: { \$lte: 0 } }\),/g,
            'const productsOutOfStock = await Product.countDocuments({ stock: { $lte: 0 } });');
    }
    
    // Fix pos.controller.ts specific issues
    if (filePath.includes('pos.controller.ts')) {
        // Fix validation returns
        fixed = fixed.replace(/return res\.status\(400\)\.json\({ success: false, message: '[^']+' }\),/g, function(match) {
            return match.replace(/}\),/, '});');
        });
        
        // Fix const declarations with commas
        fixed = fixed.replace(/const (\w+): (\w+) = ([^,]+),$/gm, 'const $1: $2 = $3;');
        
        // Fix object method declarations
        fixed = fixed.replace(/processPayment\s*=\s*async\s*\(/g, 'processPayment: async (');
        fixed = fixed.replace(/refundPayment\s*=\s*async\s*\(/g, 'refundPayment: async (');
        fixed = fixed.replace(/voidPayment\s*=\s*async\s*\(/g, 'voidPayment: async (');
        fixed = fixed.replace(/createOrder\s*=\s*async\s*\(/g, 'createOrder: async (');
        
        // Fix missing closing braces in error handling
        fixed = fixed.replace(/if \(error\.name === '(\w+)'\) \{\s*}\s*}/g, 
            'if (error.name === \'$1\') {\n                return sendErrorResponse(res, 400, error.message, error);\n            }');
    }
    
    // Fix category.controller.ts specific issues
    if (filePath.includes('category.controller.ts')) {
        // Fix validation middleware
        fixed = fixed.replace(/const { error } = (\w+)\.validate\(req\.body, { abortEarly: false }\),/g,
            'const { error } = $1.validate(req.body, { abortEarly: false });');
        
        // Fix controller method declarations
        fixed = fixed.replace(/const (\w+): ([^=]+) = req\.body,/g, 'const $1: $2 = req.body;');
        
        // Fix duplicate function exports
        const getAllCategoriesMatches = fixed.match(/export const getAllCategories/g);
        if (getAllCategoriesMatches && getAllCategoriesMatches.length > 1) {
            // Keep only the first occurrence
            let firstFound = false;
            fixed = fixed.replace(/export const getAllCategories[^}]+}/g, function(match) {
                if (!firstFound) {
                    firstFound = true;
                    return match;
                }
                return ''; // Remove duplicates
            });
        }
    }
    
    return fixed;
}

// Function to process a file
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fixed = fixTypeScriptSyntax(content, filePath);
        
        if (fixed !== content) {
            fs.writeFileSync(filePath, fixed, 'utf8');
            console.log(`✅ Fixed ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🔧 Fixing remaining TypeScript syntax errors...');

// Priority files to fix first
const priorityFiles = [
    'src/controllers/pos.controller.ts',
    'src/controllers/auth.controller.ts',
    'src/controllers/admin.controller.ts',
    'src/controllers/category.controller.ts',
    'src/config/database.cloud.ts',
    'src/models/Analytics.ts',
    'src/models/Category.ts',
    'src/services/auth.service.ts',
    'src/services/pos.service.ts',
    'src/utils/appError.ts',
    'src/utils/asyncHandler.ts'
];

let totalFixed = 0;

// Fix priority files
priorityFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        if (processFile(fullPath)) {
            totalFixed++;
        }
    }
});

// Then fix all TypeScript files
function walkDir(dir) {
    if (!fs.existsSync(dir)) {
        return;
    }
    
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