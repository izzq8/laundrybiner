import { type NextRequest, NextResponse } from "next/server"

const MIDTRANS_SERVER_KEY = "SB-Mid-server-bS9phW7kMqLO0jGb3Q9n7INz"
const MIDTRANS_BASE_URL = "https://api.sandbox.midtrans.com/v2"

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params

    const response = await fetch(`${MIDTRANS_BASE_URL}/${orderId}/status`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
      },
    })

    const result = await response.json()

    if (response.ok) {
      let status = "pending"
      if (result.transaction_status === "settlement" || result.transaction_status === "capture") {
        status = "success"
      } else if (["deny", "cancel", "expire"].includes(result.transaction_status)) {
        status = "failed"
      }

      return NextResponse.json({
        success: true,
        status,
        data: result,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Failed to get payment status",
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    })
  }
}
