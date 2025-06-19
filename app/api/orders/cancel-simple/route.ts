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

    console.log('🚀 Simple cancel order request:', { orderId, reason })

    // Step 1: Get the current order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, order_number, notes')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      console.error('❌ Order not found:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Step 2: Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Order cannot be cancelled. Current status: ${order.status}` 
        },
        { status: 400 }
      )
    }

    console.log('✅ Order found and can be cancelled:', order)

    // Step 3: Simple update - just status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'pending_cancellation' })
      .eq('id', orderId)

    if (updateError) {
      console.error('❌ Update failed:', updateError)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to update order status',
          error: updateError.message,
          code: updateError.code,
          hint: updateError.hint
        },
        { status: 500 }
      )
    }

    console.log('✅ Status updated successfully')

    // Step 4: Try to add cancellation note (optional - don't fail if this fails)
    if (reason) {
      const cancelNote = `\n\n[CANCEL REQUEST - ${new Date().toISOString()}] ${reason}`
      const newNotes = order.notes ? order.notes + cancelNote : cancelNote.trim()
      
      const { error: notesError } = await supabase
        .from('orders')
        .update({ notes: newNotes })
        .eq('id', orderId)

      if (notesError) {
        console.warn('⚠️ Notes update failed (but cancellation succeeded):', notesError)
      } else {
        console.log('✅ Notes updated successfully')
      }
    }

    // Step 5: Get updated order for response
    const { data: updatedOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    return NextResponse.json({
      success: true,
      message: 'Order cancellation request submitted successfully',
      data: updatedOrder || { id: orderId, status: 'pending_cancellation' }
    })

  } catch (error) {
    console.error('❌ Unexpected error in simple cancel:', error)
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
