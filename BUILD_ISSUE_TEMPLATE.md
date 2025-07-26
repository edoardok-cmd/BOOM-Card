# Issue: Fix Next.js Static Export Build Failures

## Description
The BOOM Card project is currently unable to build and deploy due to incompatible Next.js configuration. The project is configured for static export but uses features that require client-side routing.

## Error
```
Error: NextRouter was not mounted. https://nextjs.org/docs/messages/next-router-not-mounted
```

## Affected Files
- All pages fail during static generation
- Primary issues in:
  - `src/components/Layout.tsx` - uses `useRouter()` at component level
  - `src/contexts/AuthContext.tsx` - uses `useRouter()` at component level
  - Various other components that rely on Next.js router

## Root Cause
1. `next.config.js` has `output: 'export'` configured for static site generation
2. Multiple components use `useRouter` hook which requires client-side routing
3. These two approaches are incompatible

## Proposed Solutions

### Option A: Remove Static Export (Recommended)
1. Remove `output: 'export'` from `next.config.js`
2. Update `netlify.toml` to use `.next` directory instead of `out`
3. Ensure Netlify is configured for Next.js SSR/ISR deployment

### Option B: Make Components SSG-Compatible
1. Wrap all `useRouter` calls in `useEffect` or check for client-side
2. Use dynamic imports with `ssr: false` for router-dependent components
3. Implement proper SSG/SSR detection throughout the app

### Option C: Use Different Build Strategy
1. Switch to client-side only rendering
2. Use a different framework that better supports the current architecture
3. Implement custom build scripts to handle the hybrid approach

## Impact
- No PRs can be deployed until this is resolved
- All Netlify builds will fail
- Development is not affected (only production builds)

## Testing
After implementing a fix:
1. Run `npm run build` locally - should complete without errors
2. Deploy to Netlify - should succeed
3. Verify all pages load correctly in production

## References
- [Next.js Router Not Mounted Error](https://nextjs.org/docs/messages/next-router-not-mounted)
- [Next.js Static Export Limitations](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- Current PR with browser console fixes: #[PR_NUMBER]