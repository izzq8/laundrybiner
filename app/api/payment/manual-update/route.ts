import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_number, payment_status, order_status } = body

    console.log(`Manual update request for order: ${order_number}`)
    console.log(`New payment status: ${payment_status}`)
    console.log(`New order status: ${order_status}`)

    if (!order_number) {
      return NextResponse.json({
        success: false,
        message: "Order number is required"
      }, { status: 400 })
    }

    // Update order status
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: payment_status || "paid",
        status: order_status || "confirmed", 
        updated_at: new Date().toISOString(),
      })
      .eq("order_number", order_number)
      .select()

    if (error) {
      console.error("Error updating order:", error)
      return NextResponse.json({
        success: false,
        message: "Failed to update order",
        error: error.message
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Order not found"
      }, { status: 404 })
    }

    console.log(`Successfully updated order ${order_number}:`, data[0])

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: data[0]
    })

  } catch (error) {
    console.error("Manual update error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
