-- Migration script to ensure orders table has the correct structure
-- Run this if you need to add missing columns or fix data types

-- Add midtrans_transaction_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'midtrans_transaction_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN midtrans_transaction_id text;
        CREATE INDEX IF NOT EXISTS idx_orders_midtrans_transaction_id 
        ON orders USING btree (midtrans_transaction_id);
    END IF;
END $$;

-- Add midtrans_order_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'midtrans_order_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN midtrans_order_id text;
        CREATE INDEX IF NOT EXISTS idx_orders_midtrans_order_id 
        ON orders USING btree (midtrans_order_id);
    END IF;
END $$;

-- Ensure customer_name and customer_phone columns exist (should already exist based on table definition)
-- This is just for verification

-- Update any existing orders that might have transaction_id in different column
-- (Only run if you have existing data that needs migration)
/*
UPDATE orders 
SET midtrans_transaction_id = transaction_id 
WHERE midtrans_transaction_id IS NULL AND transaction_id IS NOT NULL;
*/

-- Verify table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
