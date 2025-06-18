"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function PaymentUnfinishPage() {
  const router = useRouter()

  const handleBackToOrder = () => {
    router.push('/order')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Pembayaran Dibatalkan
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            Anda telah membatalkan proses pembayaran. Pesanan Anda belum selesai.
          </p>

          <div className="bg-yellow-50 p-4 rounded-lg text-left">
            <p className="text-sm text-yellow-700">
              <strong>Catatan:</strong> Jika Anda mengalami masalah dengan pembayaran, 
              silakan hubungi customer service kami atau coba metode pembayaran lain.
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={handleBackToOrder} className="w-full">
              Kembali ke Pesanan
            </Button>
            <Button variant="outline" onClick={handleBackToHome} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
