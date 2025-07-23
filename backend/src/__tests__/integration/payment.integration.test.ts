import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../../app';
import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { stripe } from '../../lib/stripe';
import { generateTestUser, generateTestPartner, generateTestAdmin } from '../helpers/generators';
import { signJWT } from '../../utils/jwt';
import { PaymentStatus, SubscriptionStatus, TransactionType } from '@prisma/client';
import Stripe from 'stripe';

describe('Payment Integration Tests', () => {
  let app: Application;
  let userToken: string;
  let partnerToken: string;
  let adminToken: string;
  let testUser: any;
  let testPartner: any;
  let testAdmin: any;
  let testSubscription: any;
  let testPaymentMethod: any;
  let stripeCustomer: Stripe.Customer;
  let stripeSubscription: Stripe.Subscription;
  let stripePaymentMethod: Stripe.PaymentMethod;

  beforeAll(async () => {
    app = await createApp();
    
    // Clear test data
    await prisma.$transaction([
      prisma.transaction.deleteMany({}),
      prisma.subscription.deleteMany({}),
      prisma.paymentMethod.deleteMany({}),
      prisma.user.deleteMany({}),
      prisma.partner.deleteMany({}),
    ]);
    
    await redis.flushdb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await redis.quit();
  });

  beforeEach(async () => {
    // Create test users
    testUser = await prisma.user.create({
      data: generateTestUser(),
    });
    
    testPartner = await prisma.partner.create({
      data: generateTestPartner(),
    });
    
    testAdmin = await prisma.user.create({
      data: {
        ...generateTestAdmin(),
        role: 'ADMIN',
      },
    });

    // Generate tokens
    userToken = signJWT({ id: testUser.id, role: testUser.role });
    partnerToken = signJWT({ id: testPartner.id, role: 'PARTNER' });
    adminToken = signJWT({ id: testAdmin.id, role: testAdmin.role });

    // Create Stripe customer
    stripeCustomer = await stripe.customers.create({
      email: testUser.email,
      metadata: {
        userId: testUser.id,
      },
    });

    // Update user with Stripe customer ID
    await prisma.user.update({
      where: { id: testUser.id },
      data: { stripeCustomerId: stripeCustomer.id },
    });

    // Create test payment method in Stripe
    stripePaymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa',
      },
    });

    // Attach payment method to customer
    await stripe.paymentMethods.attach(stripePaymentMethod.id, {
      customer: stripeCustomer.id,
    });

    // Set as default payment method
    await stripe.customers.update(stripeCustomer.id, {
      invoice_settings: {
        default_payment_method: stripePaymentMethod.id,
      },
    });
  });

  afterEach(async () => {
    // Clean up Stripe resources
    if (stripeSubscription) {
      try {
        await stripe.subscriptions.cancel(stripeSubscription.id);
      } catch (error) {
        // Subscription might already be cancelled
      }

    // Clean up database
    await prisma.$transaction([
      prisma.transaction.deleteMany({}),
      prisma.subscription.deleteMany({}),
      prisma.paymentMethod.deleteMany({}),
      prisma.user.deleteMany({}),
      prisma.partner.deleteMany({}),
    ]);
  });

  describe('POST /api/payments/setup-intent', () => {
    it('should create a setup intent for authenticated user', async () => {
      const response = await request(app)
        .post('/api/payments/setup-intent')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('clientSecret');
      expect(response.body.clientSecret).toMatch(/^seti_/);
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app)
        .post('/api/payments/setup-intent')
        .expect(401);
    });
  });

  describe('POST /api/payments/payment-methods', () => {
    it('should save a payment method', async () => {
        .post('/api/payments/payment-methods')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          paymentMethodId: stripePaymentMethod.id,
          setAsDefault: true,
        })
        .expect(201);

      expect(response.body.data).toMatchObject({
        stripePaymentMethodId: stripePaymentMethod.id,
        type: 'card',
        isDefault: true,
        last4: '4242',
        brand: 'visa',
      });

      // Verify database
      const savedPaymentMethod = await prisma.paymentMethod.findFirst({
        where: { userId: testUser.id },
      });
      
      expect(savedPaymentMethod).toBeTruthy();
      expect(savedPaymentMethod?.stripePaymentMethodId).toBe(stripePaymentMethod.id);
    });

    it('should handle duplicate payment method', async () => {
      // Save payment method first
      await prisma.paymentMethod.create({
        data: {
          userId: testUser.id,
          stripePaymentMethodId: stripePaymentMethod.id,
          type: 'card',
          last4: '4242',
          brand: 'visa',
          isDefault: true,
        },
      });

      // Try to save again
        .post('/api/payments/payment-methods')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          paymentMethodId: stripePaymentMethod.id,
        })
        .expect(400);

      expect(response.body.error).toBe('Payment method already exists');
    });
  });

  describe('GET /api/payments/payment-methods', () => {
    it('should list user payment methods', async () => {
      // Create payment methods
      await prisma.paymentMethod.createMany({
        data: [
          {
            userId: testUser.id,
            stripePaymentMethodId: 'pm_test_1',
            type: 'card',
            last4: '4242',
            brand: 'visa',
            isDefault: true,
          },
          {
            userId: testUser.id,
            stripePaymentMethodId: 'pm_test_2',
            type: 'card',
            last4: '5555',
            brand: 'mastercard',
            isDefault: false,
          },
        ],
      });

        .get('/api/payments/payment-methods')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].isDefault).toBe(true);
      expect(response.body.data[1].isDefault).toBe(false);
    });
  });

  describe('DELETE /api/payments/payment-methods/:id', () => {
    it('should delete a payment method', async () => {
      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          userId: testUser.id,
          stripePaymentMethodId: stripePaymentMethod.id,
          type: 'card',
          last4: '4242',
          brand: 'visa',
          isDefault: false,
        },
      });

      await request(app)
        .delete(`/api/payments/payment-methods/${paymentMethod.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify deletion
      const deleted = await prisma.paymentMethod.findUnique({
        where: { id: paymentMethod.id },
      });
      
      expect(deleted).toBeNull();
    });

    it('should not delete default payment method with active subscription', async () => {
      // Create subscription
      await prisma.subscription.create({
        data: {
          userId: testUser.id,
          stripeSubscriptionId: 'sub_test',
          status: SubscriptionStatus.ACTIVE,
          planId: 'plan_monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

        data: {
          userId: testUser.id,
          stripePaymentMethodId: stripePaymentMethod.id,
          type: 'card',
          last4: '4242',
          brand: 'visa',
          isDefault: true,
        },
      });

        .delete(`/api/payments/payment-methods/${paymentMethod.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.error).toBe('Cannot delete default payment method with active subscription');
    });
  });

  describe('POST /api/payments/subscriptions', () => {
    it('should create a new subscription', async () => {
      // Save payment method first
      await prisma.paymentMethod.create({
        data: {
          userId: testUser.id,
          stripePaymentMethodId: stripePaymentMethod.id,
          type: 'card',
          last4: '4242',
          brand: 'visa',
          isDefault: true,
        },
      });

        .post('/api/payments/subscriptions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          planId: 'plan_monthly',
          paymentMethodId: stripePaymentMethod.id,
        })
        .expect(201);

      expect(response.body.data).toMatchObject({
        status: SubscriptionStatus.ACTIVE,
        planId: 'plan_monthly',
      });

      // Store for cleanup
      stripeSubscription = await stripe.subscriptions.retrieve(
        response.body.data.stripeSubscriptionId
      );

      // Verify database
      const subscription = await prisma.subscription.findFirst({
        where: { userId: testUser.id },
      });
      
      expect(subscription).toBeTruthy();
      expect(subscription?.status).toBe(SubscriptionStatus.ACTIVE);
    });

    it('should handle subscription creation failure', async () => {
        .post('/api/payments/subscriptions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          planId: 'invalid_plan',
          paymentMethodId: 'pm_invalid',
        })
        .expect(400);

      expect(response.body.error).toBeTruthy();
    });

    it('should prevent duplicate active subscriptions', async () => {
      // Create existing subscription
      await prisma.subscription.create({
        data: {
          userId: testUser.id,
          stripeSubscriptionId: 'sub_existing',
          status: SubscriptionStatus.ACTIVE,
          planId: 'plan_monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

        .post('/api/payments/subscriptions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          planId: 'plan_yearly',
          paymentMethodId: stripePaymentMethod.id,
        })
        .expect(400);

      expect(response.body.error).toBe('User already has an active subscription');
    });
  });

  describe('GET /api/payments/subscriptions/current', () => {
    it('should get current subscription', async () => {
        data: {
          userId: testUser.id,
          stripeSubscriptionId: 'sub_test',
          status: SubscriptionStatus.ACTIVE,
          planId: 'plan_monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

        .get('/api/payments/subscriptions/current')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: subscription.id,
        status: SubscriptionStatus.ACTIVE,
        planId: 'plan_monthly',
      });
    });

    it('should return 404 for no subscription', async () => {
      await request(app)
        .get('/api/payments/subscriptions/current')
        .set('Authorization', `Bearer ${userToken}`)
}
}
