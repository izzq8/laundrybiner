const { OrderService } = require('../lib/services/orderService.js')

// Test the order service
async function testOrderService() {
  console.log('Testing Order Service...')
  
  const orderService = new OrderService()
  
  // Sample order data
  const sampleOrderData = {
    order_id: 'TEST-' + Date.now(),
    service_type: 'kiloan',
    weight: 5,
    address: 'Jl. Test Street No. 123, Jakarta',
    pickup_date: '2025-06-20',
    pickup_time: '10:00',
    contact_name: 'John Doe',
    contact_phone: '08123456789',
    notes: 'Test order from script',
    total_price: 25000,
    customer_details: {
      email: 'test@example.com',
      name: 'John Doe',
      phone: '08123456789'
    }
  }
  
  // Sample payment result
  const samplePaymentResult = {
    transaction_status: 'settlement',
    order_id: sampleOrderData.order_id,
    payment_type: 'qris',
    gross_amount: '25000',
    transaction_id: 'TXN-' + Date.now(),
    fraud_status: 'accept',
    transaction_time: new Date().toISOString()
  }
  
  try {
    const result = await orderService.createOrder(sampleOrderData, samplePaymentResult)
    
    if (result.success) {
      console.log('✅ Order created successfully!')
      console.log('Order ID:', result.orderId)
    } else {
      console.log('❌ Order creation failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testOrderService()
