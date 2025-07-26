import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

// Custom hook for managing local storage with React state
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  }
): [T, (value: SetValue<T>) => void, () => void] {
  const serialize = options?.serialize || JSON.stringify;
  const deserialize = options?.deserialize || JSON.parse;

  // Get initial value from local storage or use default
  const getStoredValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [key, defaultValue, deserialize]);

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Update local storage when state changes
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serialize(valueToStore));
          
          // Dispatch storage event for other tabs
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: serialize(valueToStore),
            url: window.location.href,
            storageArea: window.localStorage,
          }));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serialize, storedValue]
  );

  // Remove value from local storage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        // Dispatch storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: null,
          url: window.location.href,
          storageArea: window.localStorage,
        }));
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // Listen for changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(defaultValue);
      }
    };

    // Listen to storage events from other tabs
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue, deserialize]);

  return [storedValue, setValue, removeValue];
}

// Hook for managing user preferences
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'bg' | 'en';
  notifications: boolean;
  newsletter: boolean;
  compactView: boolean;
}

const defaultPreferences: UserPreferences = {
  theme: 'auto',
  language: 'bg',
  notifications: true,
  newsletter: true,
  compactView: false,
};

export function useUserPreferences() {
  const [preferences, setPreferences, resetPreferences] = useLocalStorage<UserPreferences>(
    'userPreferences',
    defaultPreferences
  );

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences(prev => ({ ...prev, [key]: value }));
    },
    [setPreferences]
  );

  return {
    preferences,
    updatePreference,
    resetPreferences,
  };
}

// Hook for managing recent searches
export function useRecentSearches(maxItems: number = 10) {
  const [searches, setSearches, clearSearches] = useLocalStorage<string[]>(
    'recentSearches',
    []
  );

  const addSearch = useCallback(
    (search: string) => {
      if (!search.trim()) return;
      
      setSearches(prev => {
        // Remove duplicate if exists
        const filtered = prev.filter(s => s !== search);
        // Add to beginning and limit size
        return [search, ...filtered].slice(0, maxItems);
      });
    },
    [setSearches, maxItems]
  );

  const removeSearch = useCallback(
    (search: string) => {
      setSearches(prev => prev.filter(s => s !== search));
    },
    [setSearches]
  );

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches,
  };
}

// Hook for managing viewed items
export function useViewedItems<T extends { id: string }>(
  key: string,
  maxItems: number = 20
) {
  const [items, setItems, clearItems] = useLocalStorage<T[]>(key, []);

  const addItem = useCallback(
    (item: T) => {
      setItems(prev => {
        // Remove duplicate if exists
        const filtered = prev.filter(i => i.id !== item.id);
        // Add to beginning and limit size
        return [item, ...filtered].slice(0, maxItems);
      });
    },
    [setItems, maxItems]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      setItems(prev => prev.filter(i => i.id !== itemId));
    },
    [setItems]
  );

  return {
    items,
    addItem,
    removeItem,
    clearItems,
  };
}