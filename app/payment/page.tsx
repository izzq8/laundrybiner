"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CreditCard, Building2, Smartphone, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PaymentPage() {
  const [orderData, setOrderData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const pendingOrder = localStorage.getItem("pendingOrder")
    if (pendingOrder) {
      try {
        const parsed = JSON.parse(pendingOrder)
        setOrderData(parsed)
        console.log("Loaded order data:", parsed)
      } catch (err) {
        console.error("Error parsing order data:", err)
        router.push("/dashboard")
      }
    } else {
      router.push("/dashboard")
    }
  }, [router])

  const paymentCategories = {
    credit_card: {
      name: "Kartu Kredit/Debit",
      description: "Visa, Mastercard, JCB",
      icon: CreditCard,
      color: "text-blue-600",
      methods: [{ id: "credit_card", name: "Kartu Kredit/Debit", description: "Visa, Mastercard, JCB" }],
    },
    bank_transfer: {
      name: "Transfer Bank",
      description: "BCA, Mandiri, BNI, BRI",
      icon: Building2,
      color: "text-green-600",
      methods: [
        { id: "bca_va", name: "BCA Virtual Account", description: "Transfer melalui ATM/Mobile Banking BCA" },
        { id: "bni_va", name: "BNI Virtual Account", description: "Transfer melalui ATM/Mobile Banking BNI" },
        { id: "bri_va", name: "BRI Virtual Account", description: "Transfer melalui ATM/Mobile Banking BRI" },
        {
          id: "mandiri_va",
          name: "Mandiri Virtual Account",
          description: "Transfer melalui ATM/Mobile Banking Mandiri",
        },
        {
          id: "permata_va",
          name: "Permata Virtual Account",
          description: "Transfer melalui ATM/Mobile Banking Permata",
        },
      ],
    },
    ewallet: {
      name: "E-Wallet",
      description: "GoPay, ShopeePay, OVO",
      icon: Smartphone,
      color: "text-purple-600",
      methods: [
        { id: "gopay", name: "GoPay", description: "Bayar dengan saldo GoPay" },
        { id: "shopeepay", name: "ShopeePay", description: "Bayar dengan saldo ShopeePay" },
        { id: "ovo", name: "OVO", description: "Bayar dengan saldo OVO" },
        { id: "dana", name: "DANA", description: "Bayar dengan saldo DANA" },
        { id: "linkaja", name: "LinkAja", description: "Bayar dengan saldo LinkAja" },
        { id: "qris", name: "QRIS", description: "Scan QR Code untuk pembayaran" },
      ],
    },
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setSelectedMethod("")
    setError("")
  }

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
    setError("")
  }

  const handlePayment = async () => {
    if (!orderData || !selectedMethod) {
      setError("Silakan pilih metode pembayaran")
      return
    }

    setLoading(true)
    setPaymentStatus("processing")
    setError("")

    try {
      console.log("Starting payment process...")
      console.log("Order data:", orderData)
      console.log("Selected method:", selectedMethod)

      const paymentPayload = {
        order_id: orderData.order_id,
        amount: orderData.total_price,
        payment_method: selectedMethod,
        customer_details: {
          first_name: orderData.contact_name || "Customer",
          phone: orderData.contact_phone || "08123456789",
          email: "customer@example.com",
          billing_address: {
            address: orderData.address || "Jakarta",
            city: "Jakarta",
            postal_code: "12345",
            country_code: "IDN",
          },
        },
        item_details: [
          {
            id: "laundry-service",
            price: orderData.total_price,
            quantity: 1,
            name: `Layanan Laundry ${orderData.service_type}`,
          },
        ],
      }

      console.log("Payment payload:", paymentPayload)

      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      })

      const result = await response.json()
      console.log("Payment API response:", result)

      if (result.success) {
        if (result.payment_url) {
          console.log("Opening payment URL:", result.payment_url)
          window.open(result.payment_url, "_blank")
          pollPaymentStatus(orderData.order_id)
        } else if (result.actions) {
          // Handle different payment methods that might not have redirect URL
          const qrAction = result.actions.find((action: any) => action.name === "generate-qr-code")
          if (qrAction) {
            window.open(qrAction.url, "_blank")
            pollPaymentStatus(orderData.order_id)
          } else {
            setPaymentStatus("success")
            setTimeout(() => {
              router.push("/order/success")
            }, 2000)
          }
        } else {
          setPaymentStatus("success")
          setTimeout(() => {
            router.push("/order/success")
          }, 2000)
        }
      } else {
        setPaymentStatus("failed")
        setError(result.message || "Gagal membuat pembayaran")
        console.error("Payment failed:", result)
      }
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentStatus("failed")
      setError("Terjadi kesalahan saat memproses pembayaran")
    } finally {
      setLoading(false)
    }
  }

  const pollPaymentStatus = (orderId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/status/${orderId}`)
        const result = await response.json()

        if (result.status === "success") {
          setPaymentStatus("success")
          clearInterval(interval)
          localStorage.removeItem("pendingOrder")
          setTimeout(() => {
            router.push("/order/success")
          }, 2000)
        } else if (result.status === "failed") {
          setPaymentStatus("failed")
          clearInterval(interval)
        }
      } catch (error) {
        console.error("Error polling payment status:", error)
      }
    }, 3000)

    setTimeout(() => {
      clearInterval(interval)
    }, 300000) // 5 minutes
  }

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/order/create">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Pembayaran</h1>
              <p className="text-sm text-gray-600">Selesaikan pembayaran untuk pesanan Anda</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Sandbox Notice */}
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">Mode Testing (Sandbox)</h3>
                <p className="text-sm text-yellow-700">
                  Gunakan kartu test: <strong>4811 1111 1111 1114</strong> | CVV: <strong>123</strong> | Exp:{" "}
                  <strong>01/25</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Status */}
        {paymentStatus !== "pending" && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {paymentStatus === "processing" && (
                  <>
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <h3 className="font-semibold text-blue-600">Memproses Pembayaran</h3>
                      <p className="text-sm text-gray-600">Silakan selesaikan pembayaran di tab yang terbuka</p>
                    </div>
                  </>
                )}
                {paymentStatus === "success" && (
                  <>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-600">Pembayaran Berhasil!</h3>
                      <p className="text-sm text-gray-600">Pesanan Anda akan segera diproses</p>
                    </div>
                  </>
                )}
                {paymentStatus === "failed" && (
                  <>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-600">Pembayaran Gagal</h3>
                      <p className="text-sm text-gray-600">Silakan coba lagi atau pilih metode lain</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
            <CardDescription>Order ID: {orderData.order_id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Layanan:</span>
              <span className="capitalize">{orderData.service_type}</span>
            </div>
            {orderData.weight && (
              <div className="flex justify-between">
                <span className="text-gray-600">Berat:</span>
                <span>{orderData.weight} kg</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Pickup:</span>
              <span>{orderData.pickup_date}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-4">
              <span>Total:</span>
              <span>Rp {orderData.total_price?.toLocaleString("id-ID")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Metode Pembayaran</CardTitle>
            <CardDescription>
              {!selectedCategory
                ? "Pilih metode pembayaran yang tersedia"
                : selectedCategory && !selectedMethod
                  ? "Pilih detail metode pembayaran"
                  : "Metode pembayaran dipilih"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedCategory ? (
              // Category Selection
              <div className="space-y-3">
                {Object.entries(paymentCategories).map(([key, category]) => {
                  const IconComponent = category.icon
                  return (
                    <div
                      key={key}
                      onClick={() => handleCategorySelect(key)}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-6 h-6 ${category.color}`} />
                        <div>
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Tersedia</Badge>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Method Selection
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCategory("")} className="p-1">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="font-medium">{paymentCategories[selectedCategory]?.name}</h3>
                </div>

                <RadioGroup value={selectedMethod} onValueChange={handleMethodSelect}>
                  {paymentCategories[selectedCategory]?.methods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 border p-4 rounded-lg">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                        <div>
                          <h4 className="font-medium">{method.name}</h4>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {paymentStatus === "pending" && selectedMethod && (
            <Button
              onClick={handlePayment}
              className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Bayar Sekarang"}
            </Button>
          )}

          {paymentStatus === "failed" && (
            <Button onClick={handlePayment} className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white">
              Coba Lagi
            </Button>
          )}

          <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
