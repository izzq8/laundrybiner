/**
 * Test Auto Payment Status Check
 * 
 * Script ini akan membuat order dummy dan mengecek apakah auto payment check berfungsi
 */

const API_BASE = 'http://localhost:3000'

async function testAutoPaymentCheck() {
  console.log('🧪 Testing Auto Payment Status Check Implementation')
  console.log('=' .repeat(60))
  
  try {
    // Test 1: Create a dummy order
    console.log('1️⃣ Creating dummy order...')
      const orderData = {
      serviceType: 'kiloan',
      serviceTypeId: '15671ab0-0044-4e3c-8565-6dbc69e7603c', // Cuci Kering Regular
      weight: 2,
      items: [],
      pickupOption: 'pickup',
      pickupAddress: 'Jl. Test Auto Payment No. 123',
      pickupDate: '2025-06-20',
      pickupTime: '10:00',
      deliveryOption: 'delivery',
      deliveryAddress: 'Jl. Test Auto Payment No. 123',
      deliveryDate: '2025-06-23',
      deliveryTime: '14:00',
      contactName: 'Test Auto Payment',
      contactPhone: '08123456789',
      notes: 'Test order for auto payment check',
      transactionId: `TEST-AUTO-${Date.now()}`
    }

    const createResponse = await fetch(`${API_BASE}/api/orders/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    const createResult = await createResponse.json()
    
    if (!createResult.success) {
      console.log('❌ Failed to create order:', createResult.error)
      return
    }
    
    const orderId = createResult.order.id
    console.log(`✅ Order created successfully: ${orderId}`)
    console.log(`   Order Number: ${createResult.order.order_number}`)
    console.log(`   Payment Status: ${createResult.order.payment_status}`)
    
    // Test 2: Test manual payment status check endpoint
    console.log('\n2️⃣ Testing manual payment status check endpoint...')
    
    const checkResponse = await fetch(`${API_BASE}/api/orders/check-payment-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    })

    const checkResult = await checkResponse.json()
    
    if (checkResult.success) {
      console.log('✅ Manual check endpoint working')
      console.log(`   Current Status: ${checkResult.data.order.payment_status}`)
    } else {
      console.log('⚠️ Manual check endpoint response:', checkResult.message)
    }
    
    // Test 3: Simulate a Midtrans payment (create payment)
    console.log('\n3️⃣ Testing payment creation...')
    
    const paymentData = {
      order_id: `${createResult.order.order_number}-${Date.now()}`,
      amount: createResult.order.total_amount,
      customer_details: {
        first_name: orderData.contactName,
        phone: orderData.contactPhone,
        email: `${orderData.contactName.toLowerCase().replace(/\s+/g, '')}@laundrybiner.com`,
      },
      item_details: [
        {
          id: 'laundry-service',
          name: 'Layanan Laundry Kiloan',
          price: createResult.order.total_amount,
          quantity: 1,
        }
      ],
    }

    const paymentResponse = await fetch(`${API_BASE}/api/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    })

    const paymentResult = await paymentResponse.json()
    
    if (paymentResult.success) {
      console.log('✅ Payment creation successful')
      console.log(`   Payment URL: ${paymentResult.payment_url}`)
    } else {
      console.log('⚠️ Payment creation response:', paymentResult.message)
    }
    
    // Test 4: Test webhook endpoint (simulate Midtrans callback)
    console.log('\n4️⃣ Testing webhook simulation...')
    
    const webhookData = {
      transaction_status: 'settlement',
      order_id: paymentData.order_id,
      payment_type: 'qris',
      fraud_status: 'accept',
      transaction_time: new Date().toISOString(),
      gross_amount: createResult.order.total_amount.toString(),
      status_code: '200'
    }

    const webhookResponse = await fetch(`${API_BASE}/api/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    })

    const webhookResult = await webhookResponse.json()
    
    if (webhookResponse.ok) {
      console.log('✅ Webhook simulation successful')
      console.log(`   Response: ${webhookResult.message}`)
    } else {
      console.log('⚠️ Webhook simulation response:', webhookResult.message)
    }
    
    // Test 5: Check final order status
    console.log('\n5️⃣ Checking final order status...')
    
    const finalCheckResponse = await fetch(`${API_BASE}/api/orders/${orderId}`)
    const finalOrder = await finalCheckResponse.json()
    
    if (finalOrder.success) {
      console.log('✅ Final order status check')
      console.log(`   Order Status: ${finalOrder.data.status}`)
      console.log(`   Payment Status: ${finalOrder.data.payment_status}`)
      
      if (finalOrder.data.payment_status === 'paid') {
        console.log('🎉 AUTO PAYMENT CHECK WORKING! Status changed to PAID')
      } else {
        console.log('⚠️ Payment status still pending - auto check might need more time')
      }
    }
    
    console.log('\n' + '=' .repeat(60))
    console.log('📋 Test Summary:')
    console.log(`   - Order ID: ${orderId}`)
    console.log(`   - Order Number: ${createResult.order.order_number}`)
    console.log(`   - Midtrans Order ID: ${paymentData.order_id}`)
    console.log(`   - Total Amount: Rp ${createResult.order.total_amount.toLocaleString()}`)
    console.log(`   - Final Payment Status: ${finalOrder.data?.payment_status || 'unknown'}`)
    console.log('\n✨ Test completed! Check the browser at:')
    console.log(`   http://localhost:3000/orders/${orderId}`)
    console.log('\n🔄 The auto payment check should update the status automatically every 30 seconds')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testAutoPaymentCheck()
