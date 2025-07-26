import React from 'react'
import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { boomApi } from './boomApi'

interface SyncQueueItem {
  id: string
  type: 'favorite' | 'transaction' | 'review' | 'profile'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  retries: number
}

interface OfflineDB extends DBSchema {
  syncQueue: {
    key: string
    value: SyncQueueItem
  }
  partners: {
    key: string
    value: any
  }
  transactions: {
    key: string
    value: any
  }
  userData: {
    key: string
    value: any
  }
}

class OfflineSyncService {
  private db: IDBPDatabase<OfflineDB> | null = null
  private syncInProgress = false
  private syncInterval: NodeJS.Timeout | null = null

  async initialize(): Promise<void> {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      console.warn('Offline sync can only be initialized on the client side')
      return
    }

    try {
      this.db = await openDB<OfflineDB>('boom-card-offline', 1, {
        upgrade(db) {
          // Create stores
          if (!db.objectStoreNames.contains('syncQueue')) {
            db.createObjectStore('syncQueue', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('partners')) {
            db.createObjectStore('partners', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('transactions')) {
            db.createObjectStore('transactions', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('userData')) {
            db.createObjectStore('userData', { keyPath: 'key' })
          }
        }
      })

      // Start sync interval
      this.startSyncInterval()

      // Listen for online/offline events
      window.addEventListener('online', this.handleOnline.bind(this))
      window.addEventListener('offline', this.handleOffline.bind(this))

      console.log('Offline sync service initialized')
    } catch (error) {
      console.error('Failed to initialize offline sync:', error)
    }
  }

  private startSyncInterval(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncPendingChanges()
      }
    }, 30000)
  }

  private handleOnline(): void {
    console.log('Connection restored, syncing pending changes...')
    this.syncPendingChanges()
  }

  private handleOffline(): void {
    console.log('Connection lost, enabling offline mode')
  }

  // Add item to sync queue
  async queueAction(
    type: SyncQueueItem['type'],
    action: SyncQueueItem['action'],
    data: any
  ): Promise<void> {
    if (!this.db) return

    const item: SyncQueueItem = {
      id: `${type}-${action}-${Date.now()}-${Math.random()}`,
      type,
      action,
      data,
      timestamp: Date.now(),
      retries: 0
    }

    await this.db.put('syncQueue', item)
    console.log('Action queued for sync:', item)

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncPendingChanges()
    }
  }

  // Sync pending changes
  async syncPendingChanges(): Promise<void> {
    if (!this.db || this.syncInProgress) return

    this.syncInProgress = true

    try {
      const tx = this.db.transaction('syncQueue', 'readonly')
      const items = await tx.objectStore('syncQueue').getAll()

      if (items.length === 0) {
        console.log('No pending changes to sync')
        return
      }

      console.log(`Syncing ${items.length} pending changes...`)

      for (const item of items) {
        try {
          await this.syncItem(item)
          // Remove from queue after successful sync
          await this.db.delete('syncQueue', item.id)
          console.log('Synced successfully:', item.id)
        } catch (error) {
          console.error('Failed to sync item:', item.id, error)
          // Increment retry count
          item.retries++
          
          if (item.retries < 3) {
            // Update retry count
            await this.db.put('syncQueue', item)
          } else {
            // Max retries reached, remove from queue
            console.error('Max retries reached for item:', item.id)
            await this.db.delete('syncQueue', item.id)
          }
        }
      }
    } finally {
      this.syncInProgress = false
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'favorite':
        await this.syncFavorite(item)
        break
      case 'transaction':
        await this.syncTransaction(item)
        break
      case 'review':
        await this.syncReview(item)
        break
      case 'profile':
        await this.syncProfile(item)
        break
      default:
        throw new Error(`Unknown sync type: ${item.type}`)
    }
  }

  private async syncFavorite(item: SyncQueueItem): Promise<void> {
    switch (item.action) {
      case 'create':
        await boomApi.addFavorite(item.data.partnerId)
        break
      case 'delete':
        await boomApi.removeFavorite(item.data.partnerId)
        break
      default:
        throw new Error(`Invalid action for favorite: ${item.action}`)
    }
  }

  private async syncTransaction(item: SyncQueueItem): Promise<void> {
    if (item.action === 'create') {
      await boomApi.useDiscount(item.data.partnerId, item.data.discountCode)
    } else {
      throw new Error(`Invalid action for transaction: ${item.action}`)
    }
  }

  private async syncReview(item: SyncQueueItem): Promise<void> {
    if (item.action === 'create') {
      await boomApi.submitReview(item.data)
    } else {
      throw new Error(`Invalid action for review: ${item.action}`)
    }
  }

  private async syncProfile(item: SyncQueueItem): Promise<void> {
    if (item.action === 'update') {
      await boomApi.updateProfile(item.data)
    } else {
      throw new Error(`Invalid action for profile: ${item.action}`)
    }
  }

  // Cache management
  async cachePartners(partners: any[]): Promise<void> {
    if (!this.db) return

    const tx = this.db.transaction('partners', 'readwrite')
    await Promise.all(
      partners.map(partner => tx.objectStore('partners').put(partner))
    )
    await tx.done
  }

  async getCachedPartners(): Promise<any[]> {
    if (!this.db) return []

    const tx = this.db.transaction('partners', 'readonly')
    return tx.objectStore('partners').getAll()
  }

  async cacheTransaction(transaction: any): Promise<void> {
    if (!this.db) return

    await this.db.put('transactions', transaction)
  }

  async getCachedTransactions(): Promise<any[]> {
    if (!this.db) return []

    const tx = this.db.transaction('transactions', 'readonly')
    return tx.objectStore('transactions').getAll()
  }

  async cacheUserData(key: string, data: any): Promise<void> {
    if (!this.db) return

    await this.db.put('userData', { key, data, timestamp: Date.now() })
  }

  async getCachedUserData(key: string): Promise<any> {
    if (!this.db) return null

    const result = await this.db.get('userData', key)
    return result?.data || null
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    if (!this.db) return

    const stores: (keyof OfflineDB)[] = ['syncQueue', 'partners', 'transactions', 'userData']
    
    for (const store of stores) {
      const tx = this.db.transaction(store, 'readwrite')
      await tx.objectStore(store).clear()
    }
  }

  // Check if online
  isOnline(): boolean {
    if (typeof window === 'undefined') {
      return true // Assume online during SSR
    }
    return navigator.onLine
  }

  // Get pending sync count
  async getPendingSyncCount(): Promise<number> {
    if (!this.db) return 0

    const tx = this.db.transaction('syncQueue', 'readonly')
    return tx.objectStore('syncQueue').count()
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    window.removeEventListener('online', this.handleOnline.bind(this))
    window.removeEventListener('offline', this.handleOffline.bind(this))
    
    if (this.db) {
      this.db.close()
    }
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService()

// React hook for offline sync
export function useOfflineSync() {
  const [isOnline, setIsOnline] = React.useState(() => {
    if (typeof window === 'undefined') {
      return true // Assume online during SSR
    }
    return navigator.onLine
  })
  const [pendingCount, setPendingCount] = React.useState(0)

  React.useEffect(() => {
    // Initialize service
    offlineSyncService.initialize()

    // Update online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Update pending count periodically
    const updatePendingCount = async () => {
      const count = await offlineSyncService.getPendingSyncCount()
      setPendingCount(count)
    }

    updatePendingCount()
    const interval = setInterval(updatePendingCount, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const queueAction = React.useCallback(
    (type: SyncQueueItem['type'], action: SyncQueueItem['action'], data: any) => {
      return offlineSyncService.queueAction(type, action, data)
    },
    []
  )

  const syncNow = React.useCallback(() => {
    return offlineSyncService.syncPendingChanges()
  }, [])

  return {
    isOnline,
    pendingCount,
    queueAction,
    syncNow,
    cachePartners: offlineSyncService.cachePartners.bind(offlineSyncService),
    getCachedPartners: offlineSyncService.getCachedPartners.bind(offlineSyncService),
    cacheUserData: offlineSyncService.cacheUserData.bind(offlineSyncService),
    getCachedUserData: offlineSyncService.getCachedUserData.bind(offlineSyncService)
  }
}