import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Test database connection - check service_types table
    const { data: allServiceTypes, error: allError } = await supabase
      .from("service_types")
      .select("*")
    
    // Check active service types
    const { data: activeServiceTypes, error: activeError } = await supabase
      .from("service_types")
      .select("*")
      .eq("is_active", true)
    
    return NextResponse.json({
      success: true,
      data: {
        allServiceTypes: allServiceTypes || [],
        allError: allError?.message || null,
        activeServiceTypes: activeServiceTypes || [],
        activeError: activeError?.message || null
      }
    })

  } catch (error) {
    console.error("Error in test API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
