"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, AlertCircle, ArrowLeft } from "lucide-react"

export default function PaymentFinishPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading')
  const [orderData, setOrderData] = useState<any>(null)
  const [orderCreated, setOrderCreated] = useState(false)
  const [error, setError] = useState('')

  const createOrderAfterPayment = async () => {
    try {
      // Get pending order data from sessionStorage
      const pendingOrderData = sessionStorage.getItem('pendingOrder')
      
      if (!pendingOrderData) {
        throw new Error('No pending order data found')
      }

      const orderData = JSON.parse(pendingOrderData)

      // Create order in database
      const response = await fetch('/api/orders/create-after-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          paymentStatus: 'paid'
        }),
      })

      const result = await response.json()

      if (result.success) {
        setOrderCreated(true)
        setOrderData(result.order)
        // Clear pending order data
        sessionStorage.removeItem('pendingOrder')
      } else {
        throw new Error(result.message || 'Failed to create order')
      }

    } catch (error) {
      console.error('Error creating order after payment:', error)
      setError(error instanceof Error ? error.message : 'Failed to create order')
    }
  }

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Get transaction status from URL parameters
        const orderId = searchParams.get('order_id')
        const transactionStatus = searchParams.get('transaction_status')
        const statusCode = searchParams.get('status_code')
        
        console.log('Payment finish params:', { orderId, transactionStatus, statusCode })

        if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
          setStatus('success')
          // Create order after successful payment
          await createOrderAfterPayment()
        } else if (transactionStatus === 'pending') {
          setStatus('pending')
        } else {
          setStatus('failed')
          // Clear pending order data on failed payment
          sessionStorage.removeItem('pendingOrder')
        }

      } catch (error) {
        console.error('Error checking payment status:', error)
        setStatus('failed')
      }
    }

    checkPaymentStatus()
  }, [searchParams])

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="h-16 w-16 text-red-500" />
      default:
        return <Clock className="h-16 w-16 text-gray-500 animate-spin" />
    }
  }
  const getStatusTitle = () => {
    if (status === 'loading') {
      return 'Memproses Pembayaran...'
    }
    if (status === 'success') {
      if (orderCreated) {
        return 'Pembayaran Berhasil!'
      } else if (error) {
        return 'Pembayaran Berhasil, Pesanan Gagal Dibuat'
      } else {
        return 'Membuat Pesanan...'
      }
    }
    switch (status) {
      case 'pending':
        return 'Pembayaran Sedang Diproses'
      case 'failed':
        return 'Pembayaran Gagal'
      default:
        return 'Memproses Pembayaran...'
    }
  }

  const getStatusMessage = () => {
    if (status === 'loading') {
      return 'Mohon tunggu saat kami memproses pembayaran Anda...'
    }
    if (status === 'success') {
      if (orderCreated) {
        return 'Terima kasih! Pembayaran Anda telah berhasil dan pesanan laundry Anda telah dibuat. Kami akan segera memproses pesanan Anda.'
      } else if (error) {
        return `Pembayaran berhasil tetapi terjadi kesalahan saat membuat pesanan: ${error}. Silakan hubungi customer service.`
      } else {
        return 'Pembayaran berhasil! Sedang membuat pesanan Anda...'
      }
    }
    switch (status) {
      case 'pending':
        return 'Pembayaran Anda sedang diproses. Kami akan memberitahu Anda setelah pembayaran dikonfirmasi.'
      case 'failed':
        return 'Maaf, pembayaran Anda gagal diproses. Silakan coba lagi atau hubungi customer service.'
      default:
        return 'Mohon tunggu saat kami memproses pembayaran Anda...'
    }
  }
  const handleBackToHome = () => {
    router.push('/')
  }

  const handleViewOrder = () => {
    router.push('/orders')
  }

  const handleTryAgain = () => {
    router.push('/order')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <Clock className="h-16 w-16 text-gray-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Memproses Pembayaran...
            </h1>
            <p className="text-gray-600">
              Mohon tunggu while kami memproses pembayaran Anda...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">
            {getStatusTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            {getStatusMessage()}
          </p>          {orderData && (
            <div className="bg-gray-50 p-4 rounded-lg text-left space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3">Detail Pesanan:</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Nomor Order:</p>
                  <p className="font-medium">{orderData.order_number}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status:</p>
                  <Badge variant={orderData.status === 'confirmed' ? 'default' : 'secondary'}>
                    {orderData.status === 'confirmed' ? 'Dikonfirmasi' : 
                     orderData.status === 'pending' ? 'Menunggu' : orderData.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-600">Layanan:</p>
                  <p className="font-medium">{orderData.service_types?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Pembayaran:</p>
                  <p className="font-medium text-lg text-green-600">
                    Rp {orderData.total_amount?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Alamat Penjemputan:</h4>
                <p className="text-sm text-gray-600">{orderData.pickup_address}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Tanggal Penjemputan:</p>
                    <p className="font-medium">
                      {orderData.pickup_date ? new Date(orderData.pickup_date).toLocaleDateString('id-ID') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Waktu Penjemputan:</p>
                    <p className="font-medium">{orderData.pickup_time || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <Separator />              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Kontak:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Nama:</p>
                    <p className="font-medium">{orderData.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Telepon:</p>
                    <p className="font-medium">{orderData.customer_phone}</p>
                  </div>
                </div>
              </div>

              {orderData.service_types?.type === 'kiloan' && orderData.weight && (
                <>
                  <Separator />
                  <div>
                    <p className="text-gray-600">Berat Cucian:</p>
                    <p className="font-medium">{orderData.weight} kg</p>
                  </div>
                </>
              )}

              {orderData.order_items && orderData.order_items.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Item Detail:</h4>
                    {orderData.order_items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.item_types?.name || item.item_name} x{item.quantity}</span>
                        <span>Rp {item.total_price?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {orderData.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-gray-600">Catatan:</p>
                    <p className="text-sm text-gray-700">{orderData.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}          <div className="space-y-3">
            {status === 'success' && orderCreated && (
              <>
                <Button onClick={handleViewOrder} className="w-full">
                  Lihat Semua Pesanan
                </Button>
                <Button variant="outline" onClick={handleBackToHome} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </>
            )}

            {status === 'success' && !orderCreated && !error && (
              <>
                <Button disabled className="w-full">
                  Membuat Pesanan...
                </Button>
                <Button variant="outline" onClick={handleBackToHome} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </>
            )}

            {status === 'success' && error && (
              <>
                <Button variant="outline" onClick={handleBackToHome} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </>
            )}

            {status === 'pending' && (
              <>
                <Button variant="outline" onClick={handleBackToHome} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </>
            )}

            {status === 'failed' && (
              <>
                <Button onClick={handleTryAgain} className="w-full">
                  Coba Lagi
                </Button>
                <Button variant="outline" onClick={handleBackToHome} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
