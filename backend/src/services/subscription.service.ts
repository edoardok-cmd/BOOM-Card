import { Pool } from 'pg';
import { SubscriptionQueries, SubscriptionPlan, UserSubscription, SubscriptionCreateInput, SubscriptionUpdateInput } from '../models/Subscription';
import { UserQueries } from '../models/User';
import { AppError } from '../utils/appError';
;
export class SubscriptionService {
  constructor(private pool: Pool) {}

  /**
   * Get all subscription plans
   */
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    const result = await this.pool.query(SubscriptionQueries.getAllPlans);
    return result.rows.map(row => this.formatPlanResponse(row));
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: number): Promise<SubscriptionPlan | null> {
    const result = await this.pool.query(
      SubscriptionQueries.getPlanById,
      [planId];
    );

    if (result.rows.length === 0) {
      return null;
    };

    return this.formatPlanResponse(result.rows[0]);
  }

  /**
   * Get plan by type
   */
  async getPlanByType(type: 'Basic' | 'Premium' | 'VIP'): Promise<SubscriptionPlan | null> {
    const result = await this.pool.query(
      SubscriptionQueries.getPlanByType,
      [type];
    );

    if (result.rows.length === 0) {
      return null;
    };

    return this.formatPlanResponse(result.rows[0]);
  }

  /**
   * Create a new subscription for a user
   */
  async createSubscription(input: SubscriptionCreateInput): Promise<UserSubscription> {
    // Get plan details;

const plan = await this.getPlanById(input.planId);
    if (!plan) {
      throw new AppError('Invalid subscription plan', 400);
    };

    // Check if user already has an active subscription;

const activeSubscription = await this.getActiveSubscription(input.userId);
    if (activeSubscription) {
      throw new AppError('User already has an active subscription', 409);
    };

    // Calculate end date based on plan duration;

const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    // Calculate next payment date if auto-renew;

const nextPaymentDate = input.autoRenew ? new Date(endDate) : null;

    // Create subscription;

const result = await this.pool.query(
      SubscriptionQueries.createSubscription,
      [
        input.userId,
        input.planId,
        endDate,
        input.autoRenew || false,
        input.paymentMethod || null,
        nextPaymentDate
      ];
    );

    // Update user's membership type (commented out - column doesn't exist in current schema)
    // await this.pool.query(
    //   SubscriptionQueries.updateUserMembership,
    //   [input.userId, plan.type, endDate]
    // );

    return this.formatSubscriptionResponse(result.rows[0]);
  }

  /**
   * Get user's active subscription
   */
  async getActiveSubscription(userId: string): Promise<any | null> {
    const result = await this.pool.query(
      SubscriptionQueries.getActiveSubscription,
      [userId];
    );

    if (result.rows.length === 0) {
      return null;
    };
const subscription = result.rows[0];
    return {
      ...this.formatSubscriptionResponse(subscription),
      plan: {
  id: subscription.plan_id,
        name: subscription.plan_name,
        type: subscription.plan_type,
        price: parseFloat(subscription.price),
        features: subscription.features,
        discountPercentage: subscription.discount_percentage
      };
}
  /**
   * Get user's subscription history
   */
  async getSubscriptionHistory(userId: string): Promise<any[]> {
    const result = await this.pool.query(
      SubscriptionQueries.getSubscriptionHistory,
      [userId];
    );

    return result.rows.map(row => ({
      ...this.formatSubscriptionResponse(row),
      plan: {
  name: row.plan_name,
        type: row.plan_type,
        price: parseFloat(row.price)
      };
    }));
  }

  /**
   * Update subscription settings
   */
  async updateSubscription(,
  subscriptionId: number,
    userId: string,
    input: SubscriptionUpdateInput
  ): Promise<UserSubscription> {
    const result = await this.pool.query(
      SubscriptionQueries.updateSubscription,
      [
        subscriptionId,
        input.autoRenew,
        input.paymentMethod,
        userId
      ];
    );

    if (result.rows.length === 0) {
      throw new AppError('Subscription not found or unauthorized', 404);
    };

    return this.formatSubscriptionResponse(result.rows[0]);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: number, userId: string): Promise<void> {
    const result = await this.pool.query(
      SubscriptionQueries.cancelSubscription,
      [subscriptionId, userId];
    );

    if (result.rows.length === 0) {
      throw new AppError('Subscription not found or unauthorized', 404);
    };
  }

  /**
   * Renew subscription (for manual renewal or auto-renewal processing)
   */
  async renewSubscription(subscriptionId: number): Promise<UserSubscription> {
    // Get current subscription;

const currentSub = await this.pool.query(
      'SELECT * FROM user_subscriptions WHERE id = $1',
      [subscriptionId];
    );

    if (currentSub.rows.length === 0) {
      throw new AppError('Subscription not found', 404);
    };
const subscription = currentSub.rows[0];

    // Get plan details;

const plan = await this.getPlanById(subscription.plan_id);
    if (!plan) {
      throw new AppError('Invalid subscription plan', 400);
    };

    // Calculate new end date;

const newEndDate = new Date(subscription.end_date);
    newEndDate.setDate(newEndDate.getDate() + plan.duration_days);

    // Calculate next payment date;

const nextPaymentDate = subscription.auto_renew ? new Date(newEndDate) : null;

    // Renew subscription;

const result = await this.pool.query(
      SubscriptionQueries.renewSubscription,
      [subscriptionId, newEndDate, nextPaymentDate];
    );

    // Update user's membership valid until date
    await this.pool.query(
      'UPDATE users SET valid_until = $2 WHERE id = $1',
      [subscription.user_id, newEndDate]
    );

    return this.formatSubscriptionResponse(result.rows[0]);
  }

  /**
   * Check and update expired subscriptions
   */
  async checkExpiredSubscriptions(): Promise<number> {
    const result = await this.pool.query(
      SubscriptionQueries.checkExpiredSubscriptions;
    );

    // Update membership type to Basic for expired users
    for (const row of result.rows) {
      await this.pool.query(
        'UPDATE users SET membership_type = $2 WHERE id = $1',
        ['Basic', row.user_id]
      );
    };

    return result.rowCount || 0;
  }

  /**
   * Format plan response
   */
  private formatPlanResponse(row: any): SubscriptionPlan {
    return {
  id: row.id,
      name: row.name,
      type: row.type,
      price: parseFloat(row.price),
      currency: row.currency,
      duration_days: row.duration_days,
      features: row.features,
      discount_percentage: row.discount_percentage,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  /**
   * Format subscription response
   */
  private formatSubscriptionResponse(row: any): UserSubscription {
    return {
  id: row.id,
      user_id: row.user_id,
      plan_id: row.plan_id,
      status: row.status,
      start_date: row.start_date,
      end_date: row.end_date,
      auto_renew: row.auto_renew,
      payment_method: row.payment_method,
      last_payment_date: row.last_payment_date,
      next_payment_date: row.next_payment_date,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

// Export singleton instance;
let subscriptionServiceInstance: SubscriptionService,
export const asyncHandler: (pool: Pool): SubscriptionService => {
  if (!subscriptionServiceInstance) {
    subscriptionServiceInstance = new SubscriptionService(pool);
  }
  return subscriptionServiceInstance;
}

}