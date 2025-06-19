"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Plus, Package, Clock, CheckCircle, Truck, History, User, Bell, RefreshCw, Eye } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  pickup_date: string;
  pickup_time: string;
  customer_name: string;
  customer_phone: string;
  pickup_address: string;
  created_at: string;
  service_type?: string;
  weight?: number;
  pickup_option?: string;
  delivery_option?: string;
  delivery_address?: string;
  delivery_date?: string;
  delivery_time?: string;
  service_types?: {
    name: string;
    type: string;
  };
}

export default function DashboardPage() {
  const { user, getAuthToken } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch recent orders (latest 3 orders)
  const fetchRecentOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get auth token
      const headers: HeadersInit = {
        'Cache-Control': 'no-cache'
      }
      
      try {
        const authToken = await getAuthToken()
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`
        }
      } catch (authError) {
        console.log('Could not get auth token:', authError)
      }
      
      const response = await fetch('/api/orders?limit=3', {
        method: 'GET',
        headers
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.orders) {
        setOrders(data.orders)
      } else {
        console.warn('No orders found or API returned false success')
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchRecentOrders()
  }, [])

  const getStatusBadge = (status: string, order?: Order) => {
    const hasPickup = order?.pickup_option === 'pickup'
    const hasDelivery = order?.delivery_option === 'delivery'
    
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
      completed: { 
        label: 'Selesai', 
        variant: 'default' as const, 
        color: 'bg-green-500 text-white' 
      },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      pending_cancellation: { label: 'Menunggu Pembatalan', variant: 'secondary' as const, color: 'bg-orange-100 text-orange-800' },
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

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "Menunggu pickup":
        return <Clock className="w-4 h-4" />
      case "confirmed":
      case "Dikonfirmasi":
        return <CheckCircle className="w-4 h-4" />
      case "picked_up":
      case "in_process":
      case "Sedang diproses":
        return <Package className="w-4 h-4" />
      case "ready":
      case "delivered":
      case "Dalam pengiriman":
        return <Truck className="w-4 h-4" />
      case "completed":
      case "Selesai":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0F4C75] rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0F4C75]">LaundryBiner</h1>
                <p className="text-xs text-gray-600">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" disabled>
                <Bell className="w-4 h-4" />
              </Button>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang!</h2>
          <p className="text-gray-600">Kelola pesanan laundry Anda dengan mudah</p>
        </div>        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/order">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-[#0F4C75]/20 hover:border-[#0F4C75]/40">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#0F4C75] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Buat Order Baru</h3>
                <p className="text-sm text-gray-600">Mulai pesanan laundry baru</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-blue-600" />                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Pesanan Saya</h3>
                <p className="text-sm text-gray-600">Status & riwayat pesanan</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Profil</h3>
                <p className="text-sm text-gray-600">Kelola akun Anda</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pesanan Terbaru</CardTitle>
                <CardDescription>Daftar pesanan laundry Anda</CardDescription>
              </div>
              <Link href="/orders">
                <Button variant="outline" size="sm">
                  Lihat Semua
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                        {getStatusIcon(order.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{order.order_number}</h4>
                        <p className="text-sm text-gray-600 truncate">{order.service_types?.name || 'Layanan Laundry'}</p>
                        <p className="text-xs text-gray-500">
                          Pickup: {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString('id-ID') : 'TBD'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex flex-col sm:text-right">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className={getStatusBadge(order.status, order).color} variant="secondary">
                            {getStatusBadge(order.status, order).label}
                          </Badge>
                          <Badge className={getPaymentStatusBadge(order.payment_status).color} variant="secondary">
                            {getPaymentStatusBadge(order.payment_status).label}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          Rp {order.total_amount?.toLocaleString("id-ID") || '0'}
                        </p>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewOrder(order.id)}
                        className="flex items-center gap-2 self-stretch sm:self-auto"
                      >
                        <Eye className="h-4 w-4" />
                        Detail
                      </Button>
                    </div>
                  </div>
                ))}
              </div>            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-[#0F4C75] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat pesanan...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gagal memuat pesanan</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={fetchRecentOrders} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada pesanan</h3>
                <p className="text-gray-600 mb-6">Mulai pesanan laundry pertama Anda sekarang</p>
                <Link href="/order">
                  <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white">
                    <Plus className="w-4 h-4 mr-2 text-white" />
                    <span className="text-white">Buat Order Baru</span>
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden">
        <div className="grid grid-cols-3 gap-1">
          <Link href="/dashboard" className="flex flex-col items-center py-3 text-[#0F4C75]">
            <Package className="w-5 h-5 mb-1" />
            <span className="text-xs">Home</span>          </Link>
          <Link href="/orders" className="flex flex-col items-center py-3 text-gray-600">
            <History className="w-5 h-5 mb-1" />
            <span className="text-xs">Pesanan</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center py-3 text-gray-600">
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
