# Fix Admin Access Issue - justin@brandastic.com

## Problem
When logging in as `justin@brandastic.com`, the user gets stuck on continuous loading when trying to access the admin dashboard at `/admin/dashboard`.

## Root Cause
The admin dashboard checks for `profile?.is_admin === true` but the user profile in the database doesn't have the `is_admin` flag set to `true`.

## Solution

### Step 1: Run Diagnostic Script
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `diagnose_admin_access.sql`
3. Run the script to see the current state
4. This will show if the user exists and what their current admin status is

### Step 2: Apply the Fix
1. Copy and paste the contents of `fix_admin_user.sql` 
2. Run the script in Supabase SQL Editor
3. This will:
   - Add the `is_admin` column if it doesn't exist
   - Set `justin@brandastic.com` to admin status
   - Create triggers to automatically grant admin on future logins
   - Set user type to 'syndicator' and verified status

### Step 3: Verify the Fix
1. The fix script includes verification queries at the end
2. You should see output showing:
   ```
   email: justin@brandastic.com
   is_admin: true
   user_type: syndicator
   is_verified: true
   ```

### Step 4: Test Admin Access
1. **Clear browser cache/localStorage** (important!)
2. Log out completely from the application
3. Log back in as `justin@brandastic.com`
4. Navigate to `/admin/dashboard`
5. You should now see the admin dashboard without loading issues

## Alternative Access Methods

### Development Mode Access
If the database fix doesn't work immediately, you can use the development route:
- Go to `/dev-admin/dashboard` instead of `/admin/dashboard`
- This bypasses the admin check and allows immediate access

### Simple Access Code
- The current `/admin` route uses access code `777`
- You can use this as a temporary workaround
- Navigate to `/admin` and enter `777` as the access code

## Technical Details

### How Admin Access Works
1. User logs in via Google OAuth or email/password
2. App checks `useAuthStore()` for `profile?.is_admin`
3. If `is_admin === true`, admin dashboard is accessible
4. If not, user gets redirected or stuck loading

### Database Schema
```sql
profiles table:
- id (UUID)
- email (text)
- is_admin (boolean) -- This needs to be true
- user_type (text) -- Should be 'syndicator' for admin
- is_verified (boolean) -- Should be true
```

### Code Location
- Admin check: `src/pages/admin/Dashboard.tsx` line 22
- Profile loading: `src/App.tsx` fetchProfile function
- Auth store: `src/lib/store.ts`

## Prevention
The trigger created by the fix script will automatically grant admin access to `justin@brandastic.com` on any future profile creation or update, preventing this issue from recurring.

## Troubleshooting

### Still getting loading issues?
1. Check browser console for errors
2. Verify you're logged in as the correct email
3. Try clearing all browser data and logging in fresh
4. Use the diagnostic script to verify database state

### Profile not updating?
1. The app caches profile data in `useAuthStore`
2. Logging out and back in forces a fresh profile fetch
3. The trigger should catch any future updates automatically

### Need immediate access?
Use the dev route: `/dev-admin/dashboard` - this bypasses all checks. 