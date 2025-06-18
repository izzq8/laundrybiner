import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { transactionId: string } }) {
  try {
    const { transactionId } = params

    if (!transactionId) {
      return NextResponse.json({
        success: false,
        message: "Transaction ID is required",
      }, { status: 400 })
    }    // Get order details from database using midtrans_transaction_id
    const { data: order, error } = await supabaseAdmin
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
      .eq("midtrans_transaction_id", transactionId)
      .single()

    if (error) {
      console.error("Error fetching order:", error)
      return NextResponse.json({
        success: false,
        message: "Order not found",
      }, { status: 404 })
    }

    if (!order) {
      return NextResponse.json({
        success: false,
        message: "Order not found",
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: order,
    })

  } catch (error) {
    console.error("Error in GET /api/orders/[transactionId]:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 })
  }
}
