import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, User, ArrowRight } from "lucide-react"

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "Tips Merawat Pakaian Agar Awet dan Tahan Lama",
      excerpt:
        "Pelajari cara merawat berbagai jenis kain agar pakaian favorit Anda tetap awet dan terlihat seperti baru.",
      date: "15 Januari 2025",
      author: "Tim LaundryBiner",
      category: "Tips & Tricks",
    },
    {
      id: 2,
      title: "Mengapa Memilih Layanan Laundry Profesional?",
      excerpt: "Keuntungan menggunakan jasa laundry profesional dibandingkan mencuci sendiri di rumah.",
      date: "10 Januari 2025",
      author: "Rangga Biner",
      category: "Layanan",
    },
    {
      id: 3,
      title: "Panduan Memilih Deterjen yang Tepat",
      excerpt: "Berbagai jenis deterjen dan kapan menggunakannya untuk hasil cucian yang optimal.",
      date: "5 Januari 2025",
      author: "Tim LaundryBiner",
      category: "Edukasi",
    },
  ]

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
              <h1 className="text-xl font-bold text-gray-900">Blog</h1>
              <p className="text-sm text-gray-600">Tips dan informasi seputar laundry</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog <span className="text-[#0F4C75]">LaundryBiner</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tips, trik, dan informasi berguna seputar perawatan pakaian dan layanan laundry
          </p>
        </div>

        {/* Blog Posts */}
        <div className="space-y-6 mb-12">
          {blogPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                  <span>•</span>
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                  <span>•</span>
                  <span className="bg-[#0F4C75]/10 text-[#0F4C75] px-2 py-1 rounded text-xs">{post.category}</span>
                </div>
                <CardTitle className="text-xl hover:text-[#0F4C75] transition-colors">{post.title}</CardTitle>
                <CardDescription className="text-base">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="group">
                  Baca Selengkapnya
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon */}
        <Card className="text-center">
          <CardContent className="py-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Segera Hadir!</h3>
            <p className="text-gray-600 mb-6">
              Kami sedang menyiapkan konten blog yang menarik dan bermanfaat untuk Anda. Stay tuned untuk tips dan
              informasi terbaru seputar laundry!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">Hubungi Kami</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Kembali ke Beranda</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
