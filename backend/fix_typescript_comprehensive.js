const fs = require('fs');
const path = require('path');

// Function to fix TypeScript syntax errors more comprehensively
function fixTypeScriptFile(filePath) {
    console.log(`Processing ${filePath}...`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        let lines = content.split('\n');
        let modified = false;
        
        // Fix 1: Find and fix missing closing braces after catch blocks
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for catch blocks that might be missing closing braces
            if (line.includes('} catch (error)') || line.includes('} catch (e)') || line.includes('} catch (err)')) {
                // Look for the next closing brace
                let braceCount = 0;
                let catchBlockEnd = -1;
                
                for (let j = i + 1; j < lines.length && j < i + 20; j++) {
                    const checkLine = lines[j];
                    for (let char of checkLine) {
                        if (char === '{') braceCount++;
                        if (char === '}') {
                            braceCount--;
                            if (braceCount < 0) {
                                catchBlockEnd = j;
                                break;
                            }
                        }
                    }
                    if (catchBlockEnd !== -1) break;
                }
                
                // If we found a catch block without proper closing, add a brace
                if (catchBlockEnd === -1 && i + 1 < lines.length) {
                    // Check if next non-empty line starts a new method/property
                    let nextNonEmpty = i + 1;
                    while (nextNonEmpty < lines.length && lines[nextNonEmpty].trim() === '') {
                        nextNonEmpty++;
                    }
                    
                    if (nextNonEmpty < lines.length) {
                        const nextLine = lines[nextNonEmpty].trim();
                        if (nextLine.match(/^(public|private|protected|async|static|\w+\s*:|\w+\s*\()/)) {
                            // Insert closing brace before this line
                            lines.splice(nextNonEmpty, 0, '    }');
                            modified = true;
                            console.log(`  Added closing brace after catch block at line ${i}`);
                        }
                    }
                }
            }
        }
        
        // Fix 2: Fix object literal syntax - semicolons to commas
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Fix semicolons after method/property definitions in objects
            if (line.match(/^\s*}\s*;$/)) {
                // Check if next line is another property/method
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    if (nextLine.match(/^(async\s+)?\w+\s*[:(]/) || 
                        nextLine.match(/^(public|private|protected|static)/)) {
                        lines[i] = line.replace(/}\s*;$/, '},');
                        modified = true;
                    }
                }
            }
        }
        
        // Fix 3: Remove extra closing braces at end of file
        let lastNonEmptyIndex = lines.length - 1;
        while (lastNonEmptyIndex >= 0 && lines[lastNonEmptyIndex].trim() === '') {
            lastNonEmptyIndex--;
        }
        
        let extraBraces = 0;
        let checkIndex = lastNonEmptyIndex;
        while (checkIndex >= 0 && lines[checkIndex].trim() === '}') {
            extraBraces++;
            checkIndex--;
        }
        
        if (extraBraces > 3) {
            // Keep only necessary closing braces
            lines = lines.slice(0, checkIndex + 4);
            modified = true;
            console.log(`  Removed ${extraBraces - 3} extra closing braces at end of file`);
        }
        
        // Fix 4: Fix incomplete function declarations
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Look for patterns like "const :" or "const functionName:"
            if (line.match(/^\s*const\s+:\s*/) || line.match(/^\s*const\s+\w+\s*:\s*$/)) {
                lines[i] = '    // TODO: Fix incomplete function declaration';
                modified = true;
            }
            
            // Look for patterns like "public static :" without function name
            if (line.match(/^\s*(public|private|protected)\s+(static\s+)?:\s*/)) {
                lines[i] = '    // TODO: Fix incomplete method declaration';
                modified = true;
            }
        }
        
        // Fix 5: Fix arrow function syntax in object literals
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Convert "methodName = async (" to "methodName: async ("
            if (line.match(/^\s*\w+\s*=\s*async\s*\(/)) {
                lines[i] = line.replace(/(\w+)\s*=\s*async/, '$1: async');
                modified = true;
            }
            
            // Convert "methodName = (" to "methodName: ("
            if (line.match(/^\s*\w+\s*=\s*\(/)) {
                lines[i] = line.replace(/(\w+)\s*=\s*\(/, '$1: (');
                modified = true;
            }
        }
        
        // Fix 6: Fix missing commas after methods in objects
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // If line ends with } and next line starts a new method/property
            if (line.match(/^\s*}\s*$/) && i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                if (nextLine.match(/^(async\s+)?\w+\s*[:(]/) && 
                    !nextLine.startsWith('export') && 
                    !nextLine.startsWith('import')) {
                    lines[i] = line.replace(/}\s*$/, '},');
                    modified = true;
                }
            }
        }
        
        // Fix 7: Fix duplicate imports
        const importMap = new Map();
        const newLines = [];
        let inImportSection = true;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (inImportSection && line.match(/^import/)) {
                const importKey = line.trim();
                if (!importMap.has(importKey)) {
                    importMap.set(importKey, true);
                    newLines.push(line);
                }
            } else {
                if (inImportSection && line.trim() !== '' && !line.match(/^import/)) {
                    inImportSection = false;
                }
                newLines.push(line);
            }
        }
        
        if (newLines.length !== lines.length) {
            lines = newLines;
            modified = true;
            console.log(`  Removed duplicate imports`);
        }
        
        if (modified) {
            content = lines.join('\n');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Fixed ${filePath}`);
            return true;
        } else {
            console.log(`✓ No changes needed for ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Function to fix specific file patterns
function fixSpecificPatterns(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Special fixes for migration files
        if (filePath.includes('migration')) {
            // Fix common migration syntax errors
            content = content.replace(/}\s*;\s*up\(/g, '},\n\n  up(');
            content = content.replace(/}\s*;\s*down\(/g, '},\n\n  down(');
        }
        
        // Special fixes for service files
        if (filePath.includes('service')) {
            // Fix service class syntax
            content = content.replace(/}\s*;\s*async\s+(\w+)/g, '},\n\n  async $1');
            content = content.replace(/}\s*;\s*public\s+/g, '},\n\n  public ');
            content = content.replace(/}\s*;\s*private\s+/g, '},\n\n  private ');
        }
        
        // Fix incomplete type declarations
        content = content.replace(/type\s+:\s*\(/g, 'type AsyncFunction = (');
        content = content.replace(/const\s+:\s*\(/g, 'const asyncHandler = (');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error in specific pattern fix for ${filePath}:`, error.message);
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
console.log('Starting comprehensive TypeScript error fixes...\n');

const srcDir = path.join(__dirname, 'src');
const tsFiles = findTypeScriptFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files to process.\n`);

// First pass - general fixes
let fixedCount = 0;
tsFiles.forEach(file => {
    if (fixTypeScriptFile(file)) {
        fixedCount++;
    }
});

console.log(`\n--- First pass complete: ${fixedCount} files modified ---\n`);

// Second pass - specific pattern fixes
let specificFixCount = 0;
tsFiles.forEach(file => {
    if (fixSpecificPatterns(file)) {
        specificFixCount++;
    }
});

console.log(`\n--- Second pass complete: ${specificFixCount} files modified ---\n`);

console.log(`✅ Total files processed: ${tsFiles.length}`);
console.log(`✅ Files modified in first pass: ${fixedCount}`);
console.log(`✅ Files modified in second pass: ${specificFixCount}`);