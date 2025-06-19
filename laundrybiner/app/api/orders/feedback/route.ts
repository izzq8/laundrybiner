import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      orderId, 
      rating, 
      comment, 
      serviceRating, 
      deliveryRating, 
      qualityRating,
      userId 
    } = body

    // Validate required fields
    if (!orderId || !rating) {
      return NextResponse.json({
        success: false,
        message: "Order ID and rating are required"
      }, { status: 400 })
    }

    // Validate rating values
    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        message: "Rating must be between 1 and 5"
      }, { status: 400 })
    }

    // Check if order exists and is in delivered status
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, status, customer_name")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({
        success: false,
        message: "Order not found"
      }, { status: 404 })
    }

    if (order.status !== "delivered") {
      return NextResponse.json({
        success: false,
        message: "Feedback can only be given for delivered orders"
      }, { status: 400 })
    }

    // Check if feedback already exists for this order
    const { data: existingFeedback, error: feedbackCheckError } = await supabaseAdmin
      .from("order_feedback")
      .select("id")
      .eq("order_id", orderId)
      .single()

    if (existingFeedback) {
      return NextResponse.json({
        success: false,
        message: "Feedback has already been submitted for this order"
      }, { status: 400 })
    }

    // Create feedback
    const { data: feedback, error: feedbackError } = await supabaseAdmin
      .from("order_feedback")
      .insert({
        order_id: orderId,
        user_id: userId || null,
        rating: parseInt(rating),
        comment: comment || null,
        service_rating: serviceRating ? parseInt(serviceRating) : null,
        delivery_rating: deliveryRating ? parseInt(deliveryRating) : null,
        quality_rating: qualityRating ? parseInt(qualityRating) : null,
      })
      .select()
      .single()

    if (feedbackError) {
      console.error("Error creating feedback:", feedbackError)
      return NextResponse.json({
        success: false,
        message: "Failed to submit feedback"
      }, { status: 500 })
    }

    // Update order status to completed and add completed_at timestamp
    const { error: orderUpdateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        feedback_id: feedback.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId)

    if (orderUpdateError) {
      console.error("Error updating order status:", orderUpdateError)
      // Don't fail the request if order update fails, feedback is still created
    }

    // Add tracking entry
    const { error: trackingError } = await supabaseAdmin
      .from("order_tracking")
      .insert({
        order_id: orderId,
        status: "completed",
        notes: `Order completed with feedback. Rating: ${rating}/5`,
        created_by: userId || null
      })

    if (trackingError) {
      console.error("Error creating tracking entry:", trackingError)
      // Continue even if tracking fails
    }

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback
    })

  } catch (error) {
    console.error("Feedback submission error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: "Order ID is required"
      }, { status: 400 })
    }

    // Get feedback for the order
    const { data: feedback, error: feedbackError } = await supabaseAdmin
      .from("order_feedback")
      .select("*")
      .eq("order_id", orderId)
      .single()

    if (feedbackError && feedbackError.code !== 'PGRST116') {
      console.error("Error fetching feedback:", feedbackError)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch feedback"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: feedback || null
    })

  } catch (error) {
    console.error("Get feedback error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
