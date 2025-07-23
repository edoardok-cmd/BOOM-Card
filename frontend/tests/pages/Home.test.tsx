import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home, { getServerSideProps } from '../../pages/index'; // Assuming Home component is in pages/index.tsx
import '@testing-library/jest-dom'; // For extended matchers

/**
 * @file frontend/tests/pages/Home.test.tsx
 * @description Comprehensive test suite for the Home page component.
 *
 * This file contains tests for:
 * - Rendering of all major sections (Hero, Map, Statistics, App CTA, Recent Partners, Trending Deals).
 * - Correct display of content based on English and Bulgarian translations.
 * - Verification of data rendered from `getServerSideProps`.
 * - Basic accessibility checks for headings and interactive elements.
 *
 * It utilizes `@testing-library/react` for component rendering and interactions,
 * and Jest for assertions and mocking.
 */

// --- MOCK i18n SETUP ---
// This mock simulates `next-i18next`'s `useTranslation` hook and its `i18n` instance.
// It allows us to control the current language and provide specific translations for tests,
// ensuring that components consuming translations behave as expected.
const mockTranslations = {
  en: {
    home: {
      hero: {
        title: 'Unlock Exclusive Discounts',
        subtitle: 'Explore the best deals in your city',
        cta: 'Find Deals Now',
      },
      map: {
        title: 'Discover Partners Near You',
      },
      stats: {
        activePartners: 'Active Partners',
        totalSavings: 'Total Savings',
      },
      appCta: {
        title: 'Download the BOOM Card App',
      },
      recentPartners: {
        title: 'Our Newest Partners',
      },
      trendingDeals: {
        title: 'Trending Deals',
      },
    },
    common: {
      // Add any common translations used on the home page if applicable
    },
  bg: {
    home: {
      hero: {
        title: 'Отключете ексклузивни отстъпки',
        subtitle: 'Разгледайте най-добрите оферти във вашия град',
        cta: 'Намерете оферти сега',
      },
      map: {
        title: 'Открийте партньори близо до вас',
      },
      stats: {
        activePartners: 'Активни партньори',
        totalSavings: 'Общи спестявания',
      },
      appCta: {
        title: 'Изтеглете приложението BOOM Card',
      },
      recentPartners: {
        title: 'Нашите най-нови партньори',
      },
      trendingDeals: {
        title: 'Тенденции в офертите',
      },
    },
    common: {
      // Add any common translations for bg
    },
};

// Variable to control the current language in the mock
let currentTestLang = 'en';

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn((ns: string | string[] = 'common') => ({
    // The `t` function mocks translation lookup. It checks the provided namespaces
    // for the given key in the `currentTestLang`.
    t: jest.fn((key: string, options?: any) => {
      const namespaces = Array.isArray(ns) ? ns : [ns];
      for (const namespace of namespaces) {
        const translated = mockTranslations[currentTestLang]?.[namespace]?.[key];
        if (translated) {
          return translated;
        }
      return key; // Fallback to the key itself if no translation is found
    }),
    // The `i18n` object mimics the actual i18n instance from `next-i18next`.
    // `changeLanguage` updates `currentTestLang`, simulating a language switch.
    i18n: {
      changeLanguage: jest.fn((lng: string) => {
        currentTestLang = lng; // Update the mock language
        return Promise.resolve(); // Simulate async language change operation
      }),
      language: currentTestLang, // Reflects the currently set language
      isInitialized: true, // Indicates that i18n is ready
      // Add any other properties your component might access from i18n (e.g., dir, languages)
    },
  })),
  // Mocks `appWithTranslation` Higher-Order Component (HOC) to simply return the component.
  // This avoids running actual i18n initialization logic during tests.
  appWithTranslation: (Component: React.ComponentType) => Component,
  // Mocks `withTranslation` HOC, returning the component as-is.
  withTranslation: () => (Component: React.ComponentType) => Component,
  // Mocks `serverSideTranslations` to return a predefined structure.
  // This is crucial for testing `getServerSideProps` in isolation.
  serverSideTranslations: jest.fn(async (locale: string, namespaces: string[]) => ({
    _nextI18Next: {
      initialI18nStore: {
        [locale]: namespaces.reduce((acc, ns) => {
          acc[ns] = mockTranslations[locale]?.[ns] || {};
          return acc;
        }, {}),
      },
      initialLocale: locale,
      userConfig: null, // Mimic default user config
    },
  })),
}));

// --- MOCK NEXT.JS ROUTER ---
// Mocking `next/router` is important if the component uses `useRouter` for
// navigation, query parameters, or locale information.
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
  })),
}));

// --- MOCK DATA FOR HOME COMPONENT PROPS ---
// This object simulates the props that the `Home` component would receive from `getServerSideProps`.
// It includes mock data for partners, deals, statistics, and i18n related props.
const mockHomeProps = {
  initialPartners: [
    { id: 'p1', name: 'Restaurant A', category: 'Food & Drink', discount: '20%' },
    { id: 'p2', name: 'Hotel B', category: 'Accommodation', discount: '15%' },
    { id: 'p3', name: 'Spa C', category: 'Wellness & Spa', discount: '25%' },
  ],
  initialDeals: [
    { id: 'd1', title: '20% off Dinner', partnerName: 'Restaurant A' },
    { id: 'd2', title: 'Spa Package Discount', partnerName: 'Spa C' },
    { id: 'd3', title: 'Weekend Stay Offer', partnerName: 'Hotel B' },
  ],
  stats: {
    activePartners: 150,
    totalSavings: 250000, // Representing total savings in monetary value
  },
  // Properties typically provided by `next-i18next` for client-side hydration
  _nextI18Next: {
    initialI18nStore: {
      en: {
        home: mockTranslations.en.home,
        common: mockTranslations.en.common,
      },
      bg: {
        home: mockTranslations.bg.home,
        common: mockTranslations.bg.common,
      },
    },
    initialLocale: 'en',
    userConfig: null,
  },
};

// --- TEST SUITE FOR HOME PAGE ---
describe('Home Page', () => {
  // `beforeEach` hook runs before each test. It ensures a clean state for every test,
  // by resetting the language to English and clearing all Jest mock calls.
  beforeEach(() => {
    currentTestLang = 'en'; // Ensure default language for each test run
    jest.clearAllMocks(); // Clear any previous calls to mock functions
  });

  // Test Case 1: Verifies that the Home page renders all its main sections
  // and displays content correctly based on English translations.
  it('renders all main sections with English content', async () => {
    // Render the Home component with the predefined mock props
    render(<Home {...mockHomeProps} />);

    // --- Hero Section Assertions ---
    // Check for the presence of the main hero title using its role and accessible name
    expect(screen.getByRole('heading', { name: mockTranslations.en.home.hero.title })).toBeInTheDocument();
    // Check for the hero subtitle text
    expect(screen.getByText(mockTranslations.en.home.hero.subtitle)).toBeInTheDocument();
    // Check for the hero Call-to-Action button by its accessible name
    expect(screen.getByRole('button', { name: mockTranslations.en.home.hero.cta })).toBeInTheDocument();

    // --- Interactive Map Section Assertions ---
    // Check for the map section title
    expect(screen.getByRole('heading', { name: mockTranslations.en.home.map.title })).toBeInTheDocument();
    // Additional checks could be added here for map-specific elements if present (e.g., map container, markers)

    // --- Platform Statistics Assertions ---
    // Verify that the active partners text and its corresponding count are displayed
    expect(screen.getByText(`${mockTranslations.en.home.stats.activePartners}: ${mockHomeProps.stats.activePartners}`)).toBeInTheDocument();
    // Verify that the total savings text and its value are displayed
    expect(screen.getByText(`${mockTranslations.en.home.stats.totalSavings}: ${mockHomeProps.stats.totalSavings}`)).toBeInTheDocument();

    // --- Download App CTA Assertions ---
    // Check for the app download Call-to-Action title
    expect(screen.getByRole('heading', { name: mockTranslations.en.home.appCta.title })).toBeInTheDocument();
    // If there's an image for the QR code, consider checking its alt text for accessibility:
    // expect(screen.getByAltText('QR code to download the BOOM Card app')).toBeInTheDocument();

    // --- Recent Partners Section Assertions ---
    // Check for the title of the recent partners section
    expect(screen.getByRole('heading', { name: mockTranslations.en.home.recentPartners.title })).toBeInTheDocument();
    // Verify that the mock partner names are rendered on the page
    expect(screen.getByText('Restaurant A')).toBeInTheDocument();
    expect(screen.getByText('Hotel B')).toBeInTheDocument();
    expect(screen.getByText('Spa C')).toBeInTheDocument();

    // --- Trending Deals Section Assertions ---
    // Check for the title of the trending deals section
    expect(screen.getByRole('heading', { name: mockTranslations.en.home.trendingDeals.title })).toBeInTheDocument();
    // Verify that the mock deal titles are rendered on the page
    expect(screen.getByText('20% off Dinner')).toBeInTheDocument();
    expect(screen.getByText('Spa Package Discount')).toBeInTheDocument();
    expect(screen.getByText('Weekend Stay Offer')).toBeInTheDocument();
  });

  // Test Case 2: Ensures the Home page correctly displays content in Bulgarian
  // after a simulated language switch.
  it('renders all main sections with Bulgarian content after language switch', async () => {
    // Manually set the mock language to Bulgarian before rendering the component.
    // In a real app, this might happen via URL locale, user settings, or `router.locale`.
    currentTestLang = 'bg';

    // Render the Home component. Since `currentTestLang` is updated, the `useTranslation`
    // mock will now return Bulgarian strings.
    render(<Home {...mockHomeProps} />);

    // `waitFor` is used to ensure any asynchronous updates (though mocked, it's good practice)
    // and re-renders have completed before making assertions.
    await waitFor(() => {
      // --- Hero Section Assertions (Bulgarian) ---
      expect(screen.getByRole('heading', { name: mockTranslations.bg.home.hero.title })).toBeInTheDocument();
      expect(screen.getByText(mockTranslations.bg.home.hero.subtitle)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: mockTranslations.bg.home.hero.cta })).toBeInTheDocument();

      // --- Interactive Map Section Assertions (Bulgarian) ---
      expect(screen.getByRole('heading', { name: mockTranslations.bg.home.map.title })).toBeInTheDocument();

      // --- Platform Statistics Assertions (Bulgarian) ---
      expect(screen.getByText(`${mockTranslations.bg.home.stats.activePartners}: ${mockHomeProps.stats.activePartners}`)).toBeInTheDocument();
      expect(screen.getByText(`${mockTranslations.bg.home.stats.totalSavings}: ${mockHomeProps.stats.totalSavings}`)).toBeInTheDocument();

      // --- Download App CTA Assertions (Bulgarian) ---
      expect(screen.getByRole('heading', { name: mockTranslations.bg.home.appCta.title })).toBeInTheDocument();

      // --- Recent Partners Section Assertions (Bulgarian) ---
      expect(screen.getByRole('heading', { name: mockTranslations.bg.home.recentPartners.title })).toBeInTheDocument();
      // Note: Partner names (e.g., "Restaurant A") are data, not localized strings,
      // so they remain the same regardless of the interface language.
      expect(screen.getByText('Restaurant A')).toBeInTheDocument();
      expect(screen.getByText('Hotel B')).toBeInTheDocument();

      // --- Trending Deals Section Assertions (Bulgarian) ---
      expect(screen.getByRole('heading', { name: mockTranslations.bg.home.trendingDeals.title })).toBeInTheDocument();
      // Deal titles are also data and remain unchanged.
      expect(screen.getByText('20% off Dinner')).toBeInTheDocument();
      expect(screen.getByText('Spa Package Discount')).toBeInTheDocument();
    });
  });

  // Test Case 3: Verifies that `getServerSideProps` function correctly fetches
  // and returns the expected initial data and i18n props for the English locale.
  it('getServerSideProps fetches and returns initial data and translations for English locale', async () => {
    // Create a mock context object that mimics what Next.js provides to `getServerSideProps`.
    const context = {
      locale: 'en', // Simulate an English locale request
      req: {}, // Mock Request object
      res: {}, // Mock Response object
      query: {},
      resolvedUrl: '/',
    } as any; // Type assertion as the full `NextPageContext` is complex and not fully mocked here

    // Call `getServerSideProps` directly
    const result = await getServerSideProps(context);

    // Assert that the returned object contains a `props` key
    expect(result).toHaveProperty('props');

    // Destructure `props` from the result for easier assertions
    if ('props' in result) {
      const props = result.props as any; // Cast to `any` for easier property access

      // Check if the initial data (partners, deals, stats) matches our mock data
      expect(props.initialPartners).toEqual(mockHomeProps.initialPartners);
      expect(props.initialDeals).toEqual(mockHomeProps.initialDeals);
      expect(props.stats).toEqual(mockHomeProps.stats);

      // Check the `_nextI18Next` property, which contains initial i18n state
      expect(props._nextI18Next).toBeDefined();
      expect(props._nextI18Next.initialLocale).toBe('en'); // Confirm the locale passed to serverSideTranslations
      // Verify that the correct English translations are loaded into the i18n store
      expect(props._nextI18Next.initialI18nStore.en.home).toEqual(mockTranslations.en.home);
      expect(props._nextI18Next.initialI18nStore.en.common).toEqual(mockTranslations.en.common);
    } else {
      // Fail the test if 'props' key is not found (should not happen with correct setup)
      fail('getServerSideProps did not return a props object.');
    });

  // Test Case 4: Verifies that `getServerSideProps` fetches and returns correct data
  // and i18n props for the Bulgarian locale.
  it('getServerSideProps fetches and returns initial data and translations for Bulgarian locale', async () => {
    // Mock context for a Bulgarian locale request
      locale: 'bg',
      req: {},
      res: {},
      query: {},
      resolvedUrl: '/',
    } as any;


    expect(result).toHaveProperty('props');
    if ('props' in result) {

      // Confirm the initial locale is Bulgarian
      expect(props._nextI18Next.initialLocale).toBe('bg');
      // Verify that the correct Bulgarian translations are loaded
      expect(props._nextI18Next.initialI18nStore.bg.home).toEqual(mockTranslations.bg.home);
    } else {
      fail('getServerSideProps did not return a props object for Bulgarian locale.');
    });

  // Test Case 5: Basic accessibility check.
  // This test ensures that key elements like headings and buttons have proper
  // roles and accessible names, which is crucial for screen readers and navigation.
  it('has accessible elements (headings, buttons)', () => {
    render(<Home {...mockHomeProps} />);

    // Check that main headings exist and are semantically correct
    expect(screen.getByRole('heading', { name: mockTranslations.en.home.hero.title, level: 1 })).toBeInTheDocument(); // Assuming H1
    expect(screen.getByRole('heading', { name: mockTranslations.en.home.map.title, level: 2 })).toBeInTheDocument(); // Assuming H2
    expect(screen.getByRole('heading', { name: mockTranslations.en.home.appCta.title, level: 2 })).toBeInTheDocument(); // Assuming H2
    expect(screen.getByRole('heading', { name: mockTranslations.en.home.recentPartners.title, level: 2 })).toBeInTheDocument(); // Assuming H2
    expect(screen.getByRole('heading', { name: mockTranslations.en.home.trendingDeals.title, level: 2 })).toBeInTheDocument(); // Assuming H2

    // Check that the main CTA button is accessible
    expect(screen.getByRole('button', { name: mockTranslations.en.home.hero.cta })).toBeInTheDocument();

    // Additional checks could include `alt` attributes for images, ARIA attributes, etc.
    // For example, if there's a QR code image:
    // expect(screen.getByAltText(/qr code/i)).toBeInTheDocument();
  });

  // Test Case 6 (Optional/Example): Error Handling for Client-Side Data (if applicable)
  // If your Home component performs client-side data fetching (e.g., for map data or dynamic sections)
  // using `useEffect` with `SWR` or `react-query`, you would mock the data fetching hook/API
  // to simulate an error state and verify how the component handles it (e.g., displaying an error message).
  // For this exercise, the primary data flow is through `getServerSideProps`, making explicit
  // client-side error handling tests less critical at the page level.
});
}
}
}
}
