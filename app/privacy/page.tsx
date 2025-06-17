import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, AlertCircle } from "lucide-react"

export default function PrivacyPage() {
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
              <h1 className="text-xl font-bold text-gray-900">Kebijakan Privasi</h1>
              <p className="text-sm text-gray-600">Perlindungan data pribadi Anda</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#0F4C75]" />
              Kebijakan Privasi LaundryBiner
            </CardTitle>
            <CardDescription>
              Berlaku efektif sejak: 1 Januari 2025 | Terakhir diperbarui: 1 Januari 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              LaundryBiner berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda. Kebijakan privasi ini
              menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat
              menggunakan layanan kami.
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#0F4C75]" />
              1. Informasi yang Kami Kumpulkan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1.1 Informasi Pribadi</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Nama lengkap</li>
                  <li>• Nomor telepon/WhatsApp</li>
                  <li>• Alamat email</li>
                  <li>• Alamat pickup dan delivery</li>
                  <li>• Informasi pembayaran (jika menggunakan pembayaran online)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">1.2 Informasi Layanan</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Jenis layanan yang dipilih</li>
                  <li>• Riwayat pesanan</li>
                  <li>• Preferensi layanan</li>
                  <li>• Feedback dan rating</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">1.3 Informasi Teknis</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Alamat IP</li>
                  <li>• Jenis perangkat dan browser</li>
                  <li>• Data lokasi (untuk layanan antar-jemput)</li>
                  <li>• Log aktivitas aplikasi/website</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#0F4C75]" />
              2. Penggunaan Informasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-700 text-sm mb-3">Kami menggunakan informasi Anda untuk:</p>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• Memproses dan mengelola pesanan laundry</li>
                <li>• Menghubungi Anda terkait layanan (konfirmasi, update status)</li>
                <li>• Melakukan pickup dan delivery</li>
                <li>• Memproses pembayaran</li>
                <li>• Memberikan layanan pelanggan</li>
                <li>• Meningkatkan kualitas layanan</li>
                <li>• Mengirim informasi promosi (dengan persetujuan)</li>
                <li>• Mematuhi kewajiban hukum</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#0F4C75]" />
              3. Perlindungan Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">3.1 Keamanan Teknis</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Enkripsi data saat transmisi (SSL/TLS)</li>
                  <li>• Penyimpanan data yang aman</li>
                  <li>• Akses terbatas hanya untuk karyawan yang berwenang</li>
                  <li>• Backup data secara berkala</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3.2 Keamanan Fisik</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Akses terbatas ke area penyimpanan data</li>
                  <li>• Pengamanan perangkat dan sistem</li>
                  <li>• Prosedur keamanan untuk karyawan</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Pembagian Informasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800 font-medium mb-2">
                  ✓ Kami TIDAK menjual data pribadi Anda kepada pihak ketiga
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Kami dapat membagikan informasi dalam situasi berikut:</h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li>• Dengan penyedia layanan pembayaran (untuk memproses transaksi)</li>
                  <li>• Dengan kurir/driver (informasi yang diperlukan untuk pickup/delivery)</li>
                  <li>• Jika diwajibkan oleh hukum atau otoritas yang berwenang</li>
                  <li>• Untuk melindungi hak, properti, atau keamanan LaundryBiner</li>
                  <li>• Dengan persetujuan eksplisit dari Anda</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#0F4C75]" />
              5. Hak Anda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-700 text-sm mb-3">Anda memiliki hak untuk:</p>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• Mengakses data pribadi yang kami miliki tentang Anda</li>
                <li>• Meminta koreksi data yang tidak akurat</li>
                <li>• Meminta penghapusan data pribadi Anda</li>
                <li>• Membatasi pemrosesan data Anda</li>
                <li>• Menolak pemrosesan data untuk tujuan pemasaran</li>
                <li>• Meminta portabilitas data</li>
                <li>• Mengajukan keluhan kepada otoritas perlindungan data</li>
              </ul>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Cara menggunakan hak Anda:</strong> Hubungi kami melalui kontak yang tersedia di bawah. Kami
                  akan merespons permintaan Anda dalam waktu maksimal 30 hari.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Penyimpanan Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>
                  • <strong>Data akun:</strong> Selama akun aktif + 2 tahun setelah tidak aktif
                </li>
                <li>
                  • <strong>Riwayat pesanan:</strong> 5 tahun untuk keperluan akuntansi dan hukum
                </li>
                <li>
                  • <strong>Data pembayaran:</strong> Sesuai ketentuan penyedia layanan pembayaran
                </li>
                <li>
                  • <strong>Log teknis:</strong> Maksimal 1 tahun
                </li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                *Data akan dihapus secara aman setelah periode penyimpanan berakhir
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Cookies dan Teknologi Serupa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-700 text-sm">Kami menggunakan cookies dan teknologi serupa untuk:</p>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• Mengingat preferensi Anda</li>
                <li>• Meningkatkan pengalaman pengguna</li>
                <li>• Menganalisis penggunaan website/aplikasi</li>
                <li>• Menyediakan fitur keamanan</li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                Anda dapat mengatur preferensi cookies melalui pengaturan browser Anda.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Third Party Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Layanan Pihak Ketiga</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-700 text-sm mb-3">Kami menggunakan layanan pihak ketiga berikut:</p>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>
                  • <strong>Payment Gateway:</strong> Midtrans (untuk pemrosesan pembayaran)
                </li>
                <li>
                  • <strong>Google Maps:</strong> Untuk layanan lokasi
                </li>
                <li>
                  • <strong>WhatsApp Business:</strong> Untuk komunikasi pelanggan
                </li>
                <li>
                  • <strong>Email Service:</strong> Untuk notifikasi email
                </li>
              </ul>
              <p className="text-xs text-gray-600 mt-3">
                Setiap pihak ketiga memiliki kebijakan privasi sendiri yang mengatur penggunaan data Anda.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Privacy Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              9. Perubahan Kebijakan Privasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan material akan diberitahukan
              melalui email, notifikasi aplikasi, atau pengumuman di website. Penggunaan layanan setelah perubahan
              dianggap sebagai persetujuan terhadap kebijakan yang baru.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>10. Hubungi Kami</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm mb-4">
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin menggunakan hak privasi Anda:
            </p>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Data Protection Officer:</strong> Rangga Biner
              </div>
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

            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-xs text-gray-600">
                <strong>Waktu Respons:</strong> Kami akan merespons pertanyaan privasi Anda dalam waktu maksimal 7 hari
                kerja untuk pertanyaan umum, dan 30 hari untuk permintaan akses atau penghapusan data.
              </p>
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
