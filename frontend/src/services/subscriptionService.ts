import { boomApi } from './boomApi';
import { 
  SubscriptionPlan, 
  Subscription,
  ApiResponse 
} from '../types';
import { AppError } from '../utils/errorHandler';
import { authService } from './authService';

class SubscriptionService {
  private plansCache: SubscriptionPlan[] | null = null;
  private currentSubscriptionCache: Subscription | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 300000; // 5 minutes

  // Get all subscription plans
  async getPlans(forceRefresh: boolean = false): Promise<SubscriptionPlan[]> {
    const now = Date.now();
    
    // Return cached plans if available and not expired
    if (!forceRefresh && this.plansCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.plansCache;
    }
    
    try {
      const plans = await boomApi.getSubscriptionPlans();
      this.plansCache = plans;
      this.cacheTimestamp = now;
      return plans;
    } catch (error) {
      throw new AppError('Failed to load subscription plans', 'PLANS_LOAD_FAILED', 400);
    }
  }

  // Get current user's subscription
  async getCurrentSubscription(forceRefresh: boolean = false): Promise<Subscription | null> {
    if (!authService.isAuthenticated()) {
      return null;
    }
    
    // Return cached subscription if not forcing refresh
    if (!forceRefresh && this.currentSubscriptionCache) {
      return this.currentSubscriptionCache;
    }
    
    try {
      const subscription = await boomApi.getCurrentSubscription();
      this.currentSubscriptionCache = subscription;
      return subscription;
    } catch (error) {
      console.error('Failed to load current subscription:', error);
      return null;
    }
  }

  // Subscribe to a plan
  async subscribe(planId: string, paymentMethodId?: string): Promise<Subscription> {
    try {
      const subscription = await boomApi.subscribe(planId, paymentMethodId);
      
      // Update cache
      this.currentSubscriptionCache = subscription;
      
      // Update user data to reflect new membership
      await authService.getCurrentUser(true);
      
      return subscription;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Subscription failed', 'SUBSCRIPTION_FAILED', 400);
    }
  }

  // Cancel current subscription
  async cancelSubscription(): Promise<void> {
    const currentSub = await this.getCurrentSubscription();
    
    if (!currentSub) {
      throw new AppError('No active subscription found', 'NO_SUBSCRIPTION', 404);
    }
    
    try {
      await boomApi.cancelSubscription(currentSub.id);
      
      // Clear cache
      this.currentSubscriptionCache = null;
      
      // Update user data
      await authService.getCurrentUser(true);
    } catch (error) {
      throw new AppError('Failed to cancel subscription', 'CANCEL_FAILED', 400);
    }
  }

  // Update/upgrade subscription
  async updateSubscription(newPlanId: string): Promise<Subscription> {
    const currentSub = await this.getCurrentSubscription();
    
    if (!currentSub) {
      // No current subscription, create new one
      return this.subscribe(newPlanId);
    }
    
    try {
      const updatedSubscription = await boomApi.updateSubscription(currentSub.id, newPlanId);
      
      // Update cache
      this.currentSubscriptionCache = updatedSubscription;
      
      // Update user data
      await authService.getCurrentUser(true);
      
      return updatedSubscription;
    } catch (error) {
      throw new AppError('Failed to update subscription', 'UPDATE_FAILED', 400);
    }
  }

  // Check if user has active subscription
  hasActiveSubscription(): boolean {
    const subscription = this.currentSubscriptionCache;
    if (!subscription) return false;
    
    return subscription.status === 'active' && 
           new Date(subscription.endDate) > new Date();
  }

  // Get subscription days remaining
  getSubscriptionDaysRemaining(): number {
    const subscription = this.currentSubscriptionCache;
    if (!subscription || subscription.status !== 'active') return 0;
    
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }

  // Check if subscription is expiring soon (within 7 days)
  isExpiringSoon(): boolean {
    const daysRemaining = this.getSubscriptionDaysRemaining();
    return daysRemaining > 0 && daysRemaining <= 7;
  }

  // Get recommended plan based on usage
  async getRecommendedPlan(): Promise<SubscriptionPlan | null> {
    const [plans, userStats] = await Promise.all([
      this.getPlans(),
      boomApi.getUserStats()
    ]);
    
    if (!plans.length) return null;
    
    // Simple recommendation logic based on usage
    const monthlyVisits = userStats.visitsThisMonth;
    
    if (monthlyVisits > 20) {
      // Heavy user - recommend VIP
      return plans.find(p => p.name.toLowerCase().includes('vip')) || plans[plans.length - 1];
    } else if (monthlyVisits > 10) {
      // Medium user - recommend Premium
      return plans.find(p => p.name.toLowerCase().includes('premium')) || plans[1] || plans[0];
    } else {
      // Light user - recommend Standard
      return plans.find(p => p.name.toLowerCase().includes('standard')) || plans[0];
    }
  }

  // Calculate savings for a plan
  calculateAnnualSavings(plan: SubscriptionPlan): number {
    if (plan.period !== 'yearly') return 0;
    
    // Find monthly equivalent
    const plans = this.plansCache || [];
    const monthlyPlan = plans.find(p => 
      p.name === plan.name && p.period === 'monthly'
    );
    
    if (!monthlyPlan) return 0;
    
    const yearlyPrice = plan.price;
    const monthlyPrice = monthlyPlan.price * 12;
    
    return monthlyPrice - yearlyPrice;
  }

  // Clear cache
  clearCache(): void {
    this.plansCache = null;
    this.currentSubscriptionCache = null;
    this.cacheTimestamp = 0;
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

// Export the class for testing
export default SubscriptionService;