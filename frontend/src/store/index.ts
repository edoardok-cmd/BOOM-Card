export { useAuthStore } from './authStore';
export { usePartnerStore } from './partnerStore';
export { useUserStore } from './userStore';
export { useSubscriptionStore } from './subscriptionStore';
export { useUIStore, showSuccessNotification, showErrorNotification, showWarningNotification, showInfoNotification } from './uiStore';

// Store reset function for logout
export const resetAllStores = () => {
  useAuthStore.getState().logout();
  useUserStore.getState().reset();
  // Partner and subscription stores maintain their data
  // UI store maintains its state
};
