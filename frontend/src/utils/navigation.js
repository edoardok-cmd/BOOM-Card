// Navigation utility functions
export const navigationHandlers = {
  goToPlans: (router) => {
    router.push('/subscriptions');
  },
  
  goToPartners: (router) => {
    router.push('/partners');
  },
  
  goToDashboard: (router) => {
    router.push('/dashboard');
  },
  
  goToProfile: (router) => {
    router.push('/profile');
  },
  
  goToAccountSettings: (router) => {
    router.push('/account-settings');
  },
  
  goToPartnerCategory: (router, category) => {
    router.push(`/partners?category=${category}`);
  },
  
  goToPartnerDetails: (router, partnerId) => {
    router.push(`/partners/${partnerId}`);
  },
  
  startMembership: (router, plan) => {
    if (plan) {
      router.push(`/subscriptions?plan=${plan}`);
    } else {
      router.push('/subscriptions');
    }
  },
  
  downloadApp: (platform) => {
    // Placeholder URLs - replace with actual app store links
    const urls = {
      ios: 'https://apps.apple.com/app/boomcard',
      android: 'https://play.google.com/store/apps/details?id=com.boomcard'
    };
    window.open(urls[platform], '_blank');
  },
  
  openSocialMedia: (platform) => {
    // Placeholder URLs - replace with actual social media links
    const urls = {
      facebook: 'https://facebook.com/boomcard',
      twitter: 'https://twitter.com/boomcard',
      instagram: 'https://instagram.com/boomcard',
      linkedin: 'https://linkedin.com/company/boomcard'
    };
    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  },
  
  showComingSoon: () => {
    alert('This feature is coming soon! Stay tuned for updates.');
  },
  
  showDemo: () => {
    alert('Demo mode: This action would be performed in production.');
  }
};

// Button click handlers
export const buttonHandlers = {
  handleSaveChanges: (section) => {
    alert(`Changes saved for ${section}! (In production, this would save to the database)`);
  },
  
  handleUpgradeToVIP: (router) => {
    router.push('/subscriptions?plan=vip');
  },
  
  handleChangePassword: () => {
    alert('Password change functionality coming soon!');
  },
  
  handleConnectSocial: (platform) => {
    alert(`Connect to ${platform} coming soon!`);
  },
  
  handleContactSupport: () => {
    window.location.href = 'mailto:support@boomcard.bg?subject=Support Request';
  },
  
  handlePartnerWithUs: () => {
    window.location.href = 'mailto:partners@boomcard.bg?subject=Partnership Inquiry';
  }
};