"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error during auth callback:", error)
          router.push("/auth/signin?error=auth_callback_error")
          return
        }

        if (data.session) {
          // User is authenticated, save user data
          const user = data.session.user

          // Save to localStorage for immediate access
          if (user.user_metadata?.name) {
            localStorage.setItem("userName", user.user_metadata.name)
          }
          if (user.email) {
            localStorage.setItem("userEmail", user.email)
          }

          // Redirect to dashboard
          router.push("/dashboard")
        } else {
          // No session, redirect to sign in
          router.push("/auth/signin")
        }
      } catch (error) {
        console.error("Unexpected error during auth callback:", error)
        router.push("/auth/signin?error=unexpected_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#0F4C75] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Memproses autentikasi...</h2>
        <p className="text-gray-600">Mohon tunggu sebentar</p>
      </div>
    </div>
  )
}
