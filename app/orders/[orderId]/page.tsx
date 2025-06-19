"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Phone, User, Package, CheckCircle, Truck, ArrowLeft, Receipt, CreditCard, Timer } from "lucide-react"
import { CountdownTimer, useCanMakePayment } from "@/components/countdown-timer"
import { useAutoPaymentCheck } from '@/hooks/useAutoPaymentCheck'

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  total_amount: number
  pickup_date: string
  pickup_time: string
  customer_name: string
  customer_phone: string
  pickup_address: string
  notes?: string
  weight?: number
  created_at: string
  service_type?: string
  pickup_option?: string
  delivery_option?: string
  delivery_address?: string
  delivery_date?: string
  delivery_time?: string
  service_types?: {
    name: string
    type: string
    price: number
    description: string
  }
}

export default function OrderDetailPage() {  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  // Use the hook to determine if payment can be made
  const canMakePayment = useCanMakePayment(
    order?.created_at || '', 
    order?.payment_status || '', 
    order?.status || ''
  )

  // Add auto payment check hook
  const { isChecking, lastChecked, checkNow } = useAutoPaymentCheck({
    orderId: order?.id || '',
    paymentStatus: order?.payment_status || 'pending',
    orderStatus: order?.status || 'pending',
    enabled: !!order && order.payment_status === 'pending',
    intervalMs: 30000, // Check every 30 seconds
    onStatusUpdate: async (newStatus) => {
      console.log(`🔄 Payment status updated to: ${newStatus}`)
      // Refresh order data when payment status changes
      if (order?.id) {
        await fetchOrderDetail(order.id)
      }
    },
  })

  useEffect(() => {
    if (params.orderId) {
      fetchOrderDetail(params.orderId as string)
    }  }, [params.orderId])

  const fetchOrderDetail = async (orderId: string) => {
    try {
      console.log('Fetching order detail for ID:', orderId)
      const response = await fetch(`/api/orders/${orderId}`)
      console.log('Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Response data:', data)
        if (data.success) {
          setOrder(data.data)
        } else {
          console.error('API returned error:', data.message)
          setError(data.message || 'Pesanan tidak ditemukan')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('HTTP error:', response.status, errorData)
        setError('Pesanan tidak ditemukan')
      }
    } catch (error) {
      console.error('Error fetching order detail:', error)
      setError('Gagal memuat detail pesanan')
    } finally {
      setLoading(false)
    }
  }
  const handlePayment = async () => {
    if (!order) return

    console.log('Starting payment process for order:', order.id)
    console.log('Order details:', {
      id: order.id,
      total_amount: order.total_amount,
      customer_name: order.customer_name,
      service_types: order.service_types
    })

    setRefreshing(true)
    try {      // Generate unique order_id by appending timestamp to avoid "order_id already taken" error
      const uniqueOrderId = `${order.order_number}-${Date.now()}`
      
      // Prepare detailed item details for better QRIS support
      const itemDetails = []
      
      // Base service cost
      const baseAmount = order.service_type === 'kiloan' 
        ? (order.weight || 1) * 8000 
        : order.total_amount - (order.pickup_option === 'pickup' ? 5000 : 0) - (order.delivery_option === 'delivery' ? 5000 : 0)
      
      itemDetails.push({
        id: `service-${order.service_types?.type || 'laundry'}`,
        name: `${order.service_types?.name || 'Layanan Laundry'}${order.service_type === 'kiloan' ? ` (${order.weight || 1} kg)` : ''}`,
        price: baseAmount,
        quantity: 1,
      })

      // Add pickup fee if applicable
      if (order.pickup_option === 'pickup') {
        itemDetails.push({
          id: 'pickup-fee',
          name: 'Biaya Pickup',
          price: 5000,
          quantity: 1,
        })
      }

      // Add delivery fee if applicable  
      if (order.delivery_option === 'delivery') {
        itemDetails.push({
          id: 'delivery-fee',
          name: 'Biaya Delivery',
          price: 5000,
          quantity: 1,
        })
      }
      
      const payloadData = {
        order_id: uniqueOrderId,
        amount: order.total_amount,
        customer_details: {
          first_name: order.customer_name,
          phone: order.customer_phone,
          email: `${order.customer_name.toLowerCase().replace(/\s+/g, '')}@laundrybiner.com`,
        },
        item_details: itemDetails,
      }

      console.log('Sending payload with unique order_id:', payloadData)

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadData),
      })

      const data = await response.json()
      
      console.log('Payment API response status:', response.status)
      console.log('Payment API response data:', data)
      
      if (data.success && data.payment_url) {
        // Update order with midtrans order ID before redirecting
        try {
          await fetch(`/api/orders/update-payment-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: order.id,
              midtransOrderId: uniqueOrderId,
            }),
          })
        } catch (error) {
          console.error('Failed to update order with midtrans order ID:', error)
        }
        
        console.log('Redirecting to payment URL:', data.payment_url)
        // Redirect to Midtrans payment page
        window.location.href = data.payment_url
      } else {
        console.error('Payment creation failed:', data)
        alert('Gagal membuat pembayaran: ' + (data.message || 'Unknown error'))
      }} catch (error) {
      console.error('Payment error:', error)
      alert('Gagal membuat pembayaran')
    } finally {
      setRefreshing(false)
    }
  }
    const refreshPaymentStatus = async () => {
    if (!order) return
    
    setRefreshing(true)
    try {
      // Call manual status update endpoint
      const response = await fetch('/api/payment/manual-status-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id }),
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('Payment status updated:', data)
        // Refresh order data
        await fetchOrderDetail(order.id)
        alert('Status pembayaran berhasil diperbarui!')
      } else {
        console.error('Failed to update payment status:', data.message)
        alert('Gagal memperbarui status: ' + data.message)
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Gagal memperbarui status pembayaran')
    } finally {
      setRefreshing(false)
    }
  }
  const getStatusBadge = (status: string) => {
    if (!order) return { label: status, variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' }
    
    const hasPickup = order.pickup_option === 'pickup'
    const hasDelivery = order.delivery_option === 'delivery'
    
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Dikonfirmasi', variant: 'default' as const, color: 'bg-[#0F4C75] text-white' },
      picked_up: { 
        label: hasPickup ? 'Dijemput' : 'Diterima', 
        variant: 'default' as const, 
        color: 'bg-blue-100 text-blue-800' 
      },
      in_process: { label: 'Diproses', variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      ready: { 
        label: hasDelivery ? 'Siap Diantar' : 'Siap Diambil', 
        variant: 'default' as const, 
        color: 'bg-green-100 text-green-800' 
      },
      delivered: { 
        label: hasDelivery ? 'Diantar' : 'Diambil', 
        variant: 'default' as const, 
        color: 'bg-green-500 text-white' 
      },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' }
    return config
  }

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Lunas', variant: 'default' as const, color: 'bg-green-500 text-white' },
      settlement: { label: 'Lunas', variant: 'default' as const, color: 'bg-green-500 text-white' },
      failed: { label: 'Gagal', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      expired: { label: 'Kedaluwarsa', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[paymentStatus as keyof typeof statusConfig] || { label: paymentStatus, variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' }
    return config
  }
  const getOrderSteps = () => {
    if (!order) return []

    // Dynamic steps based on pickup/delivery options
    const hasPickup = order.pickup_option === 'pickup'
    const hasDelivery = order.delivery_option === 'delivery'

    let steps = [
      { key: 'pending', label: 'Pesanan Dibuat', icon: Package, description: 'Pesanan telah dibuat dan menunggu konfirmasi' },
      { key: 'confirmed', label: 'Pesanan Dikonfirmasi', icon: CheckCircle, description: 'Pesanan dikonfirmasi dan siap diproses' },
    ]

    // Add pickup step if pickup is selected
    if (hasPickup) {
      steps.push({ 
        key: 'picked_up', 
        label: 'Dijemput', 
        icon: Truck, 
        description: 'Cucian telah dijemput dari alamat Anda' 
      })
    } else {
      steps.push({ 
        key: 'picked_up', 
        label: 'Diterima', 
        icon: Package, 
        description: 'Cucian telah diterima di tempat kami' 
      })
    }

    steps.push({ 
      key: 'in_process', 
      label: 'Sedang Diproses', 
      icon: Package, 
      description: 'Cucian sedang dalam proses pencucian' 
    })

    // Add delivery/ready step based on delivery option
    if (hasDelivery) {
      steps.push({ 
        key: 'ready', 
        label: 'Siap Diantar', 
        icon: CheckCircle, 
        description: 'Cucian sudah selesai dan siap diantar' 
      })
      steps.push({ 
        key: 'delivered', 
        label: 'Diantar', 
        icon: Truck, 
        description: 'Cucian telah diantar ke alamat Anda' 
      })
    } else {
      steps.push({ 
        key: 'ready', 
        label: 'Siap Diambil', 
        icon: CheckCircle, 
        description: 'Cucian sudah selesai dan siap diambil' 
      })
      steps.push({ 
        key: 'delivered', 
        label: 'Diambil', 
        icon: CheckCircle, 
        description: 'Cucian telah diambil' 
      })
    }

    const currentStatusIndex = steps.findIndex(step => step.key === order?.status)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStatusIndex,
      active: index === currentStatusIndex
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F4C75] mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail pesanan...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pesanan Tidak Ditemukan
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'Pesanan yang Anda cari tidak ditemukan.'}
            </p>
            <Button onClick={() => router.push('/orders')}>
              Kembali ke Pesanan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/orders')}
                  className="mr-3 p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan</h1>
                  <p className="text-sm text-gray-600">#{order?.order_number}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">                {/* Payment Countdown - Show only for pending payments */}
                {order.payment_status === 'pending' && (
                  <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                            <Timer className="h-6 w-6 text-amber-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-amber-900 mb-1">
                            Waktu Pembayaran Tersisa
                          </h3>
                          <p className="text-sm text-amber-700">
                            Selesaikan pembayaran sebelum pesanan kedaluwarsa (24 jam dari pembuatan pesanan)
                          </p>
                        </div>                        <div className="text-right">                          <div className="text-3xl font-bold text-amber-900 font-mono bg-white px-4 py-2 rounded-lg shadow-sm border border-amber-200">
                            <CountdownTimer 
                              createdAt={order.created_at} 
                              showIcon={false} 
                              fontSize="large"
                              compact={true}
                            />
                          </div>
                          <p className="text-xs text-amber-600 mt-1 text-center">JAM:MENIT:DETIK</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-amber-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-amber-700">
                            Pesanan dibuat: {new Date(order.created_at).toLocaleString('id-ID')}
                          </span>
                          <span className="text-amber-700 font-medium">
                            Batas waktu: {new Date(new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </CardContent>                  </Card>
                )}

                {/* Payment status will be handled by the countdown timer component */}
                {order.payment_status === 'pending' && !canMakePayment && (
                  <CountdownTimer 
                    createdAt={order.created_at} 
                    showExpiredAction={true}
                  />
                )}

                {/* Order Progress */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Package className="h-5 w-5" />
                      Status Pesanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getOrderSteps().map((step, index) => {
                        const Icon = step.icon
                        return (
                          <div
                            key={step.key}
                            className={`flex items-start space-x-4 p-4 rounded-lg border ${
                              step.active
                                ? 'bg-[#0F4C75]/5 border-[#0F4C75]/20'
                                : step.completed
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                step.active
                                  ? 'bg-[#0F4C75] text-white'
                                  : step.completed
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <p
                                className={`font-medium ${
                                  step.active || step.completed ? 'text-gray-900' : 'text-gray-500'
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Service Details */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Receipt className="h-5 w-5" />
                      Detail Layanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {order.service_types?.name || 'Layanan Laundry'}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {order.service_types?.description || 'Layanan pencucian'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Tipe: {order.service_types?.type || 'Regular'}
                          </p>
                          {order.weight && (
                            <p className="text-sm text-gray-600">
                              Estimasi Berat: {order.weight} kg
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#0F4C75]">
                            Rp {order.total_amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Total</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <User className="h-5 w-5" />
                      Informasi Pelanggan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Nama Pelanggan</p>
                            <p className="font-medium">{order.customer_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Nomor Telepon</p>
                            <p className="font-medium">{order.customer_phone}</p>
                          </div>
                        </div>
                      </div>                      <div className="space-y-4">
                        {/* Pickup Information */}
                        {order.pickup_option === 'pickup' && (
                          <>
                            <div className="flex items-center space-x-3">
                              <Calendar className="h-5 w-5 text-green-500" />
                              <div>
                                <p className="text-sm text-gray-600">Tanggal Penjemputan</p>
                                <p className="font-medium">
                                  {new Date(order.pickup_date).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Clock className="h-5 w-5 text-green-500" />
                              <div>
                                <p className="text-sm text-gray-600">Waktu Penjemputan</p>
                                <p className="font-medium">{order.pickup_time}</p>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Delivery Information */}
                        {order.delivery_option === 'delivery' && (
                          <>
                            <div className="flex items-center space-x-3">
                              <Calendar className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="text-sm text-gray-600">Tanggal Pengantaran</p>
                                <p className="font-medium">
                                  {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  }) : 'Belum ditentukan'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Clock className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="text-sm text-gray-600">Waktu Pengantaran</p>
                                <p className="font-medium">{order.delivery_time || 'Belum ditentukan'}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="mt-6 pt-6 border-t">
                      {order.pickup_option === 'pickup' && (
                        <div className="flex items-start space-x-3 mb-4">
                          <MapPin className="h-5 w-5 text-green-500 mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Alamat Penjemputan</p>
                            <p className="font-medium">{order.pickup_address}</p>
                          </div>
                        </div>
                      )}

                      {order.delivery_option === 'delivery' && (
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Alamat Pengantaran</p>
                            <p className="font-medium">{order.delivery_address || 'Sama dengan alamat penjemputan'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {order.notes && (
                      <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-gray-600">Catatan Khusus</p>
                        <p className="font-medium mt-1 p-3 bg-gray-50 rounded-lg">{order.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4 border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <CreditCard className="h-5 w-5" />
                      Ringkasan Pembayaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Nomor Pesanan</span>
                        <span className="text-sm font-medium">{order.order_number}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status Pesanan</span>
                        <Badge className={getStatusBadge(order.status).color} variant="secondary">
                          {getStatusBadge(order.status).label}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status Pembayaran</span>
                        <Badge className={getPaymentStatusBadge(order.payment_status).color} variant="secondary">
                          {getPaymentStatusBadge(order.payment_status).label}
                        </Badge>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Biaya Layanan</span>
                          <span>Rp {order.total_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Biaya Admin</span>
                          <span>Rp 0</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                          <span>Total Pembayaran</span>
                          <span className="text-[#0F4C75]">Rp {order.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 pt-4 border-t">
                      <p className="mb-1">
                        <strong>Tanggal Pemesanan:</strong><br />
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>                    <div className="space-y-2 pt-4">
                      {/* Payment Button - Show only if payment is needed */}
                      {canMakePayment && (
                        <Button
                          onClick={handlePayment}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          disabled={refreshing}
                        >
                          {refreshing ? 'Memproses...' : 'Bayar Sekarang'}
                        </Button>
                      )}
                        {/* Refresh Payment Status Button - Always visible for development */}
                      <Button
                        onClick={refreshPaymentStatus}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        variant="outline"
                        disabled={refreshing || isChecking}
                      >
                        {refreshing ? 'Memperbarui...' : isChecking ? 'Auto-checking...' : 'Perbarui Status Pembayaran'}
                      </Button>
                      
                      {/* Auto-check status indicator */}
                      {order.payment_status === 'pending' && (
                        <div className="text-xs text-center text-gray-500 bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span>Auto-checking payment status...</span>
                          </div>
                          {lastChecked && (
                            <div className="mt-1">
                              Last checked: {lastChecked.toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Button
                        onClick={() => router.push('/orders')}
                        className="w-full"
                        variant="outline"
                      >
                        Kembali ke Daftar Pesanan
                      </Button>
                      <Button
                        onClick={() => router.push('/')}
                        className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white"
                      >
                        Beranda
                      </Button>
                    </div>                    {/* Refresh Payment Status Button */}
                    <div className="pt-4 border-t">
                      <Button
                        onClick={checkNow}
                        className="w-full"
                        variant="default"
                        disabled={refreshing || isChecking}
                      >
                        {refreshing ? 'Memperbarui...' : isChecking ? 'Checking...' : 'Cek Status Pembayaran Sekarang'}
                      </Button>
                      
                      {/* Auto-check status indicator */}
                      {order.payment_status === 'pending' && (
                        <div className="text-xs text-center text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span>Auto-checking every 30 seconds...</span>
                          </div>
                          {lastChecked && (
                            <div className="mt-1">
                              Last auto-check: {lastChecked.toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
