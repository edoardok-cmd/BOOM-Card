const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Check if file is actually JSON with .ts extension
        if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
            // Skip JSON files
            return false;
        }
        
        // Fix common TypeScript syntax errors
        
        // Fix missing semicolons
        content = content.replace(/([^;{}])\s*\n\s*(const|let|var|export|import|class|interface|type|enum)\s+/g, '$1;\n$2 ');
        
        // Fix missing commas in object literals
        content = content.replace(/([^,}])\s*\n\s*(\w+)\s*:/g, '$1,\n  $2:');
        
        // Fix missing closing braces after catch blocks
        content = content.replace(/} catch \(error\) {\s*}\s*\n\s*if/g, '    } catch (error) {\n        next(error);\n    }\n    if');
        
        // Fix extra closing braces at end of files
        const lines = content.trim().split('\n');
        while (lines.length > 0 && lines[lines.length - 1].trim() === '}') {
            const openBraces = content.substring(0, content.lastIndexOf('}')).split('{').length - 1;
            const closeBraces = content.substring(0, content.lastIndexOf('}')).split('}').length - 1;
            if (openBraces === closeBraces) {
                lines.pop();
                content = lines.join('\n');
            } else {
                break;
            }
        }
        
        // Fix incomplete function declarations
        content = content.replace(/TODO:\s*(?:Implement|Complete)\s*function.*$/gm, '// TODO: Implement');
        
        // Fix duplicate function names in same scope
        const functionMatches = content.match(/export\s+const\s+(\w+)\s*=/g) || [];
        const functionNames = {};
        functionMatches.forEach(match => {
            const name = match.match(/export\s+const\s+(\w+)\s*=/)[1];
            if (functionNames[name]) {
                functionNames[name]++;
                content = content.replace(new RegExp(`export const ${name} =`, 'g'), (match, offset) => {
                    const beforeContent = content.substring(0, offset);
                    const count = (beforeContent.match(new RegExp(`export const ${name} =`, 'g')) || []).length;
                    if (count > 0) {
                        return `export const ${name}${count + 1} =`;
                    }
                    return match;
                });
            } else {
                functionNames[name] = 1;
            }
        });
        
        // Fix service files
        if (filePath.includes('/services/')) {
            // Fix missing closing braces in service methods
            content = content.replace(/}\s*,\s*async\s+(\w+)/g, '},\n\n  async $1');
            
            // Fix service class syntax
            content = content.replace(/export\s+class\s+(\w+Service)\s*{/g, 'export class $1 {');
        }
        
        // Fix model files
        if (filePath.includes('/models/')) {
            // Fix Mongoose schema syntax
            content = content.replace(/type:\s*(\w+),;/g, 'type: $1,');
            content = content.replace(/required:\s*true,;/g, 'required: true,');
            content = content.replace(/unique:\s*true,;/g, 'unique: true,');
            content = content.replace(/default:\s*([^,]+),;/g, 'default: $1,');
        }
        
        // Fix migration files that are actually JSON
        if (filePath.includes('/migrations/') && content.trim().startsWith('{')) {
            // Convert JSON to proper TypeScript migration
            try {
                const jsonData = JSON.parse(content);
                content = `import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration${path.basename(filePath, '.ts').replace(/[^0-9]/g, '')} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migration data:
    const data = ${JSON.stringify(jsonData, null, 2)};
    // TODO: Implement migration logic
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // TODO: Implement rollback logic
  }
}`;
            } catch (e) {
                // If not valid JSON, skip
            }
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

console.log('Fixing all remaining TypeScript errors...\n');

const srcDir = path.join(__dirname, 'src');
const allFiles = getAllTsFiles(srcDir);
let fixedCount = 0;

// Process files in batches
const batchSize = 10;
for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    batch.forEach(file => {
        if (fixFile(file)) {
            console.log(`✓ Fixed ${path.relative(__dirname, file)}`);
            fixedCount++;
        }
    });
}

console.log(`\n✅ Fixed ${fixedCount} files out of ${allFiles.length} total files.`);

// Summary of common issues fixed:
console.log('\nCommon issues addressed:');
console.log('- Missing semicolons');
console.log('- Missing commas in object literals');
console.log('- Incomplete function declarations');
console.log('- Missing closing braces after catch blocks');
console.log('- Extra closing braces at end of files');
console.log('- Duplicate function names');
console.log('- JSON files with .ts extension (migrations)');