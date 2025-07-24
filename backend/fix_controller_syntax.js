const fs = require('fs');
const path = require('path');

// Read and fix controller files
const controllersDir = path.join(__dirname, 'src', 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.controller.ts'));

files.forEach(file => {
    const filePath = path.join(controllersDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix common syntax errors
    // 1. Fix missing closing braces for catch blocks
    content = content.replace(/} catch \(error\) {\s*next\(error\);\s*};\s*\n\s*\/\*\*/gm, 
        '} catch (error) {\n            next(error);\n        }\n    }\n\n    /**');
    
    // 2. Fix semicolon after closing brace in if-else statements
    content = content.replace(/}\s*else\s*{\s*[^}]+}\s*};\s*\n\s*\/\*\*/gm, function(match) {
        return match.replace(/};\s*\n\s*\/\*\*/, '}\n  };\n\n  /**');
    });
    
    // 3. Remove extra closing braces at end of file
    content = content.replace(/}\s*}\s*}\s*}\s*}\s*}\s*}\s*}\s*$/, '');
    content = content.replace(/}\s*}\s*}\s*}\s*}\s*$/, '');
    
    // 4. Fix duplicate imports (remove second occurrence)
    const importRegex = /^import .+ from .+;$/gm;
    const imports = [];
    content = content.replace(importRegex, (match, offset) => {
        if (imports.includes(match)) {
            return '// Duplicate import removed: ' + match;
        }
        imports.push(match);
        return match;
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
});

console.log('Syntax fixes completed!');