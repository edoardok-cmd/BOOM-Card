import { Request, Response } from 'express';
import QRCodeService from '../services/qrcode.clean.service';

// Extend Request to include user from authentication middleware
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const qrCodeService = new QRCodeService();

// Mock business data (would come from database in production)
const mockBusinesses = [
  {
    id: 'business_1',
    name: 'Pizza Palace',
    category: 'restaurant',
    defaultDiscount: 15
  },
  {
    id: 'business_2', 
    name: 'Fashion Store',
    category: 'retail',
    defaultDiscount: 20
  },
  {
    id: 'business_3',
    name: 'Coffee Corner',
    category: 'cafe',
    defaultDiscount: 10
  },
  {
    id: 'business_4',
    name: 'Gym Fitness',
    category: 'fitness',
    defaultDiscount: 25
  },
  {
    id: 'business_5',
    name: 'Book Store',
    category: 'retail',
    defaultDiscount: 12
  }
];

/**
 * Generate a single QR code for a specific business discount
 */
export const generateQRCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { businessId, businessName, discountPercentage, expirationHours, campaignId, customMessage, saveToFile } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User authentication required',
        error: 'UNAUTHORIZED' 
      });
      return;
    }

    if (!businessId || !businessName || !discountPercentage) {
      res.status(400).json({ 
        success: false, 
        message: 'Business ID, business name, and discount percentage are required',
        error: 'VALIDATION_ERROR' 
      });
      return;
    }

    if (discountPercentage < 1 || discountPercentage > 100) {
      res.status(400).json({ 
        success: false, 
        message: 'Discount percentage must be between 1 and 100',
        error: 'VALIDATION_ERROR' 
      });
      return;
    }

    const qrCode = await qrCodeService.generateQRCode({
      userId,
      businessId,
      businessName,
      discountPercentage: Number(discountPercentage),
      expirationHours: expirationHours ? Number(expirationHours) : 24,
      campaignId,
      customMessage,
      saveToFile: Boolean(saveToFile)
    });

    res.status(201).json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCodeId: qrCode.qrCodeId,
        discountCode: qrCode.discountCode,
        dataUrl: qrCode.dataUrl,
        redemptionUrl: qrCode.redemptionUrl,
        expiresAt: qrCode.expiresAt,
        filePath: qrCode.filePath
      }
    });

  } catch (error: any) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: 'INTERNAL_ERROR',
      details: error.message
    });
  }
};

/**
 * Generate batch QR codes for multiple businesses
 */
export const generateBatchQRCodes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { businesses, expirationHours, campaignId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User authentication required',
        error: 'UNAUTHORIZED' 
      });
      return;
    }

    if (!businesses || !Array.isArray(businesses) || businesses.length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'Businesses array is required and must not be empty',
        error: 'VALIDATION_ERROR' 
      });
      return;
    }

    // Validate each business in the array
    for (const business of businesses) {
      if (!business.businessId || !business.businessName || !business.discountPercentage) {
        res.status(400).json({ 
          success: false, 
          message: 'Each business must have businessId, businessName, and discountPercentage',
          error: 'VALIDATION_ERROR' 
        });
        return;
      }
    }

    const qrCodes = await qrCodeService.generateBatchQRCodes({
      userId,
      businesses,
      expirationHours: expirationHours ? Number(expirationHours) : 24,
      campaignId
    });

    res.status(201).json({
      success: true,
      message: `Generated ${qrCodes.length} QR codes successfully`,
      data: {
        count: qrCodes.length,
        qrCodes: qrCodes.map(qr => ({
          qrCodeId: qr.qrCodeId,
          discountCode: qr.discountCode,
          dataUrl: qr.dataUrl,
          redemptionUrl: qr.redemptionUrl,
          expiresAt: qr.expiresAt
        }))
      }
    });

  } catch (error: any) {
    console.error('Error generating batch QR codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate batch QR codes',
      error: 'INTERNAL_ERROR',
      details: error.message
    });
  }
};

/**
 * Validate a QR code
 */
export const validateQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      res.status(400).json({ 
        success: false, 
        message: 'QR data is required',
        error: 'VALIDATION_ERROR' 
      });
      return;
    }

    const validation = qrCodeService.validateQRCode(qrData);

    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid QR code',
        error: 'INVALID_QR_CODE',
        details: validation.error
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'QR code is valid',
      data: validation.data
    });

  } catch (error: any) {
    console.error('Error validating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate QR code',
      error: 'INTERNAL_ERROR',
      details: error.message
    });
  }
};

/**
 * Get available businesses for QR code generation
 */
export const getAvailableBusinesses = async (req: Request, res: Response): Promise<void> => {
  try {
    // In production, this would query the database for available partner businesses
    res.status(200).json({
      success: true,
      message: 'Retrieved available businesses',
      data: {
        businesses: mockBusinesses,
        total: mockBusinesses.length
      }
    });

  } catch (error: any) {
    console.error('Error getting available businesses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available businesses',
      error: 'INTERNAL_ERROR',
      details: error.message
    });
  }
};

/**
 * Generate QR code for a predefined business with default discount
 */
export const generateBusinessQRCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { businessId } = req.params;
    const { customDiscount, expirationHours, campaignId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User authentication required',
        error: 'UNAUTHORIZED' 
      });
      return;
    }

    const business = mockBusinesses.find(b => b.id === businessId);
    if (!business) {
      res.status(404).json({ 
        success: false, 
        message: 'Business not found',
        error: 'BUSINESS_NOT_FOUND' 
      });
      return;
    }

    const discountPercentage = customDiscount || business.defaultDiscount;

    const qrCode = await qrCodeService.generateQRCode({
      userId,
      businessId: business.id,
      businessName: business.name,
      discountPercentage,
      expirationHours: expirationHours ? Number(expirationHours) : 24,
      campaignId,
      saveToFile: true
    });

    res.status(201).json({
      success: true,
      message: `QR code generated for ${business.name}`,
      data: {
        business: {
          id: business.id,
          name: business.name,
          category: business.category
        },
        qrCode: {
          qrCodeId: qrCode.qrCodeId,
          discountCode: qrCode.discountCode,
          dataUrl: qrCode.dataUrl,
          redemptionUrl: qrCode.redemptionUrl,
          expiresAt: qrCode.expiresAt,
          discountPercentage
        }
      }
    });

  } catch (error: any) {
    console.error('Error generating business QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate business QR code',
      error: 'INTERNAL_ERROR',
      details: error.message
    });
  }
};

/**
 * Get QR code generation statistics
 */
export const getQRCodeStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User authentication required',
        error: 'UNAUTHORIZED' 
      });
      return;
    }

    const stats = await qrCodeService.getQRCodeStats();

    res.status(200).json({
      success: true,
      message: 'QR code statistics retrieved',
      data: {
        statistics: stats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error getting QR code stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get QR code statistics',
      error: 'INTERNAL_ERROR',
      details: error.message
    });
  }
};

/**
 * Health check for QR code service
 */
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // Test QR code generation
    const testQRCode = await qrCodeService.generateQRCode({
      userId: 'health_check',
      businessId: 'test_business',
      businessName: 'Test Business',
      discountPercentage: 10,
      expirationHours: 1
    });

    res.status(200).json({
      success: true,
      message: 'QR code service is healthy',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        testGeneration: !!testQRCode.qrCodeId
      }
    });

  } catch (error: any) {
    console.error('QR code service health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'QR code service is unhealthy',
      error: 'SERVICE_UNHEALTHY',
      details: error.message
    });
  }
};

/**
 * Generate membership QR code for authenticated user
 */
export const getMembershipQrCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
      return;
    }

    const { userId, email } = req.user;

    // Generate membership-specific QR code data
    const membershipData = {
      type: 'membership',
      userId,
      email,
      membershipId: `BOOM-${userId.substring(0, 8).toUpperCase()}`,
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year validity
    };

    // Generate QR code for membership
    const qrCodeResult = await qrCodeService.generateQRCode({
      businessId: 'boom-membership',
      businessName: 'BOOM Card Membership',
      discountPercentage: 0, // No specific discount, just membership verification
      userId,
      expirationHours: 365 * 24, // 1 year
      saveToFile: false,
      metadata: membershipData
    });

    res.status(200).json({
      success: true,
      message: 'Membership QR code generated successfully',
      data: {
        qrCode: qrCodeResult.qrCode,
        membershipId: membershipData.membershipId,
        validUntil: membershipData.validUntil,
        format: 'png',
        size: 256
      }
    });

  } catch (error: any) {
    console.error('Error generating membership QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate membership QR code',
      error: 'QR_GENERATION_ERROR',
      details: error.message
    });
  }
};