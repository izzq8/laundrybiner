-- Insert sample service types and pricing
CREATE TABLE IF NOT EXISTS public.service_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('kiloan', 'satuan')) NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample service types
INSERT INTO public.service_types (name, type, price, description) VALUES
('Cuci Kering Kiloan', 'kiloan', 8000, 'Layanan cuci dan kering per kilogram'),
('Cuci Setrika Kiloan', 'kiloan', 10000, 'Layanan cuci, kering, dan setrika per kilogram'),
('Express Kiloan', 'kiloan', 15000, 'Layanan kiloan dengan pengerjaan 24 jam'),
('Kemeja', 'satuan', 8000, 'Cuci setrika kemeja'),
('Celana Panjang', 'satuan', 7000, 'Cuci setrika celana panjang'),
('Kaos/T-Shirt', 'satuan', 5000, 'Cuci setrika kaos'),
('Dress', 'satuan', 12000, 'Cuci setrika dress'),
('Blazer/Jas', 'satuan', 15000, 'Cuci setrika blazer atau jas'),
('Rok', 'satuan', 6000, 'Cuci setrika rok'),
('Celana Pendek', 'satuan', 5000, 'Cuci setrika celana pendek');

-- Create item types table for satuan pricing
CREATE TABLE IF NOT EXISTS public.item_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert item types
INSERT INTO public.item_types (name, price, category) VALUES
('Kemeja', 8000, 'Atasan'),
('Kaos/T-Shirt', 5000, 'Atasan'),
('Blouse', 7000, 'Atasan'),
('Sweater', 10000, 'Atasan'),
('Celana Panjang', 7000, 'Bawahan'),
('Celana Pendek', 5000, 'Bawahan'),
('Rok', 6000, 'Bawahan'),
('Dress', 12000, 'Pakaian'),
('Blazer', 15000, 'Formal'),
('Jas', 20000, 'Formal'),
('Jaket', 12000, 'Outerwear');
