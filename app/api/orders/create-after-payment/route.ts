import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating order after payment success:', body);

    const {
      serviceType,
      serviceTypeId,
      weight,
      items,
      pickupOption,
      pickupAddress,
      pickupDate,
      pickupTime,
      deliveryOption,
      deliveryAddress,
      deliveryDate,
      deliveryTime,
      contactName,
      contactPhone,
      notes,
      transactionId,
      totalAmount,
      paymentStatus = 'paid' // Since this is called after successful payment
    } = body;

    // Validation
    if (!serviceType || !serviceTypeId || !contactName || !contactPhone || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (serviceType === 'kiloan' && (!weight || weight <= 0)) {
      return NextResponse.json(
        { error: 'Weight is required for kiloan service' },
        { status: 400 }
      );
    }

    if (serviceType === 'satuan' && (!items || items.length === 0)) {
      return NextResponse.json(
        { error: 'Items are required for satuan service' },
        { status: 400 }
      );
    }

    if (pickupOption === 'pickup' && (!pickupAddress || !pickupDate || !pickupTime)) {
      return NextResponse.json(
        { error: 'Pickup address, date, and time are required when pickup is selected' },
        { status: 400 }
      );
    }

    if (deliveryOption === 'delivery' && (!deliveryAddress || !deliveryDate || !deliveryTime)) {
      return NextResponse.json(
        { error: 'Delivery address, date, and time are required when delivery is selected' },
        { status: 400 }
      );
    }

    // Prepare order data for database
    const orderData = {
      // Required fields
      service_type_id: serviceTypeId,
      total_amount: totalAmount,
      customer_name: contactName,
      customer_phone: contactPhone,
      pickup_address: pickupOption === 'pickup' ? pickupAddress : null,
      status: 'confirmed', // Set to confirmed since payment is successful
      payment_status: paymentStatus,
      
      // Optional fields
      weight: serviceType === 'kiloan' ? weight : null,
      pickup_date: pickupOption === 'pickup' ? pickupDate : null,
      pickup_time: pickupOption === 'pickup' ? pickupTime : null,
      delivery_date: deliveryOption === 'delivery' ? deliveryDate : null,
      delivery_time: deliveryOption === 'delivery' ? deliveryTime : null,
      delivery_address: deliveryOption === 'delivery' ? deliveryAddress : null,
      pickup_option: pickupOption,
      delivery_option: deliveryOption,
      service_type: serviceType,
      items: serviceType === 'satuan' ? JSON.stringify(items) : null,
      customer_email: null,
      notes: notes || null,
      midtrans_transaction_id: transactionId,
      midtrans_order_id: transactionId
    };

    console.log('Order data to insert:', JSON.stringify(orderData, null, 2));

    // Insert order
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { 
          error: 'Failed to create order',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      );
    }

    console.log('Order created successfully after payment:', order);

    return NextResponse.json({
      success: true,
      order: order,
      message: 'Order created successfully after payment'
    });

  } catch (error: any) {
    console.error('Error creating order after payment:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
