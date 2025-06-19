"use client"

import { useEffect, useState } from "react"
import { Timer } from "lucide-react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

interface CountdownTimerProps {
  createdAt: string
  expiryHours?: number
  showIcon?: boolean
  compact?: boolean
  className?: string
  showExpiredAction?: boolean
  fontSize?: 'small' | 'medium' | 'large'
}

export function CountdownTimer({ 
  createdAt, 
  expiryHours = 24, 
  showIcon = true, 
  compact = false,
  className = "",
  showExpiredAction = false,
  fontSize = 'medium'
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const updateCountdown = () => {
      const createdDate = new Date(createdAt)
      const expiryTime = new Date(createdDate.getTime() + expiryHours * 60 * 60 * 1000)
      const now = new Date()
      const difference = expiryTime.getTime() - now.getTime()

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        setIsExpired(false)
      } else {
        setTimeLeft('00:00:00')
        setIsExpired(true)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [createdAt, expiryHours])

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showIcon && (
          <Timer className={`h-3 w-3 ${isExpired ? 'text-red-500' : 'text-amber-500'}`} />
        )}
        <span className={`text-xs font-mono ${isExpired ? 'text-red-600' : 'text-amber-600'}`}>
          {isExpired ? 'Expired' : timeLeft}
        </span>
      </div>
    )
  }

  // Show expired notice with action button if requested
  if (isExpired && showExpiredAction) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Timer className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-medium text-red-900">Pembayaran Kedaluwarsa</h3>
            <p className="text-sm text-red-700">
              Waktu pembayaran telah habis (lebih dari 24 jam)
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push('/order/create')}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          size="sm"
        >
          Buat Pesanan Baru
        </Button>
      </div>
    )
  }  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm'
      case 'large': return 'text-6xl sm:text-7xl md:text-8xl'
      default: return 'text-base'
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <Timer className={`h-4 w-4 ${isExpired ? 'text-red-500' : 'text-amber-500'}`} />
      )}
      <div className="flex flex-col">
        <span className={`font-mono font-light ${getFontSizeClass()} ${isExpired ? 'text-red-600' : 'text-slate-800'}`}>
          {isExpired ? 'EXPIRED' : timeLeft}
        </span>
        {!compact && (
          <span className="text-xs text-gray-500">
            {isExpired ? 'Kedaluwarsa' : 'Waktu tersisa'}
          </span>
        )}
      </div>
    </div>
  )
}

// Hook untuk mengecek apakah pembayaran masih bisa dilakukan
export function useCanMakePayment(createdAt: string, paymentStatus: string, orderStatus: string, expiryHours: number = 24) {
  const [canPay, setCanPay] = useState(false)

  useEffect(() => {
    const checkPaymentEligibility = () => {
      // Check if payment is pending or failed
      const isPaymentPending = paymentStatus === 'pending' || paymentStatus === 'failed'
      
      // Check if order is not cancelled
      const isOrderActive = orderStatus !== 'cancelled'
      
      // Check if payment hasn't expired
      const createdDate = new Date(createdAt)
      const expiryTime = new Date(createdDate.getTime() + expiryHours * 60 * 60 * 1000)
      const isNotExpired = new Date() < expiryTime
      
      setCanPay(isPaymentPending && isOrderActive && isNotExpired)
    }

    checkPaymentEligibility()
    const interval = setInterval(checkPaymentEligibility, 1000)

    return () => clearInterval(interval)
  }, [createdAt, paymentStatus, orderStatus, expiryHours])

  return canPay
}
