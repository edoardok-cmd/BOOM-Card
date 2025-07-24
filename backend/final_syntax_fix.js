const fs = require('fs');
const path = require('path');

// Manual fixes for specific problematic files
const manualFixes = {
    'src/controllers/category.controller.ts': function(content) {
        // Fix duplicated 'next' calls
        content = content.replace(/,\s*nextnext\)/g, ',\n    next)');
        content = content.replace(/nextnexterror/g, 'next(error');
        
        // Fix duplicate export const asyncHandler
        let count = 0;
        content = content.replace(/export const asyncHandler = /g, (match) => {
            count++;
            switch(count) {
                case 1: return 'export const authenticateUser = ';
                case 2: return 'export const authorizeAdmin = ';
                case 3: return 'export const validateCreateCategoryInput = ';
                case 4: return 'export const validateUpdateCategoryInput = ';
                case 5: return 'export const validateCategoryId = ';
                default: return match;
            }
        });
        
        // Fix missing user declaration
        content = content.replace(/if \(!user \|\|/g, 'const user = (req as any).user;\n    if (!user ||');
        
        return content;
    },
    
    'src/controllers/discount.controller.ts': function(content) {
        // Fix nextnexterror
        content = content.replace(/nextnexterror/g, 'next(error');
        
        return content;
    },
    
    'src/controllers/index.ts': function(content) {
        // Fix nextnext
        content = content.replace(/,\s*nextnext/g, ',\n        next');
        
        // Fix duplicate type definitions
        content = content.replace(/type AsyncFunction = \(req: RequestWithUser/g, 'type AuthenticatedAsyncFunction = (req: RequestWithUser');
        
        return content;
    },
    
    'src/controllers/pos.controller.ts': function(content) {
        // Fix forfor
        content = content.replace(/forforconst/g, 'for (const');
        
        // Fix duplicate method names
        content = content.replace(/static refundTransaction = async/g, function(match, offset, string) {
            const before = string.substring(0, offset);
            const count = (before.match(/static refundTransaction = async/g) || []).length;
            
            switch(count) {
                case 0: return 'static processTransaction = async';
                case 1: return match; // Keep refundTransaction
                case 2: return 'static voidTransaction = async';
                case 3: return 'static getTransaction = async';
                case 4: return 'static getTransactionsList = async';
                case 5: return 'static getTransactionSummary = async';
                default: return match;
            }
        });
        
        // Fix duplicate function exports
        content = content.replace(/refundPaymentrefundPayment/g, 'refundPayment:');
        content = content.replace(/voidPaymentvoidPayment/g, 'voidPayment:');
        content = content.replace(/sendErrorResponsesendErrorResponse/g, 'sendErrorResponse(');
        
        return content;
    },
    
    'src/server-ts.ts': function(content) {
        // Fix duplicate property names
        content = content.replace(/credentialscredentials/g, 'credentials:');
        content = content.replace(/standardHeadersstandardHeaders/g, 'standardHeaders:');
        
        return content;
    },
    
    'src/services/audit-logger.service.ts': function(content) {
        // Fix missing semicolons and colons
        content = content.replace(/severityseverity/g, 'severity:');
        content = content.replace(/countcount/g, 'count:');
        content = content.replace(/totalCounttotalCount/g, 'totalCount:');
        content = content.replace(/dailyActivitiesdailyActivities/g, 'dailyActivities:');
        content = content.replace(/sessionIdsessionId/g, 'sessionId:');
        
        // Fix missing closing braces
        content = content.replace(/this\.logger\.error\('Failed to flush audit queue', err\)\s*\n/g, 
                                  'this.logger.error(\'Failed to flush audit queue\', err);\n    })');
        
        return content;
    },
    
    'src/controllers/admin.controller.ts': function(content) {
        // Fix function declaration inside function
        content = content.replace(/const asyncHandler = \(fn: AsyncFunction\) => \{\s*\n\s*const product/g, 
                                  'const updateProductStock = async (productId: mongoose.Types.ObjectId, quantity: number) => {\n      const product');
        
        // Add missing closing brace after the product stock update function
        content = content.replace(/(throw new CustomError\(`Product with ID.*\);\s*\n\s*}\s*\n)(\s*if \(status === 'Shipped')/g, 
                                  '$1    };\n$2');
        
        return content;
    },
    
    'src/controllers/auth.controller.ts': function(content) {
        // Remove extra semicolon
        content = content.replace(/};;/g, '};');
        
        return content;
    }
};

// Process files
console.log('Applying final manual syntax fixes...\n');

Object.entries(manualFixes).forEach(([filePath, fixFunction]) => {
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
        try {
            let content = fs.readFileSync(fullPath, 'utf8');
            const originalContent = content;
            
            content = fixFunction(content);
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`✓ Fixed ${filePath}`);
            } else {
                console.log(`  No changes needed for ${filePath}`);
            }
        } catch (error) {
            console.error(`✗ Error fixing ${filePath}:`, error.message);
        }
    }
});

// Fix worker files with import issues
const workerFiles = ['src/workers/email.worker.ts', 'src/workers/cleanup.worker.ts'];

workerFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
        try {
            let content = fs.readFileSync(fullPath, 'utf8');
            const originalContent = content;
            
            // Fix import syntax
            content = content.replace(/^import\s+\{$/gm, 'import {');
            content = content.replace(/^import\s+$/gm, 'import');
            
            // Ensure imports are properly closed
            const lines = content.split('\n');
            let inImport = false;
            let importStart = -1;
            
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].match(/^import\s*{/) && !lines[i].includes('}')) {
                    inImport = true;
                    importStart = i;
                } else if (inImport && lines[i].includes('from')) {
                    // Check if we need to add closing brace
                    if (!lines[i].includes('}')) {
                        lines[i] = '} ' + lines[i];
                    }
                    inImport = false;
                }
            }
            
            content = lines.join('\n');
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`✓ Fixed ${filePath}`);
            }
        } catch (error) {
            console.error(`✗ Error fixing ${filePath}:`, error.message);
        }
    }
});

console.log('\n✅ Final manual fixes complete!');