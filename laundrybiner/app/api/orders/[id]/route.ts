import { NextRequest, NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params

    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: "Order ID is required"
      }, { status: 400 })
    }    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    // For demo mode, if no auth header, return order without user filtering
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header, fetching order without user filtering (demo mode)')
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .select(`
          *,
          service_types (
            name,
            type,
            price,
            description
          )
        `)
        .eq("id", orderId)
        .single()

      if (orderError || !order) {
        console.error("Error fetching order:", orderError)
        return NextResponse.json({
          success: false,
          message: "Order not found"
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: order
      })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired token"
      }, { status: 401 })
    }

    // Fetch order with service type information and user filtering
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        service_types (
          name,
          type,
          price,
          description
        )
      `)
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()

    if (orderError || !order) {
      console.error("Error fetching order:", orderError)
      return NextResponse.json({
        success: false,
        message: "Order not found or access denied"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error("Error in get order API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
