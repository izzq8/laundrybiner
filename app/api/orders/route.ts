import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, we'll get all orders for demo user
    // In production, you should filter by user_id based on authentication
    const demoUserId = '550e8400-e29b-41d4-a716-446655440000'

    // Get orders from database
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        service_types (
          name,
          type,
          price,
          description
        )
      `)
      .eq("user_id", demoUserId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: orders || []
    })

  } catch (error) {
    console.error("Error in orders API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
