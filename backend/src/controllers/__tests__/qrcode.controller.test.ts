import { Request, Response } from 'express';
import { QRCodeController } from '../qrcode.controller';
import { QRCodeService } from '../../services/qrcode.service';
import { PartnerService } from '../../services/partner.service';
import { DiscountService } from '../../services/discount.service';
import { TransactionService } from '../../services/transaction.service';
import { NotificationService } from '../../services/notification.service';
import { AppError } from '../../utils/errors';
import { QRCodeType, QRCodeStatus } from '../../types/qrcode.types';
import { UserRole } from '../../types/user.types';
import { mockRequest, mockResponse } from '../../test/utils/express-mocks';
import { generateMockQRCode, generateMockPartner, generateMockDiscount } from '../../test/fixtures';

jest.mock('../../services/qrcode.service');
jest.mock('../../services/partner.service');
jest.mock('../../services/discount.service');
jest.mock('../../services/transaction.service');
jest.mock('../../services/notification.service');

describe('QRCodeController', () => {
  let qrCodeController: QRCodeController;
  let qrCodeService: jest.Mocked<QRCodeService>;
  let partnerService: jest.Mocked<PartnerService>;
  let discountService: jest.Mocked<DiscountService>;
  let transactionService: jest.Mocked<TransactionService>;
  let notificationService: jest.Mocked<NotificationService>;
  let req: Request;
  let res: Response;

  beforeEach(() => {
    qrCodeService = new QRCodeService() as jest.Mocked<QRCodeService>;
    partnerService = new PartnerService() as jest.Mocked<PartnerService>;
    discountService = new DiscountService() as jest.Mocked<DiscountService>;
    transactionService = new TransactionService() as jest.Mocked<TransactionService>;
    notificationService = new NotificationService() as jest.Mocked<NotificationService>;

    qrCodeController = new QRCodeController(
      qrCodeService,
      partnerService,
      discountService,
      transactionService,
      notificationService
    );

    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateQRCode', () => {
    it('should generate a QR code for a partner location', async () => {
      const mockPartner = generateMockPartner();
      const mockQRCode = generateMockQRCode();

      req.user = { id: '123', role: UserRole.PARTNER };
      req.body = {
        locationId: 'loc123',
        type: QRCodeType.DISCOUNT,
        expiresIn: 3600
      };

      partnerService.getPartnerByUserId.mockResolvedValue(mockPartner);
      partnerService.validateLocationOwnership.mockResolvedValue(true);
      qrCodeService.generateQRCode.mockResolvedValue(mockQRCode);

      await qrCodeController.generateQRCode(req, res);

      expect(partnerService.getPartnerByUserId).toHaveBeenCalledWith('123');
      expect(partnerService.validateLocationOwnership).toHaveBeenCalledWith(mockPartner.id, 'loc123');
      expect(qrCodeService.generateQRCode).toHaveBeenCalledWith({
        partnerId: mockPartner.id,
        locationId: 'loc123',
        type: QRCodeType.DISCOUNT,
        expiresIn: 3600
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockQRCode
      });
    });

    it('should throw error if user is not a partner', async () => {
      req.user = { id: '123', role: UserRole.CONSUMER };
      req.body = { locationId: 'loc123', type: QRCodeType.DISCOUNT };

      await expect(qrCodeController.generateQRCode(req, res)).rejects.toThrow(
        new AppError('Access denied. Partner role required.', 403)
      );
    });

    it('should throw error if location ownership validation fails', async () => {

      req.user = { id: '123', role: UserRole.PARTNER };
      req.body = { locationId: 'loc123', type: QRCodeType.DISCOUNT };

      partnerService.getPartnerByUserId.mockResolvedValue(mockPartner);
      partnerService.validateLocationOwnership.mockResolvedValue(false);

      await expect(qrCodeController.generateQRCode(req, res)).rejects.toThrow(
        new AppError('You do not have permission to generate QR codes for this location.', 403)
      );
    });
  });

  describe('scanQRCode', () => {
    it('should successfully scan and validate a QR code', async () => {
      const mockDiscount = generateMockDiscount();

      req.user = { id: '123', role: UserRole.CONSUMER };
      req.params = { code: 'QR123' };
      req.body = { locationId: 'loc123' };

      qrCodeService.getQRCodeByCode.mockResolvedValue(mockQRCode);
      qrCodeService.validateQRCode.mockResolvedValue({ isValid: true });
      partnerService.getPartnerById.mockResolvedValue(mockPartner);
      discountService.getActiveDiscountsByLocation.mockResolvedValue([mockDiscount]);

      await qrCodeController.scanQRCode(req, res);

      expect(qrCodeService.getQRCodeByCode).toHaveBeenCalledWith('QR123');
      expect(qrCodeService.validateQRCode).toHaveBeenCalledWith(mockQRCode, 'loc123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          qrCode: mockQRCode,
          partner: mockPartner,
          availableDiscounts: [mockDiscount]
        });
    });

    it('should throw error if QR code is not found', async () => {
      req.user = { id: '123', role: UserRole.CONSUMER };
      req.params = { code: 'INVALID' };

      qrCodeService.getQRCodeByCode.mockResolvedValue(null);

      await expect(qrCodeController.scanQRCode(req, res)).rejects.toThrow(
        new AppError('QR code not found.', 404)
      );
    });

    it('should throw error if QR code is invalid', async () => {

      req.user = { id: '123', role: UserRole.CONSUMER };
      req.params = { code: 'QR123' };
      req.body = { locationId: 'loc123' };

      qrCodeService.getQRCodeByCode.mockResolvedValue(mockQRCode);
      qrCodeService.validateQRCode.mockResolvedValue({ 
        isValid: false, 
        reason: 'QR code has expired' 
      });

      await expect(qrCodeController.scanQRCode(req, res)).rejects.toThrow(
        new AppError('Invalid QR code: QR code has expired', 400)
      );
    });
  });

  describe('redeemDiscount', () => {
    it('should successfully redeem a discount', async () => {
      const mockTransaction = {
        id: 'trans123',
        userId: '123',
        partnerId: 'partner123',
        discountId: 'discount123',
        amount: 100,
        discountAmount: 20,
        finalAmount: 80,
        createdAt: new Date()
      };

      req.user = { id: '123', role: UserRole.CONSUMER };
      req.params = { code: 'QR123' };
      req.body = {
        discountId: 'discount123',
        amount: 100,
        locationId: 'loc123'
      };

      qrCodeService.getQRCodeByCode.mockResolvedValue(mockQRCode);
      qrCodeService.validateQRCode.mockResolvedValue({ isValid: true });
      discountService.getDiscountById.mockResolvedValue(mockDiscount);
      discountService.validateDiscountEligibility.mockResolvedValue({ isEligible: true });
      transactionService.createTransaction.mockResolvedValue(mockTransaction);
      qrCodeService.markQRCodeAsUsed.mockResolvedValue(undefined);

      await qrCodeController.redeemDiscount(req, res);

      expect(transactionService.createTransaction).toHaveBeenCalledWith({
        userId: '123',
        partnerId: mockQRCode.partnerId,
        locationId: 'loc123',
        discountId: 'discount123',
        qrCodeId: mockQRCode.id,
        amount: 100,
        discountAmount: 20,
        finalAmount: 80
      });
      expect(qrCodeService.markQRCodeAsUsed).toHaveBeenCalledWith(mockQRCode.id);
      expect(notificationService.sendDiscountRedemptionNotification).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          transaction: mockTransaction,
          message: 'Discount successfully redeemed!'
        });
    });

    it('should throw error if user is not eligible for discount', async () => {

      req.user = { id: '123', role: UserRole.CONSUMER };
      req.params = { code: 'QR123' };
      req.body = {
        discountId: 'discount123',
        amount: 100,
        locationId: 'loc123'
      };

      qrCodeService.getQRCodeByCode.mockResolvedValue(mockQRCode);
      qrCodeService.validateQRCode.mockResolvedValue({ isValid: true });
      discountService.getDiscountById.mockResolvedValue(mockDiscount);
      discountService.validateDiscountEligibility.mockResolvedValue({ 
        isEligible: false,
        reason: 'Discount usage limit exceeded'
      });

      await expect(qrCodeController.redeemDiscount(req, res)).rejects.toThrow(
        new AppError('Not eligible for discount: Discount usage limit exceeded', 400)
      );
    });
  });

  describe('getQRCodeHistory', () => {
    it('should return QR code history for a partner', async () => {
      const mockQRCodes = [generateMockQRCode(), generateMockQRCode()];

      req.user = { id: '123', role: UserRole.PARTNER };
      req.query = {
        locationId: 'loc123',
        status: QRCodeStatus.ACTIVE,
        page: '1',
        limit: '10'
      };

      partnerService.getPartnerByUserId.mockResolvedValue(mockPartner);
      qrCodeService.getQRCodeHistory.mockResolvedValue({
        data: mockQRCodes,
        total: 2,
        page: 1,
        totalPages: 1
      });

      await qrCodeController.getQRCodeHistory(req, res);

      expect(qrCodeService.getQRCodeHistory).toHaveBeenCalledWith({
        partnerId: mockPartner.id
}}}}
}
}
