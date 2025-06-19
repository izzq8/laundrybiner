import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Get all orders - in production you would filter by authenticated user
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
