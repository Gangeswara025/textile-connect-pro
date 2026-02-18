-- Complete Fix for Missing Newest Buyer

-- Step 1: Force drop all RLS policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- Step 2: Create simple, powerful admin policy
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (
  -- Admin can see ALL profiles without any restrictions
  get_user_role() = 'admin' OR
  -- Users can see their own profile
  id = auth.uid()
);

-- Step 3: Create update policy
CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
USING (
  get_user_role() = 'admin' OR
  id = auth.uid()
);

-- Step 4: Create insert policy
CREATE POLICY "Admins can insert profiles"
ON profiles
FOR INSERT
WITH CHECK (
  get_user_role() = 'admin' OR
  id = auth.uid()
);

-- Step 5: Final verification test
SELECT 
  'Final Fix Test' as test_result,
  auth.uid() as current_admin_id,
  get_user_role() as current_role,
  COUNT(*) as total_buyers_visible,
  COUNT(CASE WHEN approval_status = 'PENDING' THEN 1 END) as pending_count,
  CASE 
    WHEN COUNT(*) = 7 THEN '✅ SUCCESS: All 7 buyers visible'
    ELSE '❌ FAILED: Still missing ' || (7 - COUNT(*)) || ' buyers'
  END as final_status
FROM profiles
WHERE role = 'buyer'
AND get_user_role() = 'admin';
