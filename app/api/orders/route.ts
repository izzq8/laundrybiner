import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const demoMode = searchParams.get('demo') === 'true'
    const limit = limitParam ? parseInt(limitParam, 10) : undefined
    
    // Get authorization header for user authentication
    const authHeader = request.headers.get('authorization')
    let user_id = null;
    
    // Try to get user ID if authenticated
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (!authError && user) {
        user_id = user.id
        console.log('Fetching orders for authenticated user:', user_id)
      }
    }
    
    // Build query
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
    
    // Filter by user_id if user is authenticated and not in demo mode
    if (user_id && !demoMode) {
      query = query.eq('user_id', user_id)
      console.log('Filtering orders by user_id:', user_id)
    } else if (!user_id && !demoMode) {
      // If not authenticated and not demo mode, return empty array
      console.log('No authentication and not demo mode, returning empty results')
      return NextResponse.json({
        success: true,
        orders: []
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    } else {
      console.log('Demo mode or fallback: returning all orders')
    }
    
    query = query.order("created_at", { ascending: false })
    
    // Apply limit if specified
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
    }

    return NextResponse.json({
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
