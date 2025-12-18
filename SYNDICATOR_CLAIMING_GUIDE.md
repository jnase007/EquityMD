# How to Claim an Existing Syndicator Profile

## Overview

EquityMD allows syndicators to claim their company profiles on the platform. This is important because:
- ✅ **Only claimed profiles can receive messages** from investors
- ✅ Claimed profiles can create and manage deals
- ✅ Owners can edit their company information
- ✅ Verified profiles get badges and better visibility

## 🔍 Finding Claimable Profiles

### Option 1: Directory Page
1. Go to `/directory` (Find Syndicators page)
2. Browse or search for your company
3. Click on your company's profile card

### Option 2: Direct URL
If you know your company's slug, go directly to:
```
/syndicators/[your-company-slug]
```

For example:
- `/syndicators/back-bay-capital`
- `/syndicators/sutera-properties`

## 📋 Claiming Process (User Side)

### Step 1: View Syndicator Profile
Navigate to the syndicator profile page you want to claim.

### Step 2: Click "Claim Profile" Button
If the profile is **unclaimed**, you'll see a green **"Claim Profile"** button:

```tsx
// Location: src/pages/SyndicatorProfile.tsx (line 370-378)
{!syndicator.profile && (
  <button onClick={() => setShowClaimModal(true)}>
    Claim Profile
  </button>
)}
```

**Note:** The button only appears if:
- You're logged in
- The syndicator profile is marked as `claimable: true`
- No one else has claimed it yet (`claimed_by IS NULL`)

### Step 3: Fill Out Claim Request Form
A modal will appear asking for:

1. **Company Email** (required)
   - Must be your official company email
   - Example: `john@yourcompany.com`

2. **Company Website** (required)
   - Your official company website URL
   - Example: `https://yourcompany.com`

### Step 4: Submit Request
Click **"Submit Claim Request"** and you'll see:
```
✅ Your claim request has been submitted successfully. 
   Our team will review your request and contact you shortly.
```

Your request is now in the `syndicator_claim_requests` table with status `pending`.

## 🔧 Admin Approval Process

### Step 1: Admin Reviews Request
Admins can view claim requests in the **Admin Dashboard**:
1. Go to `/admin`
2. Click on **"Claim Requests"** tab
3. See all pending, approved, and rejected requests

### Step 2: Admin Evaluates
The admin can see:
- Your name and email
- Company email you provided
- Company website you provided
- When the request was made
- Current ownership status

### Step 3: Admin Decision

**Option A: Approve**
1. Admin adds notes (optional)
2. Clicks **"Approve"** button
3. You receive an email notification
4. Request status changes to `approved`

**Option B: Reject**
1. Admin adds notes explaining why
2. Clicks **"Reject"** button
3. Request status changes to `rejected`

### Step 4: Transfer Ownership (Final Step)
After approval, admin clicks **"Set as Owner"** button which:
1. Updates the syndicator record:
   ```sql
   UPDATE syndicators
   SET claimed_by = '[your-user-id]',
       claimed_at = NOW(),
       claimable = false
   WHERE id = '[syndicator-id]';
   ```
2. You now own the profile! 🎉

## 🎯 What Happens After Claiming

Once your profile is claimed:

### ✅ Messaging Enabled
- Investors can now send you messages
- You'll see messages in your `/inbox`
- Deal-specific messages link to opportunities

### ✅ Edit Access
- You can edit your company profile
- Update logo, description, contact info
- Add past projects and specialties

### ✅ Deal Management
- Create new deals (`/deals/new`)
- Edit existing deals
- Upload documents and media
- Mark deals as active/closed

### ✅ Dashboard Access
- View your syndicator dashboard
- See deal performance
- Track investor interest
- Manage communications

## 🗂️ Database Schema

### Syndicators Table
```sql
syndicators:
  - id (UUID) - Unique syndicator ID
  - company_name (text)
  - claimable (boolean) - Whether profile can be claimed
  - claimed_by (UUID) - References profiles.id (owner)
  - claimed_at (timestamp) - When it was claimed
  - verification_status (text) - unverified/verified/premier
```

### Claim Requests Table
```sql
syndicator_claim_requests:
  - id (UUID)
  - syndicator_id (UUID) - References syndicators.id
  - requester_id (UUID) - References profiles.id
  - company_email (text)
  - company_website (text)
  - status (text) - pending/approved/rejected
  - admin_notes (text)
  - created_at (timestamp)
```

## 🚫 Common Issues & Solutions

### Issue 1: "Claim Profile" Button Not Showing

**Possible Causes:**
1. Profile already claimed → Check if there's a "Contact Syndicator" button instead
2. Not logged in → Sign in first
3. Profile marked as not claimable → Contact admin

**Solution:**
```sql
-- Admin can check claim status:
SELECT 
  company_name,
  claimable,
  claimed_by,
  claimed_at
FROM syndicators
WHERE slug = 'your-company-slug';
```

### Issue 2: Multiple Claim Requests

If multiple people claim the same profile:
- Admin sees all requests grouped by syndicator
- Admin can approve multiple requests
- Only one person can be the owner at a time
- Admin uses "Set as Owner" to transfer between approved requesters

### Issue 3: Messaging Still Not Working After Claim

If messaging doesn't work after claiming:
1. Check that `claimed_by` is set in database
2. Verify `claimed_by` matches your user ID
3. Check browser console for errors
4. Try logging out and back in

```sql
-- Verify ownership:
SELECT 
  s.company_name,
  s.claimed_by,
  p.email as owner_email
FROM syndicators s
LEFT JOIN profiles p ON s.claimed_by = p.id
WHERE s.slug = 'your-company-slug';
```

## 🛠️ For Developers

### Adding a New Syndicator Profile

To add a new claimable syndicator profile:

```sql
INSERT INTO syndicators (
  company_name,
  company_description,
  state,
  city,
  claimable,
  verification_status
) VALUES (
  'New Company Name',
  'Company description...',
  'California',
  'Los Angeles',
  true,  -- Allow claiming
  'verified'
);
```

### Manually Assigning Ownership

If needed, admin can directly assign:

```sql
UPDATE syndicators
SET claimed_by = '[user-profile-id]',
    claimed_at = NOW(),
    claimable = false
WHERE id = '[syndicator-id]';
```

### Checking Claim Request Status

```sql
SELECT 
  scr.id,
  scr.status,
  scr.created_at,
  s.company_name,
  p.full_name as requester_name,
  p.email as requester_email,
  scr.company_email,
  scr.company_website,
  scr.admin_notes
FROM syndicator_claim_requests scr
JOIN syndicators s ON scr.syndicator_id = s.id
JOIN profiles p ON scr.requester_id = p.id
ORDER BY scr.created_at DESC;
```

## 📧 Email Notifications

The system sends emails at key points:

### Claim Request Submitted
**To:** User who submitted claim  
**When:** Immediately after submission  
**Subject:** "Claim Request Received"

### Claim Approved
**To:** User who submitted claim  
**When:** Admin clicks "Approve"  
**Subject:** "Syndicator Profile Claim Approved"  
**Content:** Notifies that claim was approved and ownership will be assigned

### Ownership Transferred
**To:** New owner  
**When:** Admin clicks "Set as Owner"  
**Subject:** "You Now Own [Company Name] Profile"  
**Content:** Welcome message with next steps

## 🔐 Security Considerations

- Users can only claim profiles, not assign themselves
- Admin approval required for all claims
- Email verification recommended before approval
- Ownership transfer requires admin action
- Audit trail in `syndicator_claim_requests` table

## 📞 Contact Support

If you have issues with claiming:
1. Check the Admin Dashboard → Claim Requests
2. Review admin notes for rejected requests
3. Contact support with your request ID
4. Provide proof of company affiliation

---

**Last Updated:** December 18, 2025  
**Related Files:**
- `src/components/ClaimSyndicatorModal.tsx` - Claim request form
- `src/components/admin/ClaimRequests.tsx` - Admin approval interface
- `src/pages/SyndicatorProfile.tsx` - Profile page with claim button
- `MESSAGING_FIX.md` - Related: Why claiming enables messaging

