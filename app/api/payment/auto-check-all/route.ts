import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Midtrans configuration
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-bS9phW7kMqLO0jGb3Q9n7INz"
const MIDTRANS_BASE_URL = process.env.MIDTRANS_SANDBOX === 'false' 
  ? "https://api.midtrans.com" 
  : "https://api.sandbox.midtrans.com"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting automatic payment status check for all pending orders...")

    // Get all orders with pending payment status that are not older than 48 hours
    const twoDaysAgo = new Date()
    twoDaysAgo.setHours(twoDaysAgo.getHours() - 48)

    const { data: pendingOrders, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, midtrans_order_id, payment_status, created_at")
      .eq("payment_status", "pending")
      .gte("created_at", twoDaysAgo.toISOString())
      .not("midtrans_order_id", "is", null)

    if (fetchError) {
      console.error("Error fetching pending orders:", fetchError)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch pending orders"
      }, { status: 500 })
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      console.log("✅ No pending orders found to check")
      return NextResponse.json({
        success: true,
        message: "No pending orders to check",
        checked: 0,
        updated: 0
      })
    }

    console.log(`📋 Found ${pendingOrders.length} pending orders to check`)

    let checkedCount = 0
    let updatedCount = 0
    const results = []

    for (const order of pendingOrders) {
      try {
        console.log(`🔍 Checking payment status for order ${order.order_number}...`)
        
        // Check payment status from Midtrans
        const midtransResponse = await fetch(
          `${MIDTRANS_BASE_URL}/v2/${order.midtrans_order_id}/status`,
          {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Authorization": `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')}`
            }
          }
        )

        checkedCount++

        if (!midtransResponse.ok) {
          console.warn(`⚠️  Failed to check payment status for order ${order.order_number}`)
          results.push({
            orderId: order.id,
            orderNumber: order.order_number,
            status: 'error',
            message: 'Failed to check Midtrans status'
          })
          continue
        }

        const midtransData = await midtransResponse.json()
        console.log(`📊 Midtrans status for ${order.order_number}:`, midtransData.transaction_status)

        // Determine order status based on transaction status
        let orderStatus = "pending"
        let paymentStatus = "pending"

        const { transaction_status, fraud_status } = midtransData

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
        }

        // Only update if status has changed
        if (paymentStatus !== order.payment_status) {
          console.log(`🔄 Updating order ${order.order_number}: ${order.payment_status} -> ${paymentStatus}`)
          
          const { error: updateError } = await supabaseAdmin
            .from("orders")
            .update({
              status: orderStatus,
              payment_status: paymentStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id)

          if (updateError) {
            console.error(`❌ Error updating order ${order.order_number}:`, updateError)
            results.push({
              orderId: order.id,
              orderNumber: order.order_number,
              status: 'error',
              message: 'Failed to update order status'
            })
          } else {
            console.log(`✅ Successfully updated order ${order.order_number}`)
            updatedCount++
            results.push({
              orderId: order.id,
              orderNumber: order.order_number,
              status: 'updated',
              oldStatus: order.payment_status,
              newStatus: paymentStatus
            })
          }
        } else {
          results.push({
            orderId: order.id,
            orderNumber: order.order_number,
            status: 'unchanged',
            currentStatus: paymentStatus
          })
        }

        // Small delay to avoid overwhelming Midtrans API
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`❌ Error processing order ${order.order_number}:`, error)
        results.push({
          orderId: order.id,
          orderNumber: order.order_number,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log(`🎉 Auto payment check completed: ${checkedCount} checked, ${updatedCount} updated`)

    return NextResponse.json({
      success: true,
      message: `Checked ${checkedCount} orders, updated ${updatedCount} orders`,
      checked: checkedCount,
      updated: updatedCount,
      results
    })

  } catch (error) {
    console.error("❌ Error in automatic payment status check:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
