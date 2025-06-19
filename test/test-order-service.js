// Test script to validate order service functionality
import { OrderService } from '../lib/services/orderService'

// Mock order data
const testOrderData = {
  order_id: 'TEST-' + Date.now(),
  service_type: 'kiloan' as const,
  weight: 2.5,
  address: 'Jl. Test No. 123, Jakarta',
  pickup_date: '2025-06-20',
  pickup_time: '10:00',
  contact_name: 'John Doe',
  contact_phone: '08123456789',
  notes: 'Handle with care',
  total_price: 25000,
  customer_details: {
    email: 'test@example.com',
    name: 'John Doe',
    phone: '08123456789'
  }
}

// Mock payment result
const testPaymentResult = {
  transaction_status: 'settlement',
  order_id: testOrderData.order_id,
  payment_type: 'qris',
  gross_amount: '25000',
  transaction_id: 'TXN-' + Date.now(),
  fraud_status: 'accept'
}

async function testOrderService() {
  console.log('Testing Order Service...')
  
  const orderService = new OrderService()
  
  try {
    const result = await orderService.createOrder(testOrderData, testPaymentResult)
    
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

// Run test
testOrderService()
