# Known Build Issues

## NextRouter Not Mounted Error

The BOOM Card project currently has build errors related to static site generation (SSG) that are unrelated to the browser console error fixes in this PR.

### Error:
```
Error: NextRouter was not mounted. https://nextjs.org/docs/messages/next-router-not-mounted
```

### Root Cause:
1. The project is configured for static export (`output: 'export'` in next.config.js)
2. Multiple components use `useRouter` hook during rendering (Layout, AuthContext, etc.)
3. These are incompatible - useRouter requires client-side routing which isn't available during static generation

### Potential Solutions:
1. Remove `output: 'export'` from next.config.js and use server-side rendering
2. Refactor all components to be SSG-compatible by:
   - Moving router usage to useEffect hooks
   - Using dynamic imports with `ssr: false` for router-dependent components
   - Implementing proper SSG/SSR detection
3. Use a different deployment method that supports Next.js server-side features

### Current Status:
This is a pre-existing issue in the codebase that affects the build process but is unrelated to the browser console error fixes implemented in this PR.