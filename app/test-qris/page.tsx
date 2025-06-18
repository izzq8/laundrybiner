"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CreditCard } from "lucide-react"

export default function TestQRISPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [qrisResult, setQrisResult] = useState<any>(null)
  const [snapLoaded, setSnapLoaded] = useState(false)

  // Load Snap JS SDK
  useEffect(() => {
    if (!document.getElementById("midtrans-snap")) {
      const script = document.createElement("script")
      script.src = "https://app.sandbox.midtrans.com/snap/snap.js"
      script.id = "midtrans-snap"
      script.setAttribute("data-client-key", "SB-Mid-client-mNdxM5MY-ItvKEFT")
      script.onload = () => setSnapLoaded(true)
      script.onerror = () => setError("Failed to load Midtrans Snap script")
      document.body.appendChild(script)
    } else {
      setSnapLoaded(true)
    }
  }, [])
  const testQRISPayment = async () => {
    if (!snapLoaded || !window.snap) {
      setError("Midtrans Snap belum dimuat. Silakan refresh halaman.")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      const testOrder = {
        order_id: `QRIS-TEST-${Date.now()}`,
        amount: 25000,
        customer_details: {
          first_name: "QRIS Test",
          phone: "08123456789",
          email: "test@qris.com",
          billing_address: {
            address: "Jakarta",
            city: "Jakarta",
            postal_code: "12345",
            country_code: "IDN",
          },
        },
        item_details: [
          {
            id: "qris-test-item",
            price: 25000,
            quantity: 1,
            name: "Test QRIS Payment",
          },
        ],
      }

      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testOrder),
      })

      const result = await response.json()
      console.log("QRIS Test Response:", result)

      if (result.success && result.token) {
        setQrisResult(result)
        
        // Open Snap with focus on QRIS
        if (window.snap) {
          window.snap.pay(result.token, {
            onSuccess: function(result: any) {
              console.log("QRIS Payment success:", result)
              alert("Pembayaran QRIS berhasil!")
            },
            onPending: function(result: any) {
              console.log("QRIS Payment pending:", result)
              alert("Pembayaran QRIS pending, silakan cek status transaksi")
            },
            onError: function(result: any) {
              console.log("QRIS Payment error:", result)
              setError("QRIS Payment gagal: " + JSON.stringify(result))
            },
            onClose: function() {
              console.log("QRIS Payment popup closed")
            },
          })
        }
      } else {
        setError(result.message || "Gagal membuat QRIS payment")
      }
    } catch (err) {
      console.error("QRIS Test Error:", err)
      setError("Error testing QRIS: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Test QRIS Payment
            </CardTitle>
            <CardDescription>
              Test khusus untuk pembayaran QRIS dengan Midtrans Sandbox
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Instructions */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Petunjuk Test QRIS:</strong>
                <br />1. Klik "Test QRIS Payment" untuk membuka Snap
                <br />2. Pilih "QRIS" di popup Midtrans
                <br />3. Gunakan QR Code Scanner atau simulasi
                <br />4. Untuk simulasi, gunakan URL: <strong>https://simulator.sandbox.midtrans.com/qris</strong>
              </AlertDescription>
            </Alert>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Test Result */}
            {qrisResult && (
              <Card className="bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">QRIS Token Generated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><strong>Token:</strong> {qrisResult.token}</div>
                    <div><strong>Transaction ID:</strong> {qrisResult.transaction_id}</div>
                    {qrisResult.payment_url && (
                      <div><strong>Payment URL:</strong> 
                        <a href={qrisResult.payment_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                          {qrisResult.payment_url}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Button */}
            <Button
              onClick={testQRISPayment}
              className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90"
              disabled={loading}
            >
              {loading ? "Testing QRIS..." : "Test QRIS Payment"}
            </Button>

            {/* Simulator Links */}
            <div className="space-y-2">
              <h3 className="font-semibold">Link Simulator QRIS:</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>QRIS Simulator:</strong>{" "}
                  <a 
                    href="https://simulator.sandbox.midtrans.com/qris" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://simulator.sandbox.midtrans.com/qris
                  </a>
                </div>
                <div>
                  <strong>General Simulator:</strong>{" "}
                  <a 
                    href="https://simulator.sandbox.midtrans.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://simulator.sandbox.midtrans.com
                  </a>
                </div>
              </div>
            </div>

            {/* Debug Info */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm">Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <div><strong>Environment:</strong> Sandbox</div>
                  <div><strong>Client Key:</strong> SB-Mid-client-mNdxM5MY-ItvKEFT</div>
                  <div><strong>Snap URL:</strong> https://app.sandbox.midtrans.com/snap/snap.js</div>
                  <div><strong>API Endpoint:</strong> https://app.sandbox.midtrans.com/snap/v1/transactions</div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
