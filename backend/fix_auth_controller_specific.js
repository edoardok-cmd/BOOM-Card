const fs = require('fs');
const path = require('path');

// Fix auth.controller.ts specifically
const authControllerPath = path.join(__dirname, 'src/controllers/auth.controller.ts');

let content = fs.readFileSync(authControllerPath, 'utf8');

// Fix the broken import statement
content = content.replace(/import {\nimport { UserRole, UserStatus } from '\.\.\/enums\/user\.enum';/g, 
                         'import { UserRole, UserStatus } from \'../enums/user.enum\';\nimport {');

// Fix the missing import braces
content = content.replace(/} from '\.\.\/dtos\/auth\.dto';\n\n\/\/ 2\. All TypeScript interfaces and types/g,
                         '} from \'../dtos/auth.dto\';\n\n// 2. All TypeScript interfaces and types');

// Fix the class methods - they're missing method names
let methodCount = 0;
content = content.replace(/    : async \(req: Request, res: Response, next: NextFunction\): Promise<void> => {/g, () => {
    methodCount++;
    const methodNames = [
        'register',
        'login', 
        'verifyEmail',
        'resendVerification',
        'forgotPassword',
        'resetPassword',
        'changePassword',
        'refreshToken',
        'logout',
        'getProfile'
    ];
    const methodName = methodNames[methodCount - 1] || `method${methodCount}`;
    return `    ${methodName} = async (req: Request, res: Response, next: NextFunction): Promise<void> => {`;
});

fs.writeFileSync(authControllerPath, content, 'utf8');
console.log('Fixed auth.controller.ts');

// Fix pos.controller.ts
const posControllerPath = path.join(__dirname, 'src/controllers/pos.controller.ts');

if (fs.existsSync(posControllerPath)) {
    let posContent = fs.readFileSync(posControllerPath, 'utf8');
    
    // Fix the duplicate import
    posContent = posContent.replace(/import logger from '\.\.\/utils\/logger';\n/g, '');
    posContent = posContent.replace(/import { logger } from '\.\.\/utils\/logger';/g, 'import logger from \'../utils/logger\';');
    
    // Fix incomplete catch blocks
    posContent = posContent.replace(/} catch \(error\) {\s*}\s*}/g, '    } catch (error) {\n        next(error);\n    }\n}');
    
    // Fix the missing result declarations
    posContent = posContent.replace(/if \(result\.success\) {/g, (match, offset) => {
        const beforeText = posContent.substring(Math.max(0, offset - 200), offset);
        if (!beforeText.includes('const result =')) {
            return 'const result = await paymentService.refundPayment(transactionId, amount);\n\n        if (result.success) {';
        }
        return match;
    });
    
    // Fix void payment result
    posContent = posContent.replace(/if \(!transactionId\) {\s*return sendErrorResponse[^}]+}\s*if \(result\.success\)/g, 
                                   'if (!transactionId) {\n            return sendErrorResponse(res, 400, \'Transaction ID is required for void.\');\n        }\n        \n        const result = await paymentService.voidPayment(transactionId);\n        \n        if (result.success)');
    
    fs.writeFileSync(posControllerPath, posContent, 'utf8');
    console.log('Fixed pos.controller.ts');
}

// Fix category.controller.ts
const categoryControllerPath = path.join(__dirname, 'src/controllers/category.controller.ts');

if (fs.existsSync(categoryControllerPath)) {
    let categoryContent = fs.readFileSync(categoryControllerPath, 'utf8');
    
    // Fix duplicate updateCategory declarations
    categoryContent = categoryContent.replace(/const updatedCategory = await CategoryService\.updateCategory\(id, updateData\);\s*\n\s*const updatedCategory = await CategoryService\.updateCategory\(id, updateData\);/g,
                                            'const updatedCategory = await CategoryService.updateCategory(id, updateData);');
    
    // Fix the duplicate getAllCategories export
    categoryContent = categoryContent.replace(/export const getAllCategories = async \(req: Request, res: Response, next: NextFunction\) => {\s*try {\s*const { id } = req\.params;/g,
                                            'export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {\n    try {\n        const { id } = req.params;');
    
    fs.writeFileSync(categoryControllerPath, categoryContent, 'utf8');
    console.log('Fixed category.controller.ts');
}

console.log('Completed specific fixes.');