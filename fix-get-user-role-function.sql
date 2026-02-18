-- Fix get_user_role Function Error

-- Step 1: Create the missing get_user_role function
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Test the function
SELECT 
  'Function Test' as test_type,
  auth.uid() as current_user_id,
  get_user_role() as current_role,
  CASE 
    WHEN get_user_role() = 'admin' THEN '✅ Admin role detected'
    WHEN get_user_role() = 'buyer' THEN '✅ Buyer role detected'
    ELSE '❌ No role found'
  END as role_status;

-- Step 3: Test RLS policies with the function
SELECT 
  'RLS Test with Function' as test_type,
  COUNT(*) as total_profiles_accessible,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ RLS working with function'
    ELSE '❌ RLS still broken'
  END as rls_status
FROM profiles
WHERE get_user_role() = 'admin' OR id = auth.uid();
