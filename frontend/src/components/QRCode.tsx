import React, { useEffect, useRef, useState } from 'react'
import QRCodeStyling, { Options } from 'qr-code-styling'
import { useAuthStore } from '../store/authStore'
import { userService } from '../services/userService'

interface QRCodeProps {
  size?: number
  backgroundColor?: string
  color?: string
  logo?: string
  logoSize?: number
  cornerRadius?: number
  showDownloadButton?: boolean
  className?: string
}

const QRCode: React.FC<QRCodeProps> = ({
  size = 300,
  backgroundColor = '#FFFFFF',
  color = '#000000',
  logo = '/images/logo-small.png',
  logoSize = 60,
  cornerRadius = 10,
  showDownloadButton = true,
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null)
  const [qrData, setQrData] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const user = useAuthStore(state => state.user)

  useEffect(() => {
    fetchQRData()
  }, [user])

  const fetchQRData = async () => {
    if (!user) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      // For now, use the user ID as QR data
      // In production, this would be a secure token or URL
      const qrDataString = `BOOM:${user.id}:${user.membershipType || 'basic'}`
      setQrData(qrDataString)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch QR code:', err)
      setError('Failed to load QR code')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!qrData || !ref.current) return

    const options: Options = {
      width: size,
      height: size,
      type: 'svg',
      data: qrData,
      image: logo,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'Q'
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: logoSize / size,
        margin: 5,
        crossOrigin: 'anonymous',
      },
      dotsOptions: {
        color: color,
        type: 'rounded'
      },
      backgroundOptions: {
        color: backgroundColor,
      },
      cornersSquareOptions: {
        color: color,
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color: color,
        type: 'dot',
      }
    }

    const qrCodeInstance = new QRCodeStyling(options)
    setQrCode(qrCodeInstance)

    // Clear previous QR code
    ref.current.innerHTML = ''
    qrCodeInstance.append(ref.current)

    return () => {
      if (ref.current) {
        ref.current.innerHTML = ''
      }
    }
  }, [qrData, size, backgroundColor, color, logo, logoSize])

  const handleDownload = (extension: 'png' | 'svg' | 'jpeg' = 'png') => {
    if (!qrCode) return

    qrCode.download({
      name: `boom-card-${user?.id || 'qr'}`,
      extension: extension
    })
  }

  const handleRegenerateQR = async () => {
    try {
      setLoading(true)
      // Generate a new QR code with timestamp
      const timestamp = Date.now()
      const qrDataString = `BOOM:${user.id}:${user.membershipType || 'basic'}:${timestamp}`
      setQrData(qrDataString)
      setError(null)
    } catch (err) {
      console.error('Failed to regenerate QR code:', err)
      setError('Failed to regenerate QR code')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchQRData}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div 
        ref={ref} 
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ borderRadius: cornerRadius }}
      />
      
      {showDownloadButton && (
        <div className="mt-4 flex flex-col items-center space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={() => handleDownload('png')}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
            >
              Download PNG
            </button>
            <button
              onClick={() => handleDownload('svg')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Download SVG
            </button>
          </div>
          
          <button
            onClick={handleRegenerateQR}
            className="text-sm text-indigo-600 hover:text-indigo-800 underline"
          >
            Regenerate QR Code
          </button>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Show this code to partners to apply your discount
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Member ID: {user?.id}
        </p>
      </div>
    </div>
  )
}

export default QRCode

// Mini QR Code for card display
export const MiniQRCode: React.FC<{ size?: number }> = ({ size = 100 }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [qrData, setQrData] = useState<string | null>(null)
  const user = useAuthStore(state => state.user)

  useEffect(() => {
    if (!user) return
    
    // For now, use the user ID as QR data
    // In production, this would be a secure token or URL
    const qrDataString = `BOOM:${user.id}:${user.membershipType || 'basic'}`
    setQrData(qrDataString)
  }, [user])

  useEffect(() => {
    if (!qrData || !ref.current) return

    const qrCode = new QRCodeStyling({
      width: size,
      height: size,
      type: 'svg',
      data: qrData,
      margin: 2,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'M'
      },
      dotsOptions: {
        color: '#000000',
        type: 'square'
      },
      backgroundOptions: {
        color: '#FFFFFF',
      }
    })

    ref.current.innerHTML = ''
    qrCode.append(ref.current)

    return () => {
      if (ref.current) {
        ref.current.innerHTML = ''
      }
    }
  }, [qrData, size])

  if (!qrData) {
    return <div style={{ width: size, height: size }} className="bg-gray-200 animate-pulse rounded" />
  }

  return <div ref={ref} className="bg-white rounded" />
}