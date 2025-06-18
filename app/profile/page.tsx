"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, Mail, Phone, MapPin, Lock, LogOut, Trash2, Info } from "lucide-react"
import { signOut, supabase } from "@/lib/supabase"

interface Address {
  id: string;
  label: string;
  is_default: boolean;
  address: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"email" | "google" | null>(null)
  const [profile, setProfile] = useState({
    name: typeof window !== "undefined" ? localStorage.getItem("userName") || "" : "",
    email: typeof window !== "undefined" ? localStorage.getItem("userEmail") || "" : "",
    phone: typeof window !== "undefined" ? localStorage.getItem("userPhone") || "" : "",
  })

  const [addresses] = useState<Address[]>([])

  useEffect(() => {
    // Load user data from localStorage (in real app, this would come from Supabase)
    const userName = localStorage.getItem("userName")
    const userEmail = localStorage.getItem("userEmail")
    const userPhone = localStorage.getItem("userPhone")
    const authMethod = localStorage.getItem("authMethod") // 'email' or 'google'

    if (userName || userEmail || userPhone) {
      setProfile({
        name: userName || "",
        email: userEmail || "",
        phone: userPhone || "",
      })
    }

    // Determine login method (in real app, this would come from Supabase user metadata)
    if (authMethod) {
      setLoginMethod(authMethod as "email" | "google")
    } else {
      // Default assumption based on email domain or other logic
      setLoginMethod("email")
    }
  }, [])

  const handleSave = async () => {
    try {
      // Ambil user id dari session Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) {
        alert("User tidak ditemukan. Silakan login ulang.")
        return
      }
      // Update ke database Supabase
      const { error } = await supabase
        .from("users")
        .update({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
      if (error) {
        throw error
      }
      // Simpan ke localStorage
      localStorage.setItem("userName", profile.name)
      localStorage.setItem("userEmail", profile.email)
      localStorage.setItem("userPhone", profile.phone)
      setIsEditing(false)
      alert("Profil berhasil diperbarui.")
    } catch (err) {
      console.error("Gagal update profil:", err)
      alert("Gagal menyimpan perubahan profil.")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()

      // Clear localStorage
      localStorage.removeItem("userName")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userPhone")
      localStorage.removeItem("authMethod")

      // Redirect to home page
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
      alert("Gagal keluar dari akun. Silakan coba lagi.")
    }
  }

  const handleChangePassword = () => {
    if (loginMethod === "google") {
      alert("Anda masuk menggunakan Google. Untuk mengubah password, silakan kelola melalui akun Google Anda.")
      return
    }

    // Redirect to change password page or show modal
    alert("Fitur ganti password akan segera tersedia.")
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
              <h1 className="text-xl font-bold text-gray-900">Profil Saya</h1>
              <p className="text-sm text-gray-600">Kelola informasi akun Anda</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Informasi Pribadi</CardTitle>
                <CardDescription>Kelola data pribadi Anda</CardDescription>
              </div>
              <Button variant="outline" onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
                {isEditing ? "Simpan" : "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor HP</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Addresses */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alamat Tersimpan</CardTitle>
                <CardDescription>Kelola alamat pickup dan delivery</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Tambah Alamat
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {addresses.length > 0 ? (
                addresses.map((address) => (
                  <div key={address.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{address.label}</h4>
                          {address.is_default && (
                            <span className="text-xs bg-[#0F4C75] text-white px-2 py-1 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{address.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Belum ada alamat tersimpan</h4>
                  <p className="text-sm text-gray-600 mb-4">Tambahkan alamat untuk mempercepat proses pemesanan</p>
                  <Button size="sm" className="bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white">
                    Tambah Alamat Pertama
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Keamanan</CardTitle>
            <CardDescription>Kelola password dan keamanan akun</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loginMethod === "google" && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Anda masuk menggunakan Google. Password dikelola melalui akun Google Anda.
                </AlertDescription>
              </Alert>
            )}

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleChangePassword}
              disabled={loginMethod === "google"}
            >
              <Lock className="w-4 h-4 mr-2" />
              {loginMethod === "google" ? "Password Dikelola Google" : "Ganti Password"}
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Akun</CardTitle>
            <CardDescription>Kelola akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar dari Akun
            </Button>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                Bergabung sejak Januari 2024 • Login via {loginMethod === "google" ? "Google" : "Email"}
              </p>
              <p className="text-xs text-gray-400">
                Dengan menggunakan LaundryBiner, Anda menyetujui{" "}
                <Link href="/terms" className="text-[#0F4C75] hover:underline">
                  Syarat & Ketentuan
                </Link>{" "}
                dan{" "}
                <Link href="/privacy" className="text-[#0F4C75] hover:underline">
                  Kebijakan Privasi
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
