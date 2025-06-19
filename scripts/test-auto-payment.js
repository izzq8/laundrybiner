/**
 * Test script for automatic payment status checking
 * Run with: node scripts/test-auto-payment.js
 */

const BASE_URL = 'http://localhost:3000'

async function testAutoPaymentEndpoints() {
  console.log('🧪 Testing Automatic Payment Status System...\n')

  // Test 1: Check individual order payment status
  console.log('📋 Test 1: Individual Order Payment Status Check')
  try {
    const response = await fetch(`${BASE_URL}/api/orders/check-payment-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId: 'test-order-id' }),
    })

    const data = await response.json()
    console.log('✅ Individual check endpoint:', response.status, data.success ? 'SUCCESS' : 'FAILED')
  } catch (error) {
    console.log('❌ Individual check endpoint: ERROR -', error.message)
  }

  console.log()

  // Test 2: Check bulk payment status update
  console.log('📋 Test 2: Bulk Payment Status Check')
  try {
    const response = await fetch(`${BASE_URL}/api/payment/auto-check-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log('✅ Bulk check endpoint:', response.status, data.success ? 'SUCCESS' : 'FAILED')
    if (data.success) {
      console.log(`   📊 Checked: ${data.checked} orders, Updated: ${data.updated} orders`)
    }
  } catch (error) {
    console.log('❌ Bulk check endpoint: ERROR -', error.message)
  }

  console.log()

  // Test 3: Manual status update (existing endpoint)
  console.log('📋 Test 3: Manual Status Update')
  try {
    const response = await fetch(`${BASE_URL}/api/payment/manual-status-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId: 'test-order-id' }),
    })

    const data = await response.json()
    console.log('✅ Manual update endpoint:', response.status, data.success ? 'SUCCESS' : 'FAILED')
  } catch (error) {
    console.log('❌ Manual update endpoint: ERROR -', error.message)
  }

  console.log()

  // Test 4: Get orders list
  console.log('📋 Test 4: Orders List')
  try {
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log('✅ Orders list endpoint:', response.status, data.success ? 'SUCCESS' : 'FAILED')
    if (data.success && data.data) {
      console.log(`   📊 Found: ${data.data.length} orders`)
      
      // Show pending orders count
      const pendingOrders = data.data.filter(order => order.payment_status === 'pending')
      console.log(`   ⏳ Pending payment: ${pendingOrders.length} orders`)
    }
  } catch (error) {
    console.log('❌ Orders list endpoint: ERROR -', error.message)
  }

  console.log('\n🎉 Testing completed!')
  console.log('\n📝 Next steps:')
  console.log('1. Create a test order through the UI')
  console.log('2. Make payment in Midtrans Sandbox')
  console.log('3. Watch the console logs for auto-polling activity')
  console.log('4. Verify status changes automatically within 30-120 seconds')
}

// Helper function to simulate creating a test order
async function createTestOrder() {
  console.log('🛒 Creating test order...')
  
  const testOrder = {
    serviceType: 'kiloan',
    serviceTypeId: '1',
    weight: 2,
    items: [],
    pickupOption: 'pickup',
    pickupAddress: 'Test Address, Jakarta',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '10:00',
    deliveryOption: 'delivery',
    deliveryAddress: 'Test Delivery Address, Jakarta',
    deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliveryTime: '15:00',
    contactName: 'Test Customer',
    contactPhone: '08123456789',
    notes: 'Auto-payment test order',
    transactionId: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  try {
    const response = await fetch(`${BASE_URL}/api/orders/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder),
    })

    const data = await response.json()
    
    if (data.success && data.order) {
      console.log('✅ Test order created successfully!')
      console.log(`   📋 Order ID: ${data.order.id}`)
      console.log(`   📋 Order Number: ${data.order.order_number}`)
      console.log(`   💰 Total Amount: Rp ${data.order.total_amount.toLocaleString()}`)
      console.log(`   📱 Visit: ${BASE_URL}/orders/${data.order.id}`)
      return data.order
    } else {
      console.log('❌ Failed to create test order:', data.message)
      return null
    }
  } catch (error) {
    console.log('❌ Error creating test order:', error.message)
    return null
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--create-test-order')) {
    await createTestOrder()
    console.log()
  }
  
  await testAutoPaymentEndpoints()
}

main().catch(console.error)
