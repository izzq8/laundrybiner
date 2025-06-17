"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, Heart, TrendingUp, MessageCircle } from "lucide-react"

export default function CareerPage() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent("Halo LaundryBiner, saya tertarik untuk bergabung dengan tim Anda.")
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
              <h1 className="text-xl font-bold text-gray-900">Karir</h1>
              <p className="text-sm text-gray-600">Bergabunglah dengan tim LaundryBiner</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bergabung dengan <span className="text-[#0F4C75]">Tim LaundryBiner</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kami sedang berkembang dan mencari talenta terbaik untuk bergabung dalam misi memberikan layanan laundry
            terbaik
          </p>
        </div>

        {/* Why Join Us */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-[#0F4C75] mb-2" />
              <CardTitle>Tim yang Solid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Bekerja dengan tim yang saling mendukung dan berkomitmen pada kualitas layanan terbaik.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-[#0F4C75] mb-2" />
              <CardTitle>Berkembang Bersama</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Kesempatan untuk tumbuh dan berkembang seiring dengan pertumbuhan bisnis LaundryBiner.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="w-8 h-8 text-[#0F4C75] mb-2" />
              <CardTitle>Lingkungan Positif</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Budaya kerja yang positif, ramah, dan mengutamakan work-life balance.</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Openings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Posisi yang Tersedia</CardTitle>
            <CardDescription>Saat ini kami sedang mencari kandidat untuk posisi berikut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border-l-4 border-[#0F4C75] pl-4">
                <h3 className="font-semibold text-lg mb-2">Driver/Kurir Pickup & Delivery</h3>
                <p className="text-gray-600 mb-3">
                  Bertanggung jawab untuk pickup dan delivery pakaian pelanggan di area Cilebut Timur dan sekitarnya.
                </p>
                <div className="text-sm text-gray-500">
                  <p>
                    <strong>Persyaratan:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Memiliki SIM C dan kendaraan bermotor</li>
                    <li>Familiar dengan area Cilebut dan sekitarnya</li>
                    <li>Komunikatif dan ramah</li>
                    <li>Jujur dan bertanggung jawab</li>
                  </ul>
                </div>
              </div>

              <div className="border-l-4 border-[#0F4C75] pl-4">
                <h3 className="font-semibold text-lg mb-2">Operator Laundry</h3>
                <p className="text-gray-600 mb-3">
                  Menangani proses pencucian, pengeringan, dan penyetrikaan pakaian dengan standar kualitas tinggi.
                </p>
                <div className="text-sm text-gray-500">
                  <p>
                    <strong>Persyaratan:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Pengalaman di bidang laundry (diutamakan)</li>
                    <li>Teliti dan detail-oriented</li>
                    <li>Mampu bekerja dalam tim</li>
                    <li>Fisik sehat dan kuat</li>
                  </ul>
                </div>
              </div>

              <div className="border-l-4 border-[#0F4C75] pl-4">
                <h3 className="font-semibold text-lg mb-2">Customer Service</h3>
                <p className="text-gray-600 mb-3">
                  Menangani komunikasi dengan pelanggan, menerima pesanan, dan memberikan informasi layanan.
                </p>
                <div className="text-sm text-gray-500">
                  <p>
                    <strong>Persyaratan:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Komunikasi yang baik</li>
                    <li>Sabar dan ramah dalam melayani</li>
                    <li>Familiar dengan teknologi (WhatsApp, aplikasi)</li>
                    <li>Mampu multitasking</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Benefit & Fasilitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-gray-700">
                <li>• Gaji kompetitif sesuai pengalaman</li>
                <li>• Bonus performa bulanan</li>
                <li>• Jaminan kesehatan</li>
                <li>• Cuti tahunan</li>
              </ul>
              <ul className="space-y-2 text-gray-700">
                <li>• Training dan pengembangan skill</li>
                <li>• Lingkungan kerja yang nyaman</li>
                <li>• Kesempatan promosi</li>
                <li>• Laundry gratis untuk karyawan</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How to Apply */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cara Melamar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                Tertarik bergabung dengan tim LaundryBiner? Kirimkan CV dan surat lamaran Anda melalui:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">WhatsApp</h4>
                  <p className="text-sm text-gray-600">0898 8880 575</p>
                  <Button onClick={handleWhatsApp} size="sm" className="bg-green-600 hover:bg-green-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Lamar via WhatsApp
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-sm text-gray-600">laundrybiner@gmail.com</p>
                  <Button
                    onClick={() => window.open("mailto:laundrybiner@gmail.com?subject=Lamaran Kerja - [Posisi]")}
                    size="sm"
                    variant="outline"
                  >
                    Kirim Email
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tips:</strong> Sertakan posisi yang diminati di subject email/pesan WhatsApp. Kami akan
                  menghubungi kandidat yang sesuai dalam waktu 1-2 minggu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/">
            <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
