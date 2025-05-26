# Fix Admin Favorites Issue - Developer Instructions

## Problem Summary
Admin users are getting "Error adding favorite: undefined" when trying to save deals to favorites. The issue is with database Row Level Security (RLS) policies that only allow `investor` user types to use favorites, but not `admin` user types.

## Files Available on GitHub
All necessary files are in the latest commit on the main branch:
- `fix_admin_favorites.sql` - The fix script
- `diagnose_favorites.sql` - Diagnostic script to check current state
- `FavoriteButton.tsx` - Enhanced with detailed error logging

## Step 1: Diagnose the Current Issue

1. **Access Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to the EquityMD project
   - Go to SQL Editor (left sidebar)

2. **Run Diagnostic Script**
   - Copy the contents of `diagnose_favorites.sql` from GitHub
   - Paste into SQL Editor and run
   - This will show:
     - Current favorites table structure
     - Existing RLS policies
     - User types in the system
     - Current user info (if logged in)

## Step 2: Apply the Database Fix

1. **Run the Fix Script**
   - Copy the contents of `fix_admin_favorites.sql` from GitHub
   - Paste into SQL Editor and run
   - This will:
     - Drop existing restrictive RLS policies
     - Create new policies that allow both `investor` and `admin` user types
     - Add documentation comment

2. **Expected Output**
   ```
   DROP POLICY
   DROP POLICY  
   DROP POLICY
   CREATE POLICY
   CREATE POLICY
   CREATE POLICY
   COMMENT
   ```

## Step 3: Test the Fix

1. **Test in Browser**
   - Go to the running application (localhost:5173 or production)
   - Log in as an admin user
   - Try to favorite a deal by clicking the heart button

2. **Check Browser Console**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for these logs when clicking heart:
     ```
     Checking favorite status for user: [user-id] deal: [deal-id]
     Toggling favorite for deal: [deal-id] Current state: false
     User info: {id: '...', email: '...'}
     Adding favorite...
     Favorite added successfully: [data]
     ```

3. **Verify Success**
   - Heart should turn red/filled when favorited
   - No error messages should appear
   - Check `/favorites` page to see saved deals

## Step 4: Verify for All User Types

Test favorites functionality for:
- **Investor users** - Should still work as before
- **Admin users** - Should now work (this was broken)
- **Syndicator users** - Should not see heart buttons (by design)

## Troubleshooting

### If you still get errors:

1. **Check RLS Policies Applied Correctly**
   ```sql
   SELECT policyname, cmd, qual, with_check 
   FROM pg_policies 
   WHERE tablename = 'favorites';
   ```

2. **Verify User Type**
   ```sql
   SELECT id, email, user_type 
   FROM profiles 
   WHERE id = auth.uid();
   ```

3. **Check Browser Console**
   - Look for detailed error logs in `FavoriteButton.tsx`
   - Error codes like `42501` indicate permission issues
   - `PGRST116` is normal (means no existing favorite found)

### Common Issues:

- **"Permission denied"** - RLS policies not applied correctly
- **"undefined error"** - Database connection or table access issue
- **"Policy violation"** - User type not in allowed list

## Expected Behavior After Fix

- ✅ Admin users can favorite/unfavorite deals
- ✅ Investor users continue to work as before  
- ✅ Heart buttons show on deal cards for authenticated users
- ✅ Favorites page shows saved deals for both investors and admins
- ✅ Share buttons work alongside heart buttons

## Database Schema Reference

The `favorites` table structure:
```sql
- id (UUID, primary key)
- investor_id (UUID, references profiles.id) 
- deal_id (UUID, references deals.id)
- created_at (timestamp)
- updated_at (timestamp)
- UNIQUE constraint on (investor_id, deal_id)
```

Note: Despite the name `investor_id`, this field stores the user ID for both investors and admins after the fix.

## Contact
If you encounter any issues or need clarification, the enhanced error logging in `FavoriteButton.tsx` should provide detailed information about what's failing. 