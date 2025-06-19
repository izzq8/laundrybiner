import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;    console.log(`Fetching order details for ID: ${orderId}`);
    
    // Get the order details
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error(`Order not found: ${orderId}`, orderError);
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }
    
    console.log(`Order found:`, orderData);

    // Get the order tracking history
    const { data: trackingData, error: trackingError } = await supabase
      .from("order_tracking")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    // Get the latest status
    const latestStatus = trackingData && trackingData.length > 0 
      ? trackingData[0].status 
      : orderData.status || "pending";

    // Fetch payment status from Midtrans if needed
    let paymentStatus = orderData.payment_status || "pending";
    
    // Only try to get payment status from Midtrans if we have an order_id
    if (orderId) {
      try {
        const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-bS9phW7kMqLO0jGb3Q9n7INz";
        const MIDTRANS_BASE_URL = "https://api.sandbox.midtrans.com/v2";
        
        const response = await fetch(`${MIDTRANS_BASE_URL}/${orderId}/status`, {
          method: "GET",
          headers: {
            Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.transaction_status === "settlement" || result.transaction_status === "capture") {
            paymentStatus = "paid";
          } else if (["deny", "cancel", "expire"].includes(result.transaction_status)) {
            paymentStatus = "failed";
          }
        }
      } catch (error) {
        console.error("Error fetching Midtrans payment status:", error);
        // Continue with the existing payment status if there's an error
      }
    }

    // Format the data to return
    const order = {
      ...orderData,
      status: latestStatus,
      payment_status: paymentStatus,
      tracking_history: trackingData || []
    };

    return NextResponse.json({
      success: true,
      order
    });
    
  } catch (error) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get order status" },
      { status: 500 }
    );
  }
}
