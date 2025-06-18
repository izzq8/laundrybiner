import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { supabaseAdmin } from "@/lib/supabase"

// Midtrans configuration - Using sandbox credentials
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
    const { 
      transaction_status, 
      order_id, 
      payment_type, 
      fraud_status, 
      transaction_time, 
      gross_amount: amount,
      transaction_id,
      va_numbers,
      bank,
      payment_amounts,
      masked_card,
      currency
    } = body

    console.log(`SANDBOX Webhook - Order ${order_id}: ${transaction_status} (${payment_type})`)

    // Initialize Supabase client
    const supabase = supabaseAdmin

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

    // Update order in database using order_number instead of id
    const { data: existingOrder, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, payment_status")
      .eq("order_number", order_id)
      .single()

    if (fetchError) {
      console.error("Error fetching order:", fetchError)
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Update order status
    const { error: orderError } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        transaction_id: transaction_id,
        fraud_status: fraud_status,
        transaction_time: transaction_time ? new Date(transaction_time).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", existingOrder.id)

    if (orderError) {
      console.error("Error updating order:", orderError)
      return NextResponse.json({ message: "Failed to update order" }, { status: 500 })
    }

    // Insert or update payment record
    const paymentData = {
      order_id: existingOrder.id,
      transaction_id: transaction_id,
      payment_type: payment_type,
      gross_amount: parseInt(amount),
      transaction_status: transaction_status,
      transaction_time: new Date(transaction_time).toISOString(),
      payment_method: payment_type,
      bank: bank || null,
      va_number: va_numbers?.[0]?.va_number || null,
      fraud_status: fraud_status,
      masked_card: masked_card || null,
      currency: currency || 'IDR',
      signature_key: signature,
      raw_response: body
    }

    // Try to update existing payment record, if not exists, insert new one
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("transaction_id", transaction_id)
      .single()

    if (existingPayment) {
      // Update existing payment
      const { error: paymentUpdateError } = await supabase
        .from("payments")
        .update({
          transaction_status: transaction_status,
          payment_method: payment_type,
          bank: bank || null,
          va_number: va_numbers?.[0]?.va_number || null,
          fraud_status: fraud_status,
          masked_card: masked_card || null,
          raw_response: body,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingPayment.id)

      if (paymentUpdateError) {
        console.error("Error updating payment:", paymentUpdateError)
      }
    } else {
      // Insert new payment record
      const { error: paymentInsertError } = await supabase
        .from("payments")
        .insert(paymentData)

      if (paymentInsertError) {
        console.error("Error inserting payment:", paymentInsertError)
        // Don't fail the webhook for payment insert error
      }
    }

    // Log status change in order_status_history
    if (existingOrder.status !== orderStatus) {
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: existingOrder.id,
          old_status: existingOrder.status,
          new_status: orderStatus,
          notes: `Status updated via Midtrans webhook - ${transaction_status}`,
          changed_by: null // System change
        })

      if (historyError) {
        console.error("Error logging status history:", historyError)
      }
    }

    console.log(`Order ${order_id} status updated to: ${orderStatus}, payment: ${paymentStatus}`)

    return NextResponse.json({ 
      message: "Webhook processed successfully",
      order_status: orderStatus,
      payment_status: paymentStatus
    })

  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      { message: "Webhook processing failed", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
