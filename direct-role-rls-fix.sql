-- Alternative Fix - Direct Role Check in RLS

-- Step 1: Test if get_user_role() works correctly
SELECT 
  'Function Test' as test_type,
  auth.uid() as current_user_id,
  get_user_role() as role_from_function,
  (SELECT role FROM profiles WHERE id = auth.uid()) as direct_role_check
FROM profiles 
WHERE id = auth.uid()
LIMIT 1;

-- Step 2: Drop all RLS policies completely
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- Step 3: Create RLS policy with direct role check (not function)
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (
  -- Direct role check instead of function
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
  -- Users can see their own profile
  id = auth.uid()
);

-- Step 4: Create update policy with direct check
CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
  id = auth.uid()
);

-- Step 5: Create insert policy with direct check
CREATE POLICY "Admins can insert profiles"
ON profiles
FOR INSERT
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
  id = auth.uid()
);

-- Step 6: Final test
SELECT 
  'Direct Role Fix Test' as test_result,
  auth.uid() as current_admin_id,
  (SELECT role FROM profiles WHERE id = auth.uid()) as current_role,
  COUNT(*) as total_buyers_visible,
  CASE 
    WHEN COUNT(*) = 7 THEN '✅ SUCCESS: All 7 buyers visible'
    ELSE '❌ FAILED: Still missing ' || (7 - COUNT(*)) || ' buyers'
  END as final_status
FROM profiles
WHERE role = 'buyer'
AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin';
