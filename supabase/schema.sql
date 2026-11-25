-- =========================================================================
-- RUN THIS SQL IN YOUR SUPABASE SQL EDITOR
-- Link: https://supabase.com/dashboard/project/ommezdbmsuwbfjzpdikk/sql
-- =========================================================================

-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer TEXT NOT NULL,
    payment TEXT NOT NULL DEFAULT 'Pending',
    total TEXT NOT NULL,
    items TEXT NOT NULL,
    fulfillment TEXT NOT NULL DEFAULT 'Unfulfilled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view orders
CREATE POLICY "Allow authenticated users to read orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role all operations" 
ON public.orders FOR ALL 
TO service_role 
USING (true);

-- 2. Dump Initial Seed Data
INSERT INTO public.orders (id, date, customer, payment, total, items, fulfillment) VALUES
('#14550', '2026-05-09T16:42:00Z', 'Emma Smith', 'Pending', '$248.00', '2 items', 'Unfulfilled'),
('#14536', '2026-05-09T14:18:00Z', 'Melody Macy', 'Paid', '$1,200.00', '3 items', 'Fulfilled'),
('#14521', '2026-05-08T21:05:00Z', 'Max Smith', 'Pending', '$79.00', '1 item', 'Unfulfilled'),
('#14508', '2026-05-08T18:36:00Z', 'Sean Bean', 'Paid', '$5,500.00', '5 items', 'Fulfilled'),
('#14492', '2026-05-07T19:50:00Z', 'Brian Cox', 'Refunded', '$880.00', '2 items', 'Returned'),
('#14477', '2026-05-07T13:24:00Z', 'Mikaela Collins', 'Paid', '$3,150.00', '4 items', 'Fulfilled'),
('#14463', '2026-05-06T18:10:00Z', 'Francis Drake', 'Pending', '$180.00', '1 item', 'Unfulfilled'),
('#14450', '2026-05-06T11:45:00Z', 'Olivia Wilde', 'Paid', '$920.00', '2 items', 'Fulfilled'),
('#14434', '2026-05-05T15:30:00Z', 'Liam Neeson', 'Paid', '$2,450.00', '3 items', 'Fulfilled'),
('#14418', '2026-05-05T10:15:00Z', 'Sophia Loren', 'Refunded', '$410.00', '1 item', 'Returned'),
('#14402', '2026-05-04T17:20:00Z', 'Lucas Scott', 'Paid', '$1,890.00', '3 items', 'Fulfilled'),
('#14389', '2026-05-04T12:05:00Z', 'Chloe Bennett', 'Pending', '$320.00', '2 items', 'Unfulfilled'),
('#14371', '2026-05-03T16:50:00Z', 'Ethan Hunt', 'Paid', '$4,200.00', '4 items', 'Fulfilled'),
('#14355', '2026-05-03T09:40:00Z', 'Grace Kelly', 'Paid', '$750.00', '1 item', 'Fulfilled'),
('#14338', '2026-05-02T14:15:00Z', 'Noah Centineo', 'Refunded', '$630.00', '2 items', 'Returned')
ON CONFLICT (id) DO NOTHING;
