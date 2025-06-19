"use client"

import { useEffect } from 'react'

interface AutoPaymentServiceProps {
  enabled?: boolean
  intervalMinutes?: number
}

export function AutoPaymentService({ 
  enabled = true, 
  intervalMinutes = 2 // Check every 2 minutes
}: AutoPaymentServiceProps) {
  
  useEffect(() => {
    if (!enabled) return

    const runAutoCheck = async () => {
      try {
        console.log("🤖 Running automatic payment status check...")
        
        const response = await fetch('/api/payment/auto-check-all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Auto-check completed: ${data.checked} checked, ${data.updated} updated`)
          
          if (data.updated > 0) {
            console.log(`🎉 ${data.updated} orders had their payment status updated!`)
            
            // Trigger a custom event to notify other components
            window.dispatchEvent(new CustomEvent('paymentStatusUpdated', {
              detail: data
            }))
          }
        } else {
          console.warn("⚠️  Auto-check request failed:", response.status)
        }
      } catch (error) {
        console.error("❌ Auto-check error:", error)
      }
    }

    // Run initial check after 10 seconds
    const initialTimeout = setTimeout(runAutoCheck, 10000)

    // Set up periodic checking
    const interval = setInterval(runAutoCheck, intervalMinutes * 60 * 1000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [enabled, intervalMinutes])

  // This component doesn't render anything visible
  return null
}

// Hook to listen for payment status updates
export function usePaymentStatusUpdates(callback?: (data: any) => void) {
  useEffect(() => {
    const handlePaymentUpdate = (event: CustomEvent) => {
      console.log("📢 Payment status update event received:", event.detail)
      callback?.(event.detail)
    }

    window.addEventListener('paymentStatusUpdated', handlePaymentUpdate as EventListener)

    return () => {
      window.removeEventListener('paymentStatusUpdated', handlePaymentUpdate as EventListener)
    }
  }, [callback])
}
