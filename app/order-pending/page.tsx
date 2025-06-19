"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Package, RefreshCw } from "lucide-react"

interface OrderDetails {
  id: string
  order_number: string
  status: string
  payment_status: string
  service_type: string
  total_amount: number
  pickup_date: string
  pickup_time: string
  contact_name: string
  contact_phone: string
  created_at: string
}

export default function OrderPendingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    } else {
      setError("Order ID not found")
      setLoading(false)
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      const result = await response.json()
      
      if (result.success) {
        setOrder(result.data)
        
        // If payment is now successful, redirect to success page
        if (result.data.payment_status === 'paid') {
          router.push(`/order-success?order_id=${orderId}`)
          return
        }
      } else {
        setError(result.message || "Failed to fetch order details")
      }
    } catch (err) {
      console.error("Error fetching order:", err)
      setError("Failed to fetch order details")
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  const checkPaymentStatus = async () => {
    setChecking(true)
    await fetchOrderDetails()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Pending Header */}
          <Card className="mb-6">
            <CardContent className="text-center py-8">
              <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Pending</h1>
              <p className="text-gray-600 mb-4">
                Your payment is being processed. Please wait or check your payment method.
              </p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Order #{order.order_number}
              </Badge>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="font-medium capitalize">{order.service_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium text-lg">Rp {order.total_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant="secondary">
                    {order.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <Badge variant="outline" className="border-orange-500 text-orange-600">
                    {order.payment_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 font-medium mb-2">⏳ Payment Pending</p>
                  <p className="text-orange-700 text-sm">
                    Your payment is currently being processed. This usually takes a few minutes.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">What you can do:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Check your banking app or e-wallet for payment confirmation</li>
                    <li>Wait for payment processing to complete (usually 1-5 minutes)</li>
                    <li>Click "Check Payment Status" below to refresh</li>
                    <li>Contact our support if payment doesn't complete in 15 minutes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={checkPaymentStatus}
              disabled={checking}
              className="flex-1"
            >
              {checking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Payment Status
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push('/contact')}
              className="flex-1"
            >
              Contact Support
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Button 
              variant="ghost"
              onClick={() => router.push('/')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
