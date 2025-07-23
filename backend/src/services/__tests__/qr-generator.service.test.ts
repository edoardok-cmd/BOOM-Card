import { jest } from '@jest/globals';
import { QRGeneratorService } from '../qr-generator.service';
import { ConfigService } from '../config.service';
import { LoggerService } from '../logger.service';
import { CacheService } from '../cache.service';
import { MetricsService } from '../metrics.service';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Redis } from 'ioredis';

interface QRGenerationOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  format?: 'png' | 'svg' | 'base64';
  color?: {
    dark?: string;
    light?: string;
  };
  logo?: {
    url: string;
    width?: number;
    height?: number;
  };
}

interface QRCodeData {
  id: string;
  userId: string;
  cardId?: string;
  type: 'profile' | 'payment' | 'contact' | 'custom';
  data: string;
  metadata?: Record<string, any>;
  shortUrl?: string;
  expiresAt?: Date;
}

interface QRGenerationResult {
  id: string;
  qrCode: string;
  format: string;
  shortUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
}

interface QRCacheEntry {
  id: string;
  qrCode: string;
  format: string;
  generatedAt: Date;
  accessCount: number;
  lastAccessedAt: Date;
}

const DEFAULT_QR_OPTIONS: QRGenerationOptions = {
  size: 300,
  margin: 4,
  errorCorrectionLevel: 'M',
  format: 'png',
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  };

const CACHE_TTL = 3600; // 1 hour
const MAX_QR_SIZE = 1000;
const MIN_QR_SIZE = 100;
const SUPPORTED_FORMATS = ['png', 'svg', 'base64'] as const;
const QR_CACHE_PREFIX = 'qr:';
const QR_METRICS_PREFIX = 'qr_generator';

Based on the QR generator service implementation, I'll generate Part 2 of the test file continuing from Part 1:

describe('QRGeneratorService', () => {
  let service: QRGeneratorService;
  let mockPrisma: any;
  let mockRedis: any;
  let mockLogger: any;
  let mockS3Upload: jest.Mock;
  let mockEncrypt: jest.Mock;
  let mockDecrypt: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.QR_SECRET_KEY = 'test-secret-key';
    process.env.AWS_S3_BUCKET = 'test-bucket';

    // Create service instance
    service = new QRGeneratorService();

    // Setup default mocks
    mockPrisma.qRCode.create.mockResolvedValue({
      id: mockQRId,
      type: 'discount',
      userId: 'user-123',
      partnerId: 'partner-123',
      isActive: true
    });

    mockRedis.setex.mockResolvedValue('OK');
    mockRedis.set.mockResolvedValue('OK');
    
    mockS3Upload.mockResolvedValue('https://s3.amazonaws.com/test-bucket/qr-codes/test.png');
    mockEncrypt.mockReturnValue('encrypted-data');
    mockDecrypt.mockReturnValue(JSON.stringify(mockQRData));
  });

  afterEach(() => {
    delete process.env.QR_SECRET_KEY;
    delete process.env.AWS_S3_BUCKET;
  });

  describe('constructor', () => {
    it('should throw error if QR_SECRET_KEY is not set', () => {
      delete process.env.QR_SECRET_KEY;
      expect(() => new QRGeneratorService()).toThrow('QR_SECRET_KEY environment variable is required');
    });

    it('should initialize with default options', () => {
      expect(service).toBeDefined();
      expect(service['defaultOptions']).toEqual({
        size: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M',)
        format: 'png'
      });
    });
  });

  describe('generateDiscountQR', () => {
    const mockDiscountPayload: DiscountQRPayload = {
      discountId: 'discount-123',
      partnerId: 'partner-123',
      userId: 'user-123',
      discountPercentage: 20,
      validUntil: new Date('2024-12-31'),
      usageLimit: 5,
      conditions: ['Min purchase $50']
    };

    it('should generate discount QR code successfully', async () => {
      const result = await service.generateDiscountQR(mockDiscountPayload);

      expect(result).toEqual({
        qrCode: mockQRCodeData,
        qrId: mockQRId,
        url: 'https://s3.amazonaws.com/test-bucket/qr-codes/test.png'
      });

      expect(mockQRCode.toDataURL).toHaveBeenCalled();
      expect(mockEncrypt).toHaveBeenCalled();
      expect(mockRedis.setex).toHaveBeenCalled();
      expect(mockPrisma.qRCode.create).toHaveBeenCalled();
      expect(mockS3Upload).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Discount QR code generated', {
        qrId: mockQRId,
        userId: 'user-123'
      });
    });

    it('should calculate correct TTL for Redis', async () => {
      const futureDate = new Date(Date.now() + 86400000); // 24 hours from now
      await service.generateDiscountQR({
        ...mockDiscountPayload,
        validUntil: futureDate
      });

      const ttlCall = mockRedis.setex.mock.calls[0];
      const ttl = ttlCall[1];
      expect(ttl).toBeGreaterThan(86000); // Close to 24 hours in seconds
      expect(ttl).toBeLessThan(87000);
    });

    it('should handle QR generation without S3 upload', async () => {
      delete process.env.AWS_S3_BUCKET;
      

      expect(result.url).toBe('');
      expect(mockS3Upload).not.toHaveBeenCalled();
    });

    it('should merge custom options with defaults', async () => {
      const customOptions: QRGenerationOptions = {
        size: 400,
        errorCorrectionLevel: 'H',
        color: { dark: '#FF0000' };

      await service.generateDiscountQR(mockDiscountPayload, customOptions);

      expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 400,
          errorCorrectionLevel: 'H',
          color: expect.objectContaining({ dark: '#FF0000' })
        })
      );
    });

    it('should handle errors and throw AppError', async () => {
      mockPrisma.qRCode.create.mockRejectedValue(new Error('Database error'));

      await expect(service.generateDiscountQR(mockDiscountPayload))
        .rejects.toThrow(AppError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to generate discount QR code',
        expect.any(Error)
      );
    });
  });

  describe('generatePartnerQR', () => {
    const mockPartnerPayload: PartnerQRPayload = {
      partnerId: 'partner-123',
      partnerName: 'Test Restaurant',
      category: 'dining',
      discountRange: {
        min: 10,
        max: 30
      };

    it('should generate partner QR code successfully', async () => {

      expect(result).toEqual({
        qrCode: mockQRCodeData,
        qrId: mockQRId,
        url: 'https://s3.amazonaws.com/test-bucket/qr-codes/test.png'
      });

      expect(mockRedis.set).toHaveBeenCalledWith(
        `qr:partner:${mockQRId}`,
        expect.any(String)
      );
      expect(mockPrisma.qRCode.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'partner',
          partnerId: 'partner-123'
        })
      });
    });

    it('should store partner QR permanently in Redis', async () => {
      await service.generatePartnerQR(mockPartnerPayload);

      expect(mockRedis.set).toHaveBeenCalled();
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });

    it('should include partner metadata in QR data', async () => {
      await service.generatePartnerQR(mockPartnerPayload);

      const encryptCall = mockEncrypt.mock.calls[0];
      const qrData = JSON.parse(encryptCall[0]);

      expect(qrData.metadata).toEqual({
        partnerId: 'partner-123',
        name: 'Test Restaurant',
        category: 'dining',
        discountMin: 10,
        discountMax: 30
      });
    });
  });

  describe('generateUserQR', () => {
    const mockUserPayload: UserQRPayload = {
      userId: 'user-123',
      subscriptionId: 'sub-123',
      subscriptionStatus: 'active',
      validUntil: new Date('2024-12-31')
    };

    it('should generate user QR code successfully', async () => {

      expect(result).toEqual({
        qrCode: mockQRCodeData,
        qrId: mockQRId,
        url: 'https://s3.amazonaws.com/test-bucket/qr-codes/test.png'
      });

      expect(mockPrisma.qRCode.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'user',
          userId: 'user-123',
          expiresAt: mockUserPayload.validUntil
        })
      });
    });

    it('should set correct expiration in Redis', async () => {
      await service.generateUserQR({
        ...mockUserPayload,
        validUntil: futureDate
      });

      expect(ttl).toBeGreaterThan(604000); // Close to 7 days in seconds
      expect(ttl).toBeLessThan(605000);
    });
  });

  describe('generateTransactionQR', () => {
    const mockTransactionPayload: TransactionQRPayload = {
      transactionId: 'txn-123',
      userId: 'user-123',
      partnerId: 'partner-123',
      amount: 100,
      discount: 20,
      timestamp: new Date()
    };

    it('should generate transaction QR code successfully', async () => {

      expect(result).toEqual({
        qrCode: mockQRCodeData,
        qrId: mockQRId,
        url: 'https://s3.amazonaws.com/test-bucket/qr-codes/test.png'
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Transaction QR code generated',
        { qrId: mockQRId, transactionId: 'txn-123' }
      );
    });

    it('should calculate saved amount correctly', async () => {
      await service.generateTransactionQR(mockTransactionPayload);


      expect(qrData.metadata.savedAmount).toBe(20); // 100 * 0.2
    });

    it('should store transaction QR for 30 days', async () => {
      await service.generateTransactionQR(mockTransactionPayload);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `qr:transaction:${mockQRId}`,
        30 * 24 * 60 * 60,
        expect.any(String)
      );
    });
  });

  describe('validateQR', () => {
    beforeEach(() => {
      mockPrisma.qRCode.findUnique.mockResolvedValue({
        id: mockQRId,
        type: 'discount',
        isActive: true,
        expiresAt: new Date('2024-12-31'),
        data: mockQRData
      });

      mockRedis.get.mockResolvedValue(JSON.stringify(mockQRData));
    });

    it('should validate QR code successfully', async () => {

      expect(result).toEqual(mockQRData);
      expect(mockDecrypt).toHaveBeenCalledWith('encrypted-data');
    });

    it('should throw error for invalid signature', async () => {
      jest.spyOn(service as any, 'verifySignature').mockReturnValue(false);

      await expect(service.validateQR('encrypted-data'))
        .rejects.toThrow('Invalid QR code signature');
    });

    it('should throw error for non-existent QR code', async () => {
      mockPrisma.qRCode.findUnique.mockResolvedValue(null);

      await expect(service.validateQR('encrypted-data'))
        .rejects.toThrow('QR code not found');
    });

    it('should throw error for inactive QR code', async () => {
      mockPrisma.qRCode.findUnique.mockResolvedValue({
        id: mockQRId,
        isActive: false
      });

      await e
}}}
}
}
}
