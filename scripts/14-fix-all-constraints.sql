-- Fix all remaining foreign key constraint issues

-- Drop problematic foreign key constraints
ALTER TABLE public.order_tracking DROP CONSTRAINT IF EXISTS order_tracking_created_by_fkey;
ALTER TABLE public.addresses DROP CONSTRAINT IF EXISTS addresses_user_id_fkey;

-- Make created_by nullable in order_tracking (since we don't have auth users for demo)
ALTER TABLE public.order_tracking ALTER COLUMN created_by DROP NOT NULL;

-- Make user_id nullable in addresses (for demo purposes)
ALTER TABLE public.addresses ALTER COLUMN user_id DROP NOT NULL;

-- Create a demo user in the public.users table
INSERT INTO public.users (id, email, name, phone, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'demo@laundry.com',
    'Demo User',
    '08123456789',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create a simple profile for the demo user
INSERT INTO public.profiles (id, email, full_name, phone, role, is_active, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'demo@laundry.com',
    'Demo User',
    '08123456789',
    'customer',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample service types
INSERT INTO public.service_types (name, type, price, description, is_active) 
VALUES
  ('Cuci Kering Kiloan', 'kiloan', 5000, 'Cuci dan kering per kilogram', true),
  ('Cuci Setrika Kiloan', 'kiloan', 7000, 'Cuci, kering, dan setrika per kilogram', true),
  ('Cuci Setrika Premium', 'kiloan', 10000, 'Cuci setrika dengan detergen premium', true),
  ('Cuci Express Kiloan', 'kiloan', 12000, 'Cuci setrika selesai 1 hari', true),
  
  ('Kemeja Reguler', 'satuan', 8000, 'Cuci setrika kemeja biasa', true),
  ('Kemeja Premium', 'satuan', 12000, 'Cuci setrika kemeja dengan treatment khusus', true),
  ('Celana Panjang Satuan', 'satuan', 8000, 'Cuci setrika celana panjang', true),
  ('Jaket/Jas', 'satuan', 15000, 'Cuci setrika jaket atau jas', true),
  ('Dress/Gaun', 'satuan', 12000, 'Cuci setrika dress atau gaun', true),
  ('Sepatu Cuci', 'satuan', 20000, 'Cuci sepatu dengan treatment khusus', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample item types
INSERT INTO public.item_types (name, price, category, is_active) 
VALUES
  ('Kemeja Pria', 8000, 'Pakaian Formal', true),
  ('Kemeja Wanita', 8000, 'Pakaian Formal', true),
  ('Celana Panjang Pria', 8000, 'Pakaian Formal', true),
  ('Celana Panjang Wanita', 8000, 'Pakaian Formal', true),
  ('Kaos/T-Shirt', 5000, 'Pakaian Kasual', true),
  ('Polo Shirt', 6000, 'Pakaian Kasual', true),
  ('Jaket', 15000, 'Outerwear', true),
  ('Blazer/Jas', 18000, 'Pakaian Formal', true),
  ('Rok', 7000, 'Pakaian Wanita', true),
  ('Dress Pendek', 10000, 'Pakaian Wanita', true),
  ('Dress Panjang', 15000, 'Pakaian Wanita', true),
  ('Seprai Single', 8000, 'Rumah Tangga', true),
  ('Seprai Double', 12000, 'Rumah Tangga', true),
  ('Selimut', 15000, 'Rumah Tangga', true),
  ('Handuk Mandi', 5000, 'Rumah Tangga', true),
  ('Handuk Besar', 8000, 'Rumah Tangga', true)
ON CONFLICT (name) DO NOTHING;

-- Update the add_order_tracking function to handle nullable created_by
CREATE OR REPLACE FUNCTION add_order_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- Add tracking entry when order is inserted or status changes
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_tracking (order_id, status, notes, created_by)
    VALUES (NEW.id, NEW.status, 'Order created', NEW.user_id);
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.order_tracking (order_id, status, notes, created_by)
    VALUES (NEW.id, NEW.status, 'Status changed from ' || OLD.status || ' to ' || NEW.status, NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the set_order_number function to ensure uniqueness
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
DECLARE
    order_num TEXT;
    counter INT;
BEGIN
    -- Generate order number with format: LDY-YYYYMMDD-XXXX
    SELECT COUNT(*) INTO counter
    FROM orders 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    order_num := 'LDY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                 LPAD((counter + 1)::TEXT, 4, '0');
    
    NEW.order_number := order_num;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Disable RLS for all tables except users (as requested)
ALTER TABLE public.service_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
