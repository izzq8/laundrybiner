"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Plus, Package, Clock, CheckCircle, Truck, History, User, Bell } from "lucide-react"

export default function DashboardPage() {
  const [orders] = useState([])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Menunggu pickup":
        return <Clock className="w-4 h-4" />
      case "Sedang diproses":
        return <Package className="w-4 h-4" />
      case "Dalam pengiriman":
        return <Truck className="w-4 h-4" />
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
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/order/create">
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
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Status Order</h3>
                <p className="text-sm text-gray-600">Lacak pesanan aktif</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <History className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Riwayat</h3>
                <p className="text-sm text-gray-600">Lihat pesanan sebelumnya</p>
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
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 ${order.status_color} rounded-lg flex items-center justify-center text-white`}
                      >
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{order.id}</h4>
                        <p className="text-sm text-gray-600">{order.items}</p>
                        <p className="text-xs text-gray-500">Pickup: {order.pickup_date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2">
                        {order.status}
                      </Badge>
                      <p className="text-sm font-semibold text-gray-900">Rp {order.total.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada pesanan</h3>
                <p className="text-gray-600 mb-6">Mulai pesanan laundry pertama Anda sekarang</p>
                <Link href="/order/create">
                  <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Order Baru
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden">
        <div className="grid grid-cols-4 gap-1">
          <Link href="/dashboard" className="flex flex-col items-center py-3 text-[#0F4C75]">
            <Package className="w-5 h-5 mb-1" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center py-3 text-gray-600">
            <Clock className="w-5 h-5 mb-1" />
            <span className="text-xs">Status</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center py-3 text-gray-600">
            <History className="w-5 h-5 mb-1" />
            <span className="text-xs">Riwayat</span>
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
