-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  label TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  address_id UUID REFERENCES public.addresses(id),
  pickup_date DATE NOT NULL,
  pickup_time TEXT NOT NULL,
  service_type TEXT CHECK (service_type IN ('kiloan', 'satuan')) NOT NULL,
  weight DECIMAL(5,2),
  items JSONB,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'picked_up', 'processing', 'delivering', 'completed')) DEFAULT 'pending',
  total_price INTEGER,
  payment_method TEXT CHECK (payment_method IN ('transfer', 'cod')),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  admin_reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table for satuan service
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_per_item INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orders" ON public.orders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback" ON public.feedback
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own order items" ON public.order_items
  FOR ALL USING (auth.uid() = (SELECT user_id FROM public.orders WHERE id = order_id));
