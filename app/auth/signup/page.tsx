"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { signInWithGoogle, signUpWithEmail } from "@/lib/supabase"
import { useAlert } from '@/hooks/useAlert'

export default function SignUpPage() {  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  
  // Alert hook
  const { alertState, hideAlert, showSuccess, showError, showWarning, showInfo } = useAlert()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      showWarning("Password Tidak Cocok", "Password dan konfirmasi password harus sama!")
      return
    }

    if (formData.password.length < 6) {
      showWarning("Password Terlalu Pendek", "Password harus minimal 6 karakter!")
      return
    }

    setLoading(true)

    try {
      const { user } = await signUpWithEmail(formData.email, formData.password, formData.name)

      if (user) {
        // Save user data to localStorage
        localStorage.setItem("userName", formData.name)
        localStorage.setItem("userEmail", formData.email)

        showSuccess("Akun Berhasil Dibuat", "Selamat datang! Akun Anda telah berhasil dibuat.")
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Sign up error:", error)

      if (error.message?.includes("User already registered")) {
        showError("Email Sudah Terdaftar", "Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun yang ada.")
      } else if (error.message?.includes("Password should be at least 6 characters")) {
        showWarning("Password Terlalu Pendek", "Password harus minimal 6 karakter.")
      } else {
        showError("Gagal Membuat Akun", "Gagal membuat akun. Silakan coba lagi.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)

    try {
      await signInWithGoogle()
      // Redirect will be handled by Supabase
    } catch (error: any) {
      console.error("Google sign up error:", error)

      if (error.message?.includes("popup_closed_by_user")) {
        // User closed the popup, no need to show error
        return      } else if (error.message?.includes("access_denied")) {
        showError("Akses Ditolak", "Silakan coba lagi dan berikan izin yang diperlukan.")
      } else {
        showError("Gagal Daftar", "Gagal daftar dengan Google. Silakan coba lagi.")
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-[#0F4C75] rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0F4C75]">LaundryBiner</h1>
              <p className="text-xs text-gray-600">Laundry Made Easy</p>
            </div>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Buat Akun Baru</CardTitle>
            <CardDescription>Daftar untuk mulai menggunakan LaundryBiner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="terms" className="rounded" required />
                <Label htmlFor="terms" className="text-sm">
                  Saya setuju dengan{" "}
                  <Link href="/terms" className="text-[#0F4C75] hover:underline">
                    Syarat & Ketentuan
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white" disabled={loading}>
                {loading ? "Memproses..." : "Daftar"}
              </Button>
            </form>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 text-sm text-gray-500">atau</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={googleLoading}>
              {googleLoading ? (
                <div className="w-4 h-4 mr-2 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {googleLoading ? "Memproses..." : "Daftar dengan Google"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Sudah punya akun? </span>
              <Link href="/auth/signin" className="text-[#0F4C75] hover:underline font-medium">
                Masuk sekarang
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
