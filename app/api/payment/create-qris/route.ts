import { type NextRequest, NextResponse } from "next/server"

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || ""
const MIDTRANS_BASE_URL = "https://app.sandbox.midtrans.com/snap/v1"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, amount, customer_details, item_details } = body

    // Validate required fields
    if (!order_id || !amount) {
      return NextResponse.json({
        success: false,
        message: "Order ID and amount are required",
      })
    }

    // Verify server key is available
    if (!MIDTRANS_SERVER_KEY) {
      console.error("MIDTRANS_SERVER_KEY is not set")
      return NextResponse.json({
        success: false,
        message: "Payment service configuration error",
      })
    }

    // Ensure item_details is valid and all price/quantity are numbers
    const safeItemDetails = Array.isArray(item_details)
      ? item_details.map((item) => ({
          id: String(item.id),
          name: String(item.name),
          price: Number(item.price),
          quantity: Number(item.quantity),
        }))
      : []

    console.log("Creating QRIS-optimized payment Snap")
    console.log("Order ID:", order_id)
    console.log("Amount:", amount)

    // Simplified payload specifically optimized for QRIS
    const payload = {
      transaction_details: {
        order_id: String(order_id),
        gross_amount: Number(amount),
      },
      customer_details: {
        first_name: customer_details?.first_name || "Customer",
        email: customer_details?.email || "customer@example.com",
        phone: customer_details?.phone || "08123456789",
      },
      item_details: safeItemDetails,
      // Only enable QRIS and essential e-wallets to avoid conflicts
      enabled_payments: ["qris", "gopay", "shopeepay"],
      // Custom expiry
      custom_expiry: {
        expiry_duration: 30,
        unit: "minute"
      }
    }

    console.log("QRIS-optimized payload:", JSON.stringify(payload, null, 2))

    const endpoint = `${MIDTRANS_BASE_URL}/transactions`
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    console.log("Midtrans response status:", response.status)
    console.log("Midtrans response:", JSON.stringify(result, null, 2))

    if (response.ok && result.token) {
      return NextResponse.json({
        success: true,
        payment_url: result.redirect_url,
        token: result.token,
        transaction_id: result.transaction_id,
        raw_response: result,
      })
    } else {
      console.error("Midtrans error:", result)
      return NextResponse.json({
        success: false,
        message: result.status_message || result.error_messages || "Payment creation failed",
        error_details: result,
      })
    }
  } catch (error) {
    console.error("QRIS Payment creation error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error: " + (error instanceof Error ? error.message : "Unknown error"),
    })
  }
}
