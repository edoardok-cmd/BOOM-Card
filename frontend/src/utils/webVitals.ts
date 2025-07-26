import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals'

// Track Core Web Vitals
export function reportWebVitals(onPerfEntry?: (metric: Metric) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry)  // Cumulative Layout Shift
    getFID(onPerfEntry)  // First Input Delay
    getFCP(onPerfEntry)  // First Contentful Paint
    getLCP(onPerfEntry)  // Largest Contentful Paint
    getTTFB(onPerfEntry) // Time to First Byte
  }
}

// Send metrics to analytics
export function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.href,
    timestamp: Date.now()
  })

  // Use sendBeacon if available, fallback to fetch
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body)
  } else {
    fetch('/api/analytics/vitals', {
      body,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    })
  }
}

// Performance observer for custom metrics
export function observePerformance() {
  if (!('PerformanceObserver' in window)) return

  // Observe long tasks
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('Long Task detected:', {
          duration: entry.duration,
          startTime: entry.startTime,
          name: entry.name
        })
      }
    })
    longTaskObserver.observe({ entryTypes: ['longtask'] })
  } catch (e) {
    console.error('Long task observer not supported')
  }

  // Observe layout shifts
  try {
    const layoutShiftObserver = new PerformanceObserver((list) => {
      let clsScore = 0
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsScore += (entry as any).value
        }
      }
      console.log('Layout shift score:', clsScore)
    })
    layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })
  } catch (e) {
    console.error('Layout shift observer not supported')
  }

  // Observe resource timing
  try {
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) {
          console.warn('Slow resource:', {
            name: entry.name,
            duration: entry.duration,
            type: (entry as any).initiatorType
          })
        }
      }
    })
    resourceObserver.observe({ entryTypes: ['resource'] })
  } catch (e) {
    console.error('Resource observer not supported')
  }
}

// Custom performance marks
export const performanceMark = {
  start: (name: string) => {
    if ('performance' in window) {
      performance.mark(`${name}-start`)
    }
  },
  
  end: (name: string) => {
    if ('performance' in window) {
      performance.mark(`${name}-end`)
      try {
        performance.measure(name, `${name}-start`, `${name}-end`)
        const measure = performance.getEntriesByName(name)[0]
        console.log(`Performance [${name}]:`, measure.duration.toFixed(2), 'ms')
        return measure.duration
      } catch (e) {
        console.error('Performance measurement failed:', e)
      }
    }
    return 0
  },

  clear: (name: string) => {
    if ('performance' in window) {
      performance.clearMarks(`${name}-start`)
      performance.clearMarks(`${name}-end`)
      performance.clearMeasures(name)
    }
  }
}

// Network information API
export function getNetworkInfo() {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    }
  }
  return null
}

// Device memory API
export function getDeviceMemory() {
  if ('deviceMemory' in navigator) {
    return (navigator as any).deviceMemory
  }
  return null
}

// Adaptive loading based on device capabilities
export function shouldReduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isLowEndDevice() {
  const memory = getDeviceMemory()
  const network = getNetworkInfo()
  
  return (
    (memory && memory < 4) ||
    (network && (network.effectiveType === 'slow-2g' || network.effectiveType === '2g')) ||
    (network && network.saveData)
  )
}

// Performance budget monitoring
export interface PerformanceBudget {
  lcp: number  // Largest Contentful Paint (ms)
  fid: number  // First Input Delay (ms)
  cls: number  // Cumulative Layout Shift
  ttfb: number // Time to First Byte (ms)
  fcp: number  // First Contentful Paint (ms)
}

const DEFAULT_BUDGET: PerformanceBudget = {
  lcp: 2500,   // Good < 2.5s
  fid: 100,    // Good < 100ms
  cls: 0.1,    // Good < 0.1
  ttfb: 800,   // Good < 0.8s
  fcp: 1800    // Good < 1.8s
}

export function checkPerformanceBudget(
  metric: Metric,
  budget: PerformanceBudget = DEFAULT_BUDGET
) {
  const threshold = budget[metric.name.toLowerCase() as keyof PerformanceBudget]
  const isWithinBudget = metric.value <= threshold

  if (!isWithinBudget) {
    console.warn(`Performance budget exceeded for ${metric.name}:`, {
      value: metric.value,
      threshold,
      delta: metric.value - threshold
    })
  }

  return isWithinBudget
}