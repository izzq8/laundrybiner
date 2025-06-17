"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, Package, Truck, CheckCircle, XCircle, Eye } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  pickup_date: string
  delivery_date: string | null
  created_at: string
  items: {
    service_type: string
    item_type: string
    quantity: number
    price: number
  }[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching orders data
    const fetchOrders = async () => {
      try {
        // Mock data for demonstration
        const mockOrders: Order[] = [
          {
            id: "1",
            order_number: "LB-2024-001",
            status: "completed",
            total_amount: 25000,
            pickup_date: "2024-01-15",
            delivery_date: "2024-01-17",
            created_at: "2024-01-15T10:00:00Z",
            items: [
              {
                service_type: "Cuci Kering",
                item_type: "Kemeja",
                quantity: 3,
                price: 15000,
              },
              {
                service_type: "Cuci Setrika",
                item_type: "Celana",
                quantity: 2,
                price: 10000,
              },
            ],
          },
          {
            id: "2",
            order_number: "LB-2024-002",
            status: "in_progress",
            total_amount: 35000,
            pickup_date: "2024-01-20",
            delivery_date: null,
            created_at: "2024-01-20T14:30:00Z",
            items: [
              {
                service_type: "Dry Clean",
                item_type: "Jas",
                quantity: 1,
                price: 35000,
              },
            ],
          },
          {
            id: "3",
            order_number: "LB-2024-003",
            status: "pending",
            total_amount: 18000,
            pickup_date: "2024-01-22",
            delivery_date: null,
            created_at: "2024-01-22T09:15:00Z",
            items: [
              {
                service_type: "Cuci Setrika",
                item_type: "Kaos",
                quantity: 6,
                price: 18000,
              },
            ],
          },
        ]

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setOrders(mockOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "in_progress":
        return <Package className="w-4 h-4" />
      case "ready":
        return <Truck className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "ready":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu Pickup"
      case "in_progress":
        return "Sedang Diproses"
      case "ready":
        return "Siap Diantar"
      case "completed":
        return "Selesai"
      case "cancelled":
        return "Dibatalkan"
      default:
        return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Pesanan</h1>
          <p className="text-gray-600">Lihat semua pesanan laundry Anda</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Pesanan</h3>
              <p className="text-gray-600 mb-6">Anda belum memiliki riwayat pesanan laundry</p>
              <Link href="/order/create">
                <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white">Buat Pesanan Pertama</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">{order.order_number}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Dibuat pada {formatDate(order.created_at)}</p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Detail Pesanan</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.item_type} ({item.service_type})
                            </span>
                            <span className="font-medium">{formatCurrency(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Jadwal</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pickup:</span>
                          <span>{formatDate(order.pickup_date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery:</span>
                          <span>{order.delivery_date ? formatDate(order.delivery_date) : "Belum dijadwalkan"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-semibold text-gray-900">
                        Total: {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Lihat Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/order/create">
            <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white">Buat Pesanan Baru</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
