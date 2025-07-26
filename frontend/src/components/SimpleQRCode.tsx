import React, { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'

interface SimpleQRCodeProps {
  size?: number
  className?: string
}

const SimpleQRCode: React.FC<SimpleQRCodeProps> = ({ size = 200, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const user = useAuthStore(state => state.user)

  useEffect(() => {
    if (!canvasRef.current || !user) return

    // For demonstration, we'll create a simple pattern
    // In production, you would use a proper QR code library
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, size, size)

    // Create a simple QR-like pattern for demo
    const moduleSize = size / 25
    const qrData = `BOOM:${user.id}:${user.membershipType || 'basic'}`
    
    // Simple hash function to generate pattern from data
    let hash = 0
    for (let i = 0; i < qrData.length; i++) {
      hash = ((hash << 5) - hash) + qrData.charCodeAt(i)
      hash = hash & hash
    }

    // Draw QR-like pattern
    ctx.fillStyle = '#000000'
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // Corner squares (finder patterns)
        if ((row < 7 && col < 7) || (row < 7 && col >= 18) || (row >= 18 && col < 7)) {
          if ((row === 0 || row === 6 || col === 0 || col === 6) ||
              (row >= 2 && row <= 4 && col >= 2 && col <= 4)) {
            ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
          }
        } 
        // Data area (pseudo-random based on hash)
        else if ((hash + row * 25 + col) % 3 === 0) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
        }
      }
    }

    // Add BOOM text in center
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(size * 0.35, size * 0.45, size * 0.3, size * 0.1)
    ctx.fillStyle = '#000000'
    ctx.font = `${size * 0.06}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('BOOM', size / 2, size / 2)

  }, [user, size])

  if (!user) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse rounded ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`bg-white rounded shadow-lg ${className}`}
    />
  )
}

export default SimpleQRCode

export const MiniSimpleQRCode: React.FC<{ size?: number }> = ({ size = 60 }) => {
  return <SimpleQRCode size={size} />
}