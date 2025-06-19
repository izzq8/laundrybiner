/**
 * Real-time Payment Status Monitor
 * 
 * Script ini akan membuat order baru dan memantau perubahan status secara real-time
 */

const API_BASE = 'http://localhost:3000'

class PaymentStatusMonitor {
  constructor() {
    this.isMonitoring = false
    this.monitoringInterval = null
    this.orderId = null
  }

  async createTestOrder() {
    console.log('🆕 Creating new test order...')
    
    const orderData = {
      serviceType: 'kiloan',
      serviceTypeId: '15671ab0-0044-4e3c-8565-6dbc69e7603c', // Cuci Kering Regular
      weight: 3,
      items: [],
      pickupOption: 'pickup',
      pickupAddress: 'Jl. Monitor Test No. 456',
      pickupDate: '2025-06-20',
      pickupTime: '14:00',
      deliveryOption: 'delivery',
      deliveryAddress: 'Jl. Monitor Test No. 456',
      deliveryDate: '2025-06-23',
      deliveryTime: '16:00',
      contactName: 'Monitor Test User',
      contactPhone: '08987654321',
      notes: 'Test order for real-time monitoring',
      transactionId: `MONITOR-${Date.now()}`
    }

    try {
      const response = await fetch(`${API_BASE}/api/orders/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()
      
      if (result.success) {
        this.orderId = result.order.id
        console.log(`✅ Order created: ${result.order.order_number}`)
        console.log(`📋 Order ID: ${this.orderId}`)
        console.log(`💰 Total: Rp ${result.order.total_amount.toLocaleString()}`)
        console.log(`🌐 View at: http://localhost:3000/orders/${this.orderId}`)
        return result.order
      } else {
        throw new Error(result.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('❌ Error creating order:', error)
      return null
    }
  }

  async checkOrderStatus() {
    if (!this.orderId) return null

    try {
      const response = await fetch(`${API_BASE}/api/orders/${this.orderId}`)
      const result = await response.json()
      
      if (result.success) {
        return result.data
      }
    } catch (error) {
      console.error('❌ Error checking order status:', error)
    }
    
    return null
  }

  async startMonitoring() {
    const order = await this.createTestOrder()
    if (!order) {
      console.log('❌ Failed to create order. Cannot start monitoring.')
      return
    }

    console.log('\n🔄 Starting real-time payment status monitoring...')
    console.log('💡 You can now:')
    console.log('   1. Open the order URL in browser to see auto-checking indicator')
    console.log('   2. Simulate payment by running webhook test')
    console.log('   3. Watch the status change automatically here')
    console.log('\n📊 Monitoring log:')
    console.log('─'.repeat(80))

    this.isMonitoring = true
    let lastStatus = order.payment_status
    let checkCount = 0

    this.monitoringInterval = setInterval(async () => {
      if (!this.isMonitoring) return

      const currentOrder = await this.checkOrderStatus()
      if (!currentOrder) return

      checkCount++
      const now = new Date().toLocaleTimeString()
      const statusChanged = currentOrder.payment_status !== lastStatus

      if (statusChanged) {
        console.log(`🎉 [${now}] STATUS CHANGED: ${lastStatus} → ${currentOrder.payment_status}`)
        console.log(`   Order Status: ${currentOrder.status}`)
        
        if (currentOrder.payment_status === 'paid') {
          console.log('✅ PAYMENT COMPLETED! Auto payment check is working!')
          this.stopMonitoring()
          return
        }
        
        lastStatus = currentOrder.payment_status
      } else {
        // Show periodic status check
        const dots = '.'.repeat((checkCount % 3) + 1)
        process.stdout.write(`\r⏳ [${now}] Checking${dots} Status: ${currentOrder.payment_status} (Check #${checkCount})`)
      }
    }, 5000) // Check every 5 seconds

    // Auto-stop after 10 minutes
    setTimeout(() => {
      if (this.isMonitoring) {
        console.log('\n\n⏰ Monitoring timeout (10 minutes). Stopping...')
        this.stopMonitoring()
      }
    }, 10 * 60 * 1000)
  }

  stopMonitoring() {
    this.isMonitoring = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    
    console.log('\n─'.repeat(80))
    console.log('🏁 Monitoring stopped.')
    
    if (this.orderId) {
      console.log('\n📋 Summary:')
      console.log(`   Order ID: ${this.orderId}`)
      console.log(`   Order URL: http://localhost:3000/orders/${this.orderId}`)
      console.log('\n🧪 To test webhook manually, run:')
      console.log(`   node test/simulate-webhook.js ${this.orderId}`)
    }
    
    process.exit(0)
  }

  async simulatePayment() {
    if (!this.orderId) {
      console.log('❌ No order to simulate payment for')
      return
    }

    console.log('\n💳 Simulating payment via webhook...')
    
    const order = await this.checkOrderStatus()
    if (!order) return

    const webhookData = {
      transaction_status: 'settlement',
      order_id: order.midtrans_order_id || `${order.order_number}-${Date.now()}`,
      payment_type: 'qris',
      fraud_status: 'accept',
      transaction_time: new Date().toISOString(),
      gross_amount: order.total_amount.toString(),
      status_code: '200'
    }

    try {
      const response = await fetch(`${API_BASE}/api/payment/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      })

      const result = await response.json()
      
      if (response.ok) {
        console.log('✅ Payment simulation sent successfully')
        console.log('🔄 Status should update automatically within 30 seconds...')
      } else {
        console.log('⚠️ Webhook simulation response:', result.message)
      }
    } catch (error) {
      console.error('❌ Error simulating payment:', error)
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2)
const command = args[0]

const monitor = new PaymentStatusMonitor()

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Received SIGINT. Stopping monitoring...')
  monitor.stopMonitoring()
})

if (command === 'simulate' && args[1]) {
  // Simulate payment for existing order
  monitor.orderId = args[1]
  monitor.simulatePayment()
} else {
  // Start monitoring new order
  console.log('🚀 Payment Status Real-time Monitor')
  console.log('=' .repeat(50))
  console.log('This tool will create a test order and monitor payment status changes.')
  console.log('Press Ctrl+C to stop monitoring at any time.\n')
  
  monitor.startMonitoring()
}
