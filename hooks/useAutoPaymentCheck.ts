import { useEffect, useState, useCallback } from 'react'

interface UseAutoPaymentCheckOptions {
  orderId: string
  paymentStatus: string
  orderStatus: string
  enabled?: boolean
  intervalMs?: number
  onStatusUpdate?: (newStatus: string) => void
}

export function useAutoPaymentCheck({
  orderId,
  paymentStatus,
  orderStatus,
  enabled = true,
  intervalMs = 30000, // Check every 30 seconds
  onStatusUpdate
}: UseAutoPaymentCheckOptions) {
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkPaymentStatus = useCallback(async () => {
    if (!enabled || isChecking || paymentStatus === 'paid' || orderStatus === 'cancelled') {
      return
    }

    setIsChecking(true)
    
    try {
      console.log(`🔄 Auto-checking payment status for order ${orderId}`)
      
      const response = await fetch('/api/orders/check-payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.data.order) {
          const newPaymentStatus = data.data.order.payment_status
          
          console.log(`✅ Payment status check complete: ${paymentStatus} -> ${newPaymentStatus}`)
          
          if (newPaymentStatus !== paymentStatus) {
            console.log(`🎉 Payment status changed! Notifying parent component`)
            onStatusUpdate?.(newPaymentStatus)
          }
          
          setLastChecked(new Date())
        }
      }
    } catch (error) {
      console.error('❌ Error checking payment status:', error)
    } finally {
      setIsChecking(false)
    }
  }, [orderId, paymentStatus, orderStatus, enabled, isChecking, onStatusUpdate])

  useEffect(() => {
    if (!enabled || paymentStatus === 'paid' || orderStatus === 'cancelled') {
      return
    }

    // Initial check after 5 seconds
    const initialTimeout = setTimeout(checkPaymentStatus, 5000)

    // Set up periodic checking
    const interval = setInterval(checkPaymentStatus, intervalMs)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [checkPaymentStatus, enabled, intervalMs])

  return {
    isChecking,
    lastChecked,
    checkNow: checkPaymentStatus
  }
}
