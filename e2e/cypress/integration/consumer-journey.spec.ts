describe('Consumer Journey - BOOM Card', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/partners/search*', { fixture: 'partners.json' }).as('searchPartners');
    cy.intercept('GET', '/api/partners/*', { fixture: 'partner-details.json' }).as('getPartner');
    cy.intercept('POST', '/api/auth/login', { fixture: 'user-auth.json' }).as('login');
    cy.intercept('POST', '/api/subscriptions/create', { fixture: 'subscription.json' }).as('createSubscription');
    cy.intercept('GET', '/api/user/profile', { fixture: 'user-profile.json' }).as('getUserProfile');
    cy.intercept('GET', '/api/user/savings', { fixture: 'user-savings.json' }).as('getUserSavings');
  });

  describe('Landing Page Experience', () => {
    it('should display hero section with key value propositions', () => {
      cy.visit('/');
      
      cy.get('[data-cy=hero-section]').should('be.visible');
      cy.get('[data-cy=hero-title]').should('contain', 'Save up to 50%');
      cy.get('[data-cy=hero-subtitle]').should('contain', 'Exclusive discounts');
      cy.get('[data-cy=cta-get-started]').should('be.visible');
      cy.get('[data-cy=download-app-qr]').should('be.visible');
    });

    it('should show platform statistics', () => {
      cy.visit('/');
      
      cy.get('[data-cy=stats-section]').within(() => {
        cy.get('[data-cy=stat-partners]').should('be.visible');
        cy.get('[data-cy=stat-savings]').should('be.visible');
        cy.get('[data-cy=stat-users]').should('be.visible');
      });
    });

    it('should display interactive map with nearby partners', () => {
      cy.visit('/');
      
      cy.get('[data-cy=interactive-map]').should('be.visible');
      cy.get('[data-cy=map-markers]').should('have.length.greaterThan', 0);
      
      // Test map interaction
      cy.get('[data-cy=map-marker]').first().click();
      cy.get('[data-cy=map-popup]').should('be.visible');
      cy.get('[data-cy=map-popup-discount]').should('contain', '%');
    });

    it('should switch language between EN and BG', () => {
      cy.visit('/');
      
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-bg]').click();
      
      cy.get('[data-cy=hero-title]').should('contain', 'Спестете до 50%');
      
      cy.get('[data-cy=language-selector]').click();
      cy.get('[data-cy=language-en]').click();
      
      cy.get('[data-cy=hero-title]').should('contain', 'Save up to 50%');
    });
  });

  describe('Partner Discovery', () => {
    it('should search partners with filters', () => {
      cy.visit('/');
      
      cy.get('[data-cy=search-input]').type('restaurant');
      cy.get('[data-cy=search-button]').click();
      
      cy.wait('@searchPartners');
      
      cy.get('[data-cy=search-results]').should('be.visible');
      cy.get('[data-cy=partner-card]').should('have.length.greaterThan', 0);
    });

    it('should apply category filters', () => {
      cy.visit('/food-drink');
      
      cy.get('[data-cy=filter-cuisine-italian]').click();
      cy.get('[data-cy=filter-dietary-vegan]').click();
      cy.get('[data-cy=filter-discount-20plus]').click();
      
      cy.wait('@searchPartners');
      
      cy.get('[data-cy=partner-card]').each(($card) => {
        cy.wrap($card).find('[data-cy=partner-discount]').invoke('text')
          .then((text) => {
            const discount = parseInt(text.replace('%', ''));
            expect(discount).to.be.at.least(20);
          });
      });
    });

    it('should sort partners by different criteria', () => {
      cy.visit('/food-drink');
      
      cy.get('[data-cy=sort-dropdown]').select('discount-desc');
      cy.wait('@searchPartners');
      
      let previousDiscount = 100;
      cy.get('[data-cy=partner-discount]').each(($el) => {
        const currentDiscount = parseInt($el.text().replace('%', ''));
        expect(currentDiscount).to.be.at.most(previousDiscount);
        previousDiscount = currentDiscount;
      });
    });

    it('should view partner details', () => {
      cy.visit('/food-drink');
      
      cy.get('[data-cy=partner-card]').first().click();
      cy.wait('@getPartner');
      
      cy.get('[data-cy=partner-name]').should('be.visible');
      cy.get('[data-cy=partner-description]').should('be.visible');
      cy.get('[data-cy=partner-discount]').should('be.visible');
      cy.get('[data-cy=partner-location]').should('be.visible');
      cy.get('[data-cy=partner-hours]').should('be.visible');
      cy.get('[data-cy=partner-gallery]').should('be.visible');
      cy.get('[data-cy=partner-reviews]').should('be.visible');
    });
  });

  describe('Registration and Subscription', () => {
    it('should complete registration flow', () => {
      cy.visit('/');
      cy.get('[data-cy=cta-get-started]').click();
      
      // Fill registration form
      cy.get('[data-cy=register-email]').type('newuser@example.com');
      cy.get('[data-cy=register-password]').type('SecurePass123!');
      cy.get('[data-cy=register-confirm-password]').type('SecurePass123!');
      cy.get('[data-cy=register-phone]').type('+359888123456');
      cy.get('[data-cy=register-agree-terms]').check();
      
      cy.get('[data-cy=register-submit]').click();
      
      // Verify email step
      cy.get('[data-cy=verify-email-message]').should('be.visible');
    });

    it('should select and purchase subscription plan', () => {
      cy.login('user@example.com', 'password');
      cy.visit('/subscription/plans');
      
      // Select annual plan
      cy.get('[data-cy=plan-annual]').within(() => {
        cy.get('[data-cy=plan-price]').should('contain', '29.99');
        cy.get('[data-cy=plan-savings]').should('contain', 'Save 50%');
        cy.get('[data-cy=plan-select]').click();
      });
      
      // Payment form
      cy.get('[data-cy=payment-form]').should('be.visible');
      cy.get('[data-cy=card-number]').type('4242424242424242');
      cy.get('[data-cy=card-expiry]').type('12/25');
      cy.get('[data-cy=card-cvc]').type('123');
      cy.get('[data-cy=billing-name]').type('John Doe');
      
      cy.get('[data-cy=complete-payment]').click();
      cy.wait('@createSubscription');
      
      // Success page
      cy.get('[data-cy=subscription-success]').should('be.visible');
      cy.get('[data-cy=card-number-display]').should('be.visible');
    });
  });

  describe('Using Discount Card', () => {
    beforeEach(() => {
      cy.login('user@example.com', 'password');
    });

    it('should generate and display QR code', () => {
      cy.visit('/my-card');
      
      cy.get('[data-cy=qr-code]').should('be.visible');
      cy.get('[data-cy=card-number]').should('be.visible');
      cy.get('[data-cy=card-holder-name]').should('contain', 'John Doe');
      cy.get('[data-cy=card-expiry]').should('be.visible');
    });

    it('should save partner to favorites', () => {
      cy.visit('/partners/restaurant-sofia');
      
      cy.get('[data-cy=favorite-button]').click();
      cy.get('[data-cy=favorite-button]').should('have.class', 'favorited');
      
      cy.visit('/profile/favorites');
      cy.get('[data-cy=favorite-partner]').should('contain', 'Restaurant Sofia');
    });

    it('should track savings history', () => {
      cy.visit('/profile/savings');
      cy.wait('@getUserSavings');
      
      cy.get('[data-cy=total-savings]').should('be.visible');
      cy.get('[data-cy=savings-chart]').should('be.visible');
      cy.get('[data-cy=transaction-history]').should('be.visible');
      
      cy.get('[data-cy=transaction-item]').first().within(() => {
        cy.get('[data-cy=transaction-partner]').should('be.visible');
        cy.get('[data-cy=transaction-amount]').should('be.visible');
        cy.get('[data-cy=transaction-discount]').should('be.visible');
        cy.get('[data-cy=transaction-saved]').should('be.visible');
      });
    });
  });

  describe('Mobile App Download', () => {
    it('should show app download options', () => {
      cy.visit('/');
      
      cy.get('[data-cy=mobile-app-section]').scrollIntoView();
      cy.get('[data-cy=app-store-link]').should('have.attr', 'href').and('include', 'apps.apple.com');
      cy.get('[data-cy=google-play-link]').should('have.attr', 'href').and('include', 'play.google.com');
      cy.get('[data-cy=app-qr-code]').should('be.visible');
    });
  });

  describe('Profile Management', () => {
    beforeEach(() => {
      cy.login('user@example.com', 'password');
    });

    it('should update profile information', () => {
      cy.visit('/profile/settings');
      
      cy.get('[data-cy=profile-name]').clear().type('Jane Smith');
      cy.get('[data-cy=profile-phone]').clear().type('+359888999888');
      cy.get('[data-cy=profile-language]').select('bg');
      cy.get('[data-cy=profile-notifications-email]').check();
      cy.get('[data-cy=profile-notifications-sms]').uncheck();
      
      cy.get('[data-cy=save-profile]').click();
      cy.get('[data-cy=success-message]').should('contain', 'Profile updated');
    });

    it('should manage subscription', () => {
      cy.visit('/profile/subscription');
      
      cy.get('[data-cy=subscription-status]').should('contain', 'Active');
      cy.get('[data-cy=subscription-plan]').should('contain', 'Annual');
      cy.get('[data-cy=subscription-expiry]').should('be.visible');
      
      // Test renewal
      cy.get('[data-cy=renew-subscription]').click();
      cy.get('[data-cy=renewal-options]').should('be.visible');
    });
  });

  describe('Search and Filters', () => {
    it('should use location-based search', () => {
      cy.visit('/');
      
      // Allow location access
      cy.mockGeolocation(42.6977, 23.3219); // Sofia coordinates
      
      cy.get('[data-cy=use-my-location]').click();
      cy.wait('@searchPartners');
      
      cy.get('[data-cy=location-indicator]').should('contain', 'Sofia');
      cy.get('[data-cy=partner-distance]').each(($el) => {
        const distance = 
}}}}