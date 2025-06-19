"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react"
import { useAlert } from "@/hooks/useAlert"
import { AlertDialog } from "@/components/ui/alert-dialog"

export default function ContactPage() {
  const { alertState, hideAlert, showSuccess, showError, showWarning, showInfo } = useAlert()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)    // Simulate form submission
    setTimeout(() => {
      showSuccess("Pesan Terkirim", "Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.")
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
      setLoading(false)
    }, 1000)
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Halo LaundryBiner, saya ingin bertanya tentang layanan laundry.")
    window.open(`https://wa.me/6289888880575?text=${message}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Hubungi Kami</h1>
              <p className="text-sm text-gray-600">Kami siap membantu kebutuhan laundry Anda</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Informasi Kontak</h2>
              <p className="text-gray-600 mb-6">
                Hubungi kami melalui berbagai cara di bawah ini. Tim LaundryBiner siap melayani Anda!
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#0F4C75]/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#0F4C75]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Alamat</h3>
                      <p className="text-gray-600">
                        Perumahan Bumi Pertiwi 2 Blok Fi No. 3<br />
                        Cilebut Timur, Kec. Sukaraja
                        <br />
                        Kab. Bogor
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#0F4C75]/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-[#0F4C75]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Telepon/WhatsApp</h3>
                      <p className="text-gray-600">0898 8880 575</p>
                      <Button onClick={handleWhatsApp} size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat WhatsApp
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#0F4C75]/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-[#0F4C75]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">laundrybiner@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#0F4C75]/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[#0F4C75]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Jam Operasional</h3>
                      <p className="text-gray-600">
                        Setiap hari
                        <br />
                        08.00 - 20.00 WIB
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Area */}
            <Card>
              <CardHeader>
                <CardTitle>Area Layanan</CardTitle>
                <CardDescription>Wilayah yang kami layani untuk antar-jemput</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Cilebut Timur dan sekitarnya:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Perumahan Bumi Pertiwi 1 & 2</li>
                    <li>• Cilebut Timur</li>
                    <li>• Kecamatan Sukaraja</li>
                    <li>• Area sekitar dalam radius 5 km</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">
                    *Untuk area di luar wilayah tersebut, silakan hubungi kami untuk konfirmasi
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Kirim Pesan</CardTitle>
                <CardDescription>Punya pertanyaan atau ingin konsultasi? Kirim pesan kepada kami</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Masukkan nama lengkap"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor HP</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subjek</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Topik pesan Anda"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tulis pesan atau pertanyaan Anda di sini..."
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Butuh Respon Cepat?</CardTitle>
                <CardDescription>Hubungi kami langsung untuk layanan yang lebih cepat</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button onClick={() => window.open("tel:+6289888880575")} variant="outline" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Telepon
                  </Button>
                </div>
              </CardContent>
            </Card>          </div>
        </div>
      </div>

      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </div>
  )
}
