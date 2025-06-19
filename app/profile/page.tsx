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
import { signOut, getCurrentUser, getUserProfile, updateUserProfile, supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { AddressDialog } from "@/components/address-dialog"
import { useAlert } from "@/hooks/useAlert"
import { AlertDialog } from "@/components/ui/alert-dialog"

interface Address {
  id: string;
  label?: string;
  is_default: boolean;
  address?: string;
  address_line?: string;
  city?: string;
  postal_code?: string;
  notes?: string;
}

export default function ProfilePage() {
  const { toast } = useToast()
  const { alertState, hideAlert, showSuccess, showError, showWarning, showInfo } = useAlert()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"email" | "google" | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",  })
  // Add state for address dialog
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([]) // Menggunakan interface Address yang sudah didefinisikan
  
  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        // Get current authenticated user
        const user = await getCurrentUser()
        
        if (!user) {
          console.error("No authenticated user found")
          window.location.href = "/auth/signin"
          return
        }
        
        setUserId(user.id)
        
        // Determine login method from user metadata
        setLoginMethod(
          user.app_metadata?.provider === "google" ? "google" : "email"
        )
        
        // Get user profile from database
        try {
          const userProfile = await getUserProfile(user.id)
          
          if (userProfile) {
            setProfile({
              name: userProfile.name || user.user_metadata?.full_name || "",
              email: userProfile.email || user.email || "",
              phone: userProfile.phone || "",
            })
            
            // Also store in localStorage as fallback
            localStorage.setItem("userName", userProfile.name || user.user_metadata?.full_name || "")
            localStorage.setItem("userEmail", userProfile.email || user.email || "")
            localStorage.setItem("userPhone", userProfile.phone || "")
          } else {
            // Fallback to user auth data
            setProfile({
              name: user.user_metadata?.full_name || "",
              email: user.email || "",
              phone: "",
            })
          }
          
          // Get user addresses
          await fetchUserAddresses(user.id)
          
        } catch (error) {
          console.error("Error fetching user profile:", error)
          // Fallback to localStorage
          const userName = localStorage.getItem("userName")
          const userEmail = localStorage.getItem("userEmail")
          const userPhone = localStorage.getItem("userPhone")
          
          setProfile({
            name: userName || user.user_metadata?.full_name || "",
            email: userEmail || user.email || "",
            phone: userPhone || "",
          })
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])
  // Fetch user addresses from Supabase
  const fetchUserAddresses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
      
      if (error) throw error
      
      if (data) {
        setAddresses(data)
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
      toast.error("Gagal memuat alamat Anda. Silakan coba lagi.")
    }
  }
  
  // Handle address added/updated
  const handleAddressAdded = async () => {
    if (userId) {
      await fetchUserAddresses(userId)
      toast.success("Alamat berhasil ditambahkan.")
    }
  }

  const handleSave = async () => {
    if (!userId) {      toast.error("User ID tidak ditemukan. Silakan login ulang.")
      return
    }
    
    setIsSaving(true)
    
    try {
      // Save to local storage as backup
      localStorage.setItem("userName", profile.name)
      localStorage.setItem("userEmail", profile.email)
      localStorage.setItem("userPhone", profile.phone)
      
      // Save to Supabase database
      await updateUserProfile(userId, {
        name: profile.name,
        phone: profile.phone,
        // Don't update email here as it requires email verification
      })
        toast.success("Informasi profil Anda telah diperbarui.")
      
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Terjadi kesalahan saat menyimpan profil. Silakan coba lagi.")
    } finally {
      setIsSaving(false)
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
      toast.error("Gagal keluar dari akun. Silakan coba lagi.")
    }
  }
  const handleChangePassword = () => {
    if (loginMethod === "google") {
      showInfo("Akun Google", "Anda masuk menggunakan Google. Untuk mengubah password, silakan kelola melalui akun Google Anda.")
      return
    }

    // Redirect to change password page or show modal
    showInfo("Segera Tersedia", "Fitur ganti password akan segera tersedia.")
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
              <Button variant="outline" size="sm" onClick={() => setIsAddressDialogOpen(true)}>
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
                        <p className="text-sm text-gray-600">{address.address_line || address.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={async () => {
                          try {
                            if (!window.confirm('Yakin ingin menghapus alamat ini?')) return;
                            
                            const { error } = await supabase
                              .from('addresses')
                              .delete()
                              .eq('id', address.id);
                              
                            if (error) throw error;
                            
                            toast.success('Alamat berhasil dihapus');
                            // Refresh addresses
                            if (userId) fetchUserAddresses(userId);
                          } catch (error) {
                            console.error('Error deleting address:', error);
                            toast.error('Gagal menghapus alamat');
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Belum ada alamat tersimpan</h4>
                  <p className="text-sm text-gray-600 mb-4">Tambahkan alamat untuk mempercepat proses pemesanan</p>                  <Button 
                    size="sm" 
                    className="bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white"
                    onClick={() => setIsAddressDialogOpen(true)}
                  >
                    Tambah Alamat Pertama
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>        {/* Security Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Keamanan</CardTitle>
            <CardDescription>Kelola password dan keamanan akun</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loginMethod === "google" ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Anda masuk menggunakan Google. Password dikelola melalui akun Google Anda.
                </AlertDescription>
              </Alert>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleChangePassword}
              >
                <Lock className="w-4 h-4 mr-2" />
                Ganti Password
              </Button>
            )}
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
      </div>      {/* Address Dialog - Separate from the main return to avoid hydration issues */}
      {userId && (        <AddressDialog
          isOpen={isAddressDialogOpen}
          onOpenChange={setIsAddressDialogOpen}
          userId={userId}
          onAddressAdded={handleAddressAdded}
        />
      )}

      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </div>
  )
}
