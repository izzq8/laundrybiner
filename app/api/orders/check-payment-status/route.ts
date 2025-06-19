import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Midtrans configuration
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-bS9phW7kMqLO0jGb3Q9n7INz"
const MIDTRANS_BASE_URL = process.env.MIDTRANS_SANDBOX === 'false' 
  ? "https://api.midtrans.com" 
  : "https://api.sandbox.midtrans.com"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: "Order ID is required"
      }, { status: 400 })
    }

    // Get order from database
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({
        success: false,
        message: "Order not found"
      }, { status: 404 })
    }

    // Check if order has midtrans_order_id
    if (!order.midtrans_order_id) {
      return NextResponse.json({
        success: false,
        message: "Order does not have Midtrans transaction ID"
      }, { status: 400 })
    }

    // Check payment status from Midtrans
    const midtransResponse = await fetch(
      `${MIDTRANS_BASE_URL}/v2/${order.midtrans_order_id}/status`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')}`
        }
      }
    )

    if (!midtransResponse.ok) {
      return NextResponse.json({
        success: false,
        message: "Failed to check payment status from Midtrans"
      }, { status: 500 })
    }

    const midtransData = await midtransResponse.json()
    console.log("Midtrans status response:", midtransData)

    // Determine order status based on transaction status
    let orderStatus = "pending"
    let paymentStatus = "pending"

    const { transaction_status, fraud_status } = midtransData

    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        orderStatus = "confirmed"
        paymentStatus = "paid"
      }
    } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
      orderStatus = "cancelled" 
      paymentStatus = "failed"
    } else if (transaction_status === "pending") {
      orderStatus = "pending"
      paymentStatus = "pending"
    }

    // Update order in database
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json({
        success: false,
        message: "Failed to update order status"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Payment status checked and updated",
      data: {
        order: updatedOrder,
        midtrans_status: midtransData
      }
    })

  } catch (error) {
    console.error("Error checking payment status:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
