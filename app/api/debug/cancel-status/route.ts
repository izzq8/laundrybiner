import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      )
    }

    console.log('Debug cancel order for ID:', orderId)

    // Get the current order first
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found',
        error: fetchError?.message,
        details: fetchError
      })
    }

    console.log('Current order status:', order.status)
    console.log('Current order data:', order)

    // Try to update just the status first
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'pending_cancellation',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()

    console.log('Update attempt result:', { updatedOrder, updateError })

    if (updateError) {
      console.error('Update error details:', updateError)
      return NextResponse.json({
        success: false,
        message: 'Update failed',
        error: updateError.message,
        details: {
          code: updateError.code,
          hint: updateError.hint,
          details: updateError.details,
          message: updateError.message
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Debug update successful',
      data: {
        originalOrder: order,
        updatedOrder: updatedOrder
      }
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      message: 'Debug failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function GET() {
  try {
    console.log('🔍 Debug: Checking cancel status capability...')

    // First, let's just try to get an order and check what happens
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, order_number')
      .limit(3)

    console.log('📋 Found orders:', orders?.length || 0)

    if (fetchError) {
      console.error('❌ Error fetching orders:', fetchError)
      return NextResponse.json({
        success: false,
        message: 'Error fetching orders',
        error: fetchError.message
      })
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orders found to test',
        orders: []
      })
    }

    // Try to update one order to pending_cancellation
    const testOrder = orders[0]
    console.log('🧪 Testing with order:', testOrder.id, testOrder.status)

    const { data: updateResult, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'pending_cancellation',
        updated_at: new Date().toISOString()
      })
      .eq('id', testOrder.id)
      .select()

    console.log('🔄 Update result:', { updateResult, updateError })

    if (updateError) {
      console.error('❌ Update failed:', updateError)
      return NextResponse.json({
        success: false,
        message: 'Failed to update to pending_cancellation',
        error: updateError.message,
        testOrderId: testOrder.id,
        originalStatus: testOrder.status
      })
    }

    // Revert the change
    await supabase
      .from('orders')
      .update({ 
        status: testOrder.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', testOrder.id)

    return NextResponse.json({
      success: true,
      message: 'pending_cancellation status works!',
      testOrderId: testOrder.id,
      originalStatus: testOrder.status,
      updateResult
    })

  } catch (error) {
    console.error('💥 Debug error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Debug failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
