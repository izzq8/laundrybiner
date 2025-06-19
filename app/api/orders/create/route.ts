import { NextRequest, NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"

// Generate unique order number
function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `LDR${dateStr}${randomStr}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received order data:", body)

    // Handle both old and new API format
    const orderData = body.orderData || body
    const paymentResult = body.paymentResult || null

    // Validate required fields
    const requiredFields = ['address', 'pickup_date', 'pickup_time', 'service_type', 'contact_name', 'contact_phone', 'total_price']
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return NextResponse.json({
          success: false,
          message: `Field ${field} is required`
        }, { status: 400 })
      }
    }

    // For demo purposes, use a dummy user ID
    // In production, get this from authentication
    const dummyUserId = "550e8400-e29b-41d4-a716-446655440000"

    // Ensure user exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", dummyUserId)
      .single()

    if (!existingUser) {
      // Create dummy user
      const { error: userError } = await supabaseAdmin
        .from("users")
        .insert({
          id: dummyUserId,
          email: orderData.customer_details?.email || "customer@example.com",
          name: orderData.customer_details?.name || orderData.contact_name,
          phone: orderData.customer_details?.phone || orderData.contact_phone
        })

      if (userError) {
        console.error("Error creating user:", userError)
      }

      // Also create profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: dummyUserId,
          email: orderData.customer_details?.email || "customer@example.com",
          full_name: orderData.customer_details?.name || orderData.contact_name,
          phone: orderData.customer_details?.phone || orderData.contact_phone,
          role: "customer"
        })

      if (profileError) {
        console.error("Error creating profile:", profileError)
      }
    }

    // Create or get address
    let addressId = null
    const { data: addressData, error: addressError } = await supabaseAdmin
      .from("addresses")
      .insert({
        user_id: dummyUserId,
        address: orderData.address,
        label: "Pickup Address",
        is_default: false
      })
      .select()
      .single()

    if (addressError) {
      console.error("Error creating address:", addressError)
    } else {
      addressId = addressData.id
    }

    // Prepare order data
    const newOrderData = {
      user_id: dummyUserId,
      address_id: addressId,
      order_number: orderData.order_id || generateOrderNumber(),
      pickup_date: orderData.pickup_date,
      pickup_time: orderData.pickup_time,
      service_type: orderData.service_type,
      weight: orderData.service_type === 'kiloan' ? parseFloat(orderData.weight) : null,
      items: orderData.service_type === 'satuan' ? orderData.satuan_items || [] : null,
      contact_name: orderData.contact_name,
      contact_phone: orderData.contact_phone,
      notes: orderData.notes || null,
      status: paymentResult?.transaction_status === 'settlement' || 
              paymentResult?.transaction_status === 'capture' ? 'confirmed' : 'pending',
      total_price: parseInt(orderData.total_price),
      payment_method: paymentResult?.payment_type || orderData.payment_method || null,
      payment_status: paymentResult?.transaction_status === 'settlement' || 
                     paymentResult?.transaction_status === 'capture' ? 'paid' : 'pending',
      transaction_id: paymentResult?.transaction_id || orderData.transaction_id || null,
      payment_token: orderData.payment_token || null,
      pickup_address: orderData.address, // Store address for historical record
      special_instructions: orderData.special_instructions || null,
      fraud_status: paymentResult?.fraud_status || null,
      transaction_time: paymentResult?.transaction_time ? 
                       new Date(paymentResult.transaction_time).toISOString() : null
    }

    console.log("Inserting order data:", newOrderData)

    // Insert order
    const { data: orderResult, error: insertOrderError } = await supabaseAdmin
      .from("orders")
      .insert(newOrderData)
      .select()
      .single()

    if (insertOrderError) {
      console.error("Error creating order:", insertOrderError)
      return NextResponse.json({
        success: false,
        error: `Failed to create order: ${insertOrderError.message}`
      }, { status: 500 })
    }

    // Insert order items if satuan service
    if (orderData.service_type === 'satuan' && orderData.satuan_items && orderData.satuan_items.length > 0) {
      const orderItemsData = orderData.satuan_items.map((item: any) => ({
        order_id: orderResult.id,
        item_type_id: item.item_type_id || null,
        item_name: item.item_type || item.name || 'Item',
        quantity: parseInt(item.quantity),
        price_per_item: parseInt(item.price_per_item),
        total_price: parseInt(item.quantity) * parseInt(item.price_per_item),
        special_treatment: item.special_treatment || null
      }))

      const { error: itemsError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItemsData)

      if (itemsError) {
        console.error("Error creating order items:", itemsError)
        // Don't fail the whole order creation for items error
      }
    }

    console.log("Order created successfully:", orderResult)

    return NextResponse.json({
      success: true,
      orderId: orderResult.id,
      orderNumber: orderResult.order_number,
      message: "Order created successfully"
    })

  } catch (error) {
    console.error("Error in order creation API:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 })
  }
}
