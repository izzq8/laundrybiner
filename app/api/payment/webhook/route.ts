import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@/lib/supabase"

// Midtrans configuration - Using your sandbox credentials
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-bS9phW7kMqLO0jGb3Q9n7INz"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received webhook from Midtrans SANDBOX:", body)

    // Verify signature for security
    const signature = request.headers.get("x-signature")
    const orderId = body.order_id
    const statusCode = body.status_code
    const grossAmount = body.gross_amount

    if (signature && orderId && statusCode && grossAmount) {
      const signatureKey = crypto
        .createHash("sha512")
        .update(orderId + statusCode + grossAmount + MIDTRANS_SERVER_KEY)
        .digest("hex")

      if (signature !== signatureKey) {
        console.log("Invalid signature detected")
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 })
      }
    }

    // Extract transaction details
    const { transaction_status, order_id, payment_type, fraud_status, transaction_time, gross_amount: amount } = body

    console.log(`SANDBOX Webhook - Order ${order_id}: ${transaction_status} (${payment_type})`)

    // Initialize Supabase client
    const supabase = createClient()

    // Determine order status based on transaction status
    let orderStatus = "pending"
    let paymentStatus = "pending"

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
    const { error: orderError } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        payment_method: payment_type,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", order_id)

    if (orderError) {
      console.error("Error updating order status:", orderError)
    } else {
      console.log(`Order ${order_id} updated to status: ${orderStatus}`)
    }

    // Log webhook for debugging
    const { error: logError } = await supabase.from("payment_logs").insert({
      order_id: order_id,
      transaction_status: transaction_status,
      payment_type: payment_type,
      amount: amount,
      webhook_data: body,
      processed_at: new Date().toISOString(),
    })

    if (logError) {
      console.error("Error logging webhook:", logError)
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      order_status: orderStatus,
      payment_status: paymentStatus,
    })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
