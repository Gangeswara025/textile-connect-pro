-- Debug RLS Policy Issue for New Users

-- Step 1: Check if new users are being created correctly
SELECT 
  'New Users Check' as check_type,
  p.id,
  p.email,
  p.approval_status,
  p.role,
  p.created_at,
  u.email_confirmed_at,
  CASE 
    WHEN p.approval_status IS NULL THEN '❌ No approval status set'
    WHEN p.approval_status = 'PENDING' THEN '✅ Status is PENDING'
    ELSE '❓ Unknown status: ' || p.approval_status
  END as status_check
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.created_at >= NOW() - INTERVAL '1 hour'
ORDER BY p.created_at DESC;

-- Step 2: Check what admin can see with current RLS policies
SELECT 
  'Admin Access Test' as check_type,
  auth.uid() as current_admin_id,
  COUNT(*) as total_buyers,
  COUNT(CASE WHEN p.role = 'buyer' THEN 1 END) as buyer_count,
  COUNT(CASE WHEN p.approval_status = 'PENDING' THEN 1 END) as pending_count
FROM profiles p
WHERE p.role = 'buyer';

-- Step 3: Check current RLS policies on profiles table
SELECT 
  'Current RLS Policies' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 4: Test if admin can bypass RLS
SELECT 
  'RLS Bypass Test' as check_type,
  COUNT(*) as all_profiles_count
FROM profiles p
WHERE p.role = 'buyer'
AND p.approval_status = 'PENDING';
