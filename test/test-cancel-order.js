// Test script untuk debugging cancel order
const testCancelOrder = async () => {
  const orderId = 'YOUR_ORDER_ID_HERE' // Ganti dengan order ID yang valid
  
  try {
    const response = await fetch('/api/orders/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: orderId,
        reason: 'Test cancel order'
      }),
    })

    const data = await response.json()
    console.log('Cancel order response:', data)
    
    if (data.success) {
      console.log('✅ Order cancelled successfully')
    } else {
      console.error('❌ Cancel order failed:', data.message)
      if (data.details) {
        console.error('Error details:', data.details)
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error)
  }
}

// Uncomment untuk test
// testCancelOrder()

export default testCancelOrder
