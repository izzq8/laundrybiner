const fetch = require('node-fetch')
require('dotenv').config({ path: '.env.local' })

async function testMidtransPayload() {
  console.log('🧪 Testing Midtrans Payload Format...\n')
  
  // Test dengan payload yang valid
  const validPayload = {
    order_id: `TEST-${Date.now()}`,
    amount: 60000,
    customer_details: {
      first_name: "John",
      email: "john@example.com",
      phone: "08123456789"
    },
    item_details: [
      {
        id: "laundry-service",
        name: "Cuci Setrika Premium",
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
  console.log(JSON.stringify(validPayload, null, 2))
  
  try {
    console.log('\n🚀 Sending request to payment API...')
    
    const response = await fetch('http://localhost:3000/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validPayload)
    })
    
    const result = await response.json()
    
    console.log('\n📊 Response Status:', response.status)
    console.log('📋 Response Body:')
    console.log(JSON.stringify(result, null, 2))
    
    if (result.success && result.token) {
      console.log('\n✅ Payment API Test: SUCCESS')
      console.log('🎯 Snap Token:', result.token.substring(0, 20) + '...')
      console.log('🔗 Payment URL:', result.payment_url ? 'Available' : 'Missing')
      
      // Test token dengan simulator Midtrans
      console.log('\n🔍 Raw Midtrans Response:')
      if (result.raw_response) {
        console.log('- Token:', result.raw_response.token ? 'Generated' : 'Missing')
        console.log('- Redirect URL:', result.raw_response.redirect_url ? 'Available' : 'Missing')
        console.log('- Errors:', result.raw_response.error_messages || 'None')
      }
    } else {
      console.log('\n❌ Payment API Test: FAILED')
      console.log('💥 Error:', result.message)
      console.log('📋 Error Details:', result.error_details)
    }
    
  } catch (error) {
    console.log('\n💥 Request Failed:', error.message)
    console.log('🔧 Make sure the development server is running: npm run dev')
  }
}

// Fungsi untuk test payload dengan validasi
function validatePayload(payload) {
  console.log('\n🔍 Validating Payload...')
  
  const errors = []
  
  // Validasi order_id
  if (!payload.order_id || typeof payload.order_id !== 'string') {
    errors.push('❌ order_id harus berupa string yang valid')
  }
  
  // Validasi amount
  if (!payload.amount || typeof payload.amount !== 'number' || payload.amount <= 0) {
    errors.push('❌ amount harus berupa number positif')
  }
  
  // Validasi customer_details
  if (!payload.customer_details) {
    errors.push('❌ customer_details diperlukan')
  } else {
    if (!payload.customer_details.first_name) {
      errors.push('❌ customer_details.first_name diperlukan')
    }
    if (!payload.customer_details.email) {
      errors.push('❌ customer_details.email diperlukan')
    }
    if (!payload.customer_details.phone) {
      errors.push('❌ customer_details.phone diperlukan')
    }
  }
  
  // Validasi item_details
  if (!Array.isArray(payload.item_details) || payload.item_details.length === 0) {
    errors.push('❌ item_details harus berupa array dengan minimal 1 item')
  } else {
    let totalItemPrice = 0
    payload.item_details.forEach((item, index) => {
      if (!item.id) errors.push(`❌ item_details[${index}].id diperlukan`)
      if (!item.name) errors.push(`❌ item_details[${index}].name diperlukan`)
      if (typeof item.price !== 'number' || item.price <= 0) {
        errors.push(`❌ item_details[${index}].price harus berupa number positif`)
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`❌ item_details[${index}].quantity harus berupa number positif`)
      }
      totalItemPrice += (item.price || 0) * (item.quantity || 0)
    })
    
    // Validasi total amount vs item details
    if (Math.abs(totalItemPrice - payload.amount) > 1) {
      errors.push(`❌ Total item_details (${totalItemPrice}) tidak sesuai dengan amount (${payload.amount})`)
    }
  }
  
  if (errors.length === 0) {
    console.log('✅ Payload validation: PASSED')
  } else {
    console.log('❌ Payload validation: FAILED')
    errors.forEach(error => console.log('  ', error))
  }
  
  return errors.length === 0
}

// Run tests
const testPayload = {
  order_id: `TEST-${Date.now()}`,
  amount: 60000,
  customer_details: {
    first_name: "John",
    email: "john@example.com", 
    phone: "08123456789"
  },
  item_details: [
    {
      id: "laundry-service",
      name: "Cuci Setrika Premium",
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

// Validate and test
if (validatePayload(testPayload)) {
  testMidtransPayload()
}
