const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = "https://hynehzvcqpwbojjovmav.supabase.co"
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bmVoenZjcXB3Ym9qam92bWF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA0MjY4MSwiZXhwIjoyMDY1NjE4NjgxfQ.UYmmH_HSQcBS5vS4LNTpVea4v5FM8jf4SDukT02OfnA"

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkOrderSchema() {
  try {
    // Get the columns of the orders table
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error fetching orders schema:', error)
      return
    }
    
    if (orders && orders.length > 0) {
      console.log('Orders table columns:')
      console.log(Object.keys(orders[0]))
      console.log('\nSample order data:')
      console.log(orders[0])
    }
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

// Run the script
checkOrderSchema()
