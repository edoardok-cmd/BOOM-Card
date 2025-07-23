describe('Admin User Journey', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login', { fixture: 'admin-login.json' }).as('adminLogin');
    cy.intercept('GET', '/api/admin/dashboard/stats', { fixture: 'admin-dashboard-stats.json' }).as('dashboardStats');
    cy.intercept('GET', '/api/admin/partners*', { fixture: 'admin-partners.json' }).as('partners');
    cy.intercept('GET', '/api/admin/users*', { fixture: 'admin-users.json' }).as('users');
    cy.intercept('GET', '/api/admin/transactions*', { fixture: 'admin-transactions.json' }).as('transactions');
    cy.intercept('GET', '/api/admin/reports*', { fixture: 'admin-reports.json' }).as('reports');
  });

  describe('Authentication', () => {
    it('should login as admin successfully', () => {
      cy.visit('/admin/login');
      
      // Check login page elements
      cy.get('[data-cy=admin-login-form]').should('be.visible');
      cy.get('[data-cy=email-input]').should('be.visible');
      cy.get('[data-cy=password-input]').should('be.visible');
      
      // Perform login
      cy.get('[data-cy=email-input]').type('admin@boomcard.bg');
      cy.get('[data-cy=password-input]').type('SecureAdminPass123!');
      cy.get('[data-cy=remember-me-checkbox]').check();
      cy.get('[data-cy=login-button]').click();
      
      // Wait for login and redirect
      cy.wait('@adminLogin');
      cy.url().should('include', '/admin/dashboard');
      
      // Verify admin session
      cy.getCookie('admin-token').should('exist');
      cy.get('[data-cy=admin-header]').should('contain', 'Admin Dashboard');
    });

    it('should handle invalid credentials', () => {
      cy.visit('/admin/login');
      
      cy.get('[data-cy=email-input]').type('wrong@email.com');
      cy.get('[data-cy=password-input]').type('wrongpassword');
      cy.get('[data-cy=login-button]').click();
      
      cy.get('[data-cy=error-message]').should('be.visible')
        .and('contain', 'Invalid credentials');
    });

    it('should enforce two-factor authentication', () => {
      cy.intercept('POST', '/api/auth/login', { 
        statusCode: 200,
        body: { requiresTwoFactor: true, tempToken: 'temp-123' }).as('loginWith2FA');
      
      cy.visit('/admin/login');
      cy.get('[data-cy=email-input]').type('admin@boomcard.bg');
      cy.get('[data-cy=password-input]').type('SecureAdminPass123!');
      cy.get('[data-cy=login-button]').click();
      
      cy.wait('@loginWith2FA');
      
      // Should show 2FA input
      cy.get('[data-cy=two-factor-form]').should('be.visible');
      cy.get('[data-cy=otp-input]').type('123456');
      cy.get('[data-cy=verify-otp-button]').click();
      
      cy.url().should('include', '/admin/dashboard');
    });
  });

  describe('Dashboard Overview', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.visit('/admin/dashboard');
    });

    it('should display key metrics', () => {
      cy.wait('@dashboardStats');
      
      // Revenue metrics
      cy.get('[data-cy=total-revenue-card]').should('be.visible');
      cy.get('[data-cy=monthly-revenue-card]').should('be.visible');
      cy.get('[data-cy=revenue-growth-indicator]').should('have.class', 'positive');
      
      // User metrics
      cy.get('[data-cy=total-users-card]').should('contain', '12,543');
      cy.get('[data-cy=active-subscriptions-card]').should('contain', '8,234');
      cy.get('[data-cy=new-users-today-card]').should('contain', '47');
      
      // Partner metrics
      cy.get('[data-cy=total-partners-card]').should('contain', '523');
      cy.get('[data-cy=pending-partners-card]').should('contain', '15');
      
      // Transaction metrics
      cy.get('[data-cy=daily-transactions-card]').should('contain', '1,234');
      cy.get('[data-cy=total-savings-card]').should('contain', '€145,678');
    });

    it('should display real-time activity feed', () => {
      cy.get('[data-cy=activity-feed]').should('be.visible');
      cy.get('[data-cy=activity-item]').should('have.length.at.least', 5);
      
      // Check activity item structure
      cy.get('[data-cy=activity-item]').first().within(() => {
        cy.get('[data-cy=activity-timestamp]').should('be.visible');
        cy.get('[data-cy=activity-type]').should('be.visible');
        cy.get('[data-cy=activity-description]').should('be.visible');
      });
    });

    it('should show revenue charts', () => {
      cy.get('[data-cy=revenue-chart]').should('be.visible');
      cy.get('[data-cy=chart-period-selector]').select('Last 30 days');
      
      // Verify chart updates
      cy.get('[data-cy=revenue-chart-canvas]').should('be.visible');
      cy.get('[data-cy=chart-legend]').should('contain', 'Subscriptions')
        .and('contain', 'Commission');
    });

    it('should display system alerts', () => {
      cy.get('[data-cy=system-alerts]').should('be.visible');
      cy.get('[data-cy=alert-item]').each(($alert) => {
        cy.wrap($alert).should('have.attr', 'data-severity')
          .and('be.oneOf', ['info', 'warning', 'error']);
      });
    });
  });

  describe('Partner Management', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.visit('/admin/partners');
    });

    it('should list all partners with filters', () => {
      cy.wait('@partners');
      
      // Verify table structure
      cy.get('[data-cy=partners-table]').should('be.visible');
      cy.get('[data-cy=partner-row]').should('have.length', 20);
      
      // Apply filters
      cy.get('[data-cy=status-filter]').select('Active');
      cy.get('[data-cy=category-filter]').select('Restaurant');
      cy.get('[data-cy=city-filter]').select('Sofia');
      cy.get('[data-cy=apply-filters-button]').click();
      
      cy.wait('@partners');
      cy.get('[data-cy=partner-row]').should('have.length.lessThan', 20);
    });

    it('should review and approve pending partner', () => {
      cy.get('[data-cy=status-filter]').select('Pending');
      cy.get('[data-cy=apply-filters-button]').click();
      
      cy.wait('@partners');
      
      // Click on first pending partner
      cy.get('[data-cy=partner-row]').first().click();
      
      // Review partner details
      cy.get('[data-cy=partner-detail-modal]').should('be.visible');
      cy.get('[data-cy=business-name]').should('be.visible');
      cy.get('[data-cy=business-documents]').should('be.visible');
      cy.get('[data-cy=verification-checklist]').should('be.visible');
      
      // Verify documents
      cy.get('[data-cy=view-business-license]').click();
      cy.get('[data-cy=document-viewer]').should('be.visible');
      cy.get('[data-cy=close-document]').click();
      
      // Approve partner
      cy.get('[data-cy=approve-partner-button]').click();
      cy.get('[data-cy=confirmation-modal]').should('be.visible');
      cy.get('[data-cy=confirm-approval]').click();
      
      cy.get('[data-cy=success-toast]').should('contain', 'Partner approved successfully');
    });

    it('should manage partner commissions', () => {
      cy.get('[data-cy=partner-row]').first().within(() => {
        cy.get('[data-cy=commission-settings]').click();
      });
      
      cy.get('[data-cy=commission-modal]').should('be.visible');
      cy.get('[data-cy=current-commission-rate]').should('contain', '10%');
      
      // Update commission
      cy.get('[data-cy=new-commission-rate]').clear().type('12');
      cy.get('[data-cy=effective-date]').type('2024-02-01');
      cy.get('[data-cy=commission-note]').type('Increased due to high performance');
      cy.get('[data-cy=update-commission-button]').click();
      
      cy.get('[data-cy=success-toast]').should('contain', 'Commission updated');
    });

    it('should suspend partner account', () => {
      cy.get('[data-cy=partner-row]').first().within(() => {
        cy.get('[data-cy=partner-actions]').click();
      });
      
      cy.get('[data-cy=suspend-partner]').click();
      cy.get('[data-cy=suspension-modal]').should('be.visible');
      
      cy.get('[data-cy=suspension-reason]').select('Policy Violation');
      cy.get('[data-cy=suspension-notes]').type('Multiple customer complaints');
      cy.get('[data-cy=suspension-duration]').select('30 days');
      cy.get('[data-cy=confirm-suspension]').click();
      
      cy.get('[data-cy=success-toast]').should('contain', 'Partner suspended');
    });
  });

  describe('User Management', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.visit('/admin/users');
    });

    it('should search and filter users', () => {
      cy.wait('@users');
      
      // Search by email
      cy.get('[data-cy=user-search]').type('john.doe@example.com');
      cy.get('[data-cy=search-button]').click();
      
      cy.get('[data-cy=user-row]').should('have.length', 1);
      cy.get('[data-cy=user-email]').should('contain', 'john.doe@example.com');
      
      // Clear search and filter by subscription
      cy.get('[data-cy=clear-search]').click();
      cy.get('[data-cy=subscription-filter]').select('Premium');
      cy.get('[data-cy=apply-filters-button]').click();
      
      cy.wait('@users');
      cy.get('[data-cy=subscription-badge]').each(($badge) => {
        cy.wrap($badge).should('contain', 'Premium');
      });
    });

    it('should view user details and activity', () => {
      cy.get('[data-cy=user-row]').first().click();
      
      cy.get('[data-cy=user-detail-modal]').should('be.visible');
      
      // Profile information
      cy.get('[data-cy=user-profile-tab]').should('have.class', 'active');
      cy.get('[data-cy=user-name]').should('be.visible');
      cy.get('[data-cy=user-email]').should('be.visible');
      cy.get('[data-cy=user-phone]').should('be.visible');
      cy.get('[data-cy=member-since]').should('be.visible');
      
      // Subscription details
      cy.get('[data-cy=subscription-tab]').click();
      cy.get('[data-cy=subscription-plan]').should('be.visible');
      c
}}}
}
