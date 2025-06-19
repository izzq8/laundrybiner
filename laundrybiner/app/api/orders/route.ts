import { NextRequest, NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const demoMode = searchParams.get('demo') === 'true'
    const limit = limitParam ? parseInt(limitParam, 10) : undefined
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    // For demo mode, if no auth header or demo mode is requested, return all orders
    if (demoMode || !authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Demo mode or no auth header, returning all orders')
      let query = supabaseAdmin
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
        .order("created_at", { ascending: false })
      
      if (limit && limit > 0) {
        query = query.limit(limit)
      }

      const { data: orders, error } = await query

      if (error) {
        console.error("Error fetching orders:", error)
        return NextResponse.json({
          success: false,
          message: "Failed to fetch orders",
          error: error.message
        }, { status: 500 })
      }      return NextResponse.json({
        success: true,
        orders: orders || []
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
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
    }    // Get orders for the authenticated user only
    let query = supabaseAdmin
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
      .eq('user_id', user.id)
      .order("created_at", { ascending: false })
    
    if (limit && limit > 0) {
      query = query.limit(limit)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message
      }, { status: 500 })
    }    return NextResponse.json({
      success: true,
      orders: orders || []
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error("Error in orders API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
