import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== TESTING QRIS CONFIGURATION ===');
    
    // Test environment variables
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    
    console.log('Server Key exists:', !!serverKey);
    console.log('Client Key exists:', !!clientKey);
    console.log('Server Key format:', serverKey?.substring(0, 15) + '...');
    console.log('Client Key format:', clientKey?.substring(0, 15) + '...');
    
    if (!serverKey || !clientKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Midtrans keys',
        details: {
          serverKey: !!serverKey,
          clientKey: !!clientKey
        }
      });
    }
    
    // Test minimal QRIS payload
    const testPayload = {
      transaction_details: {
        order_id: `TEST-QRIS-${Date.now()}`,
        gross_amount: 10000
      },
      customer_details: {
        first_name: "Test",
        last_name: "Customer",
        email: "test@example.com",
        phone: "08123456789",
        billing_address: {
          address: "Jakarta",
          city: "Jakarta", 
          postal_code: "12345",
          country_code: "IDN"
        }
      },
      item_details: [{
        id: "test-item",
        price: 10000,
        quantity: 1,
        name: "Test QRIS Item"
      }],
      enabled_payments: ["qris"],
      qris: {
        acquirer: "gopay"
      }
    };
    
    console.log('Test payload:', JSON.stringify(testPayload, null, 2));
    
    // Send to Midtrans
    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    const result = await response.json();
    
    console.log('Midtrans response status:', response.status);
    console.log('Midtrans response:', JSON.stringify(result, null, 2));
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      midtransResponse: result,
      testPayload: testPayload
    });
    
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
