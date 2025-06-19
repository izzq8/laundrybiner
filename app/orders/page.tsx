"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Package, Eye, ArrowLeft } from "lucide-react"

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
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

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
      pending: { label: 'Menunggu', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Dikonfirmasi', variant: 'default' as const, className: 'bg-[#0F4C75] text-white' },
      picked_up: { label: 'Dijemput', variant: 'default' as const, className: 'bg-blue-100 text-blue-800' },
      in_process: { label: 'Diproses', variant: 'default' as const, className: 'bg-orange-100 text-orange-800' },
      ready: { label: 'Siap', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      delivered: { label: 'Diantar', variant: 'default' as const, className: 'bg-green-500 text-white' },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
    }
    
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' }
  }
  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Lunas', variant: 'default' as const, className: 'bg-green-500 text-white' },
      settlement: { label: 'Lunas', variant: 'default' as const, className: 'bg-green-500 text-white' },
      failed: { label: 'Gagal', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      expired: { label: 'Kedaluwarsa', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
    }
    
    return statusConfig[paymentStatus as keyof typeof statusConfig] || { label: paymentStatus, variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' }
  }
  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  const handleBackToHome = () => {
    router.push('/')
  }
  const handleNewOrder = () => {
    router.push('/order')
  }
  // Filter orders based on active tab
  const getFilteredOrders = () => {
    if (activeTab === 'active') {
      return orders.filter(order => 
        order.status !== 'delivered' && 
        order.status !== 'cancelled' && 
        order.payment_status !== 'failed' &&
        order.payment_status !== 'expired'
      )
    } else {
      return orders.filter(order => 
        order.status === 'delivered' || 
        order.status === 'cancelled' ||
        order.payment_status === 'failed' ||
        order.payment_status === 'expired'
      )
    }
  }

  // Get counts for tabs
  const getActiveOrdersCount = () => {
    return orders.filter(order => 
      order.status !== 'delivered' && 
      order.status !== 'cancelled' && 
      order.payment_status !== 'failed' &&
      order.payment_status !== 'expired'
    ).length
  }

  const getHistoryOrdersCount = () => {
    return orders.filter(order => 
      order.status === 'delivered' || 
      order.status === 'cancelled' ||
      order.payment_status === 'failed' ||
      order.payment_status === 'expired'
    ).length
  }

  const filteredOrders = getFilteredOrders()

  if (loading) {    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F4C75] mx-auto mb-4"></div>
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
            <p className="text-gray-600 mb-6">{error}</p>            <Button onClick={handleBackToHome} className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center py-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToHome}
                className="mr-3 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'active'
                    ? 'border-[#0F4C75] text-[#0F4C75]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Status Order ({loading ? '...' : getActiveOrdersCount()})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-[#0F4C75] text-[#0F4C75]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Riwayat ({loading ? '...' : getHistoryOrdersCount()})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Orders Content */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-6">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    {activeTab === 'active' ? 'Belum ada pesanan aktif' : 'Belum ada riwayat pesanan'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {activeTab === 'active' 
                      ? 'Buat pesanan laundry baru sekarang' 
                      : 'Riwayat pesanan yang sudah selesai akan muncul di sini'
                    }
                  </p>
                </div>
                {activeTab === 'active' && (                  <Button 
                    onClick={handleNewOrder}
                    className="bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white px-6 py-2 rounded-lg"
                  >
                    Buat Order Baru
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow border-gray-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-gray-900">{order.order_number}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#0F4C75]">
                            Rp {order.total_amount.toLocaleString()}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getStatusBadge(order.status).className}>
                              {getStatusBadge(order.status).label}
                            </Badge>
                            <Badge className={getPaymentStatusBadge(order.payment_status).className}>
                              {getPaymentStatusBadge(order.payment_status).label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{order.service_types?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{order.customer_name}</span>
                          </div>
                          {order.pickup_date && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {new Date(order.pickup_date).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                          )}
                        </div>                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                          className="flex items-center gap-2 border-[#0F4C75] text-[#0F4C75] hover:bg-[#0F4C75] hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          Detail
                        </Button>
                      </div>
                    </CardContent>
                  </Card>                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
