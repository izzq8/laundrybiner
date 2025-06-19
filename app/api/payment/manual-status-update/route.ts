import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-bS9phW7kMqLO0jGb3Q9n7INz"
const MIDTRANS_BASE_URL = "https://api.sandbox.midtrans.com/v2"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    
    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: "Order ID is required"
      }, { status: 400 })
    }

    console.log(`Manual payment status update for order: ${orderId}`)

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

    // Check payment status from Midtrans using order_number pattern
    let midtransOrderId = order.midtrans_order_id
    
    // If no midtrans_order_id, try to construct it from order pattern
    if (!midtransOrderId) {
      // Try common patterns that might be used
      const patterns = [
        `${order.order_number}-${Math.floor(Date.parse(order.created_at) / 1000)}`,
        order.order_number,
        `LAUNDRY-${Math.floor(Date.parse(order.created_at) / 1000)}`,
      ]
      
      for (const pattern of patterns) {
        try {
          const response = await fetch(`${MIDTRANS_BASE_URL}/${pattern}/status`, {
            method: "GET",
            headers: {
              "Authorization": `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
              "Accept": "application/json",
            },
          })
          
          if (response.ok) {
            midtransOrderId = pattern
            break
          }
        } catch (error) {
          console.log(`Pattern ${pattern} not found, trying next...`)
        }
      }
    }

    if (!midtransOrderId) {
      return NextResponse.json({
        success: false,
        message: "Cannot find Midtrans transaction for this order"
      }, { status: 404 })
    }

    // Check payment status from Midtrans
    const response = await fetch(`${MIDTRANS_BASE_URL}/${midtransOrderId}/status`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: "Failed to get payment status from Midtrans"
      }, { status: 500 })
    }

    const midtransData = await response.json()
    console.log("Midtrans status response:", midtransData)

    // Determine order status based on transaction status
    let orderStatus = order.status
    let paymentStatus = order.payment_status

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
        midtrans_order_id: midtransOrderId,
        midtrans_transaction_id: midtransData.transaction_id || midtransOrderId,
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

    // Add tracking entry
    const { error: trackingError } = await supabaseAdmin
      .from("order_tracking")
      .insert({
        order_id: orderId,
        status: orderStatus,
        notes: `Status updated manually based on Midtrans: ${transaction_status}`,
        created_by: null
      })

    if (trackingError) {
      console.error("Error creating tracking entry:", trackingError)
      // Continue even if tracking fails
    }

    console.log(`Order ${order.order_number} updated: ${orderStatus} (${paymentStatus})`)

    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully",
      order: updatedOrder,
      midtrans_status: midtransData
    })

  } catch (error) {
    console.error("Manual status update error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
