import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthStore } from '../store/authStore'
import { usePartnerStore } from '../store/partnerStore'
import { useUserStore } from '../store/userStore'
import { useUIStore } from '../store/uiStore'
import { useWebSocket } from '../services/websocketService'
import { usePushNotifications } from '../services/pushNotificationService'
import { useOfflineSync } from '../services/offlineSyncService'
import SimpleQRCode, { MiniSimpleQRCode } from '../components/SimpleQRCode'
import AdvancedSearch from '../components/AdvancedSearch'
import OptimizedImage from '../components/OptimizedImage'
import NotificationContainer from '../components/NotificationContainer'
import { formatCurrency, formatDate } from '../utils/format'

const DashboardCompletePage: React.FC = () => {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { featuredPartners, loadFeaturedPartners } = usePartnerStore()
  const { stats, activities, loadStats, loadActivities } = useUserStore()
  const { addNotification } = useUIStore()
  
  // Feature hooks
  const { isConnected: wsConnected, on: wsOn, off: wsOff } = useWebSocket()
  const { isSupported: pushSupported, permission, requestPermission, isSubscribed } = usePushNotifications()
  const { isOnline, pendingCount, syncNow } = useOfflineSync()
  
  const [showQRModal, setShowQRModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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

  // Define loadInitialData without dependencies that could cause loops
  const loadInitialData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadStats(),
        loadActivities(),
        loadFeaturedPartners()
      ])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Don't use addNotification here as it can cause re-renders
    } finally {
      setIsLoading(false)
    }
  }, []) // Empty deps - these functions from stores should be stable

  const handleNotification = React.useCallback((data: any) => {
    addNotification({
      type: data.type,
      title: data.title || 'Notification',
      message: data.message
    })
  }, []) // Remove deps

  const handleTransactionComplete = React.useCallback(() => {
    loadStats() // Refresh stats
    loadActivities() // Refresh activities
  }, []) // Remove deps

  const handleAchievement = React.useCallback((data: any) => {
    addNotification({
      type: 'success',
      title: 'Achievement Unlocked!',
      message: `${data.achievement.name}`,
      duration: 5000
    })
  }, []) // Remove deps

  useEffect(() => {
    if (!hasCheckedAuth) return

    if (!isAuthenticated) {
      // Store the intended destination
      const returnUrl = router.asPath
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
      return
    }
  }, [hasCheckedAuth, isAuthenticated, router])

  // Separate effect for loading data
  useEffect(() => {
    if (hasCheckedAuth && isAuthenticated) {
      loadInitialData()
    }
  }, [hasCheckedAuth, isAuthenticated]) // Remove loadInitialData from deps

  // Separate effect for WebSocket listeners
  useEffect(() => {
    if (!isAuthenticated) return

    // Set up WebSocket listeners
    wsOn('user:notification', handleNotification)
    wsOn('transaction:complete', handleTransactionComplete)
    wsOn('user:achievement', handleAchievement)

    return () => {
      // Cleanup WebSocket listeners
      wsOff('user:notification', handleNotification)
      wsOff('transaction:complete', handleTransactionComplete)
      wsOff('user:achievement', handleAchievement)
    }
  }, [isAuthenticated, wsOn, wsOff]) // Remove handler functions from deps

  const enablePushNotifications = async () => {
    const granted = await requestPermission()
    if (granted) {
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Push notifications enabled!'
      })
    }
  }

  if (!hasCheckedAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Dashboard - BOOM Card</title>
        <meta name="description" content="Your BOOM Card dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.firstName}!
              </h1>
              
              <div className="flex items-center space-x-4">
                {/* Connection Status */}
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-gray-600">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                  {!isOnline && pendingCount > 0 && (
                    <button
                      onClick={syncNow}
                      className="text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Sync {pendingCount} changes
                    </button>
                  )}
                </div>

                {/* WebSocket Status */}
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-gray-600">
                    {wsConnected ? 'Live updates' : 'Reconnecting...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="mb-8">
            <AdvancedSearch className="w-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Savings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats?.totalSavings || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    This month: {formatCurrency(stats?.monthlySavings || 0)}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Discounts Used</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.discountsUsed || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-indigo-100 rounded-full">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    This month: {stats?.monthlyDiscounts || 0}
                  </p>
                </div>
              </div>

              {/* Featured Partners */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Partners</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featuredPartners.slice(0, 4).map((partner) => (
                    <Link
                      key={partner.id}
                      href={`/partners/${partner.id}`}
                      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 flex items-center space-x-4">
                        <OptimizedImage
                          src={partner.logoUrl || '/images/partner-placeholder.png'}
                          alt={partner.name}
                          width={60}
                          height={60}
                          className="rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{partner.name}</h3>
                          <p className="text-sm text-gray-600">{partner.category}</p>
                          <p className="text-sm font-semibold text-indigo-600">
                            {partner.discount}% discount
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="bg-white rounded-lg shadow">
                  {activities.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {activities.slice(0, 5).map((activity) => (
                        <li key={activity.id} className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                              activity.type === 'transaction' ? 'bg-green-100' :
                              activity.type === 'achievement' ? 'bg-yellow-100' :
                              'bg-gray-100'
                            }`}>
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                {activity.type === 'transaction' ? (
                                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                ) : activity.type === 'achievement' ? (
                                  <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                ) : (
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                )}
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                              <p className="text-sm text-gray-600">{activity.description}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(activity.timestamp)}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-8 text-center text-gray-500">
                      No recent activity
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Membership Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90">Membership</p>
                    <p className="text-xl font-bold capitalize">{user.membershipType}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2">
                    <div className="w-[60px] h-[60px] bg-white rounded flex items-center justify-center">
                      <svg width="60" height="60" viewBox="0 0 60 60" className="w-full h-full">
                        {/* Simple QR code pattern */}
                        <rect width="60" height="60" fill="white"/>
                        {/* Corner squares */}
                        <rect x="4" y="4" width="16" height="16" fill="black"/>
                        <rect x="7" y="7" width="10" height="10" fill="white"/>
                        <rect x="10" y="10" width="4" height="4" fill="black"/>
                        
                        <rect x="40" y="4" width="16" height="16" fill="black"/>
                        <rect x="43" y="7" width="10" height="10" fill="white"/>
                        <rect x="46" y="10" width="4" height="4" fill="black"/>
                        
                        <rect x="4" y="40" width="16" height="16" fill="black"/>
                        <rect x="7" y="43" width="10" height="10" fill="white"/>
                        <rect x="10" y="46" width="4" height="4" fill="black"/>
                        
                        {/* Data pattern */}
                        <rect x="25" y="4" width="4" height="4" fill="black"/>
                        <rect x="31" y="4" width="4" height="4" fill="black"/>
                        <rect x="25" y="10" width="4" height="4" fill="black"/>
                        <rect x="31" y="16" width="4" height="4" fill="black"/>
                        
                        {/* Center pattern */}
                        <rect x="25" y="25" width="10" height="10" fill="black"/>
                        <rect x="27" y="27" width="6" height="6" fill="white"/>
                        <rect x="29" y="29" width="2" height="2" fill="black"/>
                        
                        {/* Additional data dots */}
                        <rect x="22" y="40" width="4" height="4" fill="black"/>
                        <rect x="28" y="40" width="4" height="4" fill="black"/>
                        <rect x="34" y="40" width="4" height="4" fill="black"/>
                        <rect x="40" y="25" width="4" height="4" fill="black"/>
                        <rect x="46" y="31" width="4" height="4" fill="black"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    Valid until: {formatDate(user.membershipExpiry)}
                  </p>
                  <p className="text-sm opacity-90">
                    Member ID: {user.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setShowQRModal(true)}
                  className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                >
                  Show Full QR Code
                </button>
              </div>

              {/* Push Notifications */}
              {pushSupported && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
                  {permission === 'granted' && isSubscribed ? (
                    <p className="text-sm text-green-600">
                      ✓ Push notifications enabled
                    </p>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        Get notified about new partners and exclusive deals
                      </p>
                      <button
                        onClick={enablePushNotifications}
                        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Enable Notifications
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    href="/partners"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <span className="text-sm font-medium">Browse Partners</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/transactions"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <span className="text-sm font-medium">Transaction History</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <span className="text-sm font-medium">My Profile</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your BOOM Card</h2>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-center">
                <div className="w-[250px] h-[250px] bg-white rounded-lg shadow-lg p-4">
                  <svg width="250" height="250" viewBox="0 0 250 250" className="w-full h-full">
                    {/* Simple QR code pattern */}
                    <rect width="250" height="250" fill="white"/>
                    
                    {/* Corner squares (finder patterns) */}
                    <rect x="10" y="10" width="60" height="60" fill="black"/>
                    <rect x="20" y="20" width="40" height="40" fill="white"/>
                    <rect x="30" y="30" width="20" height="20" fill="black"/>
                    
                    <rect x="180" y="10" width="60" height="60" fill="black"/>
                    <rect x="190" y="20" width="40" height="40" fill="white"/>
                    <rect x="200" y="30" width="20" height="20" fill="black"/>
                    
                    <rect x="10" y="180" width="60" height="60" fill="black"/>
                    <rect x="20" y="190" width="40" height="40" fill="white"/>
                    <rect x="30" y="200" width="20" height="20" fill="black"/>
                    
                    {/* Timing patterns */}
                    {[0,1,2,3,4,5,6,7,8].map(i => (
                      <rect key={`h${i}`} x={80 + i * 20} y="40" width="10" height="10" fill={i % 2 === 0 ? "black" : "white"}/>
                    ))}
                    {[0,1,2,3,4,5,6,7,8].map(i => (
                      <rect key={`v${i}`} x="40" y={80 + i * 20} width="10" height="10" fill={i % 2 === 0 ? "black" : "white"}/>
                    ))}
                    
                    {/* Center logo area */}
                    <rect x="95" y="95" width="60" height="60" fill="white" stroke="black" strokeWidth="2"/>
                    <text x="125" y="130" textAnchor="middle" fontSize="20" fontWeight="bold" fill="black">
                      BOOM
                    </text>
                    
                    {/* Data matrix pattern */}
                    {[0,1,2,3,4,5].map(row => 
                      [0,1,2,3,4,5].map(col => {
                        const shouldFill = (row + col) % 3 === 0 || (row * col) % 2 === 0;
                        if (row < 2 && col < 2) return null; // Skip top-left
                        if (row < 2 && col > 3) return null; // Skip top-right
                        if (row > 3 && col < 2) return null; // Skip bottom-left
                        if (row >= 2 && row <= 3 && col >= 2 && col <= 3) return null; // Skip center
                        
                        return (
                          <rect 
                            key={`${row}-${col}`}
                            x={80 + col * 15} 
                            y={80 + row * 15} 
                            width="10" 
                            height="10" 
                            fill={shouldFill ? "black" : "white"}
                          />
                        );
                      })
                    )}
                    
                    {/* Additional alignment pattern */}
                    <rect x="170" y="170" width="30" height="30" fill="black"/>
                    <rect x="175" y="175" width="20" height="20" fill="white"/>
                    <rect x="180" y="180" width="10" height="10" fill="black"/>
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Member ID: {user?.id?.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-gray-500 mt-1">Membership: {user?.membershipType || 'Basic'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        <NotificationContainer />
      </div>
    </>
  )
}

export default DashboardCompletePage