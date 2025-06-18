import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, we'll fetch all orders
    // In a real app, you'd authenticate the user and fetch only their orders
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items (*),
        addresses (address)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message
      }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedOrders = orders.map(order => ({
      id: order.id,
      order_number: order.order_number || `LB-${new Date(order.created_at).getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      status: order.status,
      total_amount: order.total_price,
      pickup_date: order.pickup_date,
      delivery_date: order.delivery_date,
      created_at: order.created_at,
      payment_status: order.payment_status,
      service_type: order.service_type,
      weight: order.weight,
      contact_name: order.contact_name,
      contact_phone: order.contact_phone,
      notes: order.notes,
      items: order.order_items && order.order_items.length > 0 ? 
        order.order_items.map((item: any) => ({
          service_type: order.service_type,
          item_type: item.item_type,
          quantity: item.quantity,
          price: item.total_price,
        })) : 
        [{
          service_type: order.service_type,
          item_type: order.service_type === 'kiloan' ? `${order.weight} kg` : 'Mixed Items',
          quantity: order.service_type === 'kiloan' ? order.weight : 1,
          price: order.total_price,
        }]
    }))

    return NextResponse.json({
      success: true,
      orders: transformedOrders
    })

  } catch (error) {
    console.error("Error in orders API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
