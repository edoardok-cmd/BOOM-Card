const fs = require('fs');
const path = require('path');

// Function to fix common TypeScript syntax errors
function fixTypeScriptFile(filePath) {
    console.log(`Fixing ${filePath}...`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Fix 1: Remove duplicate closing braces at the end of files
        content = content.replace(/}\s*}\s*}\s*}\s*}\s*}\s*}\s*}\s*}\s*$/, '}');
        content = content.replace(/}\s*}\s*}\s*}\s*}\s*}\s*}\s*}\s*$/, '}');
        content = content.replace(/}\s*}\s*}\s*}\s*}\s*}\s*}\s*$/, '}');
        content = content.replace(/}\s*}\s*}\s*}\s*}\s*}\s*$/, '}');
        content = content.replace(/}\s*}\s*}\s*}\s*}\s*$/, '}');
        content = content.replace(/}\s*}\s*}\s*}\s*$/, '}');
        content = content.replace(/}\s*}\s*}\s*$/, '}');
        content = content.replace(/}\s*}\s*$/, '}');
        
        // Fix 2: Fix method declarations inside objects (should use colon, not equals)
        content = content.replace(/(\s+)(public\s+)?(static\s+)?(\w+)\s*=\s*async\s*\(/g, '$1$3: async (');
        content = content.replace(/(\s+)(public\s+)?(static\s+)?(\w+)\s*=\s*\(/g, '$1$3: (');
        
        // Fix 3: Fix semicolons instead of commas in object literals
        content = content.replace(/}\s*;\s*(\w+\s*:)/g, '},\n    $1');
        content = content.replace(/}\s*;\s*async\s+(\w+)/g, '},\n    async $1');
        content = content.replace(/}\s*;\s*public\s+/g, '},\n    public ');
        content = content.replace(/}\s*;\s*private\s+/g, '},\n    private ');
        content = content.replace(/}\s*;\s*protected\s+/g, '},\n    protected ');
        
        // Fix 4: Fix missing commas after catch blocks in object literals
        content = content.replace(/(catch\s*\([^)]*\)\s*{[^}]*})\s*(\w+\s*:)/g, '$1,\n    $2');
        content = content.replace(/(catch\s*\([^)]*\)\s*{[^}]*})\s*(async\s+\w+)/g, '$1,\n    $2');
        content = content.replace(/(catch\s*\([^)]*\)\s*{[^}]*})\s*(public\s+)/g, '$1,\n    $2');
        content = content.replace(/(catch\s*\([^)]*\)\s*{[^}]*})\s*(private\s+)/g, '$1,\n    $2');
        
        // Fix 5: Fix duplicate imports and move them to the top
        const importRegex = /^import\s+.*$/gm;
        const imports = content.match(importRegex) || [];
        const uniqueImports = [...new Set(imports)];
        
        if (imports.length > 0) {
            // Remove all imports from their current positions
            content = content.replace(importRegex, '');
            
            // Add unique imports at the top
            const mainContent = content.trim();
            content = uniqueImports.join('\n') + '\n\n' + mainContent;
        }
        
        // Fix 6: Fix method declarations that should be inside a class/object
        content = content.replace(/^(\s*)(public\s+static\s+\w+)/gm, '$1$2');
        
        // Fix 7: Remove trailing commas in the last property of objects
        content = content.replace(/,\s*}/g, '\n}');
        
        // Fix 8: Fix async method declarations in objects
        content = content.replace(/:\s*async\s*\(/g, ': async (');
        
        // Fix 9: Clean up multiple empty lines
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // Fix 10: Ensure file ends with single newline
        content = content.trim() + '\n';
        
        // Only write if content changed
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Fixed ${filePath}`);
            return true;
        } else {
            console.log(`✓ No changes needed for ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`✗ Error fixing ${filePath}:`, error.message);
        return false;
    }
}

// Function to recursively find all TypeScript files
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

// Main execution
console.log('Starting TypeScript error fixes...\n');

const srcDir = path.join(__dirname, 'src');
const tsFiles = findTypeScriptFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files to check.\n`);

let fixedCount = 0;
tsFiles.forEach(file => {
    if (fixTypeScriptFile(file)) {
        fixedCount++;
    }
});

console.log(`\n✅ Fixed ${fixedCount} files out of ${tsFiles.length} total files.`);