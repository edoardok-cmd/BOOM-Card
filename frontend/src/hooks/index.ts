// Central export for all custom hooks

// Authentication hooks - using Zustand store instead
// export { 
//   AuthProvider, 
//   useAuth, 
//   ProtectedRoute, 
//   useRequireAuth, 
//   useGuestOnly 
// } from './useAuth';

// API hooks
export { 
  useApi, 
  usePaginatedApi, 
  useInfiniteScroll 
} from './useApi';

// Local storage hooks
export { 
  useLocalStorage, 
  useUserPreferences, 
  useRecentSearches, 
  useViewedItems 
} from './useLocalStorage';

// Debounce and throttle hooks
export {
  useDebounce,
  useDebouncedCallback,
  useThrottledCallback,
  useDebouncedSearch
} from './useDebounce';

// Window and viewport hooks
export {
  useWindowSize,
  useMediaQuery,
  useBreakpoint,
  useScrollPosition,
  useIntersectionObserver,
  useClickOutside,
  useKeyboardShortcut,
  useDocumentVisibility,
  useOnlineStatus
} from './useWindowEvents';