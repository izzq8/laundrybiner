import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST() {
  try {
    console.log("Running database migration and seed data...")

    // Insert sample service types for kiloan and satuan
    const { error: serviceTypesError } = await supabaseAdmin
      .from('service_types')
      .upsert([
        { name: 'Cuci Kering Kiloan', type: 'kiloan', price: 5000, description: 'Cuci dan kering per kilogram', is_active: true },
        { name: 'Cuci Setrika Kiloan', type: 'kiloan', price: 7000, description: 'Cuci, kering, dan setrika per kilogram', is_active: true },
        { name: 'Cuci Setrika Premium', type: 'kiloan', price: 10000, description: 'Cuci setrika dengan detergen premium', is_active: true },
        { name: 'Cuci Express Kiloan', type: 'kiloan', price: 12000, description: 'Cuci setrika selesai 1 hari', is_active: true },
        
        { name: 'Kemeja Reguler', type: 'satuan', price: 8000, description: 'Cuci setrika kemeja biasa', is_active: true },
        { name: 'Kemeja Premium', type: 'satuan', price: 12000, description: 'Cuci setrika kemeja dengan treatment khusus', is_active: true },
        { name: 'Celana Panjang', type: 'satuan', price: 8000, description: 'Cuci setrika celana panjang', is_active: true },
        { name: 'Jaket/Jas', type: 'satuan', price: 15000, description: 'Cuci setrika jaket atau jas', is_active: true },
        { name: 'Dress/Gaun', type: 'satuan', price: 12000, description: 'Cuci setrika dress atau gaun', is_active: true },
        { name: 'Sepatu Cuci', type: 'satuan', price: 20000, description: 'Cuci sepatu dengan treatment khusus', is_active: true }
      ], { onConflict: 'name' })

    // Insert sample item types for satuan orders
    const { error: itemTypesError } = await supabaseAdmin
      .from('item_types')
      .upsert([
        { name: 'Kemeja Pria', price: 8000, category: 'Pakaian Formal', is_active: true },
        { name: 'Kemeja Wanita', price: 8000, category: 'Pakaian Formal', is_active: true },
        { name: 'Celana Panjang Pria', price: 8000, category: 'Pakaian Formal', is_active: true },
        { name: 'Celana Panjang Wanita', price: 8000, category: 'Pakaian Formal', is_active: true },
        { name: 'Kaos/T-Shirt', price: 5000, category: 'Pakaian Kasual', is_active: true },
        { name: 'Polo Shirt', price: 6000, category: 'Pakaian Kasual', is_active: true },
        { name: 'Jaket', price: 15000, category: 'Outerwear', is_active: true },
        { name: 'Blazer/Jas', price: 18000, category: 'Pakaian Formal', is_active: true },
        { name: 'Rok', price: 7000, category: 'Pakaian Wanita', is_active: true },
        { name: 'Dress Pendek', price: 10000, category: 'Pakaian Wanita', is_active: true },
        { name: 'Dress Panjang', price: 15000, category: 'Pakaian Wanita', is_active: true },
        { name: 'Seprai Single', price: 8000, category: 'Rumah Tangga', is_active: true },
        { name: 'Seprai Double', price: 12000, category: 'Rumah Tangga', is_active: true },
        { name: 'Selimut', price: 15000, category: 'Rumah Tangga', is_active: true },
        { name: 'Handuk Mandi', price: 5000, category: 'Rumah Tangga', is_active: true },
        { name: 'Handuk Besar', price: 8000, category: 'Rumah Tangga', is_active: true }
      ], { onConflict: 'name' })

    return NextResponse.json({
      success: true,
      message: "Database migration and seed data completed successfully",
      details: {
        serviceTypesError: serviceTypesError?.message || null,
        itemTypesError: itemTypesError?.message || null
      }
    })

  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to run migration",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
