import { useRouter as useNextRouter } from 'next/router';
import { useEffect, useState } from 'react';

export function useSafeRouter() {
  const [mounted, setMounted] = useState(false);
  const router = useNextRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return a safe router object
  return {
    pathname: mounted ? router.pathname : '/',
    query: mounted ? router.query : {},
    asPath: mounted ? router.asPath : '/',
    isReady: mounted && router.isReady,
    push: mounted ? router.push : () => Promise.resolve(true),
    replace: mounted ? router.replace : () => Promise.resolve(true),
    reload: mounted ? router.reload : () => {},
    back: mounted ? router.back : () => {},
    prefetch: mounted ? router.prefetch : () => Promise.resolve(),
    beforePopState: mounted ? router.beforePopState : () => {},
    events: router.events,
    isFallback: mounted ? router.isFallback : false,
    isLocaleDomain: router.isLocaleDomain,
    isPreview: router.isPreview,
    route: mounted ? router.route : '/',
    locale: mounted ? router.locale : undefined,
    locales: router.locales,
    defaultLocale: router.defaultLocale,
    domainLocales: router.domainLocales,
    basePath: router.basePath,
  };
}