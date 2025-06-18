import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with correct credentials
const supabaseUrl = "https://hynehzvcqpwbojjovmav.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bmVoenZjcXB3Ym9qam92bWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDI2ODEsImV4cCI6MjA2NTYxODY4MX0.TCm8DYdIFGrk9e_kUYUS3QbkiR0Jda05iZPT9weDh7U"

// Types
export interface OrderData {
  order_id: string
  service_type: 'kiloan' | 'satuan'
  weight?: number
  satuan_qty?: number
  satuan_items?: Array<{ item_type: string; quantity: number; price_per_item: number }>
  items?: Array<{ name: string; qty: number; price: number }> // For satuan items
  address: string
  pickup_date: string
  pickup_time: string
  contact_name: string
  contact_phone: string
  notes?: string
  total_price: number
  payment_method?: string
  transaction_id?: string
  customer_details: {
    email: string
    name: string
    phone: string
  }
}

export interface PaymentResult {
  transaction_status: string
  order_id: string
  payment_type: string
  gross_amount: string
  transaction_id: string
  fraud_status?: string
  transaction_time?: string
}

export class OrderService {
  private supabase = createClient(supabaseUrl, supabaseAnonKey)

  /**
   * Simpan order ke database setelah payment berhasil
   */
  async createOrder(orderData: OrderData, paymentResult?: PaymentResult): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      console.log('Creating order in database:', orderData)

      // For demo purposes, we'll use a dummy user_id
      // In a real app, you'd get this from authentication
      const dummyUserId = "550e8400-e29b-41d4-a716-446655440000"

      // First, ensure user exists
      const { data: existingUser } = await this.supabase
        .from("users")
        .select("id")
        .eq("id", dummyUserId)
        .single()

      if (!existingUser) {
        // Create dummy user
        const { error: userError } = await this.supabase
          .from("users")
          .insert({
            id: dummyUserId,
            email: orderData.customer_details?.email || "customer@example.com",
            name: orderData.customer_details?.name || orderData.contact_name,
            phone: orderData.customer_details?.phone || orderData.contact_phone
          })

        if (userError) {
          console.error("Error creating user:", userError)
        }
      }

      // Create address entry
      const { data: addressData, error: addressError } = await this.supabase
        .from("addresses")
        .insert({
          user_id: dummyUserId,
          address: orderData.address,
          label: "Pickup Address",
          is_default: true
        })
        .select()
        .single()

      if (addressError) {
        console.error("Error creating address:", addressError)
        // Continue with order creation even if address fails
      }

      // Prepare order data for insertion
      const orderDataToInsert = {
        user_id: dummyUserId,
        address_id: addressData?.id || null,
        pickup_date: orderData.pickup_date,
        pickup_time: orderData.pickup_time,
        service_type: orderData.service_type,
        weight: orderData.service_type === 'kiloan' ? orderData.weight : null,
        items: orderData.service_type === 'satuan' ? orderData.satuan_items : null,
        contact_name: orderData.contact_name,
        contact_phone: orderData.contact_phone,
        notes: orderData.notes || null,
        status: paymentResult?.transaction_status === 'settlement' || 
                paymentResult?.transaction_status === 'capture' ? 'confirmed' : 'pending',
        total_price: orderData.total_price,
        payment_method: paymentResult?.payment_type || 'transfer',
        payment_status: paymentResult?.transaction_status === 'settlement' || 
                       paymentResult?.transaction_status === 'capture' ? 'paid' : 'pending',
        transaction_id: paymentResult?.transaction_id || null,
        fraud_status: paymentResult?.fraud_status || null,
        transaction_time: paymentResult?.transaction_time ? 
                         new Date(paymentResult.transaction_time).toISOString() : null
      }

      // Insert order
      const { data: orderResult, error: insertOrderError } = await this.supabase
        .from("orders")
        .insert(orderDataToInsert)
        .select()
        .single()

      if (insertOrderError) {
        console.error("Error creating order:", insertOrderError)
        return {
          success: false,
          error: `Failed to create order: ${insertOrderError.message}`
        }
      }

      // Insert order items if satuan service
      if (orderData.service_type === 'satuan' && orderData.satuan_items && orderData.satuan_items.length > 0) {
        const orderItemsData = orderData.satuan_items.map(item => ({
          order_id: orderResult.id,
          item_type: item.item_type,
          quantity: item.quantity,
          price_per_item: item.price_per_item,
          total_price: item.quantity * item.price_per_item
        }))

        const { error: itemsError } = await this.supabase
          .from("order_items")
          .insert(orderItemsData)

        if (itemsError) {
          console.error("Error creating order items:", itemsError)
          // Don't fail the whole order creation for items error
        }
      }

      console.log("Order created successfully:", orderResult)

      return {
        success: true,
        orderId: orderResult.id
      }

    } catch (error) {
      console.error('Error creating order:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string, paymentStatus?: string): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (paymentStatus) {
        updateData.payment_status = paymentStatus
      }

      const { error } = await this.supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating order status:', error)
      return false
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        console.error('Error fetching order:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  }

  /**
   * Get orders by user
   */
  async getUserOrders(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user orders:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching user orders:', error)
      return []
    }
  }

  /**
   * Generate order number
   */
  private generateOrderNumber(): string {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = Math.floor(now.getTime() / 1000).toString().slice(-6)
    return `ORD-${dateStr}-${timeStr}`
  }

  /**
   * Map payment type dari Midtrans ke format database
   */
  private mapPaymentMethod(paymentType?: string): string {
    if (!paymentType) return 'transfer'

    const mapping: { [key: string]: string } = {
      'credit_card': 'credit_card',
      'bank_transfer': 'bank_transfer',
      'bca_va': 'bank_transfer',
      'bni_va': 'bank_transfer',
      'bri_va': 'bank_transfer',
      'mandiri_va': 'bank_transfer',
      'permata_va': 'bank_transfer',
      'gopay': 'gopay',
      'shopeepay': 'shopeepay',
      'dana': 'dana',
      'ovo': 'ovo',
      'linkaja': 'linkaja',
      'qris': 'qris',
      'echannel': 'bank_transfer'
    }

    return mapping[paymentType.toLowerCase()] || 'transfer'
  }

  /**
   * Ensure user exists in users table
   */
  private async ensureUserExists(user: any, orderData: OrderData) {
    try {
      // Check if user exists
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingUser) {
        // Create user record
        const { error } = await this.supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || 'user@example.com',
            name: orderData.contact_name || user.user_metadata?.name || 'User',
            phone: orderData.contact_phone || null
          })

        if (error && error.code !== '23505') { // Ignore duplicate key error
          console.error('Error creating user:', error)
        }
      }
    } catch (error) {
      console.error('Error ensuring user exists:', error)
    }
  }

  /**
   * Log payment untuk audit trail
   */
  private async logPayment(orderId: string, paymentResult: PaymentResult) {
    try {
      await this.supabase
        .from('payment_logs')
        .insert({
          order_id: orderId,
          transaction_status: paymentResult.transaction_status || 'success',
          payment_type: paymentResult.payment_type,
          amount: paymentResult.gross_amount,
          webhook_data: paymentResult
        })
    } catch (error) {
      console.error('Error logging payment:', error)
      // Don't throw error, just log it
    }
  }
}

// Export singleton instance
export const orderService = new OrderService()
