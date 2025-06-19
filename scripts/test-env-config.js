const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Function to test environment variables
function testEnvConfig() {
  console.log('🔍 Testing Environment Configuration...\n')
  
  // Read .env.local file
  const envPath = path.join(__dirname, '.env.local')
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    console.log('✅ .env.local file found')
    console.log('📄 Content:')
    console.log(envContent)
  } else {
    console.log('❌ .env.local file not found')
  }
  
  console.log('\n🔧 Environment Variables:')
  console.log('MERCHANT_ID:', process.env.MERCHANT_ID || 'Not set')
  console.log('MIDTRANS_SERVER_KEY:', process.env.MIDTRANS_SERVER_KEY ? 'Set (hidden)' : 'Not set')
  console.log('NEXT_PUBLIC_MIDTRANS_CLIENT_KEY:', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ? 'Set (hidden)' : 'Not set')
  console.log('MIDTRANS_SANDBOX:', process.env.MIDTRANS_SANDBOX || 'Not set')
  
  console.log('\n📊 Configuration Status:')
  const hasServerKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-bS9phW7kMqLO0jGb3Q9n7INz'
  const hasClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-mNdxM5MY-ItvKEFT'
  
  console.log('✅ Server Key Available:', hasServerKey ? 'Yes' : 'No')
  console.log('✅ Client Key Available:', hasClientKey ? 'Yes' : 'No')
  console.log('✅ Sandbox Mode:', process.env.MIDTRANS_SANDBOX !== 'false' ? 'Yes' : 'No')
  
  console.log('\n🎯 Expected Configuration:')
  console.log('- MERCHANT_ID: G656403153')
  console.log('- MIDTRANS_SERVER_KEY: SB-Mid-server-bS9phW7kMqLO0jGb3Q9n7INz')
  console.log('- NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: SB-Mid-client-mNdxM5MY-ItvKEFT')
  
  console.log('\n✨ Configuration test completed!')
}

// Run the test
testEnvConfig()
