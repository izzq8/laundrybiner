import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, userId } = body

    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: "Order ID is required"
      }, { status: 400 })
    }

    // Check if order exists and is in delivered status
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, status, customer_name, order_number")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({
        success: false,
        message: "Order not found"
      }, { status: 404 })
    }

    if (order.status !== "delivered") {
      return NextResponse.json({
        success: false,
        message: "Only delivered orders can be finished"
      }, { status: 400 })
    }

    // Check if order is already completed
    if (order.status === "completed") {
      return NextResponse.json({
        success: false,
        message: "Order is already completed"
      }, { status: 400 })
    }

    // Update order status to finished (we'll use a new status or keep as delivered until feedback)
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "delivered", // Keep as delivered until feedback is given
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json({
        success: false,
        message: "Failed to finish order"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Order is ready to be finished. Please provide feedback to complete the order.",
      data: updatedOrder
    })

  } catch (error) {
    console.error("Finish order error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
