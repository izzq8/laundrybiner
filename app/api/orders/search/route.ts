import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    
    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: "Order ID is required",
      }, { status: 400 })
    }

    console.log(`Looking for order with ID: ${orderId}`)

    // Search for order by multiple fields
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .or(`id.eq.${orderId},order_number.eq.${orderId},midtrans_order_id.eq.${orderId},midtrans_transaction_id.eq.${orderId}`)

    if (error) {
      console.error("Error searching order:", error)
      return NextResponse.json({
        success: false,
        message: "Failed to search order",
        error: error.message,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: orders,
      found: orders.length,
    })

  } catch (error) {
    console.error("Order search error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}
