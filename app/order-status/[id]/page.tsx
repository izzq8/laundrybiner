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
  weight?: number
  created_at: string
  service_types?: {
    name: string
    type: string
    price: number
    description: string
  }
  order_items?: Array<{
    id: string
    quantity: number
    total_price: number
    item_name: string
    item_types?: {
      name: string
      price: number
      category: string
    }
  }>
}

export default function OrderStatusPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchOrderStatus(params.id as string)
    }
  }, [params.id])

  const fetchOrderStatus = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setOrder(data.data)
        } else {
          setError('Pesanan tidak ditemukan')
        }
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
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Menunggu</Badge>
      case 'confirmed':
        return <Badge variant="default">Dikonfirmasi</Badge>
      case 'picked_up':
        return <Badge variant="default">Dijemput</Badge>
      case 'in_process':
        return <Badge variant="default">Diproses</Badge>
      case 'ready':
        return <Badge variant="default">Siap</Badge>
      case 'delivered':
        return <Badge variant="default">Selesai</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Dibatalkan</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Menunggu</Badge>
      case 'paid':
        return <Badge variant="default">Lunas</Badge>
      case 'failed':
        return <Badge variant="destructive">Gagal</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Dibatalkan</Badge>
      case 'expired':
        return <Badge variant="destructive">Kadaluarsa</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'picked_up':
      case 'in_process':
      case 'ready':
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />
      case 'cancelled':
        return <Clock className="h-6 w-6 text-red-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Clock className="h-8 w-8 text-gray-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Memuat status pesanan...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Pesanan Tidak Ditemukan</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => window.history.back()}>
                  Kembali
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{order.order_number}</h1>
                <p className="text-gray-600 mt-1">
                  Dibuat pada {new Date(order.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <div className="text-right">
                  {getStatusBadge(order.status)}
                  <div className="mt-1">
                    {getPaymentStatusBadge(order.payment_status)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Detail Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Layanan</h3>
                  <p className="text-lg">{order.service_types?.name || 'N/A'}</p>
                  {order.service_types?.description && (
                    <p className="text-sm text-gray-600">{order.service_types.description}</p>
                  )}
                </div>

                {order.weight && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Berat Cucian</h3>
                    <p className="text-lg">{order.weight} kg</p>
                  </div>
                )}

                {order.order_items && order.order_items.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Item Detail</h3>
                    <div className="space-y-2">
                      {order.order_items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.item_types?.name || item.item_name} x{item.quantity}</span>
                          <span>Rp {item.total_price?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-green-600">Rp {order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer & Pickup Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Kontak & Penjemputan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
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

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Jadwal Penjemputan</p>
                      <p className="font-medium">
                        {new Date(order.pickup_date).toLocaleDateString('id-ID')}
                        {order.pickup_time && ` • ${order.pickup_time}`}
                      </p>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="flex items-start space-x-3">
                      <Package className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Catatan</p>
                        <p className="font-medium">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Timeline */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${['pending', 'confirmed', 'picked_up', 'in_process', 'ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <p className="mt-2">Pesanan Dibuat</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${['confirmed', 'picked_up', 'in_process', 'ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <p className="mt-2">Dikonfirmasi</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${['picked_up', 'in_process', 'ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <p className="mt-2">Dijemput</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${['in_process', 'ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <p className="mt-2">Diproses</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${['ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <p className="mt-2">Siap</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <p className="mt-2">Selesai</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
