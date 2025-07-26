import React, { memo, useRef, CSSProperties } from 'react'
import { useVirtualScroll, useIntersectionObserver } from '../hooks/usePerformance'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  height: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
  onEndReached?: () => void
  endReachedThreshold?: number
}

function VirtualListComponent<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className = '',
  overscan = 5,
  onEndReached,
  endReachedThreshold = 100
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  
  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex
  } = useVirtualScroll(items, itemHeight, height, overscan)

  // Detect when user scrolls near the end
  const { isIntersecting } = useIntersectionObserver(endRef, {
    rootMargin: `${endReachedThreshold}px`
  })

  React.useEffect(() => {
    if (isIntersecting && onEndReached) {
      onEndReached()
    }
  }, [isIntersecting, onEndReached])

  const containerStyle: CSSProperties = {
    height,
    overflow: 'auto',
    position: 'relative'
  }

  const virtualStyle: CSSProperties = {
    height: totalHeight,
    position: 'relative'
  }

  const contentStyle: CSSProperties = {
    transform: `translateY(${offsetY}px)`,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  }

  return (
    <div
      ref={containerRef}
      className={`virtual-list ${className}`}
      style={containerStyle}
      onScroll={handleScroll}
    >
      <div style={virtualStyle}>
        <div style={contentStyle}>
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="virtual-list-item"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
      <div ref={endRef} style={{ height: 1, marginTop: -1 }} />
    </div>
  )
}

export const VirtualList = memo(VirtualListComponent) as typeof VirtualListComponent

// Optimized partner card for virtual lists
export const VirtualPartnerCard = memo<{ partner: any; index: number }>(
  ({ partner, index }) => {
    return (
      <div className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{partner.name}</h3>
            <p className="text-sm text-gray-600">{partner.category}</p>
            <p className="text-sm font-medium text-indigo-600">
              {partner.discount}% discount
            </p>
          </div>
        </div>
      </div>
    )
  }
)