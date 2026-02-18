-- Restore Working RLS Policies

-- Step 1: Re-enable RLS if it was disabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop all the problematic policies we created
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- Step 3: Restore the original working policies
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (get_user_role() = 'admin');

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
USING (get_user_role() = 'admin');

-- Step 4: Test admin login
SELECT 
  'Admin Login Test' as test_type,
  auth.uid() as current_admin_id,
  get_user_role() as current_role,
  COUNT(*) as profiles_accessible,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Admin can login and see profiles'
    ELSE '❌ Admin login blocked'
  END as login_status
FROM profiles
WHERE get_user_role() = 'admin';

-- Step 5: Test if admin can see buyers
SELECT 
  'Admin Buyer Access Test' as test_type,
  COUNT(*) as total_buyers,
  COUNT(CASE WHEN approval_status = 'PENDING' THEN 1 END) as pending_count
FROM profiles
WHERE role = 'buyer'
AND get_user_role() = 'admin';
