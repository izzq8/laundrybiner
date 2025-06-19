-- Create feedback table for order completion feedback
CREATE TABLE IF NOT EXISTS public.order_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    admin_reply TEXT,
    admin_reply_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_feedback_order_id ON public.order_feedback(order_id);
CREATE INDEX IF NOT EXISTS idx_order_feedback_user_id ON public.order_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_order_feedback_rating ON public.order_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_order_feedback_created_at ON public.order_feedback(created_at);

-- Add unique constraint to prevent duplicate feedback per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_feedback_unique_order ON public.order_feedback(order_id);

-- Disable RLS for feedback table (demo purposes)
ALTER TABLE public.order_feedback DISABLE ROW LEVEL SECURITY;

-- Add new status 'completed' for orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS feedback_id UUID REFERENCES public.order_feedback(id) ON DELETE SET NULL;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_order_feedback_updated_at ON public.order_feedback;
CREATE TRIGGER update_order_feedback_updated_at
  BEFORE UPDATE ON public.order_feedback
  FOR EACH ROW EXECUTE FUNCTION update_feedback_updated_at();
