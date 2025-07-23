import { NextRouter } from 'next/router';

// Navigation utility functions
export const navigationHandlers = {
  goToPlans: (router: NextRouter) => {
    router.push('/subscriptions');
  },
  
  goToPartners: (router: NextRouter) => {
    router.push('/partners');
  },
  
  goToDashboard: (router: NextRouter) => {
    router.push('/dashboard');
  },
  
  goToProfile: (router: NextRouter) => {
    router.push('/profile');
  },
  
  goToAccountSettings: (router: NextRouter) => {
    router.push('/account-settings');
  },
  
  goToPartnerCategory: (router: NextRouter, category: string) => {
    router.push(`/partners?category=${category}`);
  },
  
  goToPartnerDetails: (router: NextRouter, partnerId: string) => {
    router.push(`/partners/${partnerId}`);
  },
  
  startMembership: (router: NextRouter, plan?: string) => {
    if (plan) {
      router.push(`/subscriptions?plan=${plan}`);
    } else {
      router.push('/subscriptions');
    }
  },
  
  downloadApp: (platform: 'ios' | 'android') => {
    // Placeholder URLs - replace with actual app store links
    const urls = {
      ios: 'https://apps.apple.com/app/boom-card',
      android: 'https://play.google.com/store/apps/details?id=com.boomcard'
    };
    window.open(urls[platform], '_blank');
  },
  
  openSocialMedia: (platform: string) => {
    // Placeholder URLs - replace with actual social media links
    const urls: { [key: string]: string } = {
      facebook: 'https://facebook.com/boomcardbg',
      twitter: 'https://twitter.com/boomcardbg',
      instagram: 'https://instagram.com/boomcardbg',
      linkedin: 'https://linkedin.com/company/boomcardbg'
    };
    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  },
  
  showComingSoon: () => {
    alert('This feature is coming soon! Stay tuned for updates.');
  },
  
  showDemo: () => {
    alert('Demo mode: This would show a product demo or video walkthrough.');
  }
};

// Button click handlers
export const buttonHandlers = {
  handleSaveChanges: (section: string) => {
    alert(`Changes saved for ${section}! (In production, this would save to the database)`);
  },
  
  handleUpgradeToVIP: (router: NextRouter) => {
    router.push('/subscriptions?plan=vip');
  },
  
  handleChangePassword: () => {
    alert('Password change functionality coming soon!');
  },
  
  handleConnectSocial: (platform: string) => {
    alert(`Connect to ${platform} coming soon!`);
  },
  
  handleContactSupport: () => {
    window.location.href = 'mailto:support@boomcard.bg';
  },
  
  handlePartnerWithUs: () => {
    window.location.href = 'mailto:partners@boomcard.bg?subject=Partnership Inquiry';
  }
};