import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

interface UIState {
  // Mobile menu
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Modals
  activeModal: string | null;
  modalProps: any;
  openModal: (modalId: string, props?: any) => void;
  closeModal: () => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Mobile menu
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (isOpen: boolean) => set({ isMobileMenuOpen: isOpen }),
  
  // Notifications
  notifications: [],
  
  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration || 5000
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));
    
    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
  },
  
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  clearNotifications: () => set({ notifications: [] }),
  
  // Loading states
  globalLoading: false,
  loadingMessage: null,
  setGlobalLoading: (loading: boolean, message?: string) => {
    set({
      globalLoading: loading,
      loadingMessage: message || null
    });
  },
  
  // Modals
  activeModal: null,
  modalProps: null,
  openModal: (modalId: string, props?: any) => {
    set({
      activeModal: modalId,
      modalProps: props
    });
  },
  closeModal: () => {
    set({
      activeModal: null,
      modalProps: null
    });
  },
  
  // Theme
  theme: 'light',
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);
      }
      return { theme: newTheme };
    });
  },
  setTheme: (theme: 'light' | 'dark') => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
    set({ theme });
  }
}));

// Helper functions for common notifications
export const showSuccessNotification = (title: string, message?: string) => {
  useUIStore.getState().addNotification({
    type: 'success',
    title,
    message
  });
};

export const showErrorNotification = (title: string, message?: string) => {
  useUIStore.getState().addNotification({
    type: 'error',
    title,
    message,
    duration: 8000 // Errors stay longer
  });
};

export const showWarningNotification = (title: string, message?: string) => {
  useUIStore.getState().addNotification({
    type: 'warning',
    title,
    message
  });
};

export const showInfoNotification = (title: string, message?: string) => {
  useUIStore.getState().addNotification({
    type: 'info',
    title,
    message
  });
};