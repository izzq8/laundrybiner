-- Add pending_cancellation status to orders status constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status = ANY (ARRAY[
  'pending'::text,
  'confirmed'::text,
  'picked_up'::text,
  'in_process'::text,
  'ready'::text,
  'delivered'::text,
  'cancelled'::text,
  'pending_cancellation'::text
]));

-- Create index for pending_cancellation status for admin queries
CREATE INDEX IF NOT EXISTS idx_orders_pending_cancellation 
ON public.orders (status) 
WHERE status = 'pending_cancellation';
