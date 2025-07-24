const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Fix if statements with comma instead of closing brace
        content = content.replace(/}\s*,\s*\n\s*if\s*\(/g, '}\n    if (');
        content = content.replace(/}\s*,\s*\n\s*(else|return|const|let|var|async|public|private|protected)/g, '}\n    $1');
        
        // Fix missing closing braces
        const lines = content.split('\n');
        let braceCount = 0;
        let inFunction = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Count braces
            for (let char of line) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
            }
            
            // Check if we're in a function/method
            if (line.match(/^\s*(public|private|protected|static|async)?\s*\w+\s*[=:]\s*(async\s*)?\(/)) {
                inFunction = true;
            }
            
            // Fix lines with just comma and closing paren
            if (line.trim() === '},') {
                // Check next line
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    if (nextLine.startsWith('next') && !nextLine.includes('(')) {
                        lines[i] = line.replace('},', '}');
                        lines[i + 1] = '    next();';
                    }
                }
            }
        }
        
        // Fix specific syntax errors in category controller
        if (filePath.includes('category.controller.ts')) {
            // Fix the middleware functions
            content = content.replace(/}\s*,\s*\n\s*next\)/g, '}\n    next();');
            
            // Fix missing const declaration in category methods
            content = content.replace(/const categories = await CategoryService\.getAllCategories/g, 
                                     'const categories = await CategoryService.getAllCategories');
            content = content.replace(/const category = await CategoryService\.getCategoryById/g,
                                     'const category = await CategoryService.getCategoryById');
            content = content.replace(/const updatedCategory = await CategoryService\.updateCategory/g,
                                     'const updatedCategory = await CategoryService.updateCategory');
        }
        
        // Fix admin controller specific issues
        if (filePath.includes('admin.controller.ts')) {
            // Add missing closing brace for updateProductStock function
            content = content.replace(/(throw new CustomError\(`Product with ID.*not found.*\);\s*\n\s*}\s*)(\n\s*if \(status === 'Shipped')/g,
                                     '$1\n    };\n$2');
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

console.log('Running final comprehensive fix...\n');

const srcDir = path.join(__dirname, 'src');
const allFiles = getAllTsFiles(srcDir);
let fixedCount = 0;

allFiles.forEach(file => {
    if (fixFile(file)) {
        console.log(`✓ Fixed ${path.relative(__dirname, file)}`);
        fixedCount++;
    }
});

console.log(`\n✅ Fixed ${fixedCount} files out of ${allFiles.length} total files.`);