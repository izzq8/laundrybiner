// Test script for manual payment status update
const testOrderId = '63fca420-dc4a-44bf-a1e9-ab931945a0b8' // From SQL attachment

async function testManualPaymentUpdate() {
  console.log('Testing manual payment status update...')
  console.log('Order ID:', testOrderId)
  
  try {
    const response = await fetch('http://localhost:3000/api/payment/manual-status-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        orderId: testOrderId 
      }),
    })

    console.log('Response status:', response.status)
    
    const data = await response.json()
    console.log('Response data:', JSON.stringify(data, null, 2))
    
    if (data.success) {
      console.log('✅ Manual payment update successful!')
      console.log('Order status:', data.order?.status)
      console.log('Payment status:', data.order?.payment_status)
      console.log('Midtrans transaction status:', data.midtrans_status?.transaction_status)
    } else {
      console.log('❌ Manual payment update failed:', data.message)
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testManualPaymentUpdate()
