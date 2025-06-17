import { createClient } from "@supabase/supabase-js"

// Use hardcoded values for preview environment
const supabaseUrl = "https://hynehzvcqpwbojjovmav.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bmVoenZjcXB3Ym9qam92bWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDI2ODEsImV4cCI6MjA2NTYxODY4MX0.TCm8DYdIFGrk9e_kUYUS3QbkiR0Jda05iZPT9weDh7U"

// Re-export createClient for compatibility
export { createClient }

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key for admin operations
const supabaseServiceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bmVoenZjcXB3Ym9qam92bWF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA0MjY4MSwiZXhwIjoyMDY1NjE4NjgxfQ.UYmmH_HSQcBS5vS4LNTpVea4v5FM8jf4SDukT02OfnA"

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Types for database tables
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  address: string
  label?: string
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  address_id: string
  pickup_date: string
  pickup_time: string
  service_type: "kiloan" | "satuan"
  weight?: number
  items?: any[]
  contact_name: string
  contact_phone: string
  notes?: string
  status: "pending" | "picked_up" | "processing" | "delivering" | "completed"
  total_price?: number
  payment_method?: "transfer" | "cod"
  payment_status?: "pending" | "paid"
  created_at: string
  updated_at: string
}

export interface Feedback {
  id: string
  order_id: string
  user_id: string
  rating: number
  comment?: string
  admin_reply?: string
  created_at: string
}

export interface ServiceType {
  id: string
  name: string
  type: "kiloan" | "satuan"
  price: number
  description?: string
  is_active: boolean
  created_at: string
}

export interface ItemType {
  id: string
  name: string
  price: number
  category?: string
  is_active: boolean
  created_at: string
}

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Google OAuth error:", error)
    throw error
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Error signing in:", error)
    throw error
  }

  return data
}

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      },
    },
  })

  if (error) {
    console.error("Error signing up:", error)
    throw error
  }

  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error("Error getting current user:", error)
    return null
  }

  return user
}

// Database helper functions
export const getServiceTypes = async () => {
  const { data, error } = await supabase.from("service_types").select("*").eq("is_active", true).order("name")

  if (error) {
    console.error("Error fetching service types:", error)
    throw error
  }

  return data as ServiceType[]
}

export const getItemTypes = async () => {
  const { data, error } = await supabase
    .from("item_types")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching item types:", error)
    throw error
  }

  return data as ItemType[]
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    throw error
  }

  return data as User
}

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating user profile:", error)
    throw error
  }

  return data as User
}

export const getUserAddresses = async (userId: string) => {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching addresses:", error)
    throw error
  }

  return data as Address[]
}

export const createAddress = async (address: Omit<Address, "id" | "created_at">) => {
  const { data, error } = await supabase.from("addresses").insert(address).select().single()

  if (error) {
    console.error("Error creating address:", error)
    throw error
  }

  return data as Address
}

export const getUserOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      addresses (
        address,
        label
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    throw error
  }

  return data
}

export const createOrder = async (order: Omit<Order, "id" | "created_at" | "updated_at">) => {
  const { data, error } = await supabase.from("orders").insert(order).select().single()

  if (error) {
    console.error("Error creating order:", error)
    throw error
  }

  return data as Order
}

export const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single()

  if (error) {
    console.error("Error updating order status:", error)
    throw error
  }

  return data as Order
}

export const updateOrderPaymentStatus = async (orderId: string, paymentStatus: Order["payment_status"]) => {
  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single()

  if (error) {
    console.error("Error updating payment status:", error)
    throw error
  }

  return data as Order
}

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("Connection test failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Connected to Supabase successfully!" }
  } catch (error) {
    console.error("Connection test error:", error)
    return { success: false, error: "Failed to connect to Supabase" }
  }
}
