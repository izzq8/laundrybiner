"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Phone, User, Package, CheckCircle, Truck } from "lucide-react"

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
  created_at: string
}

export default function OrderStatusPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.orderId) {
      fetchOrderStatus(params.orderId as string)
    }
  }, [params.orderId])

  const fetchOrderStatus = async (orderId: string) => {
    try {
      const response = await fetch(`/api/payment/status/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else {
        setError('Pesanan tidak ditemukan')
      }
    } catch (error) {
      console.error('Error fetching order status:', error)
      setError('Gagal memuat status pesanan')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="secondary">Menunggu</Badge>
      case 'confirmed':
        return <Badge variant="default">Dikonfirmasi</Badge>
      case 'picked_up':
        return <Badge variant="default">Dijemput</Badge>
      case 'in_progress':
        return <Badge variant="default">Sedang Diproses</Badge>
      case 'ready':
        return <Badge variant="default">Siap Antar</Badge>
      case 'delivered':
        return <Badge variant="default" className="bg-green-500">Selesai</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Dibatalkan</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="secondary">Menunggu Pembayaran</Badge>
      case 'paid':
      case 'settlement':
        return <Badge variant="default" className="bg-green-500">Lunas</Badge>
      case 'failed':
        return <Badge variant="destructive">Gagal</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Dibatalkan</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getOrderSteps = () => {
    const steps = [
      { key: 'pending', label: 'Pesanan Dibuat', icon: Package },
      { key: 'confirmed', label: 'Pesanan Dikonfirmasi', icon: CheckCircle },
      { key: 'picked_up', label: 'Dijemput', icon: Truck },
      { key: 'in_progress', label: 'Sedang Diproses', icon: Package },
      { key: 'ready', label: 'Siap Antar', icon: CheckCircle },
      { key: 'delivered', label: 'Selesai', icon: CheckCircle }
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
          <p className="text-gray-600">Memuat status pesanan...</p>
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
            <Button onClick={() => window.location.href = '/'}>
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Status Pesanan</h1>
            <p className="text-gray-600">Order #{order.order_number}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Progress */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Pesanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getOrderSteps().map((step, index) => {
                      const Icon = step.icon
                      return (
                        <div
                          key={step.key}
                          className={`flex items-center space-x-4 p-3 rounded-lg ${
                            step.active
                              ? 'bg-blue-50 border border-blue-200'
                              : step.completed
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200'
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
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detail Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Nama Kontak</p>
                        <p className="font-medium">{order.customer_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Telepon</p>
                        <p className="font-medium">{order.customer_phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Alamat Penjemputan</p>
                      <p className="font-medium">{order.pickup_address}</p>
                    </div>
                  </div>

                  {order.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Catatan</p>
                      <p className="font-medium">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status Pesanan</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status Pembayaran</span>
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>Rp {order.total_amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Pesanan dibuat: {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </div>

                  <Button
                    onClick={() => window.location.href = '/'}
                    className="w-full"
                    variant="outline"
                  >
                    Kembali ke Beranda
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
