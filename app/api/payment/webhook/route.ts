import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { supabaseAdmin } from "@/lib/supabase"

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

    console.log(`SANDBOX Webhook - Order ${order_id}: ${transaction_status} (${payment_type})`)    // Initialize Supabase client
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
    }    // Update order in database - try multiple approaches to match order
    console.log(`Attempting to update order with order_id: ${order_id}`)
    
    let updateSuccess = false
    let orderData = null    // Approach 1: Try to update by midtrans_order_id or midtrans_transaction_id
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: orderStatus,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
          midtrans_order_id: order_id, // Store the order_id from webhook
          midtrans_transaction_id: order_id,
        })
        .or(`midtrans_order_id.eq.${order_id},midtrans_transaction_id.eq.${order_id}`)
        .select()

      if (!error && data && data.length > 0) {
        updateSuccess = true
        orderData = data
        console.log(`Direct match update successful for order_id: ${order_id}`)
      }
    } catch (error) {
      console.log("Direct match failed, trying fallback approaches")
    }    // Approach 2: If direct match failed, try to extract order number from order_id
    if (!updateSuccess) {
      try {
        // Extract order number pattern (e.g., from "LDY-20250619-0001-1734567890123")
        let extractedOrderNumber = null
        
        // Try different patterns
        const orderIdParts = order_id.split('-')
        if (orderIdParts.length >= 3) {
          extractedOrderNumber = `${orderIdParts[0]}-${orderIdParts[1]}-${orderIdParts[2]}`
        } else if (order_id.includes('LAUNDRY-')) {
          // For patterns like "LAUNDRY-1750335432131-2dlv4086j"
          // Try to find order by partial match
          const { data: searchResults, error: searchError } = await supabase
            .from("orders")
            .select("*")
            .ilike("order_number", "%LDY%")
            .order("created_at", { ascending: false })
            .limit(50)

          if (!searchError && searchResults && searchResults.length > 0) {
            // Find the most recent order that might match
            const matchingOrder = searchResults.find(order => {
              const timeDiff = Math.abs(Date.now() - new Date(order.created_at).getTime())
              return timeDiff < 24 * 60 * 60 * 1000 // Within 24 hours
            })
            
            if (matchingOrder) {
              const { data, error } = await supabase
                .from("orders")
                .update({
                  status: orderStatus,
                  payment_status: paymentStatus,
                  midtrans_order_id: order_id,
                  midtrans_transaction_id: order_id,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", matchingOrder.id)
                .select()
                
              if (!error && data && data.length > 0) {
                updateSuccess = true
                orderData = data
                console.log(`Time-based match update successful for order: ${matchingOrder.order_number}`)
              }
            }
          }
        }
        
        if (!updateSuccess && extractedOrderNumber) {
          console.log(`Trying fallback with extracted order_number: ${extractedOrderNumber}`)
          
          const { data, error } = await supabase
            .from("orders")
            .update({
              status: orderStatus,
              payment_status: paymentStatus,
              midtrans_order_id: order_id,
              midtrans_transaction_id: order_id,
              updated_at: new Date().toISOString(),
            })
            .eq("order_number", extractedOrderNumber)
            .select()
            
          if (!error && data && data.length > 0) {
            updateSuccess = true
            orderData = data
            console.log(`Fallback update successful for order_number: ${extractedOrderNumber}`)
          }
        }
      } catch (error) {
        console.log("Order number extraction failed", error)
      }
    }

    // Approach 3: If still no success, try pattern matching
    if (!updateSuccess) {
      try {
        console.log(`Trying pattern matching for order_id: ${order_id}`)
        const { data, error } = await supabase
          .from("orders")
          .update({
            status: orderStatus,
            payment_status: paymentStatus,
            updated_at: new Date().toISOString(),
          })
          .or(`order_number.ilike.%${order_id.split('-')[0]}%,order_number.ilike.%${order_id.split('-')[1]}%`)
          .select()
          
        if (!error && data && data.length > 0) {
          updateSuccess = true
          orderData = data
          console.log(`Pattern matching update successful`)
        }
      } catch (error) {
        console.log("Pattern matching failed")
      }
    }

    if (updateSuccess && orderData) {
      console.log(`Order updated successfully to status: ${orderStatus}, payment: ${paymentStatus}`)
      console.log(`Updated ${orderData.length} order(s):`, orderData)
    } else {
      console.error(`Failed to update order with order_id: ${order_id}`)
    }// Log webhook for debugging (optional - only if table exists)
    try {
      const { error: logError } = await supabase.from("payment_logs").insert({
        order_id: order_id,
        transaction_status: transaction_status,
        payment_type: payment_type,
        amount: amount,
        webhook_data: body,
        processed_at: new Date().toISOString(),
      })

      if (logError) {
        console.error("Error logging webhook (table might not exist):", logError)
      }
    } catch (logError) {
      console.log("Payment logs table doesn't exist, skipping log")
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      order_status: orderStatus,
      payment_status: paymentStatus,
    })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
