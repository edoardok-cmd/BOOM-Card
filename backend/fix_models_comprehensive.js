const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Fix Category.ts specific issues
        if (filePath.includes('Category.ts')) {
            // Fix the aggregate array syntax
            content = content.replace(/const result = await this\.aggregate\(\[ \$match:/g, 
                                     'const result = await this.aggregate([\n    { $match:');
            
            // Fix missing braces in aggregation
            content = content.replace(/},\s*{ \$unwind:/g, '},\n    },\n    { $unwind:');
            content = content.replace(/},\s*{ \$sort:/g, '},\n    },\n    { $sort:');
            content = content.replace(/},\s*{ \$replaceRoot:/g, '},\n    },\n    { $replaceRoot:');
            content = content.replace(/},\s*{ \$project:/g, '},\n    },\n    { $project:');
            
            // Fix missing aggregate closing brace
            content = content.replace(/{ \$graphLookup: {([^}]+)},\s*{ \$unwind:/g, 
                                     '{ $graphLookup: {$1\n      }\n    },\n    { $unwind:');
            
            // Remove extra closing braces at the end
            content = content.replace(/}\s*\n\s*}\s*No newline at end of file$/g, '');
            content = content.replace(/}\s*\n\s*}\s*$/g, '}');
            
            // Fix missing closing parenthesis
            content = content.replace(/{ \$project: { __v: 0, createdAt: 0, updatedAt: 0 } }\s*No newline at end of file\s*\]\);/g,
                                     '{ $project: { __v: 0, createdAt: 0, updatedAt: 0 } }\n  ]);');
        }
        
        // Fix Analytics.ts issues
        if (filePath.includes('Analytics.ts')) {
            // Fix the semicolon placement issues
            content = content.replace(/type: Schema\.Types\.ObjectId,;/g, 'type: Schema.Types.ObjectId,');
            content = content.replace(/type: String,;/g, 'type: String,');
            content = content.replace(/trim: true,;/g, 'trim: true,');
            content = content.replace(/type: Schema\.Types\.Mixed,/g, 'type: Schema.Types.Mixed,');
            
            // Fix missing closing braces
            if (!content.endsWith('export default Analytics;')) {
                content = content.replace(/}\s*$/, '});\n\nconst Analytics = model<IAnalyticsEventDocument, IAnalyticsEventModel>(\'AnalyticsEvent\', AnalyticsEventSchema);\n\nexport default Analytics;');
            }
        }
        
        // Fix common TypeORM decorator issues in all models
        content = content.replace(/type: 'enum',;/g, 'type: \'enum\',');
        content = content.replace(/default: TransactionCategoryType\.GENERAL,;/g, 'default: TransactionCategoryType.GENERAL,');
        
        // Fix mongoose schema definition issues
        content = content.replace(/required: \[true, '([^']+)'\],/g, 'required: [true, \'$1\'],');
        content = content.replace(/unique: true,/g, 'unique: true,');
        content = content.replace(/minlength: \[(\d+), '([^']+)'\],;/g, 'minlength: [$1, \'$2\'],');
        content = content.replace(/trim: true,;/g, 'trim: true,');
        content = content.replace(/timestamps: true,/g, 'timestamps: true,');
        
        // Fix type declaration semicolons
        content = content.replace(/userId\?: string;/g, 'userId?: string;');
        content = content.replace(/type: Boolean,;/g, 'type: Boolean,');
        content = content.replace(/ref: 'Category',;/g, 'ref: \'Category\',');
        content = content.replace(/ref: 'User',/g, 'ref: \'User\',');
        content = content.replace(/from: 'categories',;/g, 'from: \'categories\',');
        content = content.replace(/as: 'ancestors',;/g, 'as: \'ancestors\',');
        content = content.replace(/as: 'descendants',;/g, 'as: \'descendants\',');
        content = content.replace(/connectFromField: '([^']+)',;/g, 'connectFromField: \'$1\',');
        
        // Fix Notification.ts specific issues
        if (filePath.includes('Notification.ts')) {
            // Fix missing commas in object definitions
            content = content.replace(/}\s*(\w+\??\s*:)/g, '},\n  $1');
        }
        
        // Fix missing closing parenthesis after aggregation
        content = content.replace(/return this\.aggregate\(\[([^]]+)\]\);/g, (match, pipeline) => {
            // Count opening and closing braces in the pipeline
            const openBraces = (pipeline.match(/{/g) || []).length;
            const closeBraces = (pipeline.match(/}/g) || []).length;
            
            if (openBraces > closeBraces) {
                const missingBraces = openBraces - closeBraces;
                let fixedPipeline = pipeline;
                for (let i = 0; i < missingBraces; i++) {
                    fixedPipeline += '\n    }';
                }
                return `return this.aggregate([${fixedPipeline}\n  ]);`;
            }
            return match;
        });
        
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

console.log('Running comprehensive model fixes...\n');

const modelsDir = path.join(__dirname, 'src/models');
const allFiles = getAllModelFiles(modelsDir);
let fixedCount = 0;

// Fix each file
allFiles.forEach(file => {
    if (fixFile(file)) {
        console.log(`✓ Fixed ${path.relative(__dirname, file)}`);
        fixedCount++;
    }
});

console.log(`\n✅ Fixed ${fixedCount} files out of ${allFiles.length} total model files.`);