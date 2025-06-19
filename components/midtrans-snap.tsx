'use client'

import { useEffect, useState } from 'react'

interface MidtransSnapProps {
  token: string
  onSuccess?: (result: any) => void
  onPending?: (result: any) => void
  onError?: (result: any) => void
  onClose?: () => void
}

export const useMidtransSnap = () => {
  const [snapReady, setSnapReady] = useState(false)
  const [snapError, setSnapError] = useState<string | null>(null)

  useEffect(() => {
    const checkSnapReady = () => {
      if (typeof window !== 'undefined' && (window as any).snap) {
        setSnapReady(true)
        setSnapError(null)
        return
      }

      // Check if script is loaded but snap is not ready
      const snapScript = document.querySelector('script[src*="snap.js"]')
      if (snapScript) {
        // Script exists, wait a bit more
        setTimeout(checkSnapReady, 100)
      } else {
        setSnapError('Midtrans Snap script tidak ditemukan')
      }
    }

    // Initial check
    checkSnapReady()

    // Fallback: if snap is not ready after 10 seconds, show error
    const timeout = setTimeout(() => {
      if (!snapReady) {
        setSnapError('Midtrans Snap gagal dimuat dalam waktu yang ditentukan')
      }
    }, 10000)

    return () => clearTimeout(timeout)
  }, [snapReady])

  const openSnap = async (token: string, callbacks: {
    onSuccess?: (result: any) => void
    onPending?: (result: any) => void
    onError?: (result: any) => void
    onClose?: () => void
  }) => {
    if (!snapReady) {
      throw new Error('Midtrans Snap belum siap. Silakan tunggu sebentar.')
    }

    if (!token) {
      throw new Error('Token pembayaran tidak valid')
    }

    try {
      // Validate token format (should be a valid string)
      if (typeof token !== 'string' || token.length < 10) {
        throw new Error('Token pembayaran tidak valid atau telah kadaluarsa')
      }

      // Check if snap is still available
      if (!(window as any).snap) {
        throw new Error('Midtrans Snap tidak tersedia')
      }

      // Open snap payment
      (window as any).snap.pay(token, {
        onSuccess: (result: any) => {
          console.log('✅ Payment success:', result)
          callbacks.onSuccess?.(result)
        },
        onPending: (result: any) => {
          console.log('⏳ Payment pending:', result)
          callbacks.onPending?.(result)
        },
        onError: (result: any) => {
          console.error('❌ Payment error:', result)
          callbacks.onError?.(result)
        },
        onClose: () => {
          console.log('🔒 Payment popup closed')
          callbacks.onClose?.()
        }
      })
    } catch (error) {
      console.error('Error opening Snap payment:', error)
      throw error
    }
  }

  return {
    snapReady,
    snapError,
    openSnap
  }
}

export const MidtransSnapButton: React.FC<MidtransSnapProps & {
  children: React.ReactNode
  className?: string
  disabled?: boolean
}> = ({ 
  token, 
  onSuccess, 
  onPending, 
  onError, 
  onClose, 
  children, 
  className = '',
  disabled = false 
}) => {
  const { snapReady, snapError, openSnap } = useMidtransSnap()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!snapReady || loading || disabled) return

    setLoading(true)
    try {
      await openSnap(token, {
        onSuccess,
        onPending,
        onError,
        onClose
      })
    } catch (error) {
      console.error('Error opening payment:', error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }

  if (snapError) {
    return (
      <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
        ⚠️ {snapError}
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={!snapReady || loading || disabled}
      className={`${className} ${
        !snapReady || loading || disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:opacity-90'
      }`}
    >
      {loading ? 'Membuka pembayaran...' : 
       !snapReady ? 'Memuat...' : 
       children}
    </button>
  )
}
