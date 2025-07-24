const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Fix incomplete import statements
        content = content.replace(/import\s*{\s*\nimport/g, 'import');
        
        // Fix pos controller specific issues
        if (filePath.includes('pos.controller')) {
            // Fix the incomplete catch blocks
            content = content.replace(/} catch \(error\) \{\s*}\s*if/g, '} catch (error) {\n    }');
            
            // Fix the specific issue with missing closing braces
            content = content.replace(/}\);\s*} else {/g, '});\n        } else {');
            content = content.replace(/}\);\s*} catch \(error\) {/g, '});\n    } catch (error) {');
            
            // Fix missing closing braces in functions
            const lines = content.split('\n');
            let braceCount = 0;
            let inCatchBlock = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                if (line.includes('} catch (error) {')) {
                    inCatchBlock = true;
                }
                
                if (inCatchBlock && line.trim() === '}') {
                    // Check if next line starts a new block
                    if (i + 1 < lines.length && lines[i + 1].trim().startsWith('if')) {
                        lines[i] = '    }';
                    }
                    inCatchBlock = false;
                }
            }
            
            content = lines.join('\n');
            
            // Fix specific syntax errors
            content = content.replace(/},\s*sendErrorResponse/g, '}\n        sendErrorResponse');
            content = content.replace(/}\s*const result = await/g, '}\n\n        const result = await');
        }
        
        // Fix auth controller issues
        if (filePath.includes('auth.controller')) {
            // Fix the class method declarations
            content = content.replace(/(\w+)\s*:\s*async\s*\(/g, '$1 = async (');
            
            // Fix missing closing braces in catch blocks
            content = content.replace(/} catch \(error\) {\s*}\s*};\s*$/gm, '} catch (error) {\n            next(error);\n        }\n    };');
        }
        
        // Fix category controller issues
        if (filePath.includes('category.controller')) {
            // Fix the missing variable declarations
            content = content.replace(/export const handler = async \(req: Request, res: Response, next: NextFunction\) => {\s*try {\s*\n\s*res\.status/g, 
                                     'export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {\n    try {\n        const categories = await CategoryService.getAllCategories();\n\n        res.status');
            
            content = content.replace(/export const handler = async \(req: Request, res: Response, next: NextFunction\) => {\s*try {\s*const { id } = req\.params;\s*\n\s*if \(!category\)/g,
                                     'export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {\n    try {\n        const { id } = req.params;\n        const category = await CategoryService.getCategoryById(id);\n\n        if (!category)');
            
            content = content.replace(/export const handler = async \(req: Request, res: Response, next: NextFunction\) => {\s*try {\s*const { id } = req\.params;\s*const updateData/g,
                                     'export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {\n    try {\n        const { id } = req.params;\n        const updateData');
            
            // Fix missing updatedCategory declaration
            content = content.replace(/if \(!updatedCategory\)/g, 'const updatedCategory = await CategoryService.updateCategory(id, updateData);\n        if (!updatedCategory)');
            
            // Rename duplicate handler exports
            let handlerCount = 0;
            content = content.replace(/export const handler = async/g, () => {
                handlerCount++;
                if (handlerCount === 1) return 'export const createCategory = async';
                if (handlerCount === 2) return 'export const getAllCategories = async';
                if (handlerCount === 3) return 'export const getCategoryById = async';
                if (handlerCount === 4) return 'export const updateCategory = async';
                if (handlerCount === 5) return 'export const deleteCategory = async';
                return 'export const handler' + handlerCount + ' = async';
            });
        }
        
        // Fix auth.controller.clean.ts
        if (filePath.includes('auth.controller.clean')) {
            // Rename duplicate handler exports
            let handlerCount = 0;
            content = content.replace(/export const handler = async/g, () => {
                handlerCount++;
                if (handlerCount === 1) return 'export const register = async';
                if (handlerCount === 2) return 'export const login = async';
                if (handlerCount === 3) return 'export const refreshToken = async';
                if (handlerCount === 4) return 'export const logout = async';
                if (handlerCount === 5) return 'export const getProfile = async';
                if (handlerCount === 6) return 'export const updateProfile = async';
                if (handlerCount === 7) return 'export const changePassword = async';
                if (handlerCount === 8) return 'export const verifyEmail = async';
                if (handlerCount === 9) return 'export const resendVerification = async';
                if (handlerCount === 10) return 'export const enable2FA = async';
                if (handlerCount === 11) return 'export const disable2FA = async';
                if (handlerCount === 12) return 'export const verify2FA = async';
                return 'export const handler' + handlerCount + ' = async';
            });
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

console.log('Fixing import and syntax issues...\n');

const srcDir = path.join(__dirname, 'src');
const allFiles = getAllTsFiles(srcDir);
let fixedCount = 0;

// Priority files to fix first
const priorityFiles = [
    'controllers/auth.controller.ts',
    'controllers/auth.controller.clean.ts',
    'controllers/category.controller.ts',
    'controllers/pos.controller.ts'
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