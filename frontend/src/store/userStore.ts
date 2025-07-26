import { create } from 'zustand';
import { userService } from '../services/userService';
import { UserStats, Activity, Achievement } from '../types';

interface UserState {
  // Data
  stats: UserStats | null;
  activities: Activity[];
  achievements: Achievement[];
  qrCode: string | null;
  
  // Loading states
  isStatsLoading: boolean;
  isActivitiesLoading: boolean;
  isAchievementsLoading: boolean;
  isQrLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  loadStats: () => Promise<void>;
  loadActivities: (limit?: number) => Promise<void>;
  loadAchievements: () => Promise<void>;
  loadQrCode: () => Promise<void>;
  regenerateQrCode: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  stats: null,
  activities: [],
  achievements: [],
  qrCode: null,
  isStatsLoading: false,
  isActivitiesLoading: false,
  isAchievementsLoading: false,
  isQrLoading: false,
  error: null
};

export const useUserStore = create<UserState>((set, get) => ({
  ...initialState,

  // Load user statistics
  loadStats: async () => {
    set({ isStatsLoading: true, error: null });
    try {
      const stats = await userService.getUserStats();
      set({
        stats,
        isStatsLoading: false
      });
    } catch (error: any) {
      set({
        isStatsLoading: false,
        error: error.message || 'Failed to load statistics'
      });
    }
  },

  // Load user activities
  loadActivities: async (limit = 10) => {
    set({ isActivitiesLoading: true, error: null });
    try {
      const activities = await userService.getActivities(limit);
      set({
        activities,
        isActivitiesLoading: false
      });
    } catch (error: any) {
      set({
        isActivitiesLoading: false,
        error: error.message || 'Failed to load activities'
      });
    }
  },

  // Load user achievements
  loadAchievements: async () => {
    set({ isAchievementsLoading: true, error: null });
    try {
      const achievements = await userService.getAchievements();
      set({
        achievements,
        isAchievementsLoading: false
      });
    } catch (error: any) {
      set({
        isAchievementsLoading: false,
        error: error.message || 'Failed to load achievements'
      });
    }
  },

  // Load QR code
  loadQrCode: async () => {
    set({ isQrLoading: true, error: null });
    try {
      const qrData = await userService.getQrCode();
      set({
        qrCode: qrData.qrCode,
        isQrLoading: false
      });
    } catch (error: any) {
      set({
        isQrLoading: false,
        error: error.message || 'Failed to load QR code'
      });
    }
  },

  // Regenerate QR code
  regenerateQrCode: async () => {
    set({ isQrLoading: true, error: null });
    try {
      const qrData = await userService.regenerateQrCode();
      set({
        qrCode: qrData.qrCode,
        isQrLoading: false
      });
    } catch (error: any) {
      set({
        isQrLoading: false,
        error: error.message || 'Failed to regenerate QR code'
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store (useful on logout)
  reset: () => {
    set(initialState);
  }
}));