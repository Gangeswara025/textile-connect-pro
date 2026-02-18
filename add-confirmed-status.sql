-- Run this in Supabase SQL Editor if updating order status to "CONFIRMED" fails.
-- This adds CONFIRMED to the allowed order statuses.

-- Drop existing check constraint (name may vary; adjust if you get an error)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new constraint including CONFIRMED
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'PENDING', 'CONFIRMED', 'QUOTED', 'AWAITING_PAYMENT', 'PAID',
    'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'
  )
);
