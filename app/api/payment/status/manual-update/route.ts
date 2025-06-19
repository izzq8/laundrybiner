import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { orderId, status = "paid" } = await request.json()
    
    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: "Order ID is required",
      }, { status: 400 })
    }

    console.log(`Manually updating payment status for order: ${orderId} to status: ${status}`)

    // Determine order status based on payment status
    let orderStatus = "pending"
    let paymentStatus = "pending"

    if (status === "paid" || status === "settlement" || status === "capture") {
      orderStatus = "confirmed"
      paymentStatus = "paid"
    } else if (status === "failed" || status === "cancel" || status === "deny") {
      orderStatus = "cancelled"
      paymentStatus = "failed"
    } else {
      orderStatus = "pending"
      paymentStatus = "pending"
    }

    // Update order in database - try multiple approaches
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .or(`midtrans_order_id.eq.${orderId},midtrans_transaction_id.eq.${orderId},order_number.eq.${orderId}`)
      .select()

    if (orderError) {
      console.error("Error updating order status:", orderError)
      return NextResponse.json({
        success: false,
        message: "Failed to update order status",
        error: orderError.message,
      }, { status: 500 })
    }

    if (!orderData || orderData.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Order not found",
      }, { status: 404 })
    }

    console.log(`Successfully updated ${orderData.length} order(s)`)

    return NextResponse.json({
      success: true,
      message: `Order status updated successfully`,
      order_status: orderStatus,
      payment_status: paymentStatus,
      updated_orders: orderData.length,
    })

  } catch (error) {
    console.error("Manual status update error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}
