const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Fix asyncHandler.ts specific issues
        if (filePath.includes('asyncHandler.ts')) {
            // Fix type declaration issues
            content = content.replace(/\) => \(/g, ') => (');
            content = content.replace(/\): void => {\s*}\s*};/g, '): void => {\n  };\n};');
            
            // Fix missing closing braces
            const openBraces = (content.match(/{/g) || []).length;
            const closeBraces = (content.match(/}/g) || []).length;
            if (openBraces > closeBraces) {
                const missingBraces = openBraces - closeBraces;
                for (let i = 0; i < missingBraces; i++) {
                    content += '\n}';
                }
            }
        }
        
        // Fix appError.ts specific issues
        if (filePath.includes('appError.ts')) {
            // Ensure proper closing braces
            const openBraces = (content.match(/{/g) || []).length;
            const closeBraces = (content.match(/}/g) || []).length;
            if (openBraces > closeBraces) {
                const missingBraces = openBraces - closeBraces;
                for (let i = 0; i < missingBraces; i++) {
                    content += '\n}';
                }
            }
        }
        
        // Fix constants.ts specific issues
        if (filePath.includes('constants.ts')) {
            // Fix object literal syntax issues
            content = content.replace(/(\w+)\s*:\s*{\s*\n\s*(\w+):\s*'([^']+)'\s*\n\s*}\s*(\w+):/g, 
                                     '$1: {\n    $2: \'$3\'\n  },\n  $4:');
            
            // Fix enum-like constant declarations
            content = content.replace(/}\s*([A-Z_]+)\s*:/g, '},\n  $1:');
            
            // Fix missing commas in object literals
            content = content.replace(/('[^']*')\s*\n\s*([A-Z_]+)\s*:/g, '$1,\n  $2:');
            content = content.replace(/}\s*\n\s*([A-Z_]+)\s*:/g, '},\n  $2:');
        }
        
        // Fix encryption.ts issues
        if (filePath.includes('encryption.ts')) {
            // Fix missing semicolons
            content = content.replace(/const (\w+) = ([^;]+)\n/g, 'const $1 = $2;\n');
            
            // Fix function return types
            content = content.replace(/\): string => {\s*}/g, '): string => {\n    // TODO: Implement\n    return \'\';\n  }');
        }
        
        // Fix errors.ts issues
        if (filePath.includes('errors.ts')) {
            // Fix class method syntax
            content = content.replace(/;\s*\n\s*}\s*$/gm, ';\n  }\n}');
        }
        
        // Fix index.ts issues
        if (filePath.includes('index.ts')) {
            // Fix export syntax
            content = content.replace(/export \* from '([^']+)'/g, 'export * from \'$1\';');
            content = content.replace(/export { default as (\w+) } from '([^']+)'/g, 'export { default as $1 } from \'$2\';');
        }
        
        // Fix jwt.ts issues
        if (filePath.includes('jwt.ts')) {
            // Fix function declarations
            content = content.replace(/export const (\w+) = \(/g, 'export const $1 = (');
            content = content.replace(/\): (\w+) => {\s*}/g, '): $1 => {\n    // TODO: Implement\n  }');
        }
        
        // Fix validation.ts issues
        if (filePath.includes('validation.ts')) {
            // Fix Joi schema definitions
            content = content.replace(/Joi\.object\(\{\s*}\)/g, 'Joi.object({})');
            content = content.replace(/\.required\(\)\s*\n\s*}/g, '.required()\n  })');
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

// Get all TypeScript files in utils directory
function getAllUtilFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.')) {
            getAllUtilFiles(filePath, fileList);
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

console.log('Fixing utils files...\n');

const utilsDir = path.join(__dirname, 'src/utils');
const allFiles = getAllUtilFiles(utilsDir);
let fixedCount = 0;

allFiles.forEach(file => {
    if (fixFile(file)) {
        console.log(`✓ Fixed ${path.relative(__dirname, file)}`);
        fixedCount++;
    }
});

console.log(`\n✅ Fixed ${fixedCount} files out of ${allFiles.length} total utils files.`);