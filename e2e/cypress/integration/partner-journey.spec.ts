describe('Partner Journey', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login', { fixture: 'partner-login.json' }).as('partnerLogin');
    cy.intercept('GET', '/api/partner/dashboard', { fixture: 'partner-dashboard.json' }).as('getDashboard');
    cy.intercept('GET', '/api/partner/transactions', { fixture: 'partner-transactions.json' }).as('getTransactions');
    cy.intercept('GET', '/api/partner/analytics', { fixture: 'partner-analytics.json' }).as('getAnalytics');
  });

  describe('Partner Registration', () => {
    beforeEach(() => {
      cy.visit('/partner/register');
    });

    it('should display registration form with all required fields', () => {
      cy.get('[data-cy=partner-registration-form]').should('be.visible');
      cy.get('[data-cy=business-name-input]').should('be.visible');
      cy.get('[data-cy=business-type-select]').should('be.visible');
      cy.get('[data-cy=contact-person-input]').should('be.visible');
      cy.get('[data-cy=email-input]').should('be.visible');
      cy.get('[data-cy=phone-input]').should('be.visible');
      cy.get('[data-cy=address-input]').should('be.visible');
      cy.get('[data-cy=city-input]').should('be.visible');
      cy.get('[data-cy=discount-percentage-input]').should('be.visible');
      cy.get('[data-cy=terms-checkbox]').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('[data-cy=submit-registration]').click();
      
      cy.get('[data-cy=business-name-error]').should('contain', 'Business name is required');
      cy.get('[data-cy=email-error]').should('contain', 'Email is required');
      cy.get('[data-cy=phone-error]').should('contain', 'Phone number is required');
      cy.get('[data-cy=terms-error]').should('contain', 'You must accept the terms');
    });

    it('should validate email format', () => {
      cy.get('[data-cy=email-input]').type('invalid-email');
      cy.get('[data-cy=submit-registration]').click();
      cy.get('[data-cy=email-error]').should('contain', 'Please enter a valid email');
    });

    it('should validate discount percentage range', () => {
      cy.get('[data-cy=discount-percentage-input]').type('150');
      cy.get('[data-cy=submit-registration]').click();
      cy.get('[data-cy=discount-error]').should('contain', 'Discount must be between 5% and 50%');
    });

    it('should successfully register a new partner', () => {
      cy.intercept('POST', '/api/partner/register', {
        statusCode: 201,
        body: { 
          id: 'partner-123',
          status: 'pending_verification',
          message: 'Registration successful. Please check your email for verification.'
        }).as('registerPartner');

      cy.get('[data-cy=business-name-input]').type('Test Restaurant');
      cy.get('[data-cy=business-type-select]').select('restaurant');
      cy.get('[data-cy=contact-person-input]').type('John Doe');
      cy.get('[data-cy=email-input]').type('john@testrestaurant.com');
      cy.get('[data-cy=phone-input]').type('+359888123456');
      cy.get('[data-cy=address-input]').type('123 Test Street');
      cy.get('[data-cy=city-input]').type('Sofia');
      cy.get('[data-cy=discount-percentage-input]').type('15');
      cy.get('[data-cy=terms-checkbox]').check();
      
      cy.get('[data-cy=submit-registration]').click();
      
      cy.wait('@registerPartner');
      cy.url().should('include', '/partner/registration-success');
      cy.get('[data-cy=success-message]').should('contain', 'Registration successful');
    });

    it('should support Bulgarian language registration', () => {
      cy.get('[data-cy=language-selector]').select('bg');
      
      cy.get('[data-cy=form-title]').should('contain', 'Регистрация на партньор');
      cy.get('[data-cy=business-name-label]').should('contain', 'Име на бизнеса');
      cy.get('[data-cy=submit-registration]').should('contain', 'Регистрирай се');
    });
  });

  describe('Partner Login', () => {
    beforeEach(() => {
      cy.visit('/partner/login');
    });

    it('should display login form', () => {
      cy.get('[data-cy=partner-login-form]').should('be.visible');
      cy.get('[data-cy=email-input]').should('be.visible');
      cy.get('[data-cy=password-input]').should('be.visible');
      cy.get('[data-cy=remember-me-checkbox]').should('be.visible');
      cy.get('[data-cy=forgot-password-link]').should('be.visible');
    });

    it('should validate login credentials', () => {
      cy.get('[data-cy=login-button]').click();
      
      cy.get('[data-cy=email-error]').should('contain', 'Email is required');
      cy.get('[data-cy=password-error]').should('contain', 'Password is required');
    });

    it('should handle invalid credentials', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { error: 'Invalid email or password' }).as('invalidLogin');

      cy.get('[data-cy=email-input]').type('wrong@email.com');
      cy.get('[data-cy=password-input]').type('wrongpassword');
      cy.get('[data-cy=login-button]').click();
      
      cy.wait('@invalidLogin');
      cy.get('[data-cy=login-error]').should('contain', 'Invalid email or password');
    });

    it('should successfully login partner', () => {
      cy.get('[data-cy=email-input]').type('partner@testrestaurant.com');
      cy.get('[data-cy=password-input]').type('ValidPassword123!');
      cy.get('[data-cy=remember-me-checkbox]').check();
      cy.get('[data-cy=login-button]').click();
      
      cy.wait('@partnerLogin');
      cy.url().should('include', '/partner/dashboard');
      cy.get('[data-cy=welcome-message]').should('contain', 'Welcome back');
    });

    it('should handle forgot password flow', () => {
      cy.get('[data-cy=forgot-password-link]').click();
      cy.url().should('include', '/partner/forgot-password');
      
      cy.get('[data-cy=reset-email-input]').type('partner@testrestaurant.com');
      cy.get('[data-cy=send-reset-button]').click();
      
      cy.get('[data-cy=reset-success]').should('contain', 'Password reset email sent');
    });
  });

  describe('Partner Dashboard', () => {
    beforeEach(() => {
      cy.login('partner');
      cy.visit('/partner/dashboard');
    });

    it('should display dashboard overview', () => {
      cy.wait('@getDashboard');
      
      cy.get('[data-cy=dashboard-header]').should('contain', 'Partner Dashboard');
      cy.get('[data-cy=total-transactions]').should('be.visible');
      cy.get('[data-cy=total-savings]').should('be.visible');
      cy.get('[data-cy=average-discount]').should('be.visible');
      cy.get('[data-cy=active-customers]').should('be.visible');
    });

    it('should display recent transactions', () => {
      cy.wait('@getTransactions');
      
      cy.get('[data-cy=transactions-table]').should('be.visible');
      cy.get('[data-cy=transaction-row]').should('have.length.at.least', 1);
      
      cy.get('[data-cy=transaction-row]').first().within(() => {
        cy.get('[data-cy=transaction-date]').should('be.visible');
        cy.get('[data-cy=customer-id]').should('be.visible');
        cy.get('[data-cy=original-amount]').should('be.visible');
        cy.get('[data-cy=discount-amount]').should('be.visible');
        cy.get('[data-cy=final-amount]').should('be.visible');
      });
    });

    it('should filter transactions by date range', () => {
      cy.get('[data-cy=date-filter-start]').type('2024-01-01');
      cy.get('[data-cy=date-filter-end]').type('2024-01-31');
      cy.get('[data-cy=apply-filter-button]').click();
      
      cy.wait('@getTransactions');
      cy.get('[data-cy=transaction-row]').each(($row) => {
        cy.wrap($row).find('[data-cy=transaction-date]')
          .invoke('text')
          .should('match', /2024-01/);
      });
    });

    it('should export transactions', () => {
      cy.get('[data-cy=export-button]').click();
      cy.get('[data-cy=export-format-select]').select('csv');
      cy.get('[data-cy=confirm-export]').click();
      
      cy.get('[data-cy=export-success]').should('contain', 'Export completed');
    });

    it('should display analytics charts', () => {
      cy.wait('@getAnalytics');
      
      cy.get('[data-cy=revenue-chart]').should('be.visible');
      cy.get('[data-cy=customer-chart]').should('be.visible');
      cy.get('[data-cy=peak-hours-chart]').should('be.visible');
      cy.get('[data-cy=popular-items-chart]').should('be.visible');
    });

    it('should update business information', () => {
      cy.get('[data-cy=settings-tab]').click();
      
      cy.get('[data-cy=business-hours-input]').clear().type('09:00 - 22:00');
      cy.get('[data-cy=description-textarea]').clear().type('Updated restaurant description');
      cy.get('[data-cy=save-settings-button]').click();
      
      cy.get('[data-cy=settings-success]').should('contain', 'Settings updated successfully');
    });

    it('should manage discount offers', () => {
      cy.get('[data-cy=offers-tab]').click();
      
      cy.get('[data-cy=add-offer-button]').click();
      cy.get('[data-cy=offer-title-input]').type('Weekend Special');
      cy.get('[data-cy=offer-discount-input]').type('20');
      cy.get('[data-cy=offer-valid-from]').type('2024-02-01');
      cy.get('[data-cy=offer-valid-to]').type('2024-02-29');
      cy.get('[data-cy=save-offer-button]').click();
      
      cy.get('[data-cy=offer-success]').should('contain', 'Offer created successfully');
      cy.get('[data-cy=offers-list]').should('contain', 'Weekend Special');
    });

    it('should handle QR code generation', () => {
      cy.get('[data-cy=qr-codes-tab]').click();
      
      cy.get('[data-cy=generate-qr-button]').click();
      cy.get('[data-cy=qr-type-select]').select('table');
      cy.get('[data-cy=table-number-input]').type('5');
      cy.get('[data-cy=generate-button]').click();
      
      cy.get('[data-cy=qr-code-display]').should('be.visible');
      cy.get
}}}
}
}
