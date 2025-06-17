"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, Clock, MapPin, Phone } from "lucide-react"

export default function OrderSuccessPage() {
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    // Simulate order data
    setOrderData({
      order_id: `ORD-${Date.now()}`,
      status: "confirmed",
      pickup_date: "2024-01-20",
      pickup_time: "10:00-12:00",
      address: "Jl. Sudirman No. 123, Jakarta Pusat",
      contact_phone: "081234567890",
      service_type: "kiloan",
      weight: 3,
      total_price: 24000,
      estimated_completion: "2024-01-22",
    })
  }, [])

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0F4C75] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pesanan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesanan Berhasil!</h1>
          <p className="text-gray-600">Pembayaran telah dikonfirmasi dan pesanan Anda sedang diproses</p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detail Pesanan</CardTitle>
            <CardDescription>Order ID: {orderData.order_id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Package className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Layanan</p>
                    <p className="text-sm text-gray-600 capitalize">{orderData.service_type}</p>
                    {orderData.weight && <p className="text-xs text-gray-500">{orderData.weight} kg</p>}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Alamat Pickup</p>
                    <p className="text-sm text-gray-600">{orderData.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Jadwal Pickup</p>
                    <p className="text-sm text-gray-600">
                      {orderData.pickup_date} ({orderData.pickup_time})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Kontak</p>
                    <p className="text-sm text-gray-600">{orderData.contact_phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="font-semibold">Total Dibayar:</span>
              <span className="text-lg font-bold text-[#0F4C75]">
                Rp {orderData.total_price.toLocaleString("id-ID")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/orders">
            <Button className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white">Lacak Pesanan</Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Kembali ke Dashboard
            </Button>
          </Link>

          <Link href="/order/create">
            <Button variant="ghost" className="w-full">
              Buat Pesanan Baru
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
