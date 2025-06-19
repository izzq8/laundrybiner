import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Order creation request body:', JSON.stringify(body, null, 2))

    const {
      serviceType,
      serviceTypeId,
      weight,
      items,
      pickupAddress,
      pickupDate,
      pickupTime,
      contactName,
      contactPhone,
      notes,
      transactionId
    } = body

    // Validate required fields
    if (!serviceTypeId) {
      console.error('Missing serviceTypeId')
      return NextResponse.json(
        { success: false, message: 'Service type is required' },
        { status: 400 }
      )
    }

    if (!contactName || !contactPhone || !pickupAddress) {
      console.error('Missing required contact fields')
      return NextResponse.json(
        { success: false, message: 'Contact information is required' },
        { status: 400 }
      )
    }

    // Calculate total amount
    let totalAmount = 0
    if (serviceType === 'kiloan' && weight) {
      // Get service type price
      const { data: serviceData, error: serviceError } = await supabaseAdmin
        .from('service_types')
        .select('price')
        .eq('id', serviceTypeId)
        .single()

      if (serviceError) {
        console.error('Error fetching service type:', serviceError)
        return NextResponse.json(
          { success: false, message: 'Invalid service type' },
          { status: 400 }
        )
      }

      totalAmount = serviceData.price * weight
    } else if (serviceType === 'satuan' && items?.length > 0) {
      totalAmount = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0)
    }

    // Add pickup and delivery fees
    totalAmount += 10000 // 5000 pickup + 5000 delivery

    console.log('Calculated total amount:', totalAmount)

    // Use demo user ID
    const demoUserId = '550e8400-e29b-41d4-a716-446655440000'    // Prepare order data
    const orderData = {
      user_id: demoUserId,
      service_type_id: serviceTypeId,
      weight: serviceType === 'kiloan' ? weight : null,
      total_amount: totalAmount,
      pickup_date: pickupDate || null,
      pickup_time: pickupTime || null,
      customer_name: contactName,
      customer_phone: contactPhone,
      customer_email: null,
      pickup_address: pickupAddress,
      notes: notes || null,
      status: 'pending',
      payment_status: 'pending',
      midtrans_transaction_id: transactionId || null
    }

    console.log('Order data to insert:', JSON.stringify(orderData, null, 2))

    // Insert order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to create order',
          error: orderError.message 
        },
        { status: 500 }
      )
    }

    console.log('Order created successfully:', order)

    // Insert order items for satuan orders
    if (serviceType === 'satuan' && items?.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        item_type_id: item.itemTypeId,
        quantity: item.quantity,
        price: item.pricePerItem,
        total_price: item.totalPrice
      }))

      console.log('Order items to insert:', JSON.stringify(orderItems, null, 2))

      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
        // Don't fail the whole order for this
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status,
        payment_status: order.payment_status
      }
    })
  } catch (error) {
    console.error('Unexpected error in order creation:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
