const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Fix incomplete export const declarations
        content = content.replace(/export const\s*:\s*async\s*\(/g, 'export const handler = async (');
        
        // Fix type declarations with colon instead of equals
        content = content.replace(/export type (\w+):\s*\(/g, 'export type $1 = (');
        
        // Fix duplicate semicolons
        content = content.replace(/;\s*;/g, ';');
        
        // Fix incomplete function declarations in controllers
        if (filePath.includes('auth.controller')) {
            // Fix the incomplete method declarations
            content = content.replace(/public\s+(\w+)\s*:\s*async\s*\(/g, 'public $1 = async (');
            content = content.replace(/(\w+)\s*:\s*async\s*\(/g, '$1 = async (');
            
            // Fix specific auth controller issues
            content = content.replace(/export const\s*:\s*async/g, 'export const handler = async');
        }
        
        // Fix category controller specific issues
        if (filePath.includes('category.controller')) {
            // Fix the incomplete function declarations
            content = content.replace(/export const\s*:\s*async/g, 'export const handler = async');
            
            // Fix missing variable declarations
            content = content.replace(/const categories = await CategoryService\.getAllCategories\(\);/g, 
                                     'const categories = await CategoryService.getAllCategories();');
            content = content.replace(/const category = await CategoryService\.getCategoryById/g,
                                     'const category = await CategoryService.getCategoryById');
            content = content.replace(/const updatedCategory = await CategoryService\.updateCategory/g,
                                     'const updatedCategory = await CategoryService.updateCategory');
            
            // Fix the undefined errors variable
            content = content.replace(/errors\.join/g, 'error.details.map(detail => detail.message).join');
        }
        
        // Fix admin controller specific issues
        if (filePath.includes('admin.controller')) {
            // Fix missing closing brace for updateProductStock
            const updateProductStockRegex = /const updateProductStock = async[^}]+\n\s*}\s*$/gm;
            content = content.replace(updateProductStockRegex, (match) => {
                if (!match.includes('};')) {
                    return match.replace(/}\s*$/, '};');
                }
                return match;
            });
        }
        
        // Fix pos controller specific issues
        if (filePath.includes('pos.controller')) {
            // Fix missing closing braces in catch blocks
            content = content.replace(/} catch \(error\) \{\s*}\s*if/g, '} catch (error) {\n        if');
            
            // Fix incomplete variable declarations
            content = content.replace(/const result = await paymentService\.refundPayment[^;]+;/g, (match) => {
                if (!match.includes('const result')) {
                    return 'const result = await paymentService.refundPayment(transactionId, amount);';
                }
                return match;
            });
            
            content = content.replace(/const result = await paymentService\.voidPayment[^;]+;/g, (match) => {
                if (!match.includes('const result')) {
                    return 'const result = await paymentService.voidPayment(transactionId);';
                }
                return match;
            });
            
            // Fix orderService declaration
            content = content.replace(/}\s*const orderService = \{/g, '};\n\nconst orderService = {');
        }
        
        // Fix database.cloud.ts specific issues
        if (filePath.includes('database.cloud.ts')) {
            // Count opening and closing braces
            const openBraces = (content.match(/{/g) || []).length;
            const closeBraces = (content.match(/}/g) || []).length;
            
            if (openBraces > closeBraces) {
                // Add missing closing braces at the end
                const missingBraces = openBraces - closeBraces;
                for (let i = 0; i < missingBraces; i++) {
                    content += '\n}';
                }
            }
        }
        
        // Fix database.ts type declarations
        if (filePath.includes('database.ts') && !filePath.includes('database.cloud.ts')) {
            content = content.replace(/export type AsyncFunction:\s*\(/g, 'export type AsyncFunction = (');
        }
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Get all TypeScript files
function getAllTsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
            getAllTsFiles(filePath, fileList);
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

console.log('Running systematic error fixes...\n');

const srcDir = path.join(__dirname, 'src');
const allFiles = getAllTsFiles(srcDir);
let fixedCount = 0;

// Priority files to fix first
const priorityFiles = [
    'controllers/auth.controller.clean.ts',
    'controllers/auth.controller.ts',
    'controllers/category.controller.ts',
    'controllers/admin.controller.ts',
    'controllers/pos.controller.ts',
    'config/database.ts',
    'config/database.cloud.ts'
];

// Fix priority files first
priorityFiles.forEach(file => {
    const fullPath = path.join(srcDir, file);
    if (fs.existsSync(fullPath)) {
        if (fixFile(fullPath)) {
            console.log(`✓ Fixed ${file}`);
            fixedCount++;
        }
    }
});

// Then fix all other files
allFiles.forEach(file => {
    const relativePath = path.relative(srcDir, file);
    if (!priorityFiles.includes(relativePath)) {
        if (fixFile(file)) {
            console.log(`✓ Fixed ${path.relative(__dirname, file)}`);
            fixedCount++;
        }
    }
});

console.log(`\n✅ Fixed ${fixedCount} files out of ${allFiles.length} total files.`);