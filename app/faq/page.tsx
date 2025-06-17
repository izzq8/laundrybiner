"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Search, ChevronDown, ChevronUp, MessageCircle, Phone } from "lucide-react"

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const faqData = [
    {
      category: "Layanan & Harga",
      items: [
        {
          question: "Apa saja layanan yang tersedia di LaundryBiner?",
          answer:
            "Kami menyediakan 4 jenis layanan: Setrika Aja (Rp 3.000/kg), Cuci Aja (Rp 3.500/kg), Paket Hemat Cuci + Setrika (Rp 5.000/kg), dan Cuci Satuan (mulai Rp 5.000/pcs).",
        },
        {
          question: "Bagaimana cara menghitung harga untuk layanan kiloan?",
          answer:
            "Harga dihitung berdasarkan berat aktual setelah penimbangan. Minimum order 2 kg. Jika kurang dari 2 kg, tetap dikenakan tarif 2 kg.",
        },
        {
          question: "Apakah ada biaya tambahan untuk pickup dan delivery?",
          answer:
            "Tidak ada biaya tambahan untuk pickup dan delivery di area Cilebut Timur dan sekitarnya. Layanan antar-jemput gratis untuk semua pelanggan.",
        },
        {
          question: "Berapa lama waktu pengerjaan laundry?",
          answer:
            "Layanan reguler: 2-3 hari kerja. Layanan express: 1 hari kerja (dengan biaya tambahan). Cuci satuan: 1-2 hari kerja. Waktu dapat berubah tergantung volume pesanan dan cuaca.",
        },
      ],
    },
    {
      category: "Pemesanan & Pickup",
      items: [
        {
          question: "Bagaimana cara memesan layanan LaundryBiner?",
          answer:
            "Anda bisa memesan melalui WhatsApp (0898 8880 575), telepon, atau aplikasi online kami. Tim kami akan mengkonfirmasi pesanan dalam waktu maksimal 2 jam.",
        },
        {
          question: "Kapan jadwal pickup tersedia?",
          answer:
            "Pickup tersedia setiap hari dari jam 08.00-20.00 WIB. Anda bisa memilih slot waktu yang sesuai saat pemesanan.",
        },
        {
          question: "Apa yang harus saya siapkan saat pickup?",
          answer:
            "Siapkan pakaian yang akan dicuci, pastikan tidak ada barang berharga di dalam saku, dan berikan instruksi khusus jika ada pakaian yang memerlukan perlakuan khusus.",
        },
        {
          question: "Bisakah saya mengubah jadwal pickup?",
          answer:
            "Ya, Anda bisa mengubah jadwal pickup dengan menghubungi kami minimal 2 jam sebelum waktu pickup yang dijadwalkan.",
        },
      ],
    },
    {
      category: "Pembayaran",
      items: [
        {
          question: "Metode pembayaran apa saja yang tersedia?",
          answer:
            "Kami menerima pembayaran tunai (COD), transfer bank, kartu kredit/debit, dan e-wallet (GoPay, OVO, DANA, LinkAja) melalui sistem pembayaran online.",
        },
        {
          question: "Kapan saya harus melakukan pembayaran?",
          answer:
            "Untuk COD, pembayaran dilakukan saat delivery. Untuk pembayaran online, pembayaran dilakukan setelah konfirmasi berat dan harga final.",
        },
        {
          question: "Apakah harga bisa berubah dari estimasi awal?",
          answer:
            "Ya, harga final ditentukan berdasarkan berat aktual setelah penimbangan. Kami akan mengkonfirmasi harga sebelum memproses pembayaran.",
        },
        {
          question: "Bagaimana jika saya ingin membatalkan pesanan?",
          answer:
            "Pembatalan gratis sebelum pickup. Setelah pickup dikenakan biaya admin 20%. Pembatalan setelah proses cuci dimulai tidak dapat dilakukan.",
        },
      ],
    },
    {
      category: "Kualitas & Keamanan",
      items: [
        {
          question: "Bagaimana LaundryBiner menjaga kualitas cucian?",
          answer:
            "Kami menggunakan deterjen berkualitas tinggi, memisahkan pakaian berdasarkan warna dan jenis kain, serta mengikuti prosedur cuci yang standar untuk setiap jenis pakaian.",
        },
        {
          question: "Bagaimana jika pakaian saya rusak atau hilang?",
          answer:
            "Kami memberikan garansi ganti rugi untuk pakaian yang rusak atau hilang akibat kelalaian kami. Ganti rugi maksimal 10x harga layanan atau sesuai kesepakatan.",
        },
        {
          question: "Apakah pakaian saya aman selama proses laundry?",
          answer:
            "Ya, kami memiliki sistem tracking untuk setiap pesanan dan menjaga keamanan pakaian selama proses. Setiap pesanan diberi label unik untuk identifikasi.",
        },
        {
          question: "Bagaimana jika ada noda yang sulit hilang?",
          answer:
            "Kami akan melakukan treatment khusus untuk noda membandel. Jika noda tidak bisa hilang 100%, kami akan menginformasikan sebelum proses selesai.",
        },
      ],
    },
    {
      category: "Area Layanan",
      items: [
        {
          question: "Di mana saja area layanan LaundryBiner?",
          answer:
            "Kami melayani Cilebut Timur dan sekitarnya, termasuk Perumahan Bumi Pertiwi 1 & 2, Kecamatan Sukaraja, dan area dalam radius 5 km dari lokasi kami.",
        },
        {
          question: "Apakah bisa layanan di luar area coverage?",
          answer:
            "Untuk area di luar wilayah standar, silakan hubungi kami untuk konfirmasi. Mungkin ada biaya tambahan untuk jarak yang lebih jauh.",
        },
        {
          question: "Bagaimana cara mengetahui apakah alamat saya tercover?",
          answer:
            "Anda bisa menghubungi kami melalui WhatsApp dengan menyebutkan alamat lengkap, dan kami akan mengkonfirmasi apakah area Anda tercover.",
        },
      ],
    },
  ]

  const filteredFAQ = faqData
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length > 0)

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Halo LaundryBiner, saya punya pertanyaan yang tidak ada di FAQ.")
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
              <h1 className="text-xl font-bold text-gray-900">FAQ</h1>
              <p className="text-sm text-gray-600">Pertanyaan yang sering ditanyakan</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari pertanyaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* FAQ Content */}
        <div className="space-y-8">
          {filteredFAQ.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.category}</h2>
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => {
                  const globalIndex = categoryIndex * 100 + itemIndex
                  const isOpen = openItems.includes(globalIndex)

                  return (
                    <Card key={itemIndex} className="overflow-hidden">
                      <CardHeader
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleItem(globalIndex)}
                      >
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-left">{item.question}</CardTitle>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                      {isOpen && (
                        <CardContent className="pt-0">
                          <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFAQ.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada hasil ditemukan</h3>
            <p className="text-gray-600 mb-6">Coba kata kunci lain atau hubungi kami langsung</p>
            <Button onClick={handleWhatsApp} className="bg-green-600 hover:bg-green-700">
              <MessageCircle className="w-4 h-4 mr-2" />
              Tanya via WhatsApp
            </Button>
          </div>
        )}

        {/* Contact CTA */}
        <Card className="mt-12 bg-[#0F4C75] text-white">
          <CardHeader>
            <CardTitle className="text-center">Masih ada pertanyaan?</CardTitle>
            <CardDescription className="text-center text-blue-100">
              Tim customer service kami siap membantu Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleWhatsApp} className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => window.open("tel:+6289888880575")}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#0F4C75]"
              >
                <Phone className="w-4 h-4 mr-2" />
                Telepon
              </Button>
              <Link href="/contact">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#0F4C75]">
                  Kirim Pesan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
