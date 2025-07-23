/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
      loginAsAdmin(email?: string, password?: string): Chainable<void>
      loginAsPartner(email?: string, password?: string): Chainable<void>
      loginAsConsumer(email?: string, password?: string): Chainable<void>
      selectLanguage(lang: 'en' | 'bg'): Chainable<void>
      searchPartners(query: string, filters?: SearchFilters): Chainable<void>
      applyFilters(filters: SearchFilters): Chainable<void>
      clearFilters(): Chainable<void>
      navigateToPartner(partnerId: string): Chainable<void>
      generateQRCode(): Chainable<string>
      scanQRCode(qrCode: string): Chainable<void>
      verifyDiscount(originalPrice: number, discountPercentage: number): Chainable<void>
      selectSubscriptionPlan(plan: 'basic' | 'premium' | 'vip'): Chainable<void>
      completePayment(paymentDetails: PaymentDetails): Chainable<void>
      uploadDocument(fixture: string, fieldName: string): Chainable<void>
      waitForToast(message: string): Chainable<void>
      dismissToast(): Chainable<void>
      checkAccessibility(): Chainable<void>
      interceptAPI(alias: string, method: string, url: string, response?: any): Chainable<void>
      waitForAPI(alias: string, timeout?: number): Chainable<void>
      mockGeolocation(latitude: number, longitude: number): Chainable<void>
      clearLocalStorage(): Chainable<void>
      preserveSession(): Chainable<void>
      validatePagination(currentPage: number, totalPages: number): Chainable<void>
      sortBy(column: string, order: 'asc' | 'desc'): Chainable<void>
      exportData(format: 'csv' | 'xlsx' | 'pdf'): Chainable<void>
      verifyEmailSent(to: string, subject: string): Chainable<void>
      clickOutside(): Chainable<void>
      scrollToBottom(): Chainable<void>
      scrollToTop(): Chainable<void>
      checkBrokenLinks(): Chainable<void>
      validateFormErrors(errors: Record<string, string>): Chainable<void>
      fillContactForm(data: ContactFormData): Chainable<void>
      ratePartner(partnerId: string, rating: number, comment?: string): Chainable<void>
      sharePartner(partnerId: string, platform: 'facebook' | 'twitter' | 'whatsapp'): Chainable<void>
      addToFavorites(partnerId: string): Chainable<void>
      removeFromFavorites(partnerId: string): Chainable<void>
      validatePartnerCard(partner: PartnerData): Chainable<void>
      checkMapMarkers(count: number): Chainable<void>
      selectMapMarker(index: number): Chainable<void>
      zoomMap(level: number): Chainable<void>
      validateTransaction(transaction: TransactionData): Chainable<void>
      downloadApp(platform: 'ios' | 'android'): Chainable<void>
      acceptCookies(): Chainable<void>
      rejectCookies(): Chainable<void>
      configureCookies(preferences: CookiePreferences): Chainable<void>
    }

  interface SearchFilters {
    category?: string
    subcategory?: string
    location?: string
    radius?: number
    minDiscount?: number
    maxDiscount?: number
    priceRange?: [number, number]
    rating?: number
    features?: string[]
    sortBy?: 'relevance' | 'discount' | 'rating' | 'distance' | 'newest'
  }

  interface PaymentDetails {
    cardNumber: string
    cardholderName: string
    expiryDate: string
    cvv: string
    billingAddress?: {
      street: string
      city: string
      postalCode: string
      country: string
    }

  interface ContactFormData {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
    category?: string
  }

  interface PartnerData {
    id: string
    name: string
    category: string
    discount: number
    rating: number
    location: string
    image?: string
  }

  interface TransactionData {
    id: string
    partnerId: string
    amount: number
    discount: number
    savedAmount: number
    date: string
    status: 'completed' | 'pending' | 'failed'
  }

  interface CookiePreferences {
    necessary: boolean
    analytics: boolean
    marketing: boolean
    preferences: boolean
  }

// Authentication commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-cy=email-input]').type(email)
  cy.get('[data-cy=password-input]').type(password)
  cy.get('[data-cy=login-button]').click()
  cy.url().should('not.include', '/login')
  cy.window().its('localStorage.token').should('exist')
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=user-menu]').click()
  cy.get('[data-cy=logout-button]').click()
  cy.url().should('include', '/login')
  cy.window().its('localStorage.token').should('not.exist')
})

Cypress.Commands.add('loginAsAdmin', (email = Cypress.env('adminEmail'), password = Cypress.env('adminPassword')) => {
  cy.login(email, password)
  cy.url().should('include', '/admin')
})

Cypress.Commands.add('loginAsPartner', (email = Cypress.env('partnerEmail'), password = Cypress.env('partnerPassword')) => {
  cy.login(email, password)
  cy.url().should('include', '/partner')
})

Cypress.Commands.add('loginAsConsumer', (email = Cypress.env('consumerEmail'), password = Cypress.env('consumerPassword')) => {
  cy.login(email, password)
  cy.url().should('include', '/dashboard')
})

// Language selection
Cypress.Commands.add('selectLanguage', (lang: 'en' | 'bg') => {
  cy.get('[data-cy=language-selector]').click()
  cy.get(`[data-cy=language-${lang}]`).click()
  cy.getCookie('language').should('have.property', 'value', lang)
})

// Search and filtering
Cypress.Commands.add('searchPartners', (query: string, filters?: SearchFilters) => {
  cy.get('[data-cy=search-input]').clear().type(query)
  if (filters) {
    cy.applyFilters(filters)
  }
  cy.get('[data-cy=search-button]').click()
  cy.wait('@searchResults')
})

Cypress.Commands.add('applyFilters', (filters: SearchFilters) => {
  cy.get('[data-cy=filters-toggle]').click()
  
  if (filters.category) {
    cy.get('[data-cy=category-filter]').select(filters.category)
  }
  
  if (filters.subcategory) {
    cy.get('[data-cy=subcategory-filter]').select(filters.subcategory)
  }
  
  if (filters.location) {
    cy.get('[data-cy=location-filter]').type(filters.location)
  }
  
  if (filters.radius) {
    cy.get('[data-cy=radius-slider]').invoke('val', filters.radius).trigger('input')
  }
  
  if (filters.minDiscount) {
    cy.get('[data-cy=min-discount-input]').clear().type(filters.minDiscount.toString())
  }
  
  if (filters.maxDiscount) {
    cy.get('[data-cy=max-discount-input]').clear().type(filters.maxDiscount.toString())
  }
  
  if (filters.priceRange) {
    cy.get('[data-cy=price-range-min]').clear().type(filters.priceRange[0].toString())
    cy.get('[data-cy=price-range-max]').clear().type(filters.priceRange[1].toString())
  }
  
  if (filters.rating) {
    cy.get(`[data-cy=rating-filter-${filters.rating}]`).click()
  }
  
  if (filters.features) {
    filters.features.forEach(feature => {
      cy.get(`[data-cy=feature-${feature}]`).check()
    })
  }
  
  if (filters.sortBy) {
    cy.get('[data-cy=sort-select]').select(filters.sortBy)
  }
  
  cy.get('[data-cy=apply-filters-button]').click()
})

Cypress.Commands.add('clearFilters', () => {
  cy.get('[data-cy=clear-filters-button]').click()
  cy.wait('@searchResults')
})

// Navigation
Cypress.Commands.add('navigateToPartner', (partnerId: string) => {
  cy.get(`[data-cy=partner-card-${partnerId}]`).click()
  cy.url().should('include', `/partners/${partnerId}`)
  cy.wait('@partnerDetails')
})

// QR Code operations
Cypress.Commands.add('generateQRCode', () => {
  cy.get('[data-cy=generate-qr-button]').click()
  cy.get('[data-cy=qr-code-display]').should('be.visible')
  cy.get('[data-cy=qr-code-value]')
    .invoke('text')
    .then((qrCode) => {
      return cy.wrap(qrCode)
    })
})

Cypress.Commands.add('scanQRCode', (qrCode: string) => {
  cy.get('[data-cy=scan-qr-button]').click()
  cy.get('[data-cy=qr-code-input]').type(qrCode)
  cy.get('[data-cy=verify-qr-button]').click()
  cy.wait('@verifyQRCode')
})

// Transaction verification
Cypress.Commands.add('verifyDiscount', (originalPrice: number, discountPercentage: number) => {
  const expectedDiscount = originalPrice * (discountPercentage / 100)
  const expectedFinal = originalPrice - expectedDiscount
  
  cy.get('[data-cy=original-price]').should('contain', originalPrice.toFixed(2))
  cy.get('[data-cy=discount-amount]').should('contain', expectedDiscount.toFixed(2))
  cy.get('[data-cy=final-price]').should('contain', expectedFinal.toFixed(2))
})

// Subscription and payment
Cypress.Commands.add('selectSubscriptionPlan', (plan: 'basic' | 'premium' | 'vip') => {
  cy.get(`[data-cy=plan-${plan}]`).click()
  cy.get('[data-cy=continue-to-payment]').click()
})

Cypress.Commands.add('completePayment', (paymentDetails: PaymentDetails) => {
  cy.get('[data-cy=card-number]').type(paymentDetails.cardNumber.replace(/\s/g, ''))
  cy.get('[data-cy=cardholder-name]').type(paymentDetails.cardholderName)
  cy.get('[data-cy=expiry-date]').type(paymentDetails.expiryDate)
  cy.get('[data-cy=cvv]').type(paymentDetails.cvv)
  
  if (paymentDetails.billingAddress) {
    cy.get('[data-cy=billing-address-toggle]').click()
    cy.get('[data-cy=billing-street]').type(paymentDetails.billingAddress.street)
    cy.get('[data-cy=billing-city]').type(paymentDetails.billingAddress.city)
    cy.get('[data-cy=billing-postal-code]').type(paymentDetails.billingAddress.postalCode)
    cy.get('[data-cy=billing-country]').select(paymentDetails.billingAddress.country)
  }
  
  cy.get('[data-cy=complete-payment-button]').click()
  cy.wait('@processPayment')
})

// File upload
Cypress.Commands.add('uploadDocument', (fixture: string, fieldName: string) => {
  cy.get(`[data-cy=upload-${fieldName}]`).selectFile(`cypress/fixtures/${fixture}`, {
    action: 'drag-drop'
  })
  cy.wait('@fileUpload')
})

// Toast notifications
Cypress.Commands.add('waitForToast', (message: string) => {
  cy.get('[data-cy=toast-notification]', { timeout: 10000 })
    .should('be.visible')
    .and('contain', message)
})

Cypress.Commands.add('dismissToast', () => {
  cy.get('[data-cy=toast-close]').click()
  cy.get('[data-cy=toast-notification]').should('not.exist')
})

// Accessibility
Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe()
  cy.checkA11y(null, {
    rules: {
      'color-contrast': { enabled: false } // Disable if using dynamic themes
    })
})

// API interception
Cypress.Commands.add('interceptAPI', (alias: string, method: string, url: string, response?: any) => {
  if (response) {
    cy.intercept(method, url, response).as(alias)
  } else {
    cy.intercept(method, url).as(alias)
  })

Cypress.Commands.add('waitForAPI', (alias: string, timeout = 10000) => {
  cy.wait(`@${alias}`, { timeout })
})

// Geolocation
Cypress.Commands.add('mockGeolocation', (latitude: number, longitude: number) => {
  cy.window().then((win) => {
    cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success) => {
      success({
        coords: {
          latitude,
          longitude,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      })
    })
  })
})

// Storage management
Cypress.Commands.add('clearLocalStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
  })
})

Cypress.Commands.add('preserveSession', () => {
  Cypress.Cookies.preserveOnce('session_token', 'remember_token')
})

// Pagination
Cypress.Commands.add('validatePagination', (currentPage: number, totalPages: number) => {
  cy.get('[data-cy=current-page]').should('contain', currentPage)
  cy.get('[data-cy=total-pages]').should('contain', totalPages)
  
  if (currentPage > 1) {
    cy.get('[data-cy=prev-page]').should('not.be.disabled')
  } else {
    cy.
}}
}
}
}
}
}
