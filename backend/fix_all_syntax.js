const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix pattern: missing closing brace before next method
    // Match: } catch (error) { next(error); } followed by /** (missing closing brace)
    const missingBracePattern = /(\s*} catch \(error[^)]*\) {\s*next\(error\);\s*}\s*)\n(\s*\/\*\*)/gm;
    if (missingBracePattern.test(content)) {
        content = content.replace(missingBracePattern, '$1\n    }\n\n$2');
        modified = true;
    }
    
    // Fix pattern: missing closing brace in general (look for common patterns)
    const generalMissingBracePattern = /(\s*}\s*catch[^{]+{[^}]+}\s*)\n(\s*\/\*\*)/gm;
    if (generalMissingBracePattern.test(content)) {
        content = content.replace(generalMissingBracePattern, (match, p1, p2) => {
            if (!p1.trim().endsWith('}')) {
                return p1 + '\n    }\n\n' + p2;
            }
            return match;
        });
        modified = true;
    }
    
    // Fix pattern: object literal ending with semicolon instead of comma
    const objectSemicolonPattern = /(\s+)(\w+):\s*{([^}]+)}\s*;\s*\n(\s*} catch)/gm;
    if (objectSemicolonPattern.test(content)) {
        content = content.replace(objectSemicolonPattern, '$1$2: {$3}\n      };\n$4');
        modified = true;
    }
    
    // Remove extra closing braces at end of file (more than 3 consecutive)
    const extraBracesPattern = /}\s*}\s*}\s*}\s*}\s*$/;
    if (extraBracesPattern.test(content)) {
        content = content.replace(extraBracesPattern, '');
        modified = true;
    }
    
    // Fix duplicate closing braces in the middle of files
    const duplicateBracesPattern = /}\s*}\s*}\s*}\s*}\s*\n\s*$/gm;
    if (duplicateBracesPattern.test(content)) {
        content = content.replace(duplicateBracesPattern, '}\n');
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed ${path.basename(filePath)}`);
    }
    
    return modified;
}

// Fix all controller files
const controllersDir = path.join(__dirname, 'src', 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.controller.ts'));

let fixedCount = 0;
files.forEach(file => {
    const filePath = path.join(controllersDir, file);
    if (fixFile(filePath)) {
        fixedCount++;
    }
});

console.log(`\nFixed ${fixedCount} files total.`);