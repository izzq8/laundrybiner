import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Shield, AlertTriangle, Clock } from "lucide-react"

export default function TermsPage() {
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
              <h1 className="text-xl font-bold text-gray-900">Syarat & Ketentuan</h1>
              <p className="text-sm text-gray-600">Ketentuan penggunaan layanan LaundryBiner</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#0F4C75]" />
              Syarat & Ketentuan Layanan
            </CardTitle>
            <CardDescription>
              Berlaku efektif sejak: 1 Januari 2025 | Terakhir diperbarui: 1 Januari 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Selamat datang di LaundryBiner! Dengan menggunakan layanan kami, Anda menyetujui syarat dan ketentuan
              berikut ini. Mohon baca dengan seksama sebelum menggunakan layanan kami.
            </p>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Informasi Perusahaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <strong>Nama Usaha:</strong> LaundryBiner
            </div>
            <div>
              <strong>Pemilik:</strong> Rangga Biner
            </div>
            <div>
              <strong>Alamat:</strong> Perumahan Bumi Pertiwi 2 Blok Fi No. 3, Cilebut Timur, Kec. Sukaraja, Kab. Bogor
            </div>
            <div>
              <strong>Kontak:</strong> 0898 8880 575 | laundrybiner@gmail.com
            </div>
            <div>
              <strong>Jam Operasional:</strong> Setiap hari, 08.00 - 20.00 WIB
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Layanan yang Disediakan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Jenis Layanan:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Setrika Aja: Rp 3.000/kg</li>
                  <li>• Cuci Aja: Rp 3.500/kg</li>
                  <li>• Paket Hemat (Cuci + Setrika): Rp 5.000/kg</li>
                  <li>• Cuci Satuan: Mulai dari Rp 5.000/pcs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Area Layanan:</h4>
                <p className="text-gray-700">Cilebut Timur dan sekitarnya dengan layanan antar-jemput gratis.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms of Use */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Ketentuan Penggunaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">3.1 Pemesanan</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Pemesanan dapat dilakukan melalui WhatsApp, telepon, atau aplikasi online</li>
                  <li>• Konfirmasi pemesanan akan diberikan dalam waktu maksimal 2 jam</li>
                  <li>• Jadwal pickup akan disesuaikan dengan ketersediaan dan area layanan</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3.2 Pickup & Delivery</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Layanan pickup dan delivery gratis untuk area Cilebut Timur dan sekitarnya</li>
                  <li>• Pelanggan wajib menyediakan akses yang memadai untuk pickup dan delivery</li>
                  <li>• Waktu pickup dan delivery akan dikonfirmasi sebelumnya</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3.3 Pembayaran</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Pembayaran dapat dilakukan secara tunai (COD) atau transfer</li>
                  <li>• Untuk pembayaran online, tersedia berbagai metode pembayaran</li>
                  <li>• Harga final akan ditentukan berdasarkan berat aktual setelah penimbangan</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsibilities */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#0F4C75]" />
              4. Tanggung Jawab
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">4.1 Tanggung Jawab LaundryBiner</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Mencuci dan menyetrika pakaian sesuai standar kualitas</li>
                  <li>• Menjaga keamanan dan kebersihan pakaian selama proses</li>
                  <li>• Memberikan layanan sesuai dengan waktu yang dijanjikan</li>
                  <li>• Mengganti kerugian untuk pakaian yang rusak atau hilang (sesuai ketentuan)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4.2 Tanggung Jawab Pelanggan</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Memastikan tidak ada barang berharga di dalam pakaian</li>
                  <li>• Memberikan instruksi khusus untuk pakaian yang memerlukan perlakuan khusus</li>
                  <li>• Memberikan informasi kontak yang dapat dihubungi</li>
                  <li>• Melakukan pembayaran sesuai dengan kesepakatan</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limitations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              5. Batasan Tanggung Jawab
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-700 text-sm">LaundryBiner tidak bertanggung jawab atas:</p>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• Kerusakan pada pakaian yang sudah rusak sebelumnya</li>
                <li>• Luntur warna pada pakaian yang tidak tahan cuci</li>
                <li>• Penyusutan alami pada bahan tertentu</li>
                <li>• Barang berharga yang tertinggal di dalam pakaian</li>
                <li>• Keterlambatan akibat force majeure (bencana alam, dll)</li>
              </ul>
              <div className="bg-amber-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-amber-800">
                  <strong>Penting:</strong> Ganti rugi maksimal sebesar 10x harga layanan atau sesuai kesepakatan
                  tertulis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Time */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0F4C75]" />
              6. Waktu Pengerjaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold mb-2">Estimasi Waktu:</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Layanan reguler: 2-3 hari kerja</li>
                  <li>• Layanan express: 1 hari kerja (dengan biaya tambahan)</li>
                  <li>• Cuci satuan: 1-2 hari kerja</li>
                </ul>
              </div>
              <p className="text-xs text-gray-600">
                *Waktu pengerjaan dapat berubah tergantung volume pesanan dan kondisi cuaca
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Kebijakan Pembatalan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Pembatalan dapat dilakukan sebelum proses pickup</li>
                <li>• Pembatalan setelah pickup dikenakan biaya administrasi 20% dari total pesanan</li>
                <li>• Pembatalan setelah proses cuci dimulai tidak dapat dilakukan</li>
                <li>• Pengembalian dana (jika ada) akan diproses dalam 3-7 hari kerja</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Privasi & Keamanan Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-700 text-sm">LaundryBiner berkomitmen melindungi privasi pelanggan:</p>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• Data pribadi hanya digunakan untuk keperluan layanan</li>
                <li>• Informasi tidak akan dibagikan kepada pihak ketiga tanpa persetujuan</li>
                <li>• Keamanan data dijaga dengan standar yang berlaku</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Perubahan Syarat & Ketentuan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              LaundryBiner berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui
              website, aplikasi, atau kontak langsung. Penggunaan layanan setelah perubahan dianggap sebagai persetujuan
              terhadap syarat dan ketentuan yang baru.
            </p>
          </CardContent>
        </Card>

        {/* Contact for Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>10. Kontak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm mb-4">
              Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi kami:
            </p>
            <div className="space-y-2 text-sm">
              <div>
                <strong>WhatsApp/Telepon:</strong> 0898 8880 575
              </div>
              <div>
                <strong>Email:</strong> laundrybiner@gmail.com
              </div>
              <div>
                <strong>Alamat:</strong> Perumahan Bumi Pertiwi 2 Blok Fi No. 3, Cilebut Timur, Kec. Sukaraja, Kab.
                Bogor
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
