"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Phone, User, Package, Eye, ArrowLeft } from "lucide-react"

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
  created_at: string
  service_types?: {
    name: string
    type: string
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrders(data.data || [])
        } else {
          setError('Gagal memuat pesanan')
        }
      } else {
        setError('Gagal memuat pesanan')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const },
      confirmed: { label: 'Dikonfirmasi', variant: 'default' as const },
      picked_up: { label: 'Dijemput', variant: 'default' as const },
      in_process: { label: 'Diproses', variant: 'default' as const },
      ready: { label: 'Siap', variant: 'default' as const },
      delivered: { label: 'Diantar', variant: 'default' as const },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const },
    }
    
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }
  }

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const },
      paid: { label: 'Lunas', variant: 'default' as const },
      failed: { label: 'Gagal', variant: 'destructive' as const },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const },
      expired: { label: 'Kedaluwarsa', variant: 'destructive' as const },
    }
    
    return statusConfig[paymentStatus as keyof typeof statusConfig] || { label: paymentStatus, variant: 'secondary' as const }
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/order-status/${orderId}`)
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleNewOrder = () => {
    router.push('/order')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pesanan...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={handleBackToHome} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pesanan Saya</h1>
              <p className="text-gray-600 mt-2">Lihat semua pesanan laundry Anda</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBackToHome}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Beranda
              </Button>
              <Button onClick={handleNewOrder}>
                Buat Pesanan Baru
              </Button>
            </div>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Pesanan</h2>
                <p className="text-gray-600 mb-6">
                  Anda belum memiliki pesanan laundry. Buat pesanan pertama Anda sekarang!
                </p>
                <Button onClick={handleNewOrder}>
                  Buat Pesanan Baru
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{order.order_number}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          Rp {order.total_amount.toLocaleString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge {...getStatusBadge(order.status)}>
                            {getStatusBadge(order.status).label}
                          </Badge>
                          <Badge {...getPaymentStatusBadge(order.payment_status)}>
                            {getPaymentStatusBadge(order.payment_status).label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Package className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Layanan</p>
                            <p className="font-medium">{order.service_types?.name || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Nama Kontak</p>
                            <p className="font-medium">{order.customer_name}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Telepon</p>
                            <p className="font-medium">{order.customer_phone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Alamat Penjemputan</p>
                            <p className="font-medium text-sm">{order.pickup_address}</p>
                          </div>
                        </div>

                        {order.pickup_date && (
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Jadwal Penjemputan</p>
                              <p className="font-medium">
                                {new Date(order.pickup_date).toLocaleDateString('id-ID')}
                                {order.pickup_time && ` • ${order.pickup_time}`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        variant="outline"
                        onClick={() => handleViewOrder(order.id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Lihat Detail
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
