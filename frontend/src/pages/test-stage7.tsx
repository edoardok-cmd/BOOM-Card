import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { useWebSocket } from '../services/websocketService'
import { usePushNotifications } from '../services/pushNotificationService'
import { useOfflineSync } from '../services/offlineSyncService'
import QRCode, { MiniQRCode } from '../components/QRCode'
import AdvancedSearch from '../components/AdvancedSearch'
import NotificationContainer from '../components/NotificationContainer'

const TestStage7Page: React.FC = () => {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { showNotification } = useUIStore()
  
  // Feature hooks
  const { isConnected: wsConnected, sendEvent } = useWebSocket()
  const { isSupported: pushSupported, permission, requestPermission } = usePushNotifications()
  const { isOnline, pendingCount, queueAction, syncNow } = useOfflineSync()
  
  const [showQRModal, setShowQRModal] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  // Check auth on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Wait a bit for store to rehydrate
      await new Promise(resolve => setTimeout(resolve, 100))
      setHasCheckedAuth(true)
    }
    checkAuthStatus()
  }, [])

  // Test WebSocket
  const testWebSocket = () => {
    if (wsConnected) {
      sendEvent('test:message', { 
        message: 'Hello from client!',
        timestamp: Date.now()
      })
      showNotification({
        type: 'success',
        message: 'WebSocket message sent!'
      })
    } else {
      showNotification({
        type: 'error',
        message: 'WebSocket not connected'
      })
    }
  }

  // Test Push Notifications
  const testPushNotifications = async () => {
    if (!pushSupported) {
      showNotification({
        type: 'error',
        message: 'Push notifications not supported'
      })
      return
    }

    if (permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        showNotification({
          type: 'error',
          message: 'Push notification permission denied'
        })
        return
      }
    }

    showNotification({
      type: 'success',
      message: 'Push notification test sent!',
      title: 'Test Notification',
      duration: 5000
    })
  }

  // Test Offline Sync
  const testOfflineSync = async () => {
    await queueAction('favorite', 'create', {
      partnerId: 'test-partner-123',
      timestamp: Date.now()
    })
    
    showNotification({
      type: 'info',
      message: `Action queued! ${pendingCount + 1} actions pending.`
    })
  }

  // Test Search
  const handleSearchResults = (results: any[]) => {
    setSearchResults(results)
    showNotification({
      type: 'success',
      message: `Found ${results.length} results`
    })
  }

  if (!hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <button
            onClick={() => {
              const returnUrl = router.asPath
              router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Stage 7 Features Test - BOOM Card</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Stage 7 Features Test</h1>

          {/* Status Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-8">
            <h2 className="text-lg font-semibold mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>WebSocket</span>
                <div className={`flex items-center space-x-2`}>
                  <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{wsConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Push Notifications</span>
                <div className={`flex items-center space-x-2`}>
                  <div className={`w-3 h-3 rounded-full ${permission === 'granted' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span>{permission}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Offline Sync</span>
                <div className={`flex items-center space-x-2`}>
                  <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span>{isOnline ? 'Online' : 'Offline'} ({pendingCount} pending)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Search */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Advanced Search</h2>
            <AdvancedSearch onSearchResults={handleSearchResults} />
            
            {searchResults.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Search Results:</h3>
                <div className="space-y-2">
                  {searchResults.slice(0, 5).map((result, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      {result.name} - {result.discount}% discount
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">QR Code</h2>
            <div className="flex items-center space-x-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Mini QR Code:</p>
                <MiniQRCode size={100} />
              </div>
              <button
                onClick={() => setShowQRModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Show Full QR Code
              </button>
            </div>
          </div>

          {/* Feature Tests */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Test Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={testWebSocket}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                <h3 className="font-medium">Test WebSocket</h3>
                <p className="text-sm text-gray-600 mt-1">Send real-time message</p>
              </button>

              <button
                onClick={testPushNotifications}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 className="font-medium">Test Push Notifications</h3>
                <p className="text-sm text-gray-600 mt-1">Request permission & test</p>
              </button>

              <button
                onClick={testOfflineSync}
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <h3 className="font-medium">Test Offline Sync</h3>
                <p className="text-sm text-gray-600 mt-1">Queue offline action</p>
              </button>

              {!isOnline && pendingCount > 0 && (
                <button
                  onClick={syncNow}
                  className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-center transition"
                >
                  <svg className="w-8 h-8 mx-auto mb-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <h3 className="font-medium">Sync Now</h3>
                  <p className="text-sm text-gray-600 mt-1">Sync {pendingCount} pending actions</p>
                </button>
              )}

              <button
                onClick={() => router.push('/dashboard')}
                className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-center transition"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <h3 className="font-medium">Complete Dashboard</h3>
                <p className="text-sm text-gray-600 mt-1">View full integration</p>
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your BOOM Card QR Code</h2>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <QRCode size={300} />
            </div>
          </div>
        )}

        {/* Notifications */}
        <NotificationContainer />
      </div>
    </>
  )
}

export default TestStage7Page