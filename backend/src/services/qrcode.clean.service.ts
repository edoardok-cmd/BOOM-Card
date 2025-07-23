import QRCode from 'qrcode';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

export interface QRCodeData {
  userId: string;
  discountCode: string;
  businessId: string;
  businessName: string;
  discountPercentage: number;
  expiresAt: Date;
  metadata: {
    generatedAt: Date;
    qrCodeId: string;
    campaignId?: string;
    customMessage?: string;
  };
}

export interface QRCodeOptions {
  width?: number;
  height?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface GeneratedQRCode {
  qrCodeId: string;
  dataUrl: string;
  filePath?: string;
  discountCode: string;
  expiresAt: Date;
  redemptionUrl: string;
}

export class QRCodeService {
  private readonly baseRedemptionUrl: string;
  private readonly qrCodeDirectory: string;
  
  constructor() {
    this.baseRedemptionUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    this.qrCodeDirectory = path.join(__dirname, '../../uploads/qr-codes');
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.qrCodeDirectory);
    } catch (error) {
      await fs.mkdir(this.qrCodeDirectory, { recursive: true });
    }
  }

  /**
   * Generate a unique discount code
   */
  private generateDiscountCode(businessName: string): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    const businessCode = businessName.substring(0, 3).toUpperCase();
    return `${businessCode}-${timestamp}-${random}`;
  }

  /**
   * Generate a unique QR code ID
   */
  private generateQRCodeId(): string {
    return `qr_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Create QR code data payload
   */
  private createQRCodeData(params: {
    userId: string;
    businessId: string;
    businessName: string;
    discountPercentage: number;
    expirationHours?: number;
    campaignId?: string;
    customMessage?: string;
  }): QRCodeData {
    const qrCodeId = this.generateQRCodeId();
    const discountCode = this.generateDiscountCode(params.businessName);
    const expiresAt = new Date(Date.now() + (params.expirationHours || 24) * 60 * 60 * 1000);

    return {
      userId: params.userId,
      discountCode,
      businessId: params.businessId,
      businessName: params.businessName,
      discountPercentage: params.discountPercentage,
      expiresAt,
      metadata: {
        generatedAt: new Date(),
        qrCodeId,
        campaignId: params.campaignId,
        customMessage: params.customMessage
      }
    };
  }

  /**
   * Generate QR code as data URL
   */
  async generateQRCodeDataUrl(
    data: QRCodeData,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const defaultOptions = {
      width: 300,
      height: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M' as const,
      ...options
    };

    const redemptionUrl = `${this.baseRedemptionUrl}/redeem/${data.metadata.qrCodeId}`;
    const qrData = JSON.stringify({
      qrCodeId: data.metadata.qrCodeId,
      discountCode: data.discountCode,
      businessId: data.businessId,
      businessName: data.businessName,
      discountPercentage: data.discountPercentage,
      expiresAt: data.expiresAt.toISOString(),
      redemptionUrl
    });

    try {
      const dataUrl = await QRCode.toDataURL(qrData, defaultOptions);
      return dataUrl;
    } catch (error) {
      console.error('Error generating QR code data URL:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code and save to file
   */
  async generateQRCodeFile(
    data: QRCodeData,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const fileName = `qr_${data.metadata.qrCodeId}.png`;
    const filePath = path.join(this.qrCodeDirectory, fileName);

    const defaultOptions = {
      width: 300,
      height: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M' as const,
      ...options
    };

    const redemptionUrl = `${this.baseRedemptionUrl}/redeem/${data.metadata.qrCodeId}`;
    const qrData = JSON.stringify({
      qrCodeId: data.metadata.qrCodeId,
      discountCode: data.discountCode,
      businessId: data.businessId,
      businessName: data.businessName,
      discountPercentage: data.discountPercentage,
      expiresAt: data.expiresAt.toISOString(),
      redemptionUrl
    });

    try {
      await QRCode.toFile(filePath, qrData, defaultOptions);
      return filePath;
    } catch (error) {
      console.error('Error generating QR code file:', error);
      throw new Error('Failed to generate QR code file');
    }
  }

  /**
   * Generate complete QR code with both data URL and file
   */
  async generateQRCode(params: {
    userId: string;
    businessId: string;
    businessName: string;
    discountPercentage: number;
    expirationHours?: number;
    campaignId?: string;
    customMessage?: string;
    saveToFile?: boolean;
    qrOptions?: QRCodeOptions;
  }): Promise<GeneratedQRCode> {
    try {
      // Create QR code data
      const qrCodeData = this.createQRCodeData(params);

      // Generate data URL
      const dataUrl = await this.generateQRCodeDataUrl(qrCodeData, params.qrOptions);

      // Generate file if requested
      let filePath: string | undefined;
      if (params.saveToFile) {
        filePath = await this.generateQRCodeFile(qrCodeData, params.qrOptions);
      }

      const redemptionUrl = `${this.baseRedemptionUrl}/redeem/${qrCodeData.metadata.qrCodeId}`;

      return {
        qrCodeId: qrCodeData.metadata.qrCodeId,
        dataUrl,
        filePath,
        discountCode: qrCodeData.discountCode,
        expiresAt: qrCodeData.expiresAt,
        redemptionUrl
      };
    } catch (error) {
      console.error('Error in generateQRCode:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Validate QR code data
   */
  validateQRCode(qrData: string): { isValid: boolean; data?: any; error?: string } {
    try {
      const parsed = JSON.parse(qrData);
      
      const requiredFields = ['qrCodeId', 'discountCode', 'businessId', 'discountPercentage', 'expiresAt'];
      const missingFields = requiredFields.filter(field => !parsed[field]);
      
      if (missingFields.length > 0) {
        return {
          isValid: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        };
      }

      const expiresAt = new Date(parsed.expiresAt);
      if (expiresAt < new Date()) {
        return {
          isValid: false,
          error: 'QR code has expired'
        };
      }

      return {
        isValid: true,
        data: parsed
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid QR code format'
      };
    }
  }

  /**
   * Create redemption URL for a QR code
   */
  createRedemptionUrl(qrCodeId: string): string {
    return `${this.baseRedemptionUrl}/redeem/${qrCodeId}`;
  }

  /**
   * Generate batch QR codes for multiple businesses
   */
  async generateBatchQRCodes(params: {
    userId: string;
    businesses: Array<{
      businessId: string;
      businessName: string;
      discountPercentage: number;
    }>;
    expirationHours?: number;
    campaignId?: string;
    qrOptions?: QRCodeOptions;
  }): Promise<GeneratedQRCode[]> {
    const results: GeneratedQRCode[] = [];

    for (const business of params.businesses) {
      try {
        const qrCode = await this.generateQRCode({
          userId: params.userId,
          businessId: business.businessId,
          businessName: business.businessName,
          discountPercentage: business.discountPercentage,
          expirationHours: params.expirationHours,
          campaignId: params.campaignId,
          saveToFile: true,
          qrOptions: params.qrOptions
        });
        results.push(qrCode);
      } catch (error) {
        console.error(`Failed to generate QR code for business ${business.businessId}:`, error);
        // Continue with other businesses even if one fails
      }
    }

    return results;
  }

  /**
   * Get QR code statistics
   */
  async getQRCodeStats(): Promise<{
    totalGenerated: number;
    activeCount: number;
    expiredCount: number;
    diskUsage: string;
  }> {
    try {
      const files = await fs.readdir(this.qrCodeDirectory);
      const qrFiles = files.filter(file => file.startsWith('qr_') && file.endsWith('.png'));
      
      let totalSize = 0;
      for (const file of qrFiles) {
        const filePath = path.join(this.qrCodeDirectory, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }

      const diskUsage = `${(totalSize / 1024 / 1024).toFixed(2)} MB`;

      return {
        totalGenerated: qrFiles.length,
        activeCount: qrFiles.length, // Would need database to track active vs expired
        expiredCount: 0, // Would need database to track expired codes
        diskUsage
      };
    } catch (error) {
      console.error('Error getting QR code stats:', error);
      return {
        totalGenerated: 0,
        activeCount: 0,
        expiredCount: 0,
        diskUsage: '0 MB'
      };
    }
  }
}

export default QRCodeService;