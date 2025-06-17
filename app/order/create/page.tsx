"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Package, Phone, CreditCard, Wallet, Building2, Smartphone } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateOrderPage() {
  const [step, setStep] = useState(1)
  const [orderData, setOrderData] = useState({
    address: "",
    pickup_date: "",
    pickup_time: "",
    service_type: "",
    items: [],
    weight: "",
    contact_name: "",
    contact_phone: "",
    notes: "",
    payment_method: "",
  })
  const router = useRouter()

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const calculatePrice = () => {
    if (orderData.service_type === "kiloan" && orderData.weight) {
      return Number.parseFloat(orderData.weight) * 8000
    }
    return 0
  }

  const handleSubmit = async () => {
    const totalPrice = calculatePrice()

    if (orderData.payment_method === "pay_later") {
      // For pay later, just create order
      router.push("/order/confirmation")
    } else {
      // For online payment, redirect to payment
      const orderWithPrice = {
        ...orderData,
        total_price: totalPrice,
        order_id: `ORD-${Date.now()}`,
      }

      // Store order data temporarily
      localStorage.setItem("pendingOrder", JSON.stringify(orderWithPrice))

      // Redirect to payment
      router.push("/payment")
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Alamat Pickup</Label>
                <Textarea
                  id="address"
                  placeholder="Masukkan alamat lengkap untuk pickup"
                  value={orderData.address}
                  onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickup_date">Tanggal Pickup</Label>
                  <Input
                    id="pickup_date"
                    type="date"
                    value={orderData.pickup_date}
                    onChange={(e) => setOrderData({ ...orderData, pickup_date: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="pickup_time">Waktu Pickup</Label>
                  <Select onValueChange={(value) => setOrderData({ ...orderData, pickup_time: value })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Pilih waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00-10:00">08:00 - 10:00</SelectItem>
                      <SelectItem value="10:00-12:00">10:00 - 12:00</SelectItem>
                      <SelectItem value="13:00-15:00">13:00 - 15:00</SelectItem>
                      <SelectItem value="15:00-17:00">15:00 - 17:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Pilih Jenis Layanan</Label>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <Card
                  className={`cursor-pointer border-2 ${orderData.service_type === "kiloan" ? "border-[#0F4C75] bg-[#0F4C75]/5" : "border-gray-200"}`}
                  onClick={() => setOrderData({ ...orderData, service_type: "kiloan" })}
                >
                  <CardContent className="p-6 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-[#0F4C75]" />
                    <h3 className="font-semibold mb-2">Kiloan</h3>
                    <p className="text-sm text-gray-600 mb-4">Bayar berdasarkan berat pakaian</p>
                    <Badge variant="secondary">Rp 8.000/kg</Badge>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 ${orderData.service_type === "satuan" ? "border-[#0F4C75] bg-[#0F4C75]/5" : "border-gray-200"}`}
                  onClick={() => setOrderData({ ...orderData, service_type: "satuan" })}
                >
                  <CardContent className="p-6 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-[#0F4C75]" />
                    <h3 className="font-semibold mb-2">Satuan</h3>
                    <p className="text-sm text-gray-600 mb-4">Bayar per item pakaian</p>
                    <Badge variant="secondary">Mulai Rp 5.000</Badge>
                  </CardContent>
                </Card>
              </div>
            </div>

            {orderData.service_type === "kiloan" && (
              <div>
                <Label htmlFor="weight">Perkiraan Berat (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Contoh: 3"
                  value={orderData.weight}
                  onChange={(e) => setOrderData({ ...orderData, weight: e.target.value })}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">*Berat akan ditimbang ulang saat pickup</p>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact_name">Nama Penerima</Label>
                <Input
                  id="contact_name"
                  placeholder="Nama lengkap penerima"
                  value={orderData.contact_name}
                  onChange={(e) => setOrderData({ ...orderData, contact_name: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Nomor HP Penerima</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={orderData.contact_phone}
                  onChange={(e) => setOrderData({ ...orderData, contact_phone: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Instruksi khusus untuk driver atau catatan lainnya"
                  value={orderData.notes}
                  onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Ringkasan Pesanan</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Alamat:</span>
                  <span className="text-right max-w-xs">{orderData.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup:</span>
                  <span>
                    {orderData.pickup_date} ({orderData.pickup_time})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Layanan:</span>
                  <span className="capitalize">{orderData.service_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kontak:</span>
                  <span>{orderData.contact_phone}</span>
                </div>
                {orderData.service_type === "kiloan" && orderData.weight && (
                  <div className="flex justify-between font-semibold text-lg border-t pt-3">
                    <span>Total Estimasi:</span>
                    <span>Rp {calculatePrice().toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Metode Pembayaran</Label>
              <div className="grid gap-3 mt-4">
                {/* Online Payment Options */}
                <Card
                  className={`cursor-pointer border-2 ${orderData.payment_method === "credit_card" ? "border-[#0F4C75] bg-[#0F4C75]/5" : "border-gray-200"}`}
                  onClick={() => setOrderData({ ...orderData, payment_method: "credit_card" })}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-[#0F4C75]" />
                    <div>
                      <h4 className="font-semibold">Kartu Kredit/Debit</h4>
                      <p className="text-sm text-gray-600">Visa, Mastercard, JCB</p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 ${orderData.payment_method === "bank_transfer" ? "border-[#0F4C75] bg-[#0F4C75]/5" : "border-gray-200"}`}
                  onClick={() => setOrderData({ ...orderData, payment_method: "bank_transfer" })}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-[#0F4C75]" />
                    <div>
                      <h4 className="font-semibold">Transfer Bank</h4>
                      <p className="text-sm text-gray-600">BCA, Mandiri, BNI, BRI</p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 ${orderData.payment_method === "ewallet" ? "border-[#0F4C75] bg-[#0F4C75]/5" : "border-gray-200"}`}
                  onClick={() => setOrderData({ ...orderData, payment_method: "ewallet" })}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-[#0F4C75]" />
                    <div>
                      <h4 className="font-semibold">E-Wallet</h4>
                      <p className="text-sm text-gray-600">GoPay, OVO, DANA, LinkAja</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pay Later Option */}
                <Card
                  className={`cursor-pointer border-2 ${orderData.payment_method === "pay_later" ? "border-[#0F4C75] bg-[#0F4C75]/5" : "border-gray-200"}`}
                  onClick={() => setOrderData({ ...orderData, payment_method: "pay_later" })}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <Wallet className="w-6 h-6 text-[#0F4C75]" />
                    <div>
                      <h4 className="font-semibold">Bayar Setelah Pickup</h4>
                      <p className="text-sm text-gray-600">Transfer atau COD saat pengiriman</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Buat Order Baru</h1>
              <p className="text-sm text-gray-600">Langkah {step} dari 4</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    i <= step ? "bg-[#0F4C75] text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {i}
                </div>
                {i < 4 && <div className={`w-16 h-1 mx-2 ${i < step ? "bg-[#0F4C75]" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Alamat & Jadwal</span>
            <span>Jenis Layanan</span>
            <span>Kontak</span>
            <span>Konfirmasi</span>
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && (
                <>
                  <MapPin className="w-5 h-5" /> Alamat & Jadwal Pickup
                </>
              )}
              {step === 2 && (
                <>
                  <Package className="w-5 h-5" /> Pilih Jenis Layanan
                </>
              )}
              {step === 3 && (
                <>
                  <Phone className="w-5 h-5" /> Informasi Kontak
                </>
              )}
              {step === 4 && (
                <>
                  <CreditCard className="w-5 h-5" /> Konfirmasi & Pembayaran
                </>
              )}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tentukan lokasi dan waktu pickup yang sesuai"}
              {step === 2 && "Pilih layanan kiloan atau satuan sesuai kebutuhan"}
              {step === 3 && "Masukkan informasi kontak untuk koordinasi"}
              {step === 4 && "Tinjau pesanan dan pilih metode pembayaran"}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>
            Sebelumnya
          </Button>

          {step < 4 ? (
            <Button onClick={nextStep} className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
              Selanjutnya
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-[#0F4C75] hover:bg-[#0F4C75]/90"
              disabled={!orderData.payment_method}
            >
              {orderData.payment_method === "pay_later" ? "Konfirmasi Pesanan" : "Lanjut ke Pembayaran"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
