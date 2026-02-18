-- Create Real Database Tables for Orders, Quotations, and Invoices

-- Step 1: Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  fabric TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quotation_number TEXT UNIQUE NOT NULL,
  fabric TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  delivery_charge DECIMAL(10,2) DEFAULT 0,
  grand_total DECIMAL(10,2) NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  status TEXT NOT NULL CHECK (status IN ('PAID', 'PENDING', 'OVERDUE')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create RLS policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own orders"
ON orders
FOR SELECT
USING (buyer_id = auth.uid());

CREATE POLICY "Admins can view all orders"
ON orders
FOR SELECT
USING (get_user_role() = 'admin');

CREATE POLICY "Buyers can insert own orders"
ON orders
FOR INSERT
WITH CHECK (buyer_id = auth.uid());

-- Step 5: Create RLS policies for quotations
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own quotations"
ON quotations
FOR SELECT
USING (buyer_id = auth.uid());

CREATE POLICY "Admins can view all quotations"
ON quotations
FOR SELECT
USING (get_user_role() = 'admin');

-- Step 6: Create RLS policies for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own invoices"
ON invoices
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM orders o 
  WHERE o.id = invoices.order_id 
  AND o.buyer_id = auth.uid()
));

CREATE POLICY "Admins can view all invoices"
ON invoices
FOR SELECT
USING (get_user_role() = 'admin');

-- Step 7: Insert sample data for testing
INSERT INTO orders (buyer_id, order_number, fabric, quantity, unit_price, total_amount, status)
SELECT 
  id, 
  'ORD-TEST-001',
  'Test Fabric',
  100.00,
  50.00,
  5000.00,
  'PENDING'
FROM profiles 
WHERE role = 'buyer' 
LIMIT 1;

INSERT INTO quotations (buyer_id, quotation_number, fabric, quantity, unit_price, total_amount, grand_total, valid_until, status)
SELECT 
  id,
  'QT-TEST-001',
  'Test Fabric',
  200.00,
  25.00,
  5000.00,
  500.00,
  NOW() + INTERVAL '7 days',
  'PENDING'
FROM profiles 
WHERE role = 'buyer' 
LIMIT 1;

INSERT INTO invoices (order_id, invoice_number, amount, due_date, status)
SELECT 
  o.id,
  'INV-TEST-001',
  o.total_amount,
  NOW() + INTERVAL '30 days',
  'PENDING'
FROM orders o
WHERE o.order_number = 'ORD-TEST-001';
