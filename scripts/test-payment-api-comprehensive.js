const http = require('http');
const https = require('https');

const testPaymentAPI = async () => {
  console.log('🧪 Testing Payment API...\n');

  const testPayload = {
    order_id: 'TEST-API-' + Date.now(),
    amount: 15000,
    customer_details: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+628123456789'
    },
    item_details: [
      {
        id: 'cuci-setrika',
        price: 5000,
        quantity: 2,
        name: 'Cuci + Setrika'
      },
      {
        id: 'pickup-fee',
        price: 2500,
        quantity: 1,
        name: 'Biaya Penjemputan'
      },
      {
        id: 'delivery-fee',
        price: 2500,
        quantity: 1,
        name: 'Biaya Pengantaran'
      }
    ]
  };

  console.log('📋 Test Payload:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('\n');

  const postData = JSON.stringify(testPayload);
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/payment/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📡 Response Status:', res.statusCode);
          console.log('📡 Response Body:');
          console.log(JSON.stringify(response, null, 2));
          
          if (response.success && response.token) {
            console.log('\n✅ Token generated successfully!');
            console.log('🔑 Token:', response.token.substring(0, 30) + '...');
            
            // Validate token format
            if (response.token.length > 50) {
              console.log('✅ Token length looks good');
            } else {
              console.log('⚠️ Token might be too short');
            }
          } else {
            console.log('\n❌ Failed to generate token');
            console.log('Error:', response.message || 'Unknown error');
          }
          
          resolve(response);
        } catch (error) {
          console.error('❌ Error parsing response:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Test dengan direct Midtrans API
const testDirectMidtrans = async () => {
  console.log('\n🔧 Testing Direct Midtrans API...\n');

  const midtransPayload = {
    transaction_details: {
      order_id: 'DIRECT-TEST-' + Date.now(),
      gross_amount: 15000
    },
    customer_details: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+628123456789'
    },
    item_details: [
      {
        id: 'cuci-setrika',
        price: 5000,
        quantity: 2,
        name: 'Cuci + Setrika'
      },
      {
        id: 'pickup-fee',
        price: 2500,
        quantity: 1,
        name: 'Biaya Penjemputan'
      },
      {
        id: 'delivery-fee',
        price: 2500,
        quantity: 1,
        name: 'Biaya Pengantaran'
      }
    ]
  };

  console.log('📋 Midtrans Payload:');
  console.log(JSON.stringify(midtransPayload, null, 2));
  console.log('\n');

  const serverKey = 'SB-Mid-server-bS9phW7kMqLO0jGb3Q9n7INz';
  const auth = Buffer.from(serverKey + ':').toString('base64');
  const postData = JSON.stringify(midtransPayload);

  const options = {
    hostname: 'app.sandbox.midtrans.com',
    port: 443,
    path: '/snap/v1/transactions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + auth,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📡 Midtrans Response Status:', res.statusCode);
          console.log('📡 Midtrans Response Body:');
          console.log(JSON.stringify(response, null, 2));
          
          if (response.token) {
            console.log('\n✅ Midtrans token generated successfully!');
            console.log('🔑 Token:', response.token.substring(0, 30) + '...');
            console.log('🔗 Redirect URL:', response.redirect_url);
          } else {
            console.log('\n❌ Failed to generate Midtrans token');
          }
          
          resolve(response);
        } catch (error) {
          console.error('❌ Error parsing Midtrans response:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Midtrans request error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Run tests
async function runTests() {
  try {
    console.log('='.repeat(50));
    console.log('🚀 PAYMENT API TESTS');
    console.log('='.repeat(50));
    
    // Test 1: Our API
    console.log('\n📡 TEST 1: Our Payment API');
    console.log('-'.repeat(30));
    await testPaymentAPI();
    
    // Test 2: Direct Midtrans
    console.log('\n📡 TEST 2: Direct Midtrans API');
    console.log('-'.repeat(30));
    await testDirectMidtrans();
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

runTests();
