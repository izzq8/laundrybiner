"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"

export default function PaymentErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const errorMessage = searchParams.get('message') || 'Terjadi kesalahan dalam proses pembayaran'

  const handleTryAgain = () => {
    router.push('/order')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleContactSupport = () => {
    router.push('/contact')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Pembayaran Gagal
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            Maaf, terjadi kesalahan dalam proses pembayaran Anda.
          </p>

          <div className="bg-red-50 p-4 rounded-lg text-left">
            <p className="text-sm text-red-700">
              <strong>Error:</strong> {errorMessage}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Solusi yang bisa dicoba:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Periksa koneksi internet Anda</li>
              <li>• Pastikan saldo atau limit kartu mencukupi</li>
              <li>• Coba gunakan metode pembayaran lain</li>
              <li>• Hubungi customer service jika masalah berlanjut</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button onClick={handleTryAgain} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>
            <Button variant="outline" onClick={handleContactSupport} className="w-full">
              Hubungi Customer Service
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
