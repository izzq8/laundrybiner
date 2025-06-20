import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Phone, Mail, Clock, Target, Eye, Heart, Users, Sparkles } from "lucide-react"

export default function AboutPage() {
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
              <h1 className="text-xl font-bold text-gray-900">Tentang Kami</h1>
              <p className="text-sm text-gray-600">Mengenal LaundryBiner lebih dekat</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#0F4C75] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tentang <span className="text-[#0F4C75]">LaundryBiner</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Solusi laundry terpercaya untuk warga Cilebut Timur dan sekitarnya sejak 2025
          </p>
        </div>

        {/* Story Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#0F4C75]" />
              Cerita Kami
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              LaundryBiner berdiri sejak tahun 2025 dengan semangat untuk bikin urusan laundry jadi lebih praktis,
              cepat, dan terpercaya, khususnya buat warga Cilebut Timur dan sekitarnya.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dengan lokasi strategis di Perumahan Bumi Pertiwi 2, kami hadir sebagai solusi harian buat kamu yang sibuk
              tapi tetap pengen baju bersih wangi tiap hari ✨
            </p>
            <p className="text-gray-700 leading-relaxed">
              Didirikan oleh <strong>Rangga Biner</strong>, LaundryBiner mengutamakan pelayanan yang ramah, jujur, dan
              berkualitas. Kami percaya bahwa kepercayaan pelanggan adalah aset utama 💼❤
            </p>
          </CardContent>
        </Card>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-6 h-6 text-[#0F4C75]" />
                Visi Kami
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Menjadi layanan laundry lokal terbaik di Cilebut yang dikenal karena kualitas, kecepatan, dan
                kenyamanan, serta jadi mitra harian andalan keluarga dan individu aktif.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-[#0F4C75]" />
                Misi Kami
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[#0F4C75] rounded-full mt-2 flex-shrink-0"></div>
                  Menyediakan layanan laundry yang cepat, bersih, dan terjangkau
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[#0F4C75] rounded-full mt-2 flex-shrink-0"></div>
                  Membangun hubungan jangka panjang dengan pelanggan lewat pelayanan ramah dan profesional
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[#0F4C75] rounded-full mt-2 flex-shrink-0"></div>
                  Memberdayakan masyarakat lokal dengan membuka lapangan kerja
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[#0F4C75] rounded-full mt-2 flex-shrink-0"></div>
                  Mengedepankan kebersihan dan higienitas dalam setiap proses cuci
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-[#0F4C75]" />
              Layanan Kami
            </CardTitle>
            <CardDescription>Berbagai pilihan layanan untuk kebutuhan laundry Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Setrika Aja</h4>
                <Badge variant="secondary" className="text-lg">
                  Rp 3.000/kg
                </Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Cuci Aja</h4>
                <Badge variant="secondary" className="text-lg">
                  Rp 3.500/kg
                </Badge>
              </div>
              <div className="text-center p-4 border rounded-lg">
  <h4 className="font-semibold text-gray-900 mb-2">Paket Hemat</h4>
  <Badge variant="secondary" className="text-lg">
    Rp 5.000/kg
  </Badge>
  <p className="text-xs text-gray-600 mt-1">Cuci + Setrika</p>
</div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Cuci Satuan</h4>
                <Badge variant="secondary" className="text-lg">
                  Mulai Rp 5.000
                </Badge>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0F4C75]" />
                <strong>Area Layanan Antar-Jemput:</strong> Cilebut Timur dan sekitarnya
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informasi Kontak</CardTitle>
            <CardDescription>Hubungi kami untuk layanan laundry terbaik</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#0F4C75] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Alamat</h4>
                    <p className="text-gray-600">
                      Perumahan Bumi Pertiwi 2 Blok Fi No. 3<br />
                      Cilebut Timur, Kec. Sukaraja
                      <br />
                      Kab. Bogor
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#0F4C75] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Telepon/WhatsApp</h4>
                    <p className="text-gray-600">0898 8880 575</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#0F4C75] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">laundrybiner@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#0F4C75] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Jam Operasional</h4>
                    <p className="text-gray-600">
                      Setiap hari
                      <br />
                      08.00 - 20.00 WIB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-[#0F4C75] rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Mau baju bersih & wangi tanpa ribet?</h2>
          <p className="text-blue-100 mb-6">Langsung aja hubungi LaundryBiner, biar kami yang urus!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg"
                variant="outline"
                className="border-white text-[#0F4C75] bg-white hover:bg-[#0F4C75] hover:text-white">
                Daftar Sekarang
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-[#0F4C75] bg-white hover:bg-[#0F4C75] hover:text-white"
              >
                Hubungi Kami
              </Button>
            </Link>
          </div>
          <p className="text-sm text-blue-200 mt-4">#GampangBanget</p>
        </div>
      </div>
    </div>
  )
}
