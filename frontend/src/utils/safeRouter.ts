import { useRouter as useNextRouter } from 'next/router';
import { NextRouter } from 'next/router';

// Create a mock router for static generation
const mockRouter: NextRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: async () => true,
  replace: async () => true,
  reload: () => {},
  back: () => {},
  prefetch: async () => {},
  beforePopState: () => {},
  events: {
    on: () => {},
    off: () => {},
    emit: () => {},
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: false,
  isPreview: false,
  forward: () => {},
} as any;

// Safe router hook that returns a mock during SSG
export function useSafeRouter() {
  try {
    return useNextRouter();
  } catch (error) {
    // Return mock router during static generation
    return mockRouter;
  }
}

// Check if router is available
export function isRouterReady(router: NextRouter) {
  return typeof window !== 'undefined' && router.isReady;
}