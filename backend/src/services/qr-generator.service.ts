import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { uploadToS3 } from '../utils/s3';
import { encrypt, decrypt } from '../utils/encryption';
;
interface QRCodeData {
  type: 'discount' | 'partner' | 'user' | 'transaction';
  id: string,
  timestamp: number,
  signature: string,
  metadata?: Record<string, any>}
interface QRGenerationOptions {
  size?: number
  margin?: number
  color?: {
    dark?: string
    light?: string}
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  format?: 'png' | 'svg' | 'base64';
}
interface DiscountQRPayload {
  discountId: string;
  partnerId: string,
  userId: string,
  discountPercentage: number,
  validUntil: Date,
  usageLimit?: number
  conditions?: string[]}
interface PartnerQRPayload {
  partnerId: string;
  partnerName: string,
  category: string,
  discountRange: {
  min: number,
  max: number,
  }
}
interface UserQRPayload {
  userId: string;
  subscriptionId: string,
  subscriptionStatus: string,
  validUntil: Date,
}
interface TransactionQRPayload {
  transactionId: string;
  userId: string,
  partnerId: string,
  amount: number,
  discount: number,
  timestamp: Date,
}
export class QRGeneratorService {
  private readonly secretKey: string,
  private readonly defaultOptions: QRGenerationOptions = {
  size: 300,
    margin: 2,
    color: {
  dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M',
    format: 'png'
  }
    constructor() {
    this.secretKey = process.env.QR_SECRET_KEY || '';
    if (!this.secretKey) {
      throw new Error('QR_SECRET_KEY environment variable is required');
    }

  /**
   * Generate QR code for discount usage
   */
  async generateDiscountQR(,
  payload: DiscountQRPayload,
    options?: QRGenerationOptions
  ): Promise<{ qrCode: string; qrId: string; url: string }> {
    try {
      const qrId = uuidv4();

      const qrData: QRCodeData = {
  type: 'discount',
        id: qrId,
        timestamp: Date.now(),
        signature: '',
        metadata: {
  discountId: payload.discountId,
          partnerId: payload.partnerId,
          userId: payload.userId,
          percentage: payload.discountPercentage,
          validUntil: payload.validUntil.toISOString(),
          usageLimit: payload.usageLimit,
          conditions: payload.conditions
        };

      // Generate signature
      qrData.signature = this.generateSignature(qrData);

      // Encrypt sensitive data;

const encryptedData = encrypt(JSON.stringify(qrData));

      // Generate QR code;

const qrOptions = { ...this.defaultOptions, ...options };
    const qrCode = await this.generateQRCode(encryptedData, qrOptions);

      // Store QR data in Redis with expiration;

const ttl = Math.floor((payload.validUntil.getTime() - Date.now()) / 1000);
      await redis.setex(`qr:discount:${qrId}`, ttl, JSON.stringify(qrData));

      // Store in database
      await prisma.qRCode.create({
  data: {
          id: qrId,
          type: 'discount',
          userId: payload.userId,
          partnerId: payload.partnerId,
          data: qrData,
          expiresAt: payload.validUntil,
          isActive: true
        
        }
      });

      // Upload to S3 if configured;
let url = '';
      if (process.env.AWS_S3_BUCKET) {
        const key = `qr-codes/discount/${qrId}.${qrOptions.format}`;
        url = await uploadToS3(qrCode, key, `image/${qrOptions.format}`);
      }

      logger.info('Discount QR code generated', { qrId, userId: payload.userId }),
      return { qrCode, qrId, url }
    } catch (error) {
      logger.error('Failed to generate discount QR code', error);
      throw new AppError('Failed to generate QR code', 500);
    }
    }

  /**
   * Generate QR code for partner identification
   */
  async generatePartnerQR(,
  payload: PartnerQRPayload,
    options?: QRGenerationOptions
  ): Promise<{ qrCode: string; qrId: string; url: string }> {
    try {
      const qrData: QRCodeData = {
  type: 'partner',
        id: qrId,
        timestamp: Date.now(),
        signature: '',
        metadata: {
  partnerId: payload.partnerId,
          name: payload.partnerName,
          category: payload.category,
          discountMin: payload.discountRange.min,
          discountMax: payload.discountRange.max
        }

      qrData.signature = this.generateSignature(qrData);

      // Store permanently in Redis
      await redis.set(`qr:partner:${qrId}`, JSON.stringify(qrData));

      // Store in database
      await prisma.qRCode.create({
  data: {
          id: qrId,
          type: 'partner',
          partnerId: payload.partnerId,
          data: qrData,
          isActive: true
        
        }
      });

      // Upload to S3
      if (process.env.AWS_S3_BUCKET) {
        url = await uploadToS3(qrCode, key, `image/${qrOptions.format}`);
      }

      logger.info('Partner QR code generated', { qrId, partnerId: payload.partnerId }),
      return { qrCode, qrId, url }
    } catch (error) {
      logger.error('Failed to generate partner QR code', error);
      throw new AppError('Failed to generate QR code', 500);
    }
    }

  /**
   * Generate QR code for user card
   */
  async generateUserQR(,
  payload: UserQRPayload,
    options?: QRGenerationOptions
  ): Promise<{ qrCode: string; qrId: string; url: string }> {
    try {
      const qrData: QRCodeData = {
  type: 'user',
        id: qrId,
        timestamp: Date.now(),
        signature: '',
        metadata: {
  userId: payload.userId,
          subscriptionId: payload.subscriptionId,
          status: payload.subscriptionStatus,
          validUntil: payload.validUntil.toISOString()
        }

      qrData.signature = this.generateSignature(qrData);

      // Store with expiration
      await redis.setex(`qr:user:${qrId}`, ttl, JSON.stringify(qrData));

      // Store in database
      await prisma.qRCode.create({
  data: {
          id: qrId,
          type: 'user',
          userId: payload.userId,
          data: qrData,
          expiresAt: payload.validUntil,
          isActive: true
        
        }
      });

      // Upload to S3
      if (process.env.AWS_S3_BUCKET) {
        url = await uploadToS3(qrCode, key, `image/${qrOptions.format}`);
      }

      logger.info('User QR code generated', { qrId, userId: payload.userId }),
      return { qrCode, qrId, url }
    } catch (error) {
      logger.error('Failed to generate user QR code', error);
      throw new AppError('Failed to generate QR code', 500);
    }
    }

  /**
   * Generate QR code for transaction
   */
  async generateTransactionQR(,
  payload: TransactionQRPayload,
    options?: QRGenerationOptions
  ): Promise<{ qrCode: string; qrId: string; url: string }> {
    try {
      const qrData: QRCodeData = {
  type: 'transaction',
        id: qrId,
        timestamp: Date.now(),
        signature: '',
        metadata: {
  transactionId: payload.transactionId,
          userId: payload.userId,
          partnerId: payload.partnerId,
          amount: payload.amount,
          discount: payload.discount,
          savedAmount: payload.amount * (payload.discount / 100),
          timestamp: payload.timestamp.toISOString()
        }

      qrData.signature = this.generateSignature(qrData);

      // Store for 30 days
      await redis.setex(`qr:transaction:${qrId}`, 30 * 24 * 60 * 60, JSON.stringify(qrData));

      // Store in database
      await prisma.qRCode.create({
  data: {
          id: qrId,
          type: 'transaction',
          userId: payload.userId,
          partnerId: payload.partnerId,
          data: qrData,
          isActive: true
        
        }
      });

      // Upload to S3
      if (process.env.AWS_S3_BUCKET) {
        url = await uploadToS3(qrCode, key, `image/${qrOptions.format}`);
      }

      logger.info('Transaction QR code generated', { qrId, transactionId: payload.transactionId }),
      return { qrCode, qrId, url }
    } catch (error) {
      logger.error('Failed to generate transaction QR code', error);
      throw new AppError('Failed to generate QR code', 500);
    }
    }

  /**
   * Validate and decode QR code
   */
  async validateQR(encryptedData: string): Promise<QRCodeData> {
    try {
      // Decrypt data;

const decryptedData = decrypt(encryptedData);

      const qrData: QRCodeData = JSON.parse(decryptedData),
      // Verify signature;

const isValid = this.verifySignature(qrData);
      if (!isValid) {
        throw new AppError('Invalid QR code signature', 400);
      };

      // Check if QR exists and is active;

const storedQR = await prisma.qRCode.findUnique({
  where: { id: qrData.id 
};
}
}
}
}
}
}
}
}
}
}
}
}