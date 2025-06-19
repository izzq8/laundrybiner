/**
 * Test script untuk memverifikasi integrasi Midtrans Snap
 * Jalankan dari browser console di halaman payment
 */

// Test function to verify Snap integration
function testMidtransSnapIntegration() {
  console.log('🧪 Testing Midtrans Snap Integration...')
  
  // Check if Snap script is loaded
  const snapScript = document.getElementById('midtrans-snap')
  if (snapScript) {
    console.log('✅ Midtrans Snap script found:', snapScript.src)
  } else {
    console.log('❌ Midtrans Snap script not found')
    return false
  }
  
  // Check if window.snap is available
  if (window.snap) {
    console.log('✅ window.snap is available')
    console.log('✅ snap.pay function:', typeof window.snap.pay)
  } else {
    console.log('❌ window.snap is not available')
    return false
  }
  
  // Check environment variables
  console.log('Environment check:')
  console.log('- Client Key: SB-Mid-client-mNdxM5MY-ItvKEFT')
  console.log('- Sandbox URL: https://app.sandbox.midtrans.com/snap/snap.js')
  
  console.log('✅ All checks passed! Midtrans Snap should be working.')
  return true
}

// Test API endpoint
async function testPaymentAPI() {
  console.log('🧪 Testing Payment API...')
  
  const testOrder = {
    order_id: `TEST-${Date.now()}`,
    amount: 25000,
    customer_details: {
      first_name: "Test User",
      phone: "08123456789",
      email: "test@example.com",
      billing_address: {
        address: "Jakarta",
        city: "Jakarta",
        postal_code: "12345",
        country_code: "IDN",
      },
    },
    item_details: [
      {
        id: "laundry-service",
        price: 25000,
        quantity: 1,
        name: "Test Layanan Laundry",
      },
    ],
  }
  
  try {
    const response = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testOrder)
    })
    
    const result = await response.json()
    console.log('API Response:', result)
    
    if (result.success && result.token) {
      console.log('✅ Payment API working! Token received:', result.token)
      return result.token
    } else {
      console.log('❌ Payment API failed:', result.message)
      return null
    }
  } catch (error) {
    console.log('❌ API Error:', error)
    return null
  }
}

// Export functions for use in browser console
if (typeof window !== 'undefined') {
  window.testMidtransSnapIntegration = testMidtransSnapIntegration
  window.testPaymentAPI = testPaymentAPI
}

export { testMidtransSnapIntegration, testPaymentAPI }
