import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Check if the constraint exists
    const { data: constraints, error: constraintError } = await supabase
      .rpc('sql', {
        query: `
          SELECT conname, consrc 
          FROM pg_constraint 
          WHERE conname = 'orders_status_check' 
          AND conrelid = 'public.orders'::regclass;
        `
      })

    if (constraintError) {
      console.error('Error checking constraints:', constraintError)
    }

    // Test inserting pending_cancellation status
    const { data: testUpdate, error: testError } = await supabase
      .from('orders')
      .select('id, status')
      .limit(1)
      .single()

    if (testUpdate) {
      // Try to update to pending_cancellation to test constraint
      const { error: updateTestError } = await supabase
        .from('orders')
        .update({ status: 'pending_cancellation' })
        .eq('id', testUpdate.id)
        .select()

      return NextResponse.json({
        success: true,
        constraintExists: !constraintError,
        constraints,
        testOrderId: testUpdate.id,
        originalStatus: testUpdate.status,
        updateTestError: updateTestError?.message || null,
        canUpdateToPendingCancellation: !updateTestError
      })
    }

    return NextResponse.json({
      success: true,
      constraintExists: !constraintError,
      constraints,
      testResult: 'No orders found to test'
    })

  } catch (error) {
    console.error('Debug error:', error)
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
