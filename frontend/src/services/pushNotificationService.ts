import React from 'react'
import { boomApi } from './boomApi'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  requireInteraction?: boolean
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  data?: any
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null
  private permission: NotificationPermission = 'default'
  private isSupported = false

  constructor() {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      this.isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
      if (this.isSupported) {
        this.permission = Notification.permission
      }
    } else {
      this.isSupported = false
    }
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser')
      return false
    }

    try {
      // Wait for service worker registration
      this.registration = await navigator.serviceWorker.ready
      console.log('Push notification service initialized')
      return true
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
      return false
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      
      if (permission === 'granted') {
        console.log('Push notification permission granted')
        // Subscribe to push notifications
        await this.subscribe()
        return true
      } else {
        console.log('Push notification permission denied')
        return false
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  private async subscribe(): Promise<void> {
    if (!this.registration) {
      await this.initialize()
    }

    if (!this.registration) {
      throw new Error('Service worker not registered')
    }

    try {
      // Check if already subscribed
      const existingSubscription = await this.registration.pushManager.getSubscription()
      if (existingSubscription) {
        console.log('Already subscribed to push notifications')
        await this.sendSubscriptionToServer(existingSubscription)
        return
      }

      // Get public key from server
      const response = await boomApi.get('/notifications/vapid-public-key')
      const vapidPublicKey = response.data.publicKey
      const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey)

      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      })

      console.log('Subscribed to push notifications:', subscription)
      await this.sendSubscriptionToServer(subscription)
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      throw error
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await boomApi.post('/notifications/subscribe', {
        subscription: subscription.toJSON()
      })
      console.log('Subscription sent to server')
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
      throw error
    }
  }

  async unsubscribe(): Promise<void> {
    if (!this.registration) return

    try {
      const subscription = await this.registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await boomApi.post('/notifications/unsubscribe', {
          endpoint: subscription.endpoint
        })
        console.log('Unsubscribed from push notifications')
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      throw error
    }
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted')
      return
    }

    if (!this.registration) {
      await this.initialize()
    }

    if (!this.registration) {
      throw new Error('Service worker not registered')
    }

    try {
      await this.registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/images/icon-192.png',
        badge: options.badge || '/images/badge-72.png',
        image: options.image,
        tag: options.tag,
        requireInteraction: options.requireInteraction,
        actions: options.actions,
        data: options.data,
        vibrate: [200, 100, 200],
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Failed to show notification:', error)
      throw error
    }
  }

  async showLocalNotification(title: string, body: string, options?: Partial<NotificationOptions>): Promise<void> {
    await this.showNotification({
      title,
      body,
      ...options
    })
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission
  }

  isNotificationSupported(): boolean {
    return this.isSupported
  }

  async checkSubscription(): Promise<boolean> {
    if (!this.registration) {
      await this.initialize()
    }

    if (!this.registration) return false

    const subscription = await this.registration.pushManager.getSubscription()
    return !!subscription
  }

  // Notification templates
  async notifyNewPartner(partner: { name: string; discount: number; id: string }): Promise<void> {
    await this.showNotification({
      title: 'New Partner Added! 🎉',
      body: `${partner.name} is now offering ${partner.discount}% discount!`,
      tag: `partner-${partner.id}`,
      data: {
        type: 'partner',
        partnerId: partner.id
      },
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    })
  }

  async notifyTransaction(transaction: { partnerId: string; savings: number }): Promise<void> {
    await this.showNotification({
      title: 'Transaction Complete! 💰',
      body: `You saved ${transaction.savings} BGN on your purchase!`,
      tag: 'transaction',
      requireInteraction: true,
      data: {
        type: 'transaction',
        partnerId: transaction.partnerId
      }
    })
  }

  async notifyExpiringSoon(daysRemaining: number): Promise<void> {
    await this.showNotification({
      title: 'Membership Expiring Soon! ⏰',
      body: `Your BOOM Card membership expires in ${daysRemaining} days. Renew now to keep saving!`,
      tag: 'membership-expiry',
      requireInteraction: true,
      actions: [
        {
          action: 'renew',
          title: 'Renew Now'
        },
        {
          action: 'later',
          title: 'Remind Later'
        }
      ],
      data: {
        type: 'membership',
        action: 'renew'
      }
    })
  }

  async notifyAchievement(achievement: { name: string; description: string }): Promise<void> {
    await this.showNotification({
      title: 'Achievement Unlocked! 🏆',
      body: `${achievement.name}: ${achievement.description}`,
      tag: 'achievement',
      image: '/images/achievement-banner.png',
      data: {
        type: 'achievement'
      }
    })
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService()

// React hook for push notifications
export function usePushNotifications() {
  const [isSupported, setIsSupported] = React.useState(false)
  const [permission, setPermission] = React.useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = React.useState(false)

  React.useEffect(() => {
    const checkStatus = async () => {
      setIsSupported(pushNotificationService.isNotificationSupported())
      setPermission(pushNotificationService.getPermissionStatus())
      
      if (pushNotificationService.isNotificationSupported()) {
        await pushNotificationService.initialize()
        const subscribed = await pushNotificationService.checkSubscription()
        setIsSubscribed(subscribed)
      }
    }

    checkStatus()
  }, [])

  const requestPermission = async () => {
    const granted = await pushNotificationService.requestPermission()
    setPermission(pushNotificationService.getPermissionStatus())
    if (granted) {
      const subscribed = await pushNotificationService.checkSubscription()
      setIsSubscribed(subscribed)
    }
    return granted
  }

  const unsubscribe = async () => {
    await pushNotificationService.unsubscribe()
    setIsSubscribed(false)
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    unsubscribe,
    showNotification: pushNotificationService.showLocalNotification.bind(pushNotificationService)
  }
}