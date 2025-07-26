import React, { lazy, Suspense, ComponentType } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'

// Lazy load wrapper with loading fallback
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc)

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

// Preload component function
export function preloadComponent(
  importFunc: () => Promise<{ default: ComponentType<any> }>
) {
  // Start loading the component immediately
  const componentPromise = importFunc()
  
  return {
    component: lazy(() => componentPromise),
    preload: () => componentPromise
  }
}

// Route-based code splitting helper
export const lazyRoutes = {
  Dashboard: lazyLoad(() => import('../pages/dashboard')),
  Partners: lazyLoad(() => import('../pages/partners')),
  PartnerDetail: lazyLoad(() => import('../pages/partners/[id]')),
  Subscriptions: lazyLoad(() => import('../pages/subscriptions')),
  Profile: lazyLoad(() => import('../pages/profile')),
  Settings: lazyLoad(() => import('../pages/settings')),
  Transactions: lazyLoad(() => import('../pages/transactions')),
  Support: lazyLoad(() => import('../pages/support')),
}

// Modal lazy loading
export const lazyModals = {
  QRCodeModal: lazyLoad(() => import('../components/modals/QRCodeModal')),
  PaymentModal: lazyLoad(() => import('../components/modals/PaymentModal')),
  ReviewModal: lazyLoad(() => import('../components/modals/ReviewModal')),
  ShareModal: lazyLoad(() => import('../components/modals/ShareModal')),
}