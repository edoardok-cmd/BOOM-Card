describe('Mobile App Journey', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.visit('/');
  });

  describe('App Download Flow', () => {
    it('should display app download options on mobile', () => {
      cy.get('[data-testid="mobile-app-banner"]').should('be.visible');
      cy.get('[data-testid="app-store-link"]').should('have.attr', 'href').and('include', 'apps.apple.com');
      cy.get('[data-testid="google-play-link"]').should('have.attr', 'href').and('include', 'play.google.com');
    });

    it('should show QR code for desktop-to-mobile transition', () => {
      cy.viewport('macbook-15');
      cy.get('[data-testid="download-app-cta"]').click();
      cy.get('[data-testid="app-qr-code"]').should('be.visible');
      cy.get('[data-testid="qr-code-image"]').should('have.attr', 'src').and('include', 'qr-code');
    });

    it('should handle deep links from mobile browser', () => {
      cy.visit('/partner/restaurant-123');
      cy.get('[data-testid="open-in-app-button"]').click();
      cy.url().should('include', 'boom://partner/restaurant-123');
    });
  });

  describe('Mobile Navigation', () => {
    it('should have functional hamburger menu', () => {
      cy.get('[data-testid="mobile-menu-toggle"]').click();
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
      
      const menuItems = ['Food & Drink', 'Entertainment', 'Accommodation', 'Experiences'];
      menuItems.forEach(item => {
        cy.get('[data-testid="mobile-menu"]').contains(item).should('be.visible');
      });
    });

    it('should have sticky header on scroll', () => {
      cy.scrollTo(0, 500);
      cy.get('[data-testid="mobile-header"]').should('have.class', 'sticky');
      cy.get('[data-testid="mobile-header"]').should('have.css', 'position', 'fixed');
    });

    it('should have functional bottom navigation', () => {
      cy.get('[data-testid="bottom-nav"]').should('be.visible');
      cy.get('[data-testid="bottom-nav-home"]').should('be.visible');
      cy.get('[data-testid="bottom-nav-search"]').should('be.visible');
      cy.get('[data-testid="bottom-nav-favorites"]').should('be.visible');
      cy.get('[data-testid="bottom-nav-profile"]').should('be.visible');
    });
  });

  describe('Mobile Search Experience', () => {
    it('should have optimized search interface', () => {
      cy.get('[data-testid="mobile-search-button"]').click();
      cy.get('[data-testid="search-overlay"]').should('be.visible');
      cy.get('[data-testid="search-input"]').should('have.focus');
    });

    it('should show location-based results', () => {
      cy.intercept('GET', '/api/location', { fixture: 'user-location.json' });
      cy.get('[data-testid="mobile-search-button"]').click();
      cy.get('[data-testid="use-my-location"]').click();
      cy.get('[data-testid="nearby-partners"]').should('be.visible');
    });

    it('should have working voice search', () => {
      cy.get('[data-testid="mobile-search-button"]').click();
      cy.get('[data-testid="voice-search-button"]').should('be.visible');
    });

    it('should display search filters appropriately', () => {
      cy.get('[data-testid="mobile-search-button"]').click();
      cy.get('[data-testid="filter-button"]').click();
      cy.get('[data-testid="filter-drawer"]').should('be.visible');
      cy.get('[data-testid="filter-category"]').should('be.visible');
      cy.get('[data-testid="filter-discount"]').should('be.visible');
      cy.get('[data-testid="filter-distance"]').should('be.visible');
    });
  });

  describe('Mobile Map Experience', () => {
    it('should load interactive map on mobile', () => {
      cy.visit('/map');
      cy.get('[data-testid="mobile-map"]').should('be.visible');
      cy.get('[data-testid="map-center-location"]').click();
      cy.get('[data-testid="location-permission-prompt"]').should('be.visible');
    });

    it('should show partner pins on map', () => {
      cy.visit('/map');
      cy.get('[data-testid="partner-pin"]').should('have.length.greaterThan', 0);
      cy.get('[data-testid="partner-pin"]').first().click();
      cy.get('[data-testid="partner-preview-card"]').should('be.visible');
    });

    it('should have list/map toggle', () => {
      cy.visit('/search?category=restaurants');
      cy.get('[data-testid="view-toggle"]').should('be.visible');
      cy.get('[data-testid="map-view-button"]').click();
      cy.get('[data-testid="mobile-map"]').should('be.visible');
      cy.get('[data-testid="list-view-button"]').click();
      cy.get('[data-testid="results-list"]').should('be.visible');
    });
  });

  describe('Mobile Partner Details', () => {
    beforeEach(() => {
      cy.visit('/partner/restaurant-123');
    });

    it('should display partner information optimized for mobile', () => {
      cy.get('[data-testid="partner-hero-image"]').should('be.visible');
      cy.get('[data-testid="partner-name"]').should('be.visible');
      cy.get('[data-testid="discount-badge"]').should('be.visible');
      cy.get('[data-testid="partner-rating"]').should('be.visible');
    });

    it('should have swipeable image gallery', () => {
      cy.get('[data-testid="image-gallery"]').should('be.visible');
      cy.get('[data-testid="gallery-image"]').first().swipe('left');
      cy.get('[data-testid="gallery-indicator"]').eq(1).should('have.class', 'active');
    });

    it('should show mobile-optimized actions', () => {
      cy.get('[data-testid="mobile-actions-bar"]').should('be.visible');
      cy.get('[data-testid="call-button"]').should('be.visible');
      cy.get('[data-testid="directions-button"]').should('be.visible');
      cy.get('[data-testid="share-button"]').should('be.visible');
      cy.get('[data-testid="save-button"]').should('be.visible');
    });

    it('should handle QR code redemption flow', () => {
      cy.login('user@example.com', 'password');
      cy.get('[data-testid="redeem-discount-button"]').click();
      cy.get('[data-testid="qr-code-modal"]').should('be.visible');
      cy.get('[data-testid="qr-code"]').should('be.visible');
      cy.get('[data-testid="discount-timer"]').should('be.visible');
    });
  });

  describe('Mobile Authentication', () => {
    it('should show mobile-optimized login', () => {
      cy.get('[data-testid="bottom-nav-profile"]').click();
      cy.get('[data-testid="mobile-login-form"]').should('be.visible');
      cy.get('[data-testid="social-login-buttons"]').should('be.visible');
    });

    it('should support biometric login', () => {
      cy.window().then(win => {)
        if (win.navigator.credentials) {
          cy.get('[data-testid="bottom-nav-profile"]').click();
          cy.get('[data-testid="biometric-login"]').should('be.visible');
        });
    });

    it('should handle phone number verification', () => {
      cy.get('[data-testid="bottom-nav-profile"]').click();
      cy.get('[data-testid="phone-login-tab"]').click();
      cy.get('[data-testid="phone-input"]').type('+359888123456');
      cy.get('[data-testid="send-code-button"]').click();
      cy.get('[data-testid="verification-code-input"]').should('be.visible');
    });
  });

  describe('Mobile Subscription Flow', () => {
    beforeEach(() => {
      cy.login('user@example.com', 'password');
    });

    it('should display subscription options for mobile', () => {
      cy.visit('/subscription');
      cy.get('[data-testid="subscription-cards"]').should('be.visible');
      cy.get('[data-testid="plan-card"]').should('have.length', 3);
      cy.get('[data-testid="plan-features-list"]').should('be.visible');
    });

    it('should handle mobile payment methods', () => {
      cy.visit('/subscription');
      cy.get('[data-testid="plan-card"]').first().click();
      cy.get('[data-testid="mobile-payment-sheet"]').should('be.visible');
      cy.get('[data-testid="apple-pay-button"]').should('be.visible');
      cy.get('[data-testid="google-pay-button"]').should('be.visible');
    });

    it('should show digital card after subscription', () => {
      cy.intercept('POST', '/api/subscription/activate', { statusCode: 200 });
      cy.visit('/profile/card');
      cy.get('[data-testid="digital-card"]').should('be.visible');
      cy.get('[data-testid="card-number"]').should('be.visible');
      cy.get('[data-testid="add-to-wallet"]').should('be.visible');
    });
  });

  describe('Mobile User Profile', () => {
    beforeEach(() => {
      cy.login('user@example.com', 'password');
      cy.get('[data-testid="bottom-nav-profile"]').click();
    });

    it('should display user information', () => {
      cy.get('[data-testid="user-avatar"]').should('be.visible');
      cy.get('[data-testid="user-name"]').should('be.visible');
      cy.get('[data-testid="membership-status"]').should('be.visible');
      cy.get('[data-testid="total-savings"]').should('be.visible');
    });

    it('should show transaction history', () => {
      cy.get('[data-testid="transaction-history"]').click();
      cy.get('[data-testid="transaction-list"]').should('be.visible');
      cy.get('[data-testid="transaction-item"]').should('have.length.greaterThan', 0);
    });

    it('should handle profile settings', () => {
      cy.get('[data-testid="profile-settings"]').click();
      cy.get('[data-testid="notification-preferences"]').should('be.visible');
      cy.get('[data-testid="language-selector"]').should('be.visible');
      cy.get('[data-testid="privacy-settings"]').should('be.visible');
    });
  });

  describe('Mobile Favorites', () => {
    beforeEach(() => {
      cy.login('user@example.com', 'password');
    });

    it('should save partners to favorites', () => {
      cy.visit('/partner/restaurant-123');
      cy.get('[data-testid="save-button"]').click();
      cy.get('[data-testid="saved-confirmation"]').should('be.visible');
      
      cy.get('[data-testid="bottom-nav-favorites"]').click();
      cy.get('[data-testid="favorite-item"]').should('contain', 'Restaurant 123');
    });

    it('should organize favorites by category', () => {
      cy.get('[data-testid="bottom-nav-favorites"]').click();
      cy.get('[data-testid="favorites-filter"]').should('be.visible');
      cy.get('[data-testid="filter-restaurants"]').click();
      cy.get('[data-testid="favorite-item"]').each($el => {
        cy.wrap($el).should('have.attr', 'data-category', 'restaurant');
      });
    });
  });

  describe('Mobile Notifications', () => {
    beforeEach(() => {
      cy.login('user@example.com', 'password');
    });

    it('should request push notification permissions', () => {
      cy.visit('/');
      cy.window().then(win => {)
        if ('Notification' in win) {
          cy.get('[data-testid="enable-notifications-prompt"]').should('be.visible');
        });
    });

    it('should display in-app notifications', () => {
      cy.intercept('GET', '/api/notifications', { fixture: 'notifications.json' });
      cy.get('[data-testid="notification-bell"]').click();
      cy.get('[data-testid="notification-drawer"]').should('be.visible');
      cy.get('[data-testid="notification-item"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Mobile Performance', () => {
    it('should implement infinite scroll for search results', () => {
      cy.visit('/search?category=restaurants');
      cy.get('[data-testid="results-list"]').scrollTo('bottom');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="partner-card"]').should('have.length.greaterThan', 10);
    });

    it('should lazy load images', () => {
      cy.visit('/');
      cy.get('[data-testid="partner-image"][loading="lazy"]').should('exist');
    });

    it('should work offline with cached data', () => {
      cy.visit('/');
      cy.window().then(win => {)
        if ('serviceWorker' in win.navigator) {
          cy.get('[data-testid="offline-indicator"]').should('not.exist');
        });
    });
  });

  desc
}
}
}
}
