# Admin User Update Issue Fix

## 🚨 Problem Description

When logged in as an admin and trying to update user roles (e.g., changing "Joran Nassie" from admin to user), the changes don't persist. The UI shows the change temporarily, but after a page refresh or when the auto-save triggers, the change is reverted.

## 🔍 Root Cause

The issue is caused by database Row Level Security (RLS) policies that were changed in migration `20250326184152_red_water.sql`. This migration removed admin privileges and replaced them with policies that only allow users to update their own profiles:

```sql
-- Current restrictive policy (from red_water migration)
CREATE POLICY "Enable update for users based on id"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)  -- Only allows self-updates
  WITH CHECK (auth.uid() = id);
```

This means that even admins cannot update other users' `is_admin` or `is_verified` fields.

## 🛠️ Solutions

### Solution 1: Database Policy Fix (Recommended)

Run the following SQL commands in your Supabase SQL Editor:

```sql
-- Drop the restrictive update policy
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Create new policy that allows both self-updates and admin updates
CREATE POLICY "Enable update for users and admins"
  ON profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR  -- Users can update their own profile
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )  -- Admins can update any profile
  )
  WITH CHECK (
    auth.uid() = id OR  -- Users can update their own profile
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )  -- Admins can update any profile
  );

-- Also update the select policy to ensure admins can view all profiles
DROP POLICY IF EXISTS "Enable select for authenticated users" ON profiles;

CREATE POLICY "Enable select for users and admins"
  ON profiles
  FOR SELECT
  USING (
    auth.uid() = id OR  -- Users can view their own profile
    auth.role() = 'authenticated' OR  -- Authenticated users can view other profiles
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )  -- Admins can view all profiles
  );
```

### Solution 2: Using the Fix Script

If you have the Supabase service key, you can run the automated fix script:

```bash
# Make sure you have the service key in your .env file
# VITE_SUPABASE_SERVICE_KEY=your_service_key

node fix-admin-policies.js
```

### Solution 3: Manual Verification

To verify the fix worked, check that admin users can update other profiles:

1. Log in as an admin user
2. Go to Admin Dashboard → User Management
3. Try changing a user's admin status or verification status
4. The auto-save indicator should show "Changes saved automatically"
5. Refresh the page to confirm the changes persisted

## 🔧 How the Auto-Save Works

The UserManagement component uses the `useAutoSave` hook with the following flow:

1. User clicks to toggle admin/verification status
2. UI updates optimistically (immediate visual feedback)
3. Change is added to `pendingUpdates` state
4. Auto-save triggers after 1.5 seconds of no changes
5. Batch update sent to Supabase: `supabase.from('profiles').update(updateData).eq('id', userId)`
6. If successful, `pendingUpdates` is cleared
7. If failed, error is logged and shown

## 🚨 Current Behavior Without Fix

- ✅ UI updates immediately (optimistic update)
- ❌ Database update fails silently due to RLS policy
- ❌ Auto-save shows success but changes don't persist
- ❌ Page refresh shows original values

## ✅ Expected Behavior After Fix

- ✅ UI updates immediately (optimistic update)
- ✅ Database update succeeds for admin users
- ✅ Auto-save shows success and changes persist
- ✅ Page refresh shows updated values

## 🔍 Debugging Steps

If the issue persists after applying the fix:

1. **Check admin status**: Verify the current user has `is_admin = true`
2. **Check browser console**: Look for any error messages during save
3. **Check auto-save indicator**: Should show "Changes saved automatically"
4. **Check database directly**: Query the profiles table to see if changes were applied
5. **Check RLS policies**: Verify the new policies are active

```sql
-- Check current user's admin status
SELECT id, email, full_name, is_admin FROM profiles WHERE id = auth.uid();

-- Check all admin users
SELECT id, email, full_name, is_admin FROM profiles WHERE is_admin = true;

-- Check current policies on profiles table
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

## 📝 Files Modified

- `fix-admin-policies.js` - Automated fix script
- `supabase/migrations/20250527_restore_admin_policies.sql` - Migration file
- This documentation file

## 🎯 Testing the Fix

1. Log in as admin user
2. Navigate to Admin Dashboard → User Management
3. Find a test user (not yourself)
4. Toggle their admin status or verification status
5. Wait for auto-save indicator to show "Changes saved automatically"
6. Refresh the page
7. Verify the change persisted

The fix should restore full admin functionality for user management while maintaining security for regular users. 