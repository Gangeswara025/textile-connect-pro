-- Fix RLS Policies to Allow Admin Access

-- Step 1: Drop all existing restrictive policies
DROP POLICY IF EXISTS "Only verified and approved users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Only verified and approved users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Only verified and approved users can insert profiles" ON profiles;

-- Step 2: Create simple admin-friendly policies
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (
  -- Admin can see all profiles
  get_user_role() = 'admin' OR
  -- Users can see their own profile
  id = auth.uid()
);

CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
USING (
  -- Admin can update all profiles
  get_user_role() = 'admin' OR
  -- Users can update their own profile
  id = auth.uid()
);

CREATE POLICY "Admins can insert profiles"
ON profiles
FOR INSERT
WITH CHECK (
  -- Admin can insert any profile
  get_user_role() = 'admin' OR
  -- Users can insert their own profile
  id = auth.uid()
);

-- Step 3: Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Test the fix
SELECT 
  'RLS Fix Test' as test_result,
  auth.uid() as current_admin_id,
  get_user_role() as current_role,
  COUNT(*) as total_profiles_admin_can_see,
  COUNT(CASE WHEN role = 'buyer' THEN 1 END) as buyer_count,
  COUNT(CASE WHEN approval_status = 'PENDING' THEN 1 END) as pending_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Admin can see profiles'
    ELSE '❌ Admin still blocked'
  END as access_status
FROM profiles
WHERE get_user_role() = 'admin';
