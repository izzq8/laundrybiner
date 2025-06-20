import { useEffect, useCallback } from 'react'
import { invalidateOrdersCache } from './useOrdersCache'

interface PaymentStatusUpdate {
  orderId: string
  paymentStatus: string
  orderStatus: string
  updated: number
}

type PaymentStatusUpdateCallback = (data: PaymentStatusUpdate) => void

export function usePaymentStatusUpdates(callback: PaymentStatusUpdateCallback) {
  const handlePaymentStatusUpdate = useCallback((data: PaymentStatusUpdate) => {
    console.log('💳 Payment status update received:', data)
    
    // Invalidate orders cache when payment status changes
    if (data.updated > 0) {
      console.log('🔄 Invalidating orders cache due to payment status update')
      invalidateOrdersCache()
    }
    
    // Call the provided callback
    callback(data)
  }, [callback])

  useEffect(() => {
    // Listen for payment status updates from background service
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PAYMENT_STATUS_UPDATE') {
        handlePaymentStatusUpdate(event.data.payload)
      }
    }

    // Listen for custom events (from other parts of the app)
    const handleCustomEvent = (event: CustomEvent<PaymentStatusUpdate>) => {
      handlePaymentStatusUpdate(event.detail)
    }

    window.addEventListener('message', handleMessage)
    window.addEventListener('paymentStatusUpdate', handleCustomEvent as EventListener)

    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('paymentStatusUpdate', handleCustomEvent as EventListener)
    }
  }, [handlePaymentStatusUpdate])
}

// Utility to trigger payment status update
export const triggerPaymentStatusUpdate = (data: PaymentStatusUpdate) => {
  const event = new CustomEvent('paymentStatusUpdate', { detail: data })
  window.dispatchEvent(event)
}
