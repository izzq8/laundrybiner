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

    console.log('Cancel order request:', { orderId, reason })

    // Get the current order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    console.log('Fetch order result:', { order: order?.id, error: fetchError })

    if (fetchError) {
      console.error('Error fetching order:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Order not found', error: fetchError.message },
        { status: 404 }
      )
    }

    if (!order) {
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

    // Try multiple approaches to update the order
    let updateResult = null
    let updateError = null

    // Method 1: Update status only first
    console.log('Attempting Method 1: Status only update')
    const { data: statusUpdateResult, error: statusError } = await supabase
      .from('orders')
      .update({ 
        status: 'pending_cancellation',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()

    if (statusError) {
      console.error('Method 1 failed:', statusError)
      
      // Method 2: Try without updated_at
      console.log('Attempting Method 2: Status only without updated_at')
      const { data: statusUpdateResult2, error: statusError2 } = await supabase
        .from('orders')
        .update({ status: 'pending_cancellation' })
        .eq('id', orderId)
        .select()

      if (statusError2) {
        console.error('Method 2 failed:', statusError2)
          // Method 3: Try with RPC function (if exists) or raw SQL
        console.log('Attempting Method 3: Using RPC function')
        try {
          const { data: rpcResult, error: rpcError } = await supabase.rpc('update_order_status', {
            order_id: orderId,
            new_status: 'pending_cancellation'
          })

          if (rpcError) {
            console.error('Method 3 (RPC) failed:', rpcError)
            updateError = statusError // Use the first error for response
          } else {
            updateResult = [{ id: orderId, status: 'pending_cancellation' }]
            console.log('Method 3 (RPC) succeeded:', rpcResult)
          }
        } catch (rpcError) {
          console.error('Method 3 (RPC) exception:', rpcError)
          updateError = statusError
        }
      } else {
        updateResult = statusUpdateResult2
      }
    } else {
      updateResult = statusUpdateResult
    }

    // If all methods failed, return error
    if (updateError && !updateResult) {
      console.error('All update methods failed. Final error:', updateError)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to update order status',
          error: updateError.message,
          details: {
            code: updateError.code,
            hint: updateError.hint,
            details: updateError.details,
            message: updateError.message
          }
        },
        { status: 500 }
      )
    }

    // If status update succeeded, try to update notes separately
    if (updateResult) {
      const cancelNote = reason ? `[CANCEL REQUEST] ${reason}` : '[CANCEL REQUEST] User requested cancellation'
      const newNotes = order.notes ? `${order.notes}\n\n${cancelNote}` : cancelNote

      const { error: notesError } = await supabase
        .from('orders')
        .update({ notes: newNotes })
        .eq('id', orderId)

      if (notesError) {
        console.warn('Notes update failed, but status update succeeded:', notesError)
        // Don't fail the whole operation if notes update fails
      }
    }

    // Get the final updated order
    const { data: finalOrder, error: finalFetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (finalFetchError) {
      console.warn('Could not fetch final order state:', finalFetchError)
    }

    // Log the cancellation request for admin tracking
    console.log(`🚫 Order cancellation requested:`, {
      orderId,
      orderNumber: order.order_number,
      reason: reason || 'No reason provided',
      timestamp: new Date().toISOString(),
      success: true
    })

    return NextResponse.json({
      success: true,
      message: 'Cancellation request submitted successfully',
      data: finalOrder || { id: orderId, status: 'pending_cancellation' }
    })

  } catch (error) {
    console.error('Error processing cancellation request:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    )
  }
}
