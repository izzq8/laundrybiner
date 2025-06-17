import { type NextRequest, NextResponse } from "next/server"

const MIDTRANS_SERVER_KEY = "SB-Mid-server-bS9phW7kMqLO0jGb3Q9n7INz"
const MIDTRANS_BASE_URL = "https://api.sandbox.midtrans.com/v2"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, amount, payment_method, customer_details, item_details } = body

    console.log("Creating payment with method:", payment_method)
    console.log("Order ID:", order_id)
    console.log("Amount:", amount)

    // Prepare the correct payload format for Midtrans
    const payload = {
      transaction_details: {
        order_id,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customer_details.first_name || "Customer",
        last_name: customer_details.last_name || "",
        email: customer_details.email || "customer@example.com",
        phone: customer_details.phone || "08123456789",
        billing_address: {
          first_name: customer_details.first_name || "Customer",
          last_name: customer_details.last_name || "",
          address: customer_details.billing_address?.address || "Jakarta",
          city: customer_details.billing_address?.city || "Jakarta",
          postal_code: customer_details.billing_address?.postal_code || "12345",
          country_code: "IDN",
        },
      },
      item_details,
      enabled_payments: getEnabledPayments(payment_method),
      credit_card: {
        secure: true,
      },
    }

    console.log("Sending payload to Midtrans:", JSON.stringify(payload, null, 2))

    // Use the correct Midtrans endpoint
    const endpoint = `${MIDTRANS_BASE_URL}/charge`
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
    console.log("Midtrans response:", JSON.stringify(result, null, 2))

    if (response.ok) {
      return NextResponse.json({
        success: true,
        payment_url:
          result.redirect_url || result.actions?.find((action: any) => action.name === "generate-qr-code")?.url,
        token: result.token,
        payment_method: payment_method,
        transaction_id: result.transaction_id,
        va_numbers: result.va_numbers,
        actions: result.actions,
        raw_response: result,
      })
    } else {
      console.error("Midtrans error:", result)
      return NextResponse.json({
        success: false,
        message: result.error_messages?.[0] || result.status_message || "Payment creation failed",
        error_details: result,
      })
    }
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error: " + error.message,
    })
  }
}

function getEnabledPayments(payment_method: string) {
  console.log("Getting enabled payments for:", payment_method)

  switch (payment_method) {
    case "credit_card":
      return ["credit_card"]
    case "bca_va":
      return ["bca_va"]
    case "bni_va":
      return ["bni_va"]
    case "bri_va":
      return ["bri_va"]
    case "mandiri_va":
      return ["echannel"]
    case "permata_va":
      return ["permata_va"]
    case "gopay":
      return ["gopay"]
    case "shopeepay":
      return ["shopeepay"]
    case "ovo":
      return ["ovo"]
    case "dana":
      return ["dana"]
    case "linkaja":
      return ["linkaja"]
    case "qris":
      return ["qris"]
    default:
      // Fallback to common payment methods
      return ["credit_card", "bca_va", "bni_va", "bri_va", "gopay", "shopeepay"]
  }
}
