"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PaymentStatusUpdatePage() {
  const router = useRouter()
  const [orderId, setOrderId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpdateStatus = async () => {
    if (!orderId.trim()) {
      setError("Masukkan Order ID")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/payment/manual-status-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: orderId.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.message || 'Gagal memperbarui status')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memperbarui status')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Update Status Pembayaran</h1>
            <p className="text-sm text-gray-600">
              Tool untuk memperbarui status pembayaran secara manual (Development Only)
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Manual Payment Status Update
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                placeholder="Masukkan Order ID (UUID)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Contoh: 63fca420-dc4a-44bf-a1e9-ab931945a0b8
              </p>
            </div>

            <Button
              onClick={handleUpdateStatus}
              disabled={loading || !orderId.trim()}
              className="w-full"
            >
              {loading ? 'Memproses...' : 'Update Status Pembayaran'}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Status berhasil diperbarui!</strong></p>
                    <p>Order Status: <span className="font-mono">{result.order?.status}</span></p>
                    <p>Payment Status: <span className="font-mono">{result.order?.payment_status}</span></p>
                    <p>Midtrans Transaction Status: <span className="font-mono">{result.midtrans_status?.transaction_status}</span></p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-gray-500 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold mb-2">Catatan Penggunaan:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Tool ini digunakan untuk development ketika webhook Midtrans tidak bisa mengakses localhost</li>
                <li>Sistem akan mencari transaksi Midtrans berdasarkan pola order ID yang umum digunakan</li>
                <li>Status akan diperbarui berdasarkan response dari Midtrans API</li>
                <li>Pada production, webhook seharusnya berfungsi normal</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
