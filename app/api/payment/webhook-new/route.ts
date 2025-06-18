import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import crypto from "crypto"

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || ""

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received webhook:", body)

    // Verify webhook signature
    const signature = request.headers.get("signature")
    if (signature && MIDTRANS_SERVER_KEY) {
      const expectedSignature = crypto
        .createHash("sha512")
        .update(body.order_id + body.status_code + body.gross_amount + MIDTRANS_SERVER_KEY)
        .digest("hex")
      
      if (signature !== expectedSignature) {
        console.error("Invalid webhook signature")
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 })
      }
    }

    // Extract payment data
    const {
      order_id: midtransOrderId,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
      gross_amount
    } = body

    // Find the order
    const { data: order, error: findError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("midtrans_order_id", midtransOrderId)
      .single()

    if (findError || !order) {
      console.error("Order not found:", midtransOrderId, findError)
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Determine payment status and order status based on Midtrans response
    let paymentStatus = order.payment_status
    let orderStatus = order.status
    let trackingNotes = ""

    switch (transaction_status) {
      case "capture":
        if (fraud_status === "challenge") {
          paymentStatus = "pending"
          trackingNotes = "Payment is being reviewed for fraud"
        } else if (fraud_status === "accept") {
          paymentStatus = "paid"
          orderStatus = "confirmed"
          trackingNotes = "Payment successful, order confirmed"
        }
        break

      case "settlement":
        paymentStatus = "paid"
        orderStatus = "confirmed"
        trackingNotes = "Payment settled, order confirmed"
        break

      case "pending":
        paymentStatus = "pending"
        trackingNotes = "Payment is pending"
        break

      case "deny":
        paymentStatus = "failed"
        orderStatus = "cancelled"
        trackingNotes = "Payment denied, order cancelled"
        break

      case "expire":
        paymentStatus = "failed"
        orderStatus = "cancelled"
        trackingNotes = "Payment expired, order cancelled"
        break

      case "cancel":
        paymentStatus = "failed"
        orderStatus = "cancelled"
        trackingNotes = "Payment cancelled, order cancelled"
        break

      default:
        console.log("Unknown transaction status:", transaction_status)
        trackingNotes = `Payment status updated: ${transaction_status}`
    }

    // Update order
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: paymentStatus,
        status: orderStatus,
        midtrans_transaction_id: transaction_id,
        midtrans_payment_type: payment_type,
        updated_at: new Date().toISOString()
      })
      .eq("id", order.id)

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json({ message: "Failed to update order" }, { status: 500 })
    }

    // Add tracking entry
    const { error: trackingError } = await supabaseAdmin
      .from("order_tracking")
      .insert({
        order_id: order.id,
        status: orderStatus,
        notes: trackingNotes
      })

    if (trackingError) {
      console.error("Error creating tracking entry:", trackingError)
      // Continue even if tracking fails
    }

    console.log(`Order ${order.order_number} updated: ${orderStatus} (${paymentStatus})`)

    return NextResponse.json({ message: "OK" })

  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
