-- Fix RLS to Show All Buyers Including Newest

-- Step 1: Check if newest buyer exists but admin can't see
SELECT 
  'Newest Buyer Check' as check_type,
  p.id,
  p.email,
  p.approval_status,
  p.role,
  p.created_at,
  ROW_NUMBER() OVER (ORDER BY p.created_at DESC) as buyer_rank
FROM profiles p
WHERE p.role = 'buyer'
ORDER BY p.created_at DESC
LIMIT 10;

-- Step 2: Test what admin can actually see
SELECT 
  'Admin Visible Buyers' as check_type,
  auth.uid() as current_admin_id,
  get_user_role() as current_role,
  COUNT(*) as visible_buyers,
  MIN(p.created_at) as oldest_visible,
  MAX(p.created_at) as newest_visible
FROM profiles p
WHERE p.role = 'buyer'
AND get_user_role() = 'admin';

-- Step 3: Drop and recreate RLS policies to ensure admin sees ALL buyers
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- Step 4: Create comprehensive admin policy
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (
  -- Admin can see ALL profiles regardless of status
  get_user_role() = 'admin' OR
  -- Users can see their own profile
  id = auth.uid()
);

-- Step 5: Test the fix
SELECT 
  'After Fix Test' as test_type,
  auth.uid() as current_admin_id,
  get_user_role() as current_role,
  COUNT(*) as total_buyers_admin_can_see,
  COUNT(CASE WHEN approval_status = 'PENDING' THEN 1 END) as pending_count,
  MIN(created_at) as oldest_buyer,
  MAX(created_at) as newest_buyer,
  CASE 
    WHEN COUNT(*) >= 7 THEN '✅ Admin can see all 7 buyers'
    ELSE '❌ Admin still missing buyers: ' || (7 - COUNT(*))
  END as access_status
FROM profiles
WHERE role = 'buyer'
AND get_user_role() = 'admin';
