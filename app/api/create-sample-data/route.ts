import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Creating sample data ===")
    
    // Step 1: Create a sample service type
    const { data: serviceType, error: serviceTypeError } = await supabaseAdmin
      .from("service_types")
      .upsert({
        name: "Cuci Kering Lipat",
        type: "kiloan",
        price: 8000,
        description: "Layanan cuci kering dan lipat per kilogram",
        is_active: true
      })
      .select()
      .single()

    if (serviceTypeError) {
      console.error("Error creating service type:", serviceTypeError)
      return NextResponse.json({
        success: false,
        message: "Failed to create service type",
        error: serviceTypeError.message
      }, { status: 500 })
    }

    console.log("Service type created:", serviceType)

    // Step 2: Create a sample user
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: "John Doe",
        email: "john@example.com",
        phone: "081234567890"
      })
      .select()
      .single()

    if (userError) {
      console.error("Error creating user:", userError)
      return NextResponse.json({
        success: false,
        message: "Failed to create user",
        error: userError.message
      }, { status: 500 })
    }

    console.log("User created:", user)

    // Step 3: Create sample orders
    const sampleOrders = [
      {
        order_number: "LB-2025-001",
        user_id: user.id,
        service_type_id: serviceType.id,
        weight: 3.5,
        total_amount: 28000,
        pickup_date: "2025-06-20",
        pickup_time: "10:00:00",
        customer_name: "John Doe",
        customer_phone: "081234567890",
        customer_email: "john@example.com",
        pickup_address: "Jl. Merdeka No. 123, Jakarta Pusat",
        notes: "Jangan gunakan pewangi yang terlalu kuat",
        status: "confirmed",
        payment_status: "paid"
      },
      {
        order_number: "LB-2025-002",
        user_id: user.id,
        service_type_id: serviceType.id,
        weight: 2.0,
        total_amount: 16000,
        pickup_date: "2025-06-21",
        pickup_time: "14:00:00",
        customer_name: "Jane Smith",
        customer_phone: "081987654321",
        customer_email: "jane@example.com",
        pickup_address: "Jl. Sudirman No. 456, Jakarta Selatan",
        notes: "Pisahkan pakaian putih dan berwarna",
        status: "in_process",
        payment_status: "paid"
      }
    ]

    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .upsert(sampleOrders)
      .select()

    if (ordersError) {
      console.error("Error creating orders:", ordersError)
      return NextResponse.json({
        success: false,
        message: "Failed to create orders",
        error: ordersError.message
      }, { status: 500 })
    }

    console.log("Orders created:", orders)

    return NextResponse.json({
      success: true,
      message: "Sample data created successfully",
      data: {
        serviceType,
        user,
        orders
      }
    })

  } catch (error) {
    console.error("Error in create-sample-data API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
