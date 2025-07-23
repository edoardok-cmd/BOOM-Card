// frontend/tests/setup.ts

// Polyfills and Mocking Browser APIs for JSDOM environment
// This file is executed once before all tests in a test run (e.g., configured in jest.config.js or vitest.config.ts's setupFiles)

// Import global matchers for @testing-library/jest-dom
import '@testing-library/jest-dom';

/**
 * Mocks the `matchMedia` API, commonly used for responsive design checks.
 * This mock ensures that components using `window.matchMedia` do not throw errors
 * in a JSDOM environment, and allows for basic testing of media queries.
 */
interface MatchMediaMock {
  matches: boolean;
  media: string;
  onchange: null;
  addListener: jest.Mock; // Deprecated, but still used in some libraries
  removeListener: jest.Mock; // Deprecated
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  dispatchEvent: jest.Mock;
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string): MatchMediaMock => ({
    matches: false, // Default to false, can be overridden per test if needed
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

/**
 * Mocks the `IntersectionObserver` API, used for lazy loading and visibility detection.
 * This mock prevents errors when components rely on `IntersectionObserver` in JSDOM.
 */
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect: jest.Mock = jest.fn();
  observe: jest.Mock = jest.fn();
  takeRecords: jest.Mock = jest.fn().mockReturnValue([]);
  unobserve: jest.Mock = jest.fn();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    // Constructor can be used to store callback/options if needed for more complex mock behavior
  }

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

/**
 * Mocks `localStorage` and `sessionStorage` APIs.
 * This creates an in-memory storage mock to prevent actual browser storage access
 * during tests, ensuring isolation and preventing side effects.
 */
class LocalStorageMock {
  private store: { [key: string]: string } = {};
  public length: number = 0;

  clear = jest.fn(() => {
    this.store = {};
    this.length = 0;
  });

  getItem = jest.fn((key: string): string | null => {
    return this.store[key] !== undefined ? this.store[key] : null;
  });

  setItem = jest.fn((key: string, value: string) => {
    this.store[key] = String(value);
    this.length = Object.keys(this.store).length;
  });

  removeItem = jest.fn((key: string) => {
    delete this.store[key];
    this.length = Object.keys(this.store).length;
  });

  key = jest.fn((index: number): string | null => {
    const keys = Object.keys(this.store);
    return keys[index] !== undefined ? keys[index] : null;
  });
}

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: new LocalStorageMock(),
});

Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: new LocalStorageMock(), // Re-use the same mock for simplicity
});

/**
 * Mocks `window.scrollTo` as it's often called by UI libraries or custom components,
 * but is not available in JSDOM.
 */
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

/**
 * Mocks `window.location.reload` for components that might trigger a page reload.
 */
Object.defineProperty(window.location, 'reload', {
  configurable: true,
  value: jest.fn(),
});

/**
 * Mocks the `fetch` API for network requests.
 * While often mocked per test or using `msw`, a global mock can prevent
 * accidental network calls during tests.
 * This basic mock always throws, forcing tests to explicitly mock `fetch`
 * if they intend to test API interactions.
 */
Object.defineProperty(global, 'fetch', {
  writable: true,
  value: jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    console.error('Fetch was called in tests without a specific mock. Input:', input, 'Init:', init);
    return Promise.reject(new Error('Fetch not mocked! Please mock fetch for API calls in tests.'));
  }),
});

// Mock environment variables for tests
// These are typically defined in a .env.test file or similar, but can be set here for global defaults.
// For Next.js, environment variables exposed to the client-side must be prefixed with NEXT_PUBLIC_.
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000/api';
process.env.NEXT_PUBLIC_APP_ENV = 'test';
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'mock-google-maps-api-key-for-tests';
process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://mock-sentry-dsn@sentry.io/12345';
process.env.NEXT_PUBLIC_GA_TRACKING_ID = 'UA-XXXXX-Y';

/**
 * Mocks `next/router` for Next.js applications.
 * This is crucial for components that use `useRouter` hook or `Router` object
 * to access route parameters, push/replace routes, etc.
 * The mock provides a minimal set of properties and methods to prevent errors
 * and allow basic interaction testing.
 */
const useRouterMock = {
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(() => Promise.resolve()),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  basePath: '',
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
};

jest.mock('next/router', () => ({
  useRouter: () => useRouterMock,
  // Provide a mock for `Router` if any legacy components directly import `Router`
  Router: useRouterMock,
  // Mock `next/link`'s default export behavior (the Link component)
  // This ensures that `Link` components don't cause errors during testing.
  default: jest.fn(({ children }: { children: React.ReactNode }) => children),
}));

/**
 * Mocks `next-i18next`'s `useTranslation` hook.
 * This provides a simple `t` function that returns the translation key itself,
 * and a mock `i18n` object for language changes, ensuring i18n works in tests.
 * This is vital for components relying on internationalization (i18n).
 * The `t` function includes basic interpolation support.
 */
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    // The t function returns the translation key by default, allowing tests
    // to verify that the correct translation keys are used in components.
    // It includes basic interpolation logic for common usage patterns ({key} or {{key}}).
    t: (key: string, options?: { [key: string]: any }): string => {
      let result = key;
      if (options) {
        for (const [optKey, optValue] of Object.entries(options)) {
          // Replace both {{key}} and {key} patterns
          result = result.replace(new RegExp(`{{${optKey}}}|{${optKey}}`, 'g'), String(optValue));
        }
      return result;
    },
    // Mock i18n object for components that interact with language switching or i18n state.
    i18n: {
      changeLanguage: jest.fn(async (lang: string) => {
        // Update the mock router's query for language if the app uses it for locale routing
        (useRouterMock.query as { lang?: string }).lang = lang;
        // Optionally update the mocked i18n.language here if tests rely on it
        // i18n.language = lang; // This would require making language mutable in the mock
      }),
      language: 'en', // Default language for tests to ensure consistency
      languages: ['en', 'bg'], // Supported languages
      // Add other i18n properties/methods if components directly access them
      init: jest.fn(),
      addResourceBundle: jest.fn(),
      removeResourceBundle: jest.fn(),
      hasResourceBundle: jest.fn(),
      getDataByLanguage: jest.fn(),
    },
    // Mock ready state if components wait for i18n to be ready
    ready: true,
  }),
  // Mock `appWithTranslation` and `withTranslation` as pass-throughs
  // This ensures that these HOCs/wrappers do not interfere with component rendering in tests.
  appWithTranslation: (Component: React.ComponentType<any>) => Component,
  withTranslation: () => (Component: React.ComponentType<any>) => Component,
}));

// End of frontend/tests/setup.ts
}
}
