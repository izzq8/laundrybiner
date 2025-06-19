const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = "https://hynehzvcqpwbojjovmav.supabase.co"
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bmVoenZjcXB3Ym9qam92bWF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA0MjY4MSwiZXhwIjoyMDY1NjE4NjgxfQ.UYmmH_HSQcBS5vS4LNTpVea4v5FM8jf4SDukT02OfnA"

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function updatePaymentStatus() {
  try {
    const orderId = 'fd4a83d6-a5ce-45b2-b563-2951110d1183'
    
    console.log(`Updating payment status for order: ${orderId}`)
    
    // First, let's check the current order status
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
    
    if (fetchError) {
      console.error('Error fetching order:', fetchError)
      return
    }
    
    console.log('Current order status:', {
      id: currentOrder.id,
      order_number: currentOrder.order_number,
      status: currentOrder.status,
      payment_status: currentOrder.payment_status,
      created_at: currentOrder.created_at
    })
      // Update the payment status and order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating order:', updateError)
      return
    }
    
    console.log('Order updated successfully!')
    console.log('New order status:', {
      id: updatedOrder.id,
      order_number: updatedOrder.order_number,
      status: updatedOrder.status,
      payment_status: updatedOrder.payment_status,
      updated_at: updatedOrder.updated_at
    })
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

// Run the script
updatePaymentStatus()
