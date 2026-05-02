# Cursor Prompt: Syndicator Verification & Deal Approval Flow

## Context
EquityMD already has a verification system:
- `syndicator_profiles` table has `verification_status` column (unverified, verified, featured, premium)
- `SyndicatorVerificationAdmin.tsx` component for admin approval
- `VerificationBadge.tsx` and `VerifiedBadge.tsx` for display
- `syndicator_verification_history` table for audit trail
- Supabase storage already exists for deal media/documents

## What To Build

### 1. Verification Document Upload (Syndicator Side)

Add a verification section to the syndicator profile/settings page. If `verification_status` is `unverified`, show a card that says:

**"Verify your account to list deals on EquityMD"**

Three upload fields:
- **Government ID** (required) — US driver's license or passport. File upload (image or PDF, max 10MB)
- **Entity Documents** (required) — Articles of Incorporation, LLC Operating Agreement, or Certificate of Formation. File upload (PDF, max 10MB)
- **Bio / Track Record** (required) — text field, minimum 100 characters. Describe your CRE experience and completed deals.

Submit button: "Submit for Verification"

On submit:
- Upload files to Supabase Storage bucket `verification-docs` (private, not public)
- Path: `verification-docs/{syndicator_id}/gov-id.{ext}` and `verification-docs/{syndicator_id}/entity-docs.{ext}`
- Update `syndicator_profiles` set `verification_status = 'pending'`
- Insert a row into `syndicator_verification_history` with status change
- Show confirmation: "Documents submitted! We'll review within 24-48 hours."
- Send notification to admin (Justin) — email or Supabase webhook

### 2. Add 'pending' Status

Update the `verification_status` CHECK constraint to include 'pending':
```sql
ALTER TABLE syndicator_profiles 
DROP CONSTRAINT IF EXISTS syndicator_profiles_verification_status_check;

ALTER TABLE syndicator_profiles 
ADD CONSTRAINT syndicator_profiles_verification_status_check 
CHECK (verification_status IN ('unverified', 'pending', 'verified', 'featured', 'premium'));
```

### 3. Deal Listing Gate

In the NewDeal page and any deal creation flow:
- Check `verification_status` of the current user's syndicator profile
- If NOT `verified`, `featured`, or `premium` → block deal creation
- Show message: "You need to verify your account before listing a deal. [Verify Now →]"
- Link to the verification upload section

### 4. Admin Review Panel Update

Update `SyndicatorVerificationAdmin.tsx`:
- Add a "Pending" tab/filter showing syndicators with `verification_status = 'pending'`
- Show uploaded documents (links to Supabase Storage files)
- Add "Approve" button (sets to `verified`) and "Deny" button (sets back to `unverified` with notes)
- Pending count badge in the admin sidebar

### 5. Deal Approval Queue

Add admin approval for deal listings:
- Add `approval_status` column to `deals` table: `pending`, `approved`, `rejected`
- Default new deals to `approval_status = 'pending'`
- Deals with `pending` status are NOT visible on the public directory/browse pages
- Admin panel gets a "Pending Deals" section to review and approve/reject
- Approved deals become visible to all users
- Rejected deals show a message to the syndicator with admin notes

```sql
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
```

Update all public deal queries to filter: `WHERE approval_status = 'approved'`

### 6. Storage Bucket Setup

Create a private Supabase storage bucket `verification-docs`:
- RLS: Only the syndicator can upload to their own folder
- RLS: Only admins can read all files
- No public access

### 7. US Only

- Add a note on the verification form: "EquityMD is currently available for US-based entities only."
- Entity documents must be from a US state

## Design Notes
- Keep it clean and simple — match existing EquityMD design system
- Verification card should feel like a gentle nudge, not a blocker (until they try to list a deal)
- Admin panel should make it dead simple to approve — one click
- Mobile responsive

## Files To Modify
- `src/pages/Profile.tsx` or `src/pages/ProfileNew.tsx` — add verification upload section
- `src/pages/NewDeal.tsx` — add verification gate
- `src/components/SyndicatorVerificationAdmin.tsx` — add pending tab + doc viewer
- `src/pages/admin/AdminDashboard.tsx` — add pending deals section
- New migration file for schema changes
- Supabase storage bucket config
