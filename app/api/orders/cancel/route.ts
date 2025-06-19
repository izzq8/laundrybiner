import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { orderId, reason } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get the current order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order can be cancelled
    // Only allow cancellation for orders that are not yet picked up/in process
    if (!['pending', 'confirmed'].includes(order.status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Order cannot be cancelled at this stage' 
        },
        { status: 400 }
      )
    }

    // Update order status to indicate user wants to cancel
    // We'll add a new field to track cancellation request
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'pending_cancellation',
        notes: order.notes 
          ? `${order.notes}\n\n[CANCEL REQUEST] ${reason || 'User requested cancellation'}`
          : `[CANCEL REQUEST] ${reason || 'User requested cancellation'}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update order status' },
        { status: 500 }
      )
    }

    // Log the cancellation request for admin tracking
    console.log(`🚫 Order cancellation requested:`, {
      orderId,
      orderNumber: order.order_number,
      reason: reason || 'No reason provided',
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Cancellation request submitted successfully'
    })

  } catch (error) {
    console.error('Error processing cancellation request:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
