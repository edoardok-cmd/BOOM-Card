import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastUpdated = useRef<number>(Date.now())

  useEffect(() => {
    const now = Date.now()
    const timeElapsed = now - lastUpdated.current

    if (timeElapsed >= interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now()
        setThrottledValue(value)
      }, interval - timeElapsed)

      return () => clearTimeout(timer)
    }
  }, [value, interval])

  return throttledValue
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      if (entry.isIntersecting) {
        setHasIntersected(true)
      }
    }, options)

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [ref, options])

  return { isIntersecting, hasIntersected }
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const renderStartTime = useRef<number>(0)
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    avgRenderTime: 0,
    lastRenderTime: 0
  })

  useEffect(() => {
    renderCount.current += 1
    const renderEndTime = performance.now()
    const renderTime = renderEndTime - renderStartTime.current

    setMetrics(prev => ({
      renderCount: renderCount.current,
      avgRenderTime: (prev.avgRenderTime * (prev.renderCount - 1) + renderTime) / renderCount.current,
      lastRenderTime: renderTime
    }))

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderCount: renderCount.current,
        renderTime: `${renderTime.toFixed(2)}ms`
      })
    }
  })

  renderStartTime.current = performance.now()

  return metrics
}

// Prefetch hook for Next.js routes
export function usePrefetch() {
  const router = useRouter()
  
  const prefetchRoute = useCallback((href: string) => {
    router.prefetch(href)
  }, [router])

  const prefetchRoutes = useCallback((routes: string[]) => {
    routes.forEach(route => router.prefetch(route))
  }, [router])

  return { prefetchRoute, prefetchRoutes }
}

// Memory cache hook
export function useMemoryCache<T>(key: string, fetcher: () => Promise<T>, ttl: number = 60000) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map())

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = cache.current.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      setData(cached.data)
      return cached.data
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      cache.current.set(key, { data: result, timestamp: Date.now() })
      setData(result)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl])

  const clearCache = useCallback(() => {
    cache.current.delete(key)
    setData(null)
  }, [key])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData, clearCache }
}

// Virtual scroll hook for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  }
}