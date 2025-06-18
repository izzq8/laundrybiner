import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: "Order ID is required"
      }, { status: 400 })
    }    // Fetch order with items using midtrans_transaction_id
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        service_types (
          name,
          type,
          price,
          description
        ),
        order_items (
          *,
          item_types (
            name,
            price,
            category
          )
        )
      `)
      .eq("midtrans_transaction_id", orderId)
      .single()

    if (orderError || !order) {
      console.error("Error fetching order:", orderError)
      return NextResponse.json({
        success: false,
        message: "Order not found"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: order
    })

  } catch (error) {
    console.error("Error in get order API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
