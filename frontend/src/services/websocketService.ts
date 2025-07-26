import React from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { usePartnerStore } from '../store/partnerStore'
import { useUIStore } from '../store/uiStore'

type EventCallback = (data: any) => void

interface WebSocketEvents {
  // Partner events
  'partner:update': (data: { partnerId: string; changes: any }) => void
  'partner:new': (data: { partner: any }) => void
  'partner:featured': (data: { partners: any[] }) => void
  
  // User events
  'user:notification': (data: { type: string; message: string; metadata?: any }) => void
  'user:achievement': (data: { achievement: any }) => void
  'user:subscription': (data: { subscription: any }) => void
  
  // Transaction events
  'transaction:complete': (data: { transaction: any; savings: number }) => void
  'transaction:failed': (data: { transactionId: string; reason: string }) => void
  
  // System events
  'system:maintenance': (data: { message: string; duration: number }) => void
  'system:announcement': (data: { title: string; message: string; priority: string }) => void
}

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private eventHandlers: Map<keyof WebSocketEvents, Set<EventCallback>> = new Map()
  private isConnected = false

  constructor() {
    // Initialize event handlers map
    const events: (keyof WebSocketEvents)[] = [
      'partner:update', 'partner:new', 'partner:featured',
      'user:notification', 'user:achievement', 'user:subscription',
      'transaction:complete', 'transaction:failed',
      'system:maintenance', 'system:announcement'
    ]
    
    events.forEach(event => {
      this.eventHandlers.set(event, new Set())
    })
  }

  connect(): void {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      console.warn('WebSocket can only be initialized on the client side')
      return
    }

    const token = useAuthStore.getState().getAccessToken?.() || localStorage.getItem('accessToken')
    
    if (!token) {
      console.warn('No auth token available for WebSocket connection')
      return
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8003'
    
    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 10000,
    })

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.isConnected = true
      this.reconnectAttempts = 0
      
      // Notify UI
      useUIStore.getState().showNotification({
        type: 'success',
        message: 'Real-time updates connected',
        duration: 3000
      })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      this.isConnected = false
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect manually
        this.reconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.isConnected = false
    })

    // Setup application event listeners
    this.setupApplicationEvents()
  }

  private setupApplicationEvents(): void {
    if (!this.socket) return

    // Partner events
    this.socket.on('partner:update', (data) => {
      this.emit('partner:update', data)
      // Update store if the partner is currently loaded
      const { partners, updatePartner } = usePartnerStore.getState()
      const partner = partners.find(p => p.id === data.partnerId)
      if (partner) {
        updatePartner(data.partnerId, data.changes)
      }
    })

    this.socket.on('partner:new', (data) => {
      this.emit('partner:new', data)
      useUIStore.getState().showNotification({
        type: 'info',
        message: `New partner added: ${data.partner.name}`,
        action: {
          label: 'View',
          onClick: () => window.location.href = `/partners/${data.partner.id}`
        }
      })
    })

    this.socket.on('partner:featured', (data) => {
      this.emit('partner:featured', data)
      usePartnerStore.getState().setFeaturedPartners(data.partners)
    })

    // User events
    this.socket.on('user:notification', (data) => {
      this.emit('user:notification', data)
      useUIStore.getState().showNotification({
        type: data.type as any,
        message: data.message,
        metadata: data.metadata
      })
    })

    this.socket.on('user:achievement', (data) => {
      this.emit('user:achievement', data)
      useUIStore.getState().showNotification({
        type: 'success',
        message: `Achievement unlocked: ${data.achievement.name}!`,
        duration: 5000
      })
    })

    this.socket.on('user:subscription', (data) => {
      this.emit('user:subscription', data)
      // Update user subscription in auth store
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        useAuthStore.getState().updateUser({
          ...currentUser,
          membershipType: data.subscription.type,
          membershipExpiry: data.subscription.expiryDate
        })
      }
    })

    // Transaction events
    this.socket.on('transaction:complete', (data) => {
      this.emit('transaction:complete', data)
      useUIStore.getState().showNotification({
        type: 'success',
        message: `Transaction complete! You saved ${data.savings} BGN`,
        duration: 5000
      })
    })

    this.socket.on('transaction:failed', (data) => {
      this.emit('transaction:failed', data)
      useUIStore.getState().showNotification({
        type: 'error',
        message: `Transaction failed: ${data.reason}`,
        duration: 5000
      })
    })

    // System events
    this.socket.on('system:maintenance', (data) => {
      this.emit('system:maintenance', data)
      useUIStore.getState().showNotification({
        type: 'warning',
        message: data.message,
        duration: 0 // Don't auto-hide
      })
    })

    this.socket.on('system:announcement', (data) => {
      this.emit('system:announcement', data)
      useUIStore.getState().showNotification({
        type: 'info',
        message: data.message,
        title: data.title,
        duration: data.priority === 'high' ? 0 : 10000
      })
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      useUIStore.getState().showNotification({
        type: 'error',
        message: 'Real-time connection lost. Please refresh the page.',
        duration: 0
      })
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      10000
    )

    setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}`)
      this.connect()
    }, delay)
  }

  // Event emitter methods
  on<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.add(callback as EventCallback)
    }
  }

  off<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.delete(callback as EventCallback)
    }
  }

  private emit<K extends keyof WebSocketEvents>(
    event: K,
    data: Parameters<WebSocketEvents[K]>[0]
  ): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }

  // Send events to server
  sendEvent(event: string, data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    } else {
      console.warn('WebSocket not connected, queuing event:', event)
      // Could implement a queue here for offline support
    }
  }

  // Join/leave rooms
  joinRoom(room: string): void {
    this.sendEvent('join:room', { room })
  }

  leaveRoom(room: string): void {
    this.sendEvent('leave:room', { room })
  }

  // Check connection status
  isConnectedStatus(): boolean {
    return this.isConnected
  }
}

// Export singleton instance
export const websocketService = new WebSocketService()

// React hook for WebSocket
export function useWebSocket() {
  const [isConnected, setIsConnected] = React.useState(false)

  React.useEffect(() => {
    // Connect on mount - disabled for now as backend doesn't support WebSocket
    // websocketService.connect()
    
    // Update connection status
    const interval = setInterval(() => {
      setIsConnected(websocketService.isConnectedStatus())
    }, 1000)

    return () => {
      clearInterval(interval)
      // Don't disconnect on unmount - keep connection alive
    }
  }, [])

  return {
    isConnected,
    on: websocketService.on.bind(websocketService),
    off: websocketService.off.bind(websocketService),
    sendEvent: websocketService.sendEvent.bind(websocketService),
    joinRoom: websocketService.joinRoom.bind(websocketService),
    leaveRoom: websocketService.leaveRoom.bind(websocketService)
  }
}