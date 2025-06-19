import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST() {
  try {
    console.log("Creating order_feedback table...")

    // Check if table already exists by trying to select from it
    const { error: checkError } = await supabaseAdmin
      .from('order_feedback')
      .select('id')
      .limit(1)

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: "order_feedback table already exists"
      })
    }

    // If table doesn't exist, we'll get an error
    // For now, let's return a message that manual SQL execution is needed
    return NextResponse.json({
      success: false,
      message: "Please execute the SQL script manually in your Supabase dashboard",
      sqlScript: "scripts/15-create-feedback-table.sql",
      instructions: "Copy the contents of scripts/15-create-feedback-table.sql and execute it in your Supabase SQL editor"
    })

  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to check/create feedback table", 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
