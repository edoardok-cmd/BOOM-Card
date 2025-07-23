import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import jwt from 'jsonwebtoken';
import { QRCodeGenerator } from '../../services/qr-code.service';
import { NotificationService } from '../../services/notification.service';
import { AnalyticsService } from '../../services/analytics.service';
import { User, Partner, Venue, Offer, Transaction, TransactionStatus } from '@prisma/client';

jest.mock('../../services/notification.service');
jest.mock('../../services/analytics.service');

describe('QR Code Redemption Integration Tests', () => {
  let authToken: string;
  let partnerAuthToken: string;
  let testUser: User;
  let testPartner: Partner;
  let testVenue: Venue;
  let testOffer: Offer;
  let qrCodeService: QRCodeGenerator;

  beforeAll(async () => {
    // Clear test data
    await prisma.transaction.deleteMany({});
    await prisma.offer.deleteMany({});
    await prisma.venue.deleteMany({});
    await prisma.partner.deleteMany({});
    await prisma.user.deleteMany({});
    await redis.flushdb();

    // Initialize services
    qrCodeService = new QRCodeGenerator();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'testuser@example.com',
        password: '$2b$10$YourHashedPasswordHere',
        firstName: 'Test',
        lastName: 'User',
        phone: '+359888123456',
        isActive: true,
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    authToken = jwt.sign(
      { userId: testUser.id, email: testUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Create test partner
    testPartner = await prisma.partner.create({
      data: {
        email: 'partner@example.com',
        password: '$2b$10$YourHashedPasswordHere',
        businessName: 'Test Restaurant',
        contactPerson: 'John Doe',
        phone: '+359888654321',
        isActive: true,
        isVerified: true,
      },
    });

    partnerAuthToken = jwt.sign(
      { partnerId: testPartner.id, email: testPartner.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Create test venue
    testVenue = await prisma.venue.create({
      data: {
        partnerId: testPartner.id,
        name: 'Test Restaurant Downtown',
        category: 'RESTAURANT',
        subcategory: 'FINE_DINING',
        address: '123 Main St',
        city: 'Sofia',
        postalCode: '1000',
        latitude: 42.6977,
        longitude: 23.3219,
        phone: '+359888111222',
        isActive: true,
      },
    });

    // Create test offer
    testOffer = await prisma.offer.create({
      data: {
        venueId: testVenue.id,
        title: '20% Off All Menu Items',
        description: 'Get 20% discount on all food and beverages',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid for dine-in only. Cannot be combined with other offers.',
        isActive: true,
        maxRedemptionsPerUser: 5,
        totalRedemptionsLimit: 1000,
      },
    });
  });

  afterEach(async () => {
    await prisma.transaction.deleteMany({});
    await prisma.offer.deleteMany({});
    await prisma.venue.deleteMany({});
    await prisma.partner.deleteMany({});
    await prisma.user.deleteMany({});
    await redis.flushdb();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await redis.quit();
  });

  describe('POST /api/qr/generate', () => {
    it('should generate QR code for valid offer', async () => {
      const response = await request(app)
        .post('/api/qr/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          offerId: testOffer.id,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('qrCode');
      expect(response.body).toHaveProperty('redemptionCode');
      expect(response.body).toHaveProperty('expiresAt');

      // Verify QR code data is stored in Redis
      const storedData = await redis.get(`qr:${response.body.redemptionCode}`);
      expect(storedData).toBeTruthy();
      const parsedData = JSON.parse(storedData!);
      expect(parsedData.userId).toBe(testUser.id);
      expect(parsedData.offerId).toBe(testOffer.id);
    });

    it('should reject generation for inactive subscription', async () => {
      await prisma.user.update({
        where: { id: testUser.id },
        data: { subscriptionStatus: 'EXPIRED' },
      });

        .post('/api/qr/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          offerId: testOffer.id,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Active subscription required');
    });

    it('should reject generation for inactive offer', async () => {
      await prisma.offer.update({
        where: { id: testOffer.id },
        data: { isActive: false },
      });

        .post('/api/qr/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          offerId: testOffer.id,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Offer is not active');
    });

    it('should respect max redemptions per user limit', async () => {
      // Create max transactions for user
      for (let i = 0; i < 5; i++) {
        await prisma.transaction.create({
          data: {
            userId: testUser.id,
            partnerId: testPartner.id,
            venueId: testVenue.id,
            offerId: testOffer.id,
            redemptionCode: `TEST${i}`,
            status: TransactionStatus.COMPLETED,
            discountType: 'PERCENTAGE',
            discountValue: 20,
            originalAmount: 100,
            discountedAmount: 80,
            savedAmount: 20,
          },
        });
      }

        .post('/api/qr/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          offerId: testOffer.id,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Maximum redemptions reached for this offer');
    });
  });

  describe('POST /api/qr/verify', () => {
    let redemptionCode: string;

    beforeEach(async () => {
      // Generate QR code
      const qrData = {
        userId: testUser.id,
        offerId: testOffer.id,
        venueId: testVenue.id,
        timestamp: Date.now(),
      };
      redemptionCode = qrCodeService.generateRedemptionCode();
      await redis.setex(
        `qr:${redemptionCode}`,
        300, // 5 minutes
        JSON.stringify(qrData)
      );
    });

    it('should verify valid QR code by partner', async () => {
        .post('/api/qr/verify')
        .set('Authorization', `Bearer ${partnerAuthToken}`)
        .send({
          redemptionCode,
          venueId: testVenue.id,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('offer');
      expect(response.body).toHaveProperty('user');
      expect(response.body.offer.id).toBe(testOffer.id);
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should reject verification for wrong venue', async () => {
      const anotherVenue = await prisma.venue.create({
        data: {
          partnerId: testPartner.id,
          name: 'Another Venue',
          category: 'RESTAURANT',
          address: '456 Other St',
          city: 'Sofia',
          isActive: true,
        },
      });

        .post('/api/qr/verify')
        .set('Authorization', `Bearer ${partnerAuthToken}`)
        .send({
          redemptionCode,
          venueId: anotherVenue.id,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid QR code for this venue');
    });

    it('should reject expired QR code', async () => {
      await redis.del(`qr:${redemptionCode}`);

        .post('/api/qr/verify')
        .set('Authorization', `Bearer ${partnerAuthToken}`)
        .send({
          redemptionCode,
          venueId: testVenue.id,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('QR code expired or invalid');
    });

    it('should reject verification by unauthorized partner', async () => {
      const anotherPartner = await prisma.partner.create({
        data: {
          email: 'another@partner.com',
          password: '$2b$10$YourHashedPasswordHere',
          businessName: 'Another Business',
          contactPerson: 'Jane Doe',
          phone: '+359888999888',
          isActive: true,
        },
      });

      const anotherPartnerToken = jwt.sign(
        { partnerId: anotherPartner.id, email: anotherPartner.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

        .post('/api/qr/verify')
        .set('Authorization', `Bearer ${anotherPartnerToken}`)
        .send({
          redemptionCode,
          venueId: testVenue.id,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Unauthorized to verify for this venue');
    });
  });

  describe('POST /api/qr/redeem', () => {
    let redemptionCode: string;

    beforeEach(async () => {
      // Generate QR code
        userId: testUser.id,
        offerId: testOffer.id,
        venueId: testVenue.id,
        timestamp: Date.now(),
  
}}}}