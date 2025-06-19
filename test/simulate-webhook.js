/**
 * Simulate Webhook Payment for Testing
 * 
 * Usage: node simulate-webhook.js [orderId]
 */

const API_BASE = 'http://localhost:3000'

async function simulateWebhookPayment(orderId) {
  console.log('💳 Simulating webhook payment...')
  console.log(`📋 Order ID: ${orderId}`)
  
  try {
    // First, get order details
    const orderResponse = await fetch(`${API_BASE}/api/orders/${orderId}`)
    const orderResult = await orderResponse.json()
    
    if (!orderResult.success) {
      console.log('❌ Failed to get order details:', orderResult.error)
      return
    }
    
    const order = orderResult.data
    console.log(`📋 Order Number: ${order.order_number}`)
    console.log(`💰 Total Amount: Rp ${order.total_amount.toLocaleString()}`)
    console.log(`📊 Current Status: ${order.payment_status}`)
    
    if (order.payment_status === 'paid') {
      console.log('✅ Order is already paid!')
      return
    }
    
    // Simulate Midtrans webhook
    const webhookData = {
      transaction_status: 'settlement',
      order_id: order.midtrans_order_id || `${order.order_number}-${Date.now()}`,
      payment_type: 'qris',
      fraud_status: 'accept',
      transaction_time: new Date().toISOString(),
      gross_amount: order.total_amount.toString(),
      status_code: '200'
    }
    
    console.log('\n🔄 Sending webhook simulation...')
    console.log(`📤 Midtrans Order ID: ${webhookData.order_id}`)
    
    const webhookResponse = await fetch(`${API_BASE}/api/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    })

    const webhookResult = await webhookResponse.json()
    
    if (webhookResponse.ok) {
      console.log('✅ Webhook simulation successful!')
      console.log(`📨 Response: ${webhookResult.message}`)
      
      // Check status after simulation
      setTimeout(async () => {
        console.log('\n🔍 Checking order status after webhook...')
        const updatedOrderResponse = await fetch(`${API_BASE}/api/orders/${orderId}`)
        const updatedOrderResult = await updatedOrderResponse.json()
        
        if (updatedOrderResult.success) {
          const updatedOrder = updatedOrderResult.data
          console.log(`📊 Updated Status: ${updatedOrder.payment_status}`)
          console.log(`📊 Order Status: ${updatedOrder.status}`)
          
          if (updatedOrder.payment_status === 'paid') {
            console.log('🎉 SUCCESS! Payment status changed to PAID')
            console.log('✨ Auto payment check is working correctly!')
          } else {
            console.log('⚠️ Status not changed yet. Auto-check will update it within 30 seconds.')
          }
        }
        
        console.log(`\n🌐 View order at: http://localhost:3000/orders/${orderId}`)
      }, 2000)
      
    } else {
      console.log('❌ Webhook simulation failed:', webhookResult.message)
    }
    
  } catch (error) {
    console.error('❌ Error simulating payment:', error)
  }
}

// Get order ID from command line argument
const orderId = process.argv[2]

if (!orderId) {
  console.log('❌ Please provide an order ID')
  console.log('Usage: node simulate-webhook.js [orderId]')
  console.log('\nExample: node simulate-webhook.js 7ddd8f5b-b55d-4de7-9641-88ec34083fdf')
  process.exit(1)
}

simulateWebhookPayment(orderId)
