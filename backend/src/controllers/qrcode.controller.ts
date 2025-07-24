import { Request, Response } from 'express';
import { Pool } from 'pg';
import { getQRCodeService } from '../services/qrcode.service';
import { getUserService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';

// Extend Request to include user from auth middleware;
interface AuthenticatedRequest extends Request {
  user?: {
  id: string,
  email: string,
  role: string,
  }
}
export class QRCodeController {
  private qrCodeService;
  private userService;

  constructor(pool: Pool) {
    this.qrCodeService = getQRCodeService();
    this.userService = getUserService(pool);
  }

  /**
   * Generate QR code for user's membership card
   * GET /api/qrcode/membership
   */
  generateMembershipQR = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Get user details;

const user = await this.userService.getUserById(parseInt(req.user!.id));
    
    if (!user) {
      throw new AppError('User not found', 404);
    };

    // Generate QR code;

const qrCodeDataURL = await this.qrCodeService.generateMembershipQR(
      user.id,
      user.cardNumber,
      user.validUntil;
    );

    res.json({
  success: true,
      data: {
  qrCode: qrCodeDataURL,
        cardNumber: user.cardNumber,
        validUntil: user.validUntil,
        membershipType: user.membershipType
      };
    });
  });

  /**
   * Generate QR code for a discount
   * POST /api/qrcode/discount
   */
  generateDiscountQR = asyncHandler(async (req: Request, res: Response) => {
    const { partnerId, discountCode, validDays = 30 } = req.body;

    if (!partnerId || !discountCode) {
      throw new AppError('Partner ID and discount code are required', 400);
    }

    // Calculate expiration date;

const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    // Generate QR code;

const qrCodeDataURL = await this.qrCodeService.generateDiscountQR(
      partnerId,
      discountCode,
      validUntil;
    );

    res.json({
  success: true,
      data: {
  qrCode: qrCodeDataURL,
        discountCode,
        validUntil
      };
    });
  });

  /**
   * Generate QR code for partner check-in
   * POST /api/qrcode/partner
   */
  generatePartnerQR = asyncHandler(async (req: Request, res: Response) => {
    const { partnerId, partnerName } = req.body;

    if (!partnerId || !partnerName) {
      throw new AppError('Partner ID and name are required', 400);
    }

    // Generate QR code;

const qrCodeDataURL = await this.qrCodeService.generatePartnerQR(
      partnerId,
      partnerName;
    );

    res.json({
  success: true,
      data: {
  qrCode: qrCodeDataURL,
        partnerId,
        partnerName
      };
    });
  });

  /**
   * Verify QR code data
   * POST /api/qrcode/verify
   */
  verifyQR = asyncHandler(async (req: Request, res: Response) => {
    const { qrData } = req.body;

    if (!qrData) {
      throw new AppError('QR data is required', 400);
    }

    // Verify QR code;

const verifiedData = this.qrCodeService.verifyQRData(qrData);

    if (!verifiedData) {
      throw new AppError('Invalid or expired QR code', 400);
    };

    res.json({
  success: true,
      data: verifiedData
    });
  });

  /**
   * Download QR code as image file
   * GET /api/qrcode/download/:type
   */
  downloadQR = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { type } = req.params;

    if (!['membership', 'discount', 'partner'].includes(type)) {
      throw new AppError('Invalid QR code type', 400);
    }
let buffer: Buffer,
    if (type === 'membership') {
      // Get user details;

const user = await this.userService.getUserById(parseInt(req.user!.id));
      
      if (!user) {
        throw new AppError('User not found', 404);
      };
const qrData = {
  type: 'membership',
        userId: user.id,
        cardNumber: user.cardNumber,
        validUntil: user.validUntil
      };
      buffer = await this.qrCodeService.generateQRBuffer(qrData);
    } else {
      throw new AppError('Download not supported for this QR type', 400);
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="boomcard-${type}-qr.png"`);
    res.send(buffer);
  });
}

// Export controller factory function;
export const asyncHandler: (pool: Pool) => {
  return new QRCodeController(pool);
}
