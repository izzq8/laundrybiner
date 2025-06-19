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
    }    // Ensure item_details is valid and all price/quantity are numbers
    const safeItemDetails = Array.isArray(item_details) && item_details.length > 0
      ? item_details.map((item) => ({
          id: String(item.id),
          name: String(item.name),
          price: Number(item.price),
          quantity: Number(item.quantity),
        }))
      : [
          {
            id: "laundry-service",
            name: "Layanan Laundry",
            price: Number(amount),
            quantity: 1,
          }
        ]    // Validate that total item_details price matches gross_amount
    const totalItemPrice = safeItemDetails.reduce((total, item) => total + (item.price * item.quantity), 0)
    if (totalItemPrice !== Number(amount)) {
      console.warn(`Item details total (${totalItemPrice}) doesn't match gross amount (${amount}). Adjusting item details.`)
      // Adjust the first item price to match the total
      if (safeItemDetails.length > 0) {
        safeItemDetails[0].price = Number(amount)
        safeItemDetails[0].quantity = 1
      }
    }

    // Final validation for QRIS compatibility
    const finalTotalItemPrice = safeItemDetails.reduce((total, item) => total + (item.price * item.quantity), 0)
    if (finalTotalItemPrice !== Number(amount)) {
      console.error(`CRITICAL: Final item details total (${finalTotalItemPrice}) still doesn't match gross amount (${amount})`)
      return NextResponse.json({
        success: false,
        message: "Item details validation failed for QRIS compatibility",
      })
    }    console.log("=== CREATING MIDTRANS PAYMENT ===")
    console.log("Order ID:", order_id)
    console.log("Gross Amount:", amount)
    console.log("Customer Details:", JSON.stringify(customer_details, null, 2))
    console.log("Safe item_details:", JSON.stringify(safeItemDetails, null, 2))
    console.log("Total item price verification:", safeItemDetails.reduce((total, item) => total + (item.price * item.quantity), 0))
    console.log("=== END PAYMENT DEBUG INFO ===")

    // Prepare the correct payload format for Midtrans Snap
    const payload = {
      transaction_details: {
        order_id: String(order_id),
        gross_amount: Number(amount),
      },
      customer_details: {
        first_name: customer_details?.first_name || "Customer",
        last_name: customer_details?.last_name || "",
        email: customer_details?.email || "customer@laundrybiner.com",
        phone: customer_details?.phone || "08123456789",
        billing_address: {
          first_name: customer_details?.first_name || "Customer",
          last_name: customer_details?.last_name || "",
          address: customer_details?.billing_address?.address || "Jakarta",
          city: customer_details?.billing_address?.city || "Jakarta",
          postal_code: customer_details?.billing_address?.postal_code || "12345",
          country_code: "IDN",
        },
      },
      item_details: safeItemDetails,
      // Add payment method configuration for better QRIS support
      enabled_payments: [
        "qris", "gopay", "shopeepay", "dana", "linkaja", "ovo",
        "credit_card", "bca_va", "bni_va", "bri_va", "echannel", "permata_va", "other_va"
      ],
      // QRIS specific configuration
      custom_expiry: {
        expiry_duration: 1440, // 24 hours in minutes
        unit: "minute"
      },
      // Callbacks untuk redirect URLs
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/finish`,
        unfinish: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/unfinish`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/error`
      }
    }

    console.log("Sending payload to Midtrans (Snap):", JSON.stringify(payload, null, 2))

    // Use the correct Midtrans Snap endpoint
    const endpoint = `${MIDTRANS_BASE_URL}/transactions`
    console.log("Endpoint:", endpoint)

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
    console.log("Midtrans response (full):", JSON.stringify(result, null, 2))

    if (response.ok && result.token) {
      return NextResponse.json({
        success: true,
        payment_url: result.redirect_url,
        token: result.token,
        transaction_id: result.transaction_id,
        raw_response: result,
      })
    } else {
      console.error("Midtrans error (no token):", result)
      return NextResponse.json({
        success: false,
        message: result.status_message || result.error_messages || "Payment creation failed",
        error_details: result,
      })
    }
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error: " + (error instanceof Error ? error.message : "Unknown error"),
    })
  }
}
