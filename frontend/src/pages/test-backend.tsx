import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const TestBackendPage: React.FC = () => {
  const [status, setStatus] = useState<{
    apiUrl: string
    wsUrl: string
    healthCheck: 'checking' | 'success' | 'error'
    message?: string
  }>({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'Not configured',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'Not configured',
    healthCheck: 'checking'
  })

  useEffect(() => {
    checkBackendHealth()
  }, [])

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(prev => ({
          ...prev,
          healthCheck: 'success',
          message: `Backend is healthy! Version: ${data.version || 'Unknown'}`
        }))
      } else {
        setStatus(prev => ({
          ...prev,
          healthCheck: 'error',
          message: `Backend returned status: ${response.status}`
        }))
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        healthCheck: 'error',
        message: error instanceof Error ? error.message : 'Connection failed'
      }))
    }
  }

  const getStatusColor = () => {
    switch (status.healthCheck) {
      case 'checking':
        return 'text-yellow-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
    }
  }

  const getStatusIcon = () => {
    switch (status.healthCheck) {
      case 'checking':
        return '⏳'
      case 'success':
        return '✅'
      case 'error':
        return '❌'
    }
  }

  return (
    <>
      <Head>
        <title>Backend Connection Test - BOOM Card</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Backend Connection Test</h1>

            <div className="space-y-6">
              {/* API URL */}
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">API Configuration</h2>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">API URL:</span>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">
                      {status.apiUrl}
                    </code>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">WebSocket URL:</span>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">
                      {status.wsUrl}
                    </code>
                  </p>
                </div>
              </div>

              {/* Health Check */}
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Health Check</h2>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getStatusIcon()}</span>
                  <div>
                    <p className={`font-medium ${getStatusColor()}`}>
                      {status.healthCheck === 'checking' && 'Checking backend connection...'}
                      {status.healthCheck === 'success' && 'Backend connected successfully!'}
                      {status.healthCheck === 'error' && 'Backend connection failed'}
                    </p>
                    {status.message && (
                      <p className="text-sm text-gray-600 mt-1">{status.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={checkBackendHealth}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Retry Health Check
                </button>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Go to Login
                </Link>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-6 mt-6">
                <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                  <li>If the health check is successful, the backend is properly connected</li>
                  <li>You can now login with your credentials</li>
                  <li>If it fails, the backend might be sleeping (Render free tier)</li>
                  <li>Wait a moment and retry - Render backends wake up after ~30 seconds</li>
                </ol>
              </div>

              {/* Test Credentials */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Test Credentials:</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    <code className="bg-gray-200 px-2 py-1 rounded">test@example.com</code>
                  </p>
                  <p>
                    <span className="font-medium">Password:</span>{' '}
                    <code className="bg-gray-200 px-2 py-1 rounded">Test123!</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TestBackendPage