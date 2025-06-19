"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Phone, User, Package, CheckCircle, Truck, ArrowLeft, Receipt, CreditCard } from "lucide-react"

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
  service_types?: {
    name: string
    type: string
    price: number
    description: string
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.orderId) {
      fetchOrderDetail(params.orderId as string)
    }
  }, [params.orderId])

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Dikonfirmasi', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      picked_up: { label: 'Dijemput', variant: 'default' as const, color: 'bg-purple-100 text-purple-800' },
      in_process: { label: 'Diproses', variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      ready: { label: 'Siap', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      delivered: { label: 'Diantar', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' }
    return config
  }

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Lunas', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      settlement: { label: 'Lunas', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      failed: { label: 'Gagal', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      expired: { label: 'Kedaluwarsa', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    }

    const config = statusConfig[paymentStatus as keyof typeof statusConfig] || { label: paymentStatus, variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' }
    return config
  }

  const getOrderSteps = () => {
    const steps = [
      { key: 'pending', label: 'Pesanan Dibuat', icon: Package, description: 'Pesanan telah dibuat dan menunggu konfirmasi' },
      { key: 'confirmed', label: 'Pesanan Dikonfirmasi', icon: CheckCircle, description: 'Pesanan dikonfirmasi dan siap dijemput' },
      { key: 'picked_up', label: 'Dijemput', icon: Truck, description: 'Cucian telah dijemput dari alamat Anda' },
      { key: 'in_process', label: 'Sedang Diproses', icon: Package, description: 'Cucian sedang dalam proses pencucian' },
      { key: 'ready', label: 'Siap Diantar', icon: CheckCircle, description: 'Cucian sudah selesai dan siap diantar' },
      { key: 'delivered', label: 'Selesai', icon: CheckCircle, description: 'Cucian telah diantar ke alamat Anda' }
    ]

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            <div className="flex items-center justify-between py-4">
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
                  <h1 className="text-xl font-semibold text-gray-900">Detail Pesanan</h1>
                  <p className="text-sm text-gray-600">#{order.order_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusBadge(order.status).color}>
                  {getStatusBadge(order.status).label}
                </Badge>
                <Badge className={getPaymentStatusBadge(order.payment_status).color}>
                  {getPaymentStatusBadge(order.payment_status).label}
                </Badge>
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
              <div className="lg:col-span-2 space-y-6">

                {/* Order Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
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
                                ? 'bg-blue-50 border-blue-200'
                                : step.completed
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                step.active
                                  ? 'bg-blue-500 text-white'
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
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
                          <p className="text-2xl font-bold text-green-600">
                            Rp {order.total_amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Total</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
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
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
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
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Waktu Penjemputan</p>
                            <p className="font-medium">{order.pickup_time}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Alamat Penjemputan</p>
                          <p className="font-medium">{order.pickup_address}</p>
                        </div>
                      </div>
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
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
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
                          <span className="text-green-600">Rp {order.total_amount.toLocaleString()}</span>
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
                    </div>

                    <div className="space-y-2 pt-4">
                      <Button
                        onClick={() => router.push('/orders')}
                        className="w-full"
                        variant="outline"
                      >
                        Kembali ke Daftar Pesanan
                      </Button>
                      <Button
                        onClick={() => router.push('/')}
                        className="w-full"
                      >
                        Beranda
                      </Button>
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
