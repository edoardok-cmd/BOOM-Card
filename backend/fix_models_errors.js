const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Fix incomplete imports
        content = content.replace(/\/\/ 1\. All import statements\s*\n\s*Entity,/g, 
                                 '// 1. All import statements\nimport {\n  Entity,');
        
        content = content.replace(/} from 'typeorm';\s*\n\s*\/\/ 2\. All TypeScript/g,
                                 '} from \'typeorm\';\n\n// 2. All TypeScript');
        
        // Fix Category.ts specific issues
        if (filePath.includes('Category.ts')) {
            // Fix the incomplete aggregation arrays
            content = content.replace(/CategorySchema\.statics\.findAncestors = async function\(categoryId: Types\.ObjectId \| string\): Promise<ICategory\[\]> {\s*\n\s*{/g,
                                     'CategorySchema.statics.findAncestors = async function(categoryId: Types.ObjectId | string): Promise<ICategory[]> {\n  const result = await this.aggregate([');
            
            content = content.replace(/CategorySchema\.statics\.findDescendants = async function\(categoryId: Types\.ObjectId \| string\): Promise<ICategory\[\]> {\s*\n\s*{/g,
                                     'CategorySchema.statics.findDescendants = async function(categoryId: Types.ObjectId | string): Promise<ICategory[]> {\n  const result = await this.aggregate([');
            
            // Add missing aggregate closing
            content = content.replace(/{ \$project: { __v: 0, createdAt: 0, updatedAt: 0 } } \/\/ Exclude unnecessary fields\s*\n  \]\);/g,
                                     '{ $project: { __v: 0, createdAt: 0, updatedAt: 0 } } // Exclude unnecessary fields\n  ]);');
            
            // Fix the broken aggregation pipeline
            content = content.replace(/,\s*\n\s*{(?!\s*\$)/g, ',\n    },\n    {');
        }
        
        // Fix Notification.ts common issues
        if (filePath.includes('Notification.ts')) {
            // Fix missing commas in interface definitions
            content = content.replace(/}\s*\n\s*metadata\?:/g, '},\n  metadata?:');
            
            // Fix incomplete method definitions
            content = content.replace(/async function\s*\(\s*\)\s*{\s*}/g, 'async function() {\n    // TODO: Implement\n  }');
        }
        
        // Fix common patterns in all model files
        // Fix missing commas in enum definitions
        content = content.replace(/([A-Z_]+\s*=\s*['"][^'"]+['"])\s*\n\s*([A-Z_]+\s*=)/g, '$1,\n  $2');
        
        // Fix missing semicolons after interface properties
        content = content.replace(/([a-zA-Z_]+\??\s*:\s*[^;{}\n]+)(\n\s*[a-zA-Z_]+\s*:)/g, '$1;$2');
        
        // Fix missing closing braces
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        
        if (openBraces > closeBraces) {
            const missingBraces = openBraces - closeBraces;
            for (let i = 0; i < missingBraces; i++) {
                content += '\n}';
            }
        }
        
        // Fix Analytics.ts specific issues
        if (filePath.includes('Analytics.ts')) {
            // Fix the incomplete declaration
            content = content.replace(/}\s*\n\s*\n$/g, '};\n\nexport default Analytics;');
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

// Get all TypeScript files in models directory
function getAllModelFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.')) {
            getAllModelFiles(filePath, fileList);
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

console.log('Fixing model files...\n');

const modelsDir = path.join(__dirname, 'src/models');
const allFiles = getAllModelFiles(modelsDir);
let fixedCount = 0;

allFiles.forEach(file => {
    if (fixFile(file)) {
        console.log(`✓ Fixed ${path.relative(__dirname, file)}`);
        fixedCount++;
    }
});

console.log(`\n✅ Fixed ${fixedCount} files out of ${allFiles.length} total model files.`);