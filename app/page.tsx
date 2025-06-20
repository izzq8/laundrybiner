"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Sparkles,
  Truck,
  Clock,
  Shield,
  Star,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Menu,
  X,
  Shirt,
  Droplets,
  Zap,
} from "lucide-react"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userName = localStorage.getItem("userName")
    setIsLoggedIn(!!userName)
  }, [])

  const services = [
    {
      icon: Shirt,
      title: "Cuci Kering",
      description: "Layanan cuci dan kering standar dengan kualitas terbaik",
      price: "Mulai dari Rp 5.000/kg",
    },
    {
      icon: Droplets,
      title: "Cuci Setrika",
      description: "Pakaian dicuci bersih dan disetrika rapi siap pakai",
      price: "Mulai dari Rp 7.000/kg",
    },
    {
      icon: Zap,
      title: "Express",
      description: "Layanan kilat 24 jam untuk kebutuhan mendesak",
      price: "Mulai dari Rp 10.000/kg",
    },
  ]

  const features = [
    {
      icon: Truck,
      title: "Pickup & Delivery Gratis",
      description: "Kami jemput dan antar pakaian Anda tanpa biaya tambahan",
    },
    {
      icon: Clock,
      title: "Proses Cepat",
      description: "Layanan standar 2-3 hari, express 24 jam",
    },
    {
      icon: Shield,
      title: "Aman & Terpercaya",
      description: "Pakaian Anda aman dengan asuransi dan tracking real-time",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "Pelayanan sangat memuaskan! Pakaian kembali bersih dan wangi. Pickup dan delivery tepat waktu.",
    },
    {
      name: "Ahmad Rizki",
      rating: 5,
      comment: "Sudah langganan 6 bulan, tidak pernah kecewa. Harga terjangkau dan kualitas terjamin.",
    },
    {
      name: "Maya Sari",
      rating: 5,
      comment: "Layanan express sangat membantu saat butuh pakaian mendadak. Recommended!",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
  <img src="/laundrybiner-logo.jpg" alt="LaundryBiner" className="w-8 h-8 object-contain" />
  <span className="text-xl font-bold text-[#0F4C75]">LaundryBiner</span>
</Link>
{/* Desktop Navigation */}            <nav className="hidden md:flex items-center gap-8">
              <Link href="#services" className="text-gray-600 hover:text-[#0F4C75] transition-colors">
                Layanan
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-[#0F4C75] transition-colors">
                Tentang
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-[#0F4C75] transition-colors">
                Kontak
              </Link>
              <Link href="/faq" className="text-gray-600 hover:text-[#0F4C75] transition-colors">
                FAQ
              </Link>              {isLoggedIn && (
                <Link href="/orders" className="text-gray-600 hover:text-[#0F4C75] transition-colors">
                  Pesanan Saya
                </Link>
              )}
              {isLoggedIn && (
                <Link href="/order" className="text-white bg-[#0F4C75] hover:bg-[#0F4C75]/90 px-4 py-2 rounded-lg transition-colors">
                  Pesan Sekarang
                </Link>
              )}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="text-gray-600 hover:text-[#0F4C75]">
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white">Daftar</Button>
                  </Link>
                </>
              )}
            </div>
{/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-4">
                <Link href="#services" className="text-gray-600 hover:text-[#0F4C75] transition-colors">
                  Layanan
                </Link>
                <Link href="#about" className="text-gray-600 hover:text-[#0F4C75] transition-colors">
                  Tentang
                </Link>
                <Link href="#contact" className="text-gray-600 hover:text-[#0F4C75] transition-colors">
                  Kontak
                </Link>                <Link href="/faq" className="text-gray-600 hover:text-[#0F4C75] transition-colors">
                  FAQ
                </Link>
                {isLoggedIn && (
                  <Link href="/orders" className="text-gray-600 hover:text-[#0F4C75] transition-colors">
                    Pesanan Saya
                  </Link>
                )}
                <div className="flex flex-col gap-2 pt-4 border-t">
                  {isLoggedIn ? (
                    <>
                      <Link href="/order">
                        <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold mb-2">
                          Pesan Sekarang
                        </Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white">Dashboard</Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/signin">
                        <Button variant="ghost" className="w-full text-gray-600 hover:text-[#0F4C75]">
                          Masuk
                        </Button>
                      </Link>
                      <Link href="/auth/signup">
                        <Button className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white">Daftar</Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0F4C75] to-[#1e5a8a] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Laundry Made <span className="text-yellow-400">Easy</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Layanan laundry profesional dengan pickup & delivery gratis. Pakaian bersih, wangi, dan rapi dalam 2-3
              hari.
            </p>            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <Link href="/order">
                  <Button size="lg" className="text-white bg-yellow-400 hover:bg-yellow-500 font-semibold px-8 py-3">
                    Mulai Order Sekarang
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button size="lg" className="text-white bg-yellow-400 hover:bg-yellow-500 font-semibold px-8 py-3">
                    Daftar untuk Mulai Order
                  </Button>
                </Link>
              )}
              <Link href="#services">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-[#0F4C75] hover:bg-[#0F4C75] hover:text-white px-8 py-3"
                >
                  Lihat Layanan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Layanan Kami</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Berbagai pilihan layanan laundry untuk memenuhi kebutuhan Anda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-[#0F4C75] rounded-full flex items-center justify-center mx-auto mb-4">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Badge variant="secondary" className="text-[#0F4C75] font-semibold">
                    {service.price}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Mengapa Pilih Kami?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Komitmen kami untuk memberikan layanan terbaik bagi pelanggan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-10 h-10 text-[#0F4C75]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kata Pelanggan</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Testimoni dari pelanggan yang puas dengan layanan kami
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0F4C75] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Mencoba Layanan Kami?</h2>          <p className="text-xl mb-8 text-blue-100">
            Daftar sekarang dan nikmati kemudahan laundry dengan pickup & delivery gratis
          </p>
          {isLoggedIn ? (
            <Link href="/order/create">
              <Button size="lg" className="text-white bg-yellow-400 hover:bg-yellow-500 font-semibold px-8 py-3">
                Mulai Order Sekarang
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signup">
              <Button size="lg" className="text-white bg-yellow-400 hover:bg-yellow-500 font-semibold px-8 py-3">
                Daftar Sekarang
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Hubungi Kami</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ada pertanyaan? Jangan ragu untuk menghubungi tim customer service kami
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Informasi Kontak</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-[#0F4C75]" />
                  <div>
                    <p className="font-semibold">Telepon</p>
                    <p className="text-gray-600">+62 812-3456-7890</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-[#0F4C75]" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-gray-600">info@laundrybiner.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-[#0F4C75]" />
                  <div>
                    <p className="font-semibold">Alamat</p>
                    <p className="text-gray-600">Jl. Sudirman No. 123, Jakarta Pusat</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Ikuti Kami</h4>
                <div className="flex gap-4">
                  <Button variant="outline" size="sm">
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Instagram className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Twitter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Kirim Pesan</h3>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama</Label>
                  <Input id="name" placeholder="Nama lengkap Anda" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" />
                </div>
                <div>
                  <Label htmlFor="message">Pesan</Label>
                  <Textarea id="message" placeholder="Tulis pesan Anda di sini..." rows={4} />
                </div>
                <Button className="text-white w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90">Kirim Pesan</Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#0F4C75] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">LaundryBiner</span>
              </div>
              <p className="text-gray-400">
                Layanan laundry profesional dengan pickup & delivery gratis. Pakaian bersih, wangi, dan rapi.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Cuci Kering</li>
                <li>Cuci Setrika</li>
                <li>Express 24 Jam</li>
                <li>Pickup & Delivery</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about">Tentang Kami</Link>
                </li>
                <li>
                  <Link href="/career">Karir</Link>
                </li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li>
                  <Link href="/contact">Kontak</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/terms">Syarat & Ketentuan</Link>
                </li>
                <li>
                  <Link href="/privacy">Kebijakan Privasi</Link>
                </li>
                <li>
                  <Link href="/faq">FAQ</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LaundryBiner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
