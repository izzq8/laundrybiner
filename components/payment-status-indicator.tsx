"use client"

import { useState, useEffect } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'

interface PaymentStatusIndicatorProps {
  status: string
  orderId: string
  isAutoChecking?: boolean
  onRefresh?: () => void
  lastChecked?: Date | null
}

export function PaymentStatusIndicator({ 
  status, 
  orderId, 
  isAutoChecking = false, 
  onRefresh,
  lastChecked 
}: PaymentStatusIndicatorProps) {
  const [pulseCount, setPulseCount] = useState(0)

  useEffect(() => {
    if (isAutoChecking) {
      const interval = setInterval(() => {
        setPulseCount(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isAutoChecking])

  const getStatusConfig = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
      case 'settlement':
        return {
          icon: CheckCircle,
          label: 'Lunas',
          color: 'bg-green-500 text-white',
          description: 'Pembayaran berhasil diterima',
          showAutoCheck: false
        }
      case 'pending':
        return {
          icon: Clock,
          label: 'Menunggu Pembayaran',
          color: 'bg-yellow-500 text-white',
          description: 'Silakan lakukan pembayaran',
          showAutoCheck: true
        }
      case 'failed':
      case 'deny':
      case 'cancel':
        return {
          icon: XCircle,
          label: 'Gagal',
          color: 'bg-red-500 text-white',
          description: 'Pembayaran gagal atau dibatalkan',
          showAutoCheck: false
        }
      case 'expire':
        return {
          icon: AlertCircle,
          label: 'Kedaluwarsa',
          color: 'bg-gray-500 text-white',
          description: 'Waktu pembayaran telah habis',
          showAutoCheck: false
        }
      default:
        return {
          icon: Clock,
          label: status,
          color: 'bg-gray-500 text-white',
          description: 'Status tidak diketahui',
          showAutoCheck: false
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Status Pembayaran</span>
        <Badge className={config.color} variant="secondary">
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>
      
      <p className="text-xs text-gray-600">{config.description}</p>

      {config.showAutoCheck && isAutoChecking && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <div className="relative">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-25"></div>
            </div>
            <span className="font-medium">Auto-checking payment status...</span>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Checking every 30 seconds for payment updates
          </div>
          {lastChecked && (
            <div className="text-xs text-blue-600 mt-1">
              Last checked: {lastChecked.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {onRefresh && (
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="w-full"
          disabled={isAutoChecking}
        >
          {isAutoChecking ? 'Checking...' : 'Check Status Now'}
        </Button>
      )}
    </div>
  )
}
