import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { orderId, status } = await req.json()

    if (!orderId || !status) {
      return NextResponse.json({
        success: false,
        message: "Order ID and status are required"
      }, { status: 400 })
    }

    // Update order status
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()

    if (error) {
      console.error("Error updating order status:", error)
      return NextResponse.json({
        success: false,
        message: "Failed to update order status",
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: data?.[0]
    })

  } catch (error) {
    console.error("Update status error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
