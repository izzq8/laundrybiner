import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG: Testing database connection ===")
    
    // Test 1: Check if we can connect to database
    const { data: testConnection, error: connectionError } = await supabaseAdmin
      .from("orders")
      .select("count")
      .limit(1)

    if (connectionError) {
      console.error("Connection error:", connectionError)
      return NextResponse.json({
        success: false,
        message: "Database connection failed",
        error: connectionError.message
      }, { status: 500 })
    }

    // Test 2: Get all orders (without user filter)
    const { data: allOrders, error: allOrdersError } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        status,
        payment_status,
        total_amount,
        created_at,
        service_types (
          name,
          type
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (allOrdersError) {
      console.error("Error fetching all orders:", allOrdersError)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch orders",
        error: allOrdersError.message
      }, { status: 500 })
    }

    // Test 3: Check service_types table
    const { data: serviceTypes, error: serviceTypesError } = await supabaseAdmin
      .from("service_types")
      .select("*")
      .limit(5)

    // Test 4: Check users table
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id, name, email")
      .limit(5)

    return NextResponse.json({
      success: true,
      debug: {
        connection: "OK",
        totalOrders: allOrders?.length || 0,
        orders: allOrders || [],
        serviceTypes: serviceTypes || [],
        serviceTypesError: serviceTypesError?.message,
        users: users || [],
        usersError: usersError?.message,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("Error in debug API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
