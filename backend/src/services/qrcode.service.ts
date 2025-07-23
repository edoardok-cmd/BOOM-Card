import QRCode from 'qrcode';
import { AppError } from '../utils/appError';

export interface QRCodeData {
  type: 'membership' | 'discount' | 'partner';
  userId?: number;
  cardNumber?: string;
  partnerId?: string;
  discountCode?: string;
  validUntil?: Date;
}

export class QRCodeService {
  /**
   * Generate QR code for membership card
   */
  async generateMembershipQR(userId: number, cardNumber: string, validUntil: Date): Promise<string> {
    try {
      const qrData: QRCodeData = {
        type: 'membership',
        userId,
        cardNumber,
        validUntil
      };

      // Generate QR code as base64 data URL
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 400
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Failed to generate membership QR code:', error);
      throw new AppError('Failed to generate QR code', 500);
    }
  }

  /**
   * Generate QR code for discount
   */
  async generateDiscountQR(partnerId: string, discountCode: string, validUntil?: Date): Promise<string> {
    try {
      const qrData: QRCodeData = {
        type: 'discount',
        partnerId,
        discountCode,
        validUntil
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 300
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Failed to generate discount QR code:', error);
      throw new AppError('Failed to generate QR code', 500);
    }
  }

  /**
   * Generate QR code for partner check-in
   */
  async generatePartnerQR(partnerId: string, partnerName: string): Promise<string> {
    try {
      const qrData = {
        type: 'partner',
        partnerId,
        partnerName,
        timestamp: new Date().toISOString()
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'L',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 250
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Failed to generate partner QR code:', error);
      throw new AppError('Failed to generate QR code', 500);
    }
  }

  /**
   * Generate QR code as buffer (for direct file saving)
   */
  async generateQRBuffer(data: any): Promise<Buffer> {
    try {
      const buffer = await QRCode.toBuffer(JSON.stringify(data), {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 400
      });

      return buffer;
    } catch (error) {
      console.error('Failed to generate QR code buffer:', error);
      throw new AppError('Failed to generate QR code', 500);
    }
  }

  /**
   * Verify QR code data
   */
  verifyQRData(qrDataString: string): QRCodeData | null {
    try {
      const data = JSON.parse(qrDataString) as QRCodeData;
      
      // Basic validation
      if (!data.type || !['membership', 'discount', 'partner'].includes(data.type)) {
        return null;
      }

      // Check expiration if applicable
      if (data.validUntil && new Date(data.validUntil) < new Date()) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Invalid QR code data:', error);
      return null;
    }
  }
}

// Export singleton instance
let qrCodeServiceInstance: QRCodeService;

export const getQRCodeService = (): QRCodeService => {
  if (!qrCodeServiceInstance) {
    qrCodeServiceInstance = new QRCodeService();
  }
  return qrCodeServiceInstance;
};