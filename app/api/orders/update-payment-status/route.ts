import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentStatus, orderStatus, midtransOrderId } = body

    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: "Order ID is required"
      }, { status: 400 })
    }

    // Update order payment status and order status
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // If payment status is provided, update it
    if (paymentStatus) {
      updateData.payment_status = paymentStatus
    }

    // If order status is provided, update it too
    if (orderStatus) {
      updateData.status = orderStatus
    }

    // If midtrans order ID is provided, update it
    if (midtransOrderId) {
      updateData.midtrans_order_id = midtransOrderId
    }

    const { data: updatedOrder, error } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single()

    if (error) {
      console.error("Error updating order:", error)
      return NextResponse.json({
        success: false,
        message: "Failed to update order status",
        error: error.message
      }, { status: 500 })
    }    console.log(`Order ${orderId} updated successfully`)

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder
    })

  } catch (error) {
    console.error("Error in update payment status API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
