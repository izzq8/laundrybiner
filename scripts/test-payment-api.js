const fetch = require('node-fetch')
require('dotenv').config({ path: '.env.local' })

async function testPaymentAPI() {
  console.log('🧪 Testing Payment API...\n')
  
  // Test payload
  const testPayload = {
    order_id: `TEST-${Date.now()}`,
    amount: 60000,
    customer_details: {
      first_name: "Test Customer",
      email: "test@example.com",
      phone: "08123456789"
    },
    item_details: [
      {
        id: "test-item",
        name: "Test Laundry Service",
        price: 50000,
        quantity: 1
      },
      {
        id: "pickup-fee",
        name: "Biaya Penjemputan",
        price: 5000,
        quantity: 1
      },
      {
        id: "delivery-fee",
        name: "Biaya Pengantaran",
        price: 5000,
        quantity: 1
      }
    ]
  }
  
  console.log('📦 Test Payload:')
  console.log(JSON.stringify(testPayload, null, 2))
  
  try {
    console.log('\n🚀 Sending request to payment API...')
    
    const response = await fetch('http://localhost:3000/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    })
    
    const result = await response.json()
    
    console.log('\n📊 Response Status:', response.status)
    console.log('📋 Response Body:')
    console.log(JSON.stringify(result, null, 2))
    
    if (result.success) {
      console.log('\n✅ Payment API Test: SUCCESS')
      console.log('🎯 Snap Token:', result.token ? 'Generated' : 'Missing')
      console.log('🔗 Payment URL:', result.payment_url ? 'Available' : 'Missing')
    } else {
      console.log('\n❌ Payment API Test: FAILED')
      console.log('💥 Error:', result.message)
    }
    
  } catch (error) {
    console.log('\n💥 Request Failed:', error.message)
    console.log('🔧 Make sure the development server is running: npm run dev')
  }
}

// Run the test
testPaymentAPI()
