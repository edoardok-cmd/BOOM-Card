import { create } from 'zustand';
import { subscriptionService } from '../services/subscriptionService';
import { SubscriptionPlan, Subscription } from '../types';

interface SubscriptionState {
  // Data
  plans: SubscriptionPlan[];
  currentSubscription: Subscription | null;
  selectedPlan: SubscriptionPlan | null;
  
  // Loading states
  isPlansLoading: boolean;
  isSubscriptionLoading: boolean;
  isUpgrading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  loadPlans: () => Promise<void>;
  loadCurrentSubscription: () => Promise<void>;
  selectPlan: (plan: SubscriptionPlan | null) => void;
  subscribeToPlan: (planId: string, paymentMethod?: any) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Initial state
  plans: [],
  currentSubscription: null,
  selectedPlan: null,
  isPlansLoading: false,
  isSubscriptionLoading: false,
  isUpgrading: false,
  error: null,

  // Load available plans
  loadPlans: async () => {
    set({ isPlansLoading: true, error: null });
    try {
      const plans = await subscriptionService.getPlans();
      set({
        plans,
        isPlansLoading: false
      });
    } catch (error: any) {
      set({
        isPlansLoading: false,
        error: error.message || 'Failed to load subscription plans'
      });
    }
  },

  // Load current subscription
  loadCurrentSubscription: async () => {
    set({ isSubscriptionLoading: true, error: null });
    try {
      const subscription = await subscriptionService.getCurrentSubscription();
      set({
        currentSubscription: subscription,
        isSubscriptionLoading: false
      });
    } catch (error: any) {
      set({
        isSubscriptionLoading: false,
        error: error.message || 'Failed to load current subscription'
      });
    }
  },

  // Select a plan for subscription
  selectPlan: (plan: SubscriptionPlan | null) => {
    set({ selectedPlan: plan });
  },

  // Subscribe to a plan
  subscribeToPlan: async (planId: string, paymentMethod?: any) => {
    set({ isUpgrading: true, error: null });
    try {
      const subscription = await subscriptionService.subscribe(planId, paymentMethod);
      set({
        currentSubscription: subscription,
        selectedPlan: null,
        isUpgrading: false
      });
    } catch (error: any) {
      set({
        isUpgrading: false,
        error: error.message || 'Failed to subscribe to plan'
      });
      throw error;
    }
  },

  // Cancel current subscription
  cancelSubscription: async () => {
    set({ isUpgrading: true, error: null });
    try {
      await subscriptionService.cancelSubscription();
      set({
        currentSubscription: null,
        isUpgrading: false
      });
    } catch (error: any) {
      set({
        isUpgrading: false,
        error: error.message || 'Failed to cancel subscription'
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));