/**
 * Real-time Payment Status Monitor
 * Run with: node scripts/monitor-payments.js
 */

const BASE_URL = 'http://localhost:3000'

class PaymentMonitor {
  constructor(intervalSeconds = 10) {
    this.interval = intervalSeconds * 1000
    this.isRunning = false
    this.previousStatus = new Map()
  }

  async checkAllOrders() {
    try {
      const response = await fetch(`${BASE_URL}/api/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.log('❌ Failed to fetch orders:', response.status)
        return
      }

      const data = await response.json()
      
      if (!data.success || !data.data) {
        console.log('❌ Invalid response format')
        return
      }

      const orders = data.data
      const now = new Date().toISOString()
      
      console.log(`\n⏰ ${new Date().toLocaleTimeString()} - Checking ${orders.length} orders...`)

      // Group orders by status
      const statusGroups = {
        pending: [],
        paid: [],
        failed: [],
        cancelled: []
      }

      orders.forEach(order => {
        const status = order.payment_status || 'unknown'
        if (statusGroups[status]) {
          statusGroups[status].push(order)
        }
      })

      // Report status counts
      console.log('📊 Payment Status Summary:')
      console.log(`   🟡 Pending: ${statusGroups.pending.length}`)
      console.log(`   🟢 Paid: ${statusGroups.paid.length}`)
      console.log(`   🔴 Failed: ${statusGroups.failed.length}`)
      console.log(`   ⚫ Cancelled: ${statusGroups.cancelled.length}`)

      // Check for status changes
      orders.forEach(order => {
        const currentStatus = order.payment_status
        const previousStatus = this.previousStatus.get(order.id)
        
        if (previousStatus && previousStatus !== currentStatus) {
          console.log(`🔄 STATUS CHANGE DETECTED!`)
          console.log(`   📋 Order: ${order.order_number}`)
          console.log(`   🔄 ${previousStatus} → ${currentStatus}`)
          console.log(`   💰 Amount: Rp ${order.total_amount.toLocaleString()}`)
          console.log(`   📱 View: ${BASE_URL}/orders/${order.id}`)
        }
        
        this.previousStatus.set(order.id, currentStatus)
      })

      // Show pending orders details
      if (statusGroups.pending.length > 0) {
        console.log('\n⏳ Pending Orders Details:')
        statusGroups.pending.forEach(order => {
          const createdAt = new Date(order.created_at)
          const ageMinutes = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60))
          
          console.log(`   📋 ${order.order_number} - Rp ${order.total_amount.toLocaleString()} (${ageMinutes}m old)`)
        })
      }

    } catch (error) {
      console.log('❌ Error checking orders:', error.message)
    }
  }

  async triggerAutoCheck() {
    console.log('🤖 Triggering automatic payment check...')
    
    try {
      const response = await fetch(`${BASE_URL}/api/payment/auto-check-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        console.log(`✅ Auto-check completed: ${data.checked} checked, ${data.updated} updated`)
        
        if (data.results && data.results.length > 0) {
          data.results.forEach(result => {
            if (result.status === 'updated') {
              console.log(`   🎉 ${result.orderNumber}: ${result.oldStatus} → ${result.newStatus}`)
            }
          })
        }
      } else {
        console.log('❌ Auto-check failed:', data.message)
      }
    } catch (error) {
      console.log('❌ Error triggering auto-check:', error.message)
    }
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️  Monitor is already running!')
      return
    }

    console.log('🚀 Starting Payment Status Monitor...')
    console.log(`⏱️  Checking every ${this.interval / 1000} seconds`)
    console.log('⌨️  Press Ctrl+C to stop\n')

    this.isRunning = true

    // Initial check
    this.checkAllOrders()

    // Set up periodic checking
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.checkAllOrders()
        
        // Every 3rd check, trigger auto-check
        if (Date.now() % (3 * this.interval) < this.interval) {
          await this.triggerAutoCheck()
        }
      }
    }, this.interval)

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.stop()
    })
  }

  stop() {
    if (!this.isRunning) {
      return
    }

    console.log('\n🛑 Stopping Payment Status Monitor...')
    this.isRunning = false
    
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    console.log('✅ Monitor stopped successfully!')
    process.exit(0)
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2)
  let intervalSeconds = 10

  // Parse command line arguments
  const intervalArg = args.find(arg => arg.startsWith('--interval='))
  if (intervalArg) {
    intervalSeconds = parseInt(intervalArg.split('=')[1]) || 10
  }

  const helpArg = args.includes('--help') || args.includes('-h')
  
  if (helpArg) {
    console.log('📋 Payment Status Monitor')
    console.log('Usage: node scripts/monitor-payments.js [options]')
    console.log('')
    console.log('Options:')
    console.log('  --interval=N    Check interval in seconds (default: 10)')
    console.log('  --help, -h      Show this help message')
    console.log('')
    console.log('Examples:')
    console.log('  node scripts/monitor-payments.js')
    console.log('  node scripts/monitor-payments.js --interval=5')
    return
  }

  const monitor = new PaymentMonitor(intervalSeconds)
  monitor.start()
}

main()
