import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';

interface UseAuthCheckOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
}

export function useAuthCheck(options: UseAuthCheckOptions = {}) {
  const { redirectTo = '/login', redirectIfFound = false } = options;
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !redirectIfFound) {
      router.push(redirectTo);
    }
    
    if (isAuthenticated && redirectIfFound) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectIfFound, redirectTo, router]);

  return isAuthenticated;
}