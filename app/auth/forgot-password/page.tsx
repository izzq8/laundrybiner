"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Mail, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      setSent(true)
    } catch (error) {
      console.error("Reset password error:", error)
      alert("Gagal mengirim email reset password. Silakan coba lagi.")
    } finally {
      setLoading(false)
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
            <CardTitle className="text-2xl font-bold text-gray-900">Lupa Password?</CardTitle>
            <CardDescription>
              {sent
                ? "Kami telah mengirim link reset password ke email Anda"
                : "Masukkan email Anda untuk reset password"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!sent ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-[#0F4C75] hover:bg-[#0F4C75]/90" disabled={loading}>
                  {loading ? "Mengirim..." : "Kirim Link Reset"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Silakan cek email Anda dan klik link yang kami kirim untuk reset password.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSent(false)
                    setEmail("")
                  }}
                >
                  Kirim Ulang
                </Button>
              </div>
            )}

            <div className="text-center">
              <Link href="/auth/signin" className="inline-flex items-center text-sm text-[#0F4C75] hover:underline">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali ke halaman masuk
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
