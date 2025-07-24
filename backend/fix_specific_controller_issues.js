const fs = require('fs');
const path = require('path');

// Specific fixes for controller files
function fixControllerIssues(content, filePath) {
    let fixed = content;
    
    if (filePath.includes('pos.controller.ts')) {
        // Fix malformed interfaces
        fixed = fixed.replace(/export interface AuthenticatedRequest extends Request \{\s*user\?: \{,/g, 
            'export interface AuthenticatedRequest extends Request {\n    user?: {');
        fixed = fixed.replace(/interface IBasePOSRequest \{,/g, 'interface IBasePOSRequest {');
        fixed = fixed.replace(/export interface IPurchaseRequest extends IBasePOSRequest \{,/g, 
            'export interface IPurchaseRequest extends IBasePOSRequest {');
        fixed = fixed.replace(/export interface IRefundRequest extends IBasePOSRequest \{,/g, 
            'export interface IRefundRequest extends IBasePOSRequest {');
        fixed = fixed.replace(/export interface IBalanceInquiryRequest extends IBasePOSRequest \{,/g, 
            'export interface IBalanceInquiryRequest extends IBasePOSRequest {');
        fixed = fixed.replace(/export interface IPOSTransactionResponse \{,/g, 
            'export interface IPOSTransactionResponse {');
        
        // Fix malformed const declarations
        fixed = fixed.replace(/export const POSResponseMessages = \{,/g, 'export const POSResponseMessages = {');
        fixed = fixed.replace(/export const HttpStatus = \{,/g, 'export const HttpStatus = {');
        
        // Fix interface properties with semicolons after commas
        fixed = fixed.replace(/id: string;,\s*$/gm, 'id: string,');
        fixed = fixed.replace(/email: string;,\s*$/gm, 'email: string,');
        fixed = fixed.replace(/merchantId: string; \/\/ Identifier for the merchant initiating the transaction,/g,
            'merchantId: string, // Identifier for the merchant initiating the transaction');
        fixed = fixed.replace(/terminalId: string; \/\/ Identifier for the POS terminal,/g,
            'terminalId: string, // Identifier for the POS terminal');
        fixed = fixed.replace(/transactionType: TransactionType; \/\/ The type of transaction being performed$/gm,
            'transactionType: TransactionType, // The type of transaction being performed');
        
        // Fix missing closing braces
        fixed = fixed.replace(/return res\.status\(400\)\.json\(\{,\s*success: false,/g, 
            'return res.status(400).json({\n                    success: false,');
        
        // Fix duplicate imports
        fixed = fixed.replace(/\/\/ Duplicate import removed: import { Request, Response, NextFunction } from 'express';/g, '');
        
        // Fix malformed objects in responses
        fixed = fixed.replace(/res\.status\(201\)\.json\(\{,\s*success: true,/g, 
            'res.status(201).json({\n                success: true,');
        fixed = fixed.replace(/res\.status\(200\)\.json\(\{,\s*success: true,/g, 
            'res.status(200).json({\n                success: true,');
        
        // Fix malformed semicolons in enums
        fixed = fixed.replace(/export enum TransactionType \{;/g, 'export enum TransactionType {');
        fixed = fixed.replace(/export enum TransactionStatus \{;/g, 'export enum TransactionStatus {');
        
        // Fix missing closing braces in interfaces
        fixed = fixed.replace(/interface PaymentRequest \{,/g, 'interface PaymentRequest {');
        fixed = fixed.replace(/interface PaymentServiceResult \{,/g, 'interface PaymentServiceResult {');
        fixed = fixed.replace(/interface PaymentResponse \{,/g, 'interface PaymentResponse {');
        fixed = fixed.replace(/interface OrderItem \{,/g, 'interface OrderItem {');
        fixed = fixed.replace(/interface OrderCreateRequest \{,/g, 'interface OrderCreateRequest {');
        fixed = fixed.replace(/interface OrderServiceResult \{,/g, 'interface OrderServiceResult {');
        fixed = fixed.replace(/interface OrderResponse \{,/g, 'interface OrderResponse {');
        fixed = fixed.replace(/interface RefundRequest \{,/g, 'interface RefundRequest {');
        fixed = fixed.replace(/interface VoidRequest \{,/g, 'interface VoidRequest {');
        
        // Fix malformed service object
        fixed = fixed.replace(/const paymentService = \{,/g, 'const paymentService = {');
        fixed = fixed.replace(/const orderService = \{,/g, 'const orderService = {');
        
        // Fix return statements
        fixed = fixed.replace(/return \{,\s*orderId:/g, 'return {\n            orderId:');
        
        // Fix missing closing braces and syntax
        fixed = fixed.replace(/}\s*}\s*}\s*$/, '}\n\nexport default PosController;');
    }
    
    if (filePath.includes('auth.controller.ts')) {
        // Fix malformed interfaces
        fixed = fixed.replace(/interface AuthenticatedRequest extends Request \{\s*user\?: \{,/g, 
            'interface AuthenticatedRequest extends Request {\n  user?: {');
        fixed = fixed.replace(/interface JWTPayload \{,/g, 'interface JWTPayload {');
        
        // Fix malformed object properties
        fixed = fixed.replace(/id: string;,\s*$/gm, 'id: string,');
        fixed = fixed.replace(/role: UserRole;,\s*$/gm, 'role: UserRole,');
        fixed = fixed.replace(/status: UserStatus;,\s*$/gm, 'status: UserStatus,');
        
        // Fix response objects
        fixed = fixed.replace(/res\.cookie\('refreshToken', result\.refreshToken, \{,/g, 
            "res.cookie('refreshToken', result.refreshToken, {");
        fixed = fixed.replace(/res\.status\(201\)\.json\(\{,/g, 'res.status(201).json({');
        fixed = fixed.replace(/res\.status\(200\)\.json\(\{,/g, 'res.status(200).json({');
        
        // Fix formatUserResponse
        fixed = fixed.replace(/return \{,\s*id: user\.id,/g, 'return {\n        id: user.id,');
        
        // Fix cookie clearing
        fixed = fixed.replace(/res\.clearCookie\('refreshToken', \{,/g, "res.clearCookie('refreshToken', {");
    }
    
    if (filePath.includes('admin.controller.ts')) {
        // Fix malformed interfaces
        fixed = fixed.replace(/interface AuthenticatedAdminRequest extends Request \{\s*user\?: \{,/g, 
            'interface AuthenticatedAdminRequest extends Request {\n  user?: {');
        fixed = fixed.replace(/interface ICreateUserByAdminDto \{,/g, 'interface ICreateUserByAdminDto {');
        fixed = fixed.replace(/interface IUpdateUserByAdminDto \{,/g, 'interface IUpdateUserByAdminDto {');
        fixed = fixed.replace(/interface IManageProductDto \{,/g, 'interface IManageProductDto {');
        fixed = fixed.replace(/interface IUpdateTransactionStatusDto \{,/g, 'interface IUpdateTransactionStatusDto {');
        
        // Fix response objects
        fixed = fixed.replace(/res\.status\(200\)\.json\(\{,/g, 'res.status(200).json({');
        
        // Fix aggregate pipeline
        fixed = fixed.replace(/\$match: \{,\s*orderStatus: 'Delivered'/g, '$match: {\n          orderStatus: \'Delivered\'');
        fixed = fixed.replace(/\$group: \{,\s*_id: null,/g, '$group: {\n          _id: null,');
        fixed = fixed.replace(/\$group: \{,\s*_id: '\$orderStatus',/g, '$group: {\n          _id: \'$orderStatus\',');
        fixed = fixed.replace(/\$project: \{,\s*_id: 0,/g, '$project: {\n          _id: 0,');
    }
    
    if (filePath.includes('category.controller.ts')) {
        // Fix malformed interfaces
        fixed = fixed.replace(/export interface ICategory \{,/g, 'export interface ICategory {');
        fixed = fixed.replace(/export interface CreateCategoryBody \{,/g, 'export interface CreateCategoryBody {');
        
        // Fix interface properties
        fixed = fixed.replace(/id: string; \/\/ Using UUIDs for IDs,/g, 'id: string, // Using UUIDs for IDs');
        fixed = fixed.replace(/is_active: boolean; \/\/ Flag to indicate if the category is active,/g, 
            'is_active: boolean, // Flag to indicate if the category is active');
        fixed = fixed.replace(/created_at: Date;,/g, 'created_at: Date,');
        fixed = fixed.replace(/updated_at: Date;,/g, 'updated_at: Date,');
        
        // Fix malformed const declarations
        fixed = fixed.replace(/const categorySchema = Joi\.object\(\{,/g, 'const categorySchema = Joi.object({');
        fixed = fixed.replace(/const categoryUpdateSchema = Joi\.object\(\{,/g, 'const categoryUpdateSchema = Joi.object({');
        
        // Fix response objects
        fixed = fixed.replace(/res\.status\(HttpStatus\.CREATED\)\.json\(\{,/g, 'res.status(HttpStatus.CREATED).json({');
        fixed = fixed.replace(/res\.status\(HttpStatus\.OK\)\.json\(\{,/g, 'res.status(HttpStatus.OK).json({');
    }
    
    if (filePath.includes('database.cloud.ts')) {
        // Fix malformed interfaces
        fixed = fixed.replace(/export interface CloudProvider \{,/g, 'export interface CloudProvider {');
        
        // Fix object literals
        fixed = fixed.replace(/const postgresProviders: CloudProvider\[\] = \[\s*\{,/g, 
            'const postgresProviders: CloudProvider[] = [\n  {');
        fixed = fixed.replace(/configure: \(url: string\) => \(\{,/g, 'configure: (url: string) => ({');
        fixed = fixed.replace(/ssl: \{,\s*rejectUnauthorized: false/g, 'ssl: {\n        rejectUnauthorized: false');
        
        // Fix missing closing braces and fix structure
        fixed = fixed.replace(/export default \{,/g, 'export default {');
        
        // Remove duplicate closing braces at end
        fixed = fixed.replace(/}\s*}\s*$/, '}');
    }
    
    return fixed;
}

// Process files
const filesToFix = [
    'src/controllers/pos.controller.ts',
    'src/controllers/auth.controller.ts',
    'src/controllers/admin.controller.ts',
    'src/controllers/category.controller.ts',
    'src/config/database.cloud.ts'
];

let fixedCount = 0;

filesToFix.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const fixed = fixControllerIssues(content, fullPath);
            
            if (fixed !== content) {
                fs.writeFileSync(fullPath, fixed, 'utf8');
                console.log(`✅ Fixed ${file}`);
                fixedCount++;
            } else {
                console.log(`⏭️  No changes needed for ${file}`);
            }
        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
        }
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

console.log(`\n✅ Total files fixed: ${fixedCount}`);