import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: itemTypes, error } = await supabase
      .from("item_types")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching item types:", error)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch item types",
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: itemTypes || []
    })

  } catch (error) {
    console.error("Error in item types API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
