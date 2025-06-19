import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Get recent orders for debugging
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, payment_status, status, midtrans_order_id, midtrans_transaction_id, customer_name, total_amount, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

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
      data: orders,
      count: orders?.length || 0
    })

  } catch (error) {
    console.error("Debug orders error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
