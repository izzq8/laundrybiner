import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: serviceTypes, error } = await supabase
      .from("service_types")
      .select("*")
      .eq("is_active", true)
      .order("type", { ascending: true })
      .order("price", { ascending: true })

    if (error) {
      console.error("Error fetching service types:", error)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch service types",
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: serviceTypes || []
    })

  } catch (error) {
    console.error("Error in service types API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
