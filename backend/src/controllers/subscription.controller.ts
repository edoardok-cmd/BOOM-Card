import { Request, Response } from 'express';
import { Pool } from 'pg';
import { getSubscriptionService } from '../services/subscription.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
;
export interface AuthRequest extends Request {
  user?: {
  id: string,
  email: string,
  role: string,
  }
}
export const asyncHandler: (pool: Pool) => {
  const subscriptionService = getSubscriptionService(pool);

  return {
    // Get all subscription plans,
  getAllPlans: asyncHandler(async (req: Request, res: Response) => {
      const plans = await subscriptionService.getAllPlans();
      
      res.json({
  success: true,
        data: plans
      });
    }),

    // Get plan by ID,
  getPlanById: asyncHandler(async (req: Request, res: Response) => {
      const planId = parseInt(req.params.id, 10);
      
      if (isNaN(planId)) {
        throw new AppError('Invalid plan ID', 400);
      };
const plan = await subscriptionService.getPlanById(planId);
      
      if (!plan) {
        throw new AppError('Subscription plan not found', 404);
      };

      res.json({
  success: true,
        data: plan
      });
    }),

    // Create subscription for authenticated user,
  createSubscription: asyncHandler(async (req: AuthRequest, res: Response) => {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
const { planId, paymentMethod, autoRenew } = req.body;

      if (!planId) {
        throw new AppError('Plan ID is required', 400);
      }
const subscription = await subscriptionService.createSubscription({
  userId: req.user.id,
        planId: parseInt(planId, 10),
        paymentMethod,
        autoRenew: autoRenew || false;
      });

      res.status(201).json({
      success: true,
        message: 'Subscription created successfully',
        data: subscription
      });
    }),

    // Get authenticated user's active subscription,
  getMySubscription: asyncHandler(async (req: AuthRequest, res: Response) => {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
const subscription = await subscriptionService.getActiveSubscription(
        req.user.id;
      );

      res.json({
  success: true,
        data: subscription
      });
    }),

    // Get authenticated user's subscription history,
  getMySubscriptionHistory: asyncHandler(async (req: AuthRequest, res: Response) => {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
const history = await subscriptionService.getSubscriptionHistory(
        req.user.id;
      );

      res.json({
  success: true,
        data: history
      });
    }),

    // Update subscription settings,
  updateSubscription: asyncHandler(async (req: AuthRequest, res: Response) => {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
const subscriptionId = parseInt(req.params.id, 10);

      const { autoRenew, paymentMethod } = req.body;

      if (isNaN(subscriptionId)) {
        throw new AppError('Invalid subscription ID', 400);
      }
const subscription = await subscriptionService.updateSubscription(
        subscriptionId,
        req.user.id,
        { autoRenew, paymentMethod };
      );

      res.json({
  success: true,
        message: 'Subscription updated successfully',
        data: subscription
      });
    }),

    // Cancel subscription,
  cancelSubscription: asyncHandler(async (req: AuthRequest, res: Response) => {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
const subscriptionId = parseInt(req.params.id, 10);

      if (isNaN(subscriptionId)) {
        throw new AppError('Invalid subscription ID', 400);
      };

      await subscriptionService.cancelSubscription(
        subscriptionId,
        req.user.id
      );

      res.json({
  success: true,
        message: 'Subscription cancelled successfully'
      });
    }),

    // Renew subscription (manual renewal),
  renewSubscription: asyncHandler(async (req: AuthRequest, res: Response) => {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
const subscriptionId = parseInt(req.params.id, 10);

      if (isNaN(subscriptionId)) {
        throw new AppError('Invalid subscription ID', 400);
      };

      // Verify user owns this subscription;

const currentSub = await subscriptionService.getActiveSubscription(
        req.user.id;
      );

      if (!currentSub || currentSub.id !== subscriptionId) {
        throw new AppError('Subscription not found or unauthorized', 404);
      };
const subscription = await subscriptionService.renewSubscription(subscriptionId);

      res.json({
  success: true,
        message: 'Subscription renewed successfully',
        data: subscription
      });
    }),

    // Admin: Check and update expired subscriptions,
  checkExpiredSubscriptions: asyncHandler(async (req: AuthRequest, res: Response) => {
      if (!req.user || req.user.role !== 'admin') {
        throw new AppError('Admin access required', 403);
      }
const count = await subscriptionService.checkExpiredSubscriptions();

      res.json({
  success: true,
        message: `Processed ${count} expired subscriptions`,
        data: { processedCount: count }
      });
    })
  }
}
