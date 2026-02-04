# Step-by-Step Email Setup Guide for EquityMD

Follow these steps to complete the email configuration for EquityMD.

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Access to your Supabase project dashboard
- [ ] Access to your domain's DNS settings (for Resend domain verification)
- [ ] Admin access to EquityMD application

## Step 1: Set Up Resend Account (15 minutes)

### 1.1 Create Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Click **Sign Up** or **Get Started**
3. Create account with your email
4. Verify your email address

### 1.2 Add and Verify Domain
1. In Resend dashboard, click **Domains** in sidebar
2. Click **Add Domain** button
3. Enter your domain: `equitymd.com` (or your domain)
4. Click **Add Domain**
5. You'll see DNS records to add:
   - **SPF Record** (TXT record)
   - **DKIM Records** (CNAME records - usually 3)
   - **DMARC Record** (TXT record)

6. Add DNS records to your domain:
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Navigate to DNS settings
   - Add each record exactly as shown in Resend
   - Save changes

7. Wait for verification:
   - Return to Resend dashboard
   - Click **Verify** or wait for automatic verification
   - Status should change to "Verified" (green checkmark)
   - This can take 5-30 minutes

### 1.3 Create API Key
1. In Resend dashboard, click **API Keys** in sidebar
2. Click **Create API Key**
3. Name it: `EquityMD Production`
4. Select permissions: **Sending access**
5. Click **Add**
6. **IMPORTANT**: Copy the API key immediately (starts with `re_`)
   - You won't be able to see it again
   - Store it securely

## Step 2: Configure Supabase Edge Functions (10 minutes)

### 2.1 Add Resend API Key to Supabase
1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in sidebar
3. Click **Settings** (gear icon)
4. Scroll to **Secrets** section
5. Click **Add Secret**
6. Enter:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Paste your Resend API key (starts with `re_`)
7. Click **Save**

### 2.2 Verify Edge Functions Exist
1. In Supabase dashboard, go to **Edge Functions**
2. Verify these functions exist:
   - ✅ `send-email`
   - ✅ `send-admin-message-email`
   - ✅ `send-email-invitation`

If any are missing, they need to be deployed from your codebase.

### 2.3 Test Edge Function
1. In Supabase dashboard, go to **Edge Functions** → `send-email`
2. Click **Invoke** button
3. Enter test payload:
   ```json
   {
     "to": "your-email@example.com",
     "type": "welcome_email",
     "data": {
       "userName": "Test User",
       "userType": "investor"
     }
   }
   ```
4. Click **Invoke Function**
5. Check your email inbox for the test email
6. If successful, you'll see a response with email ID

## Step 3: Verify Email Templates (5 minutes)

### 3.1 Check Email Preview Page
1. Start your EquityMD application locally or access production
2. Navigate to `/email-preview` (must be logged in)
3. You should see a list of email types in the sidebar
4. Click through different email types to preview:
   - Welcome emails
   - Message notifications
   - Deal alerts
   - Admin notifications

### 3.2 Test Email Sending
1. In Email Preview page, click **Mass Send** tab
2. Enter your email in **Send Test Email** field
3. Click **Send Test**
4. Check your inbox for the test email
5. Verify email renders correctly

## Step 4: Configure Message Notifications (5 minutes)

### 4.1 Verify Message Email Flow
1. Log in as a test user
2. Navigate to a deal page
3. Click **Contact Syndicator** or **Express Interest**
4. Send a test message
5. Check recipient's email inbox
6. Verify email notification was received

### 4.2 Check User Email Preferences
1. Log in as a user
2. Go to profile settings
3. Verify email notification preferences exist
4. Ensure "Messages" notification is enabled (default: enabled)

### 4.3 Test Admin Notifications
1. Send a message to an unclaimed syndicator profile
2. Check admin email (`justin@brandastic.com` or configured admin email)
3. Verify admin receives notification about unclaimed profile

## Step 5: Set Up Mass Email Sending (10 minutes)

### 5.1 Access Mass Email Interface
1. Navigate to `/email-preview` in your app
2. Must be logged in as admin (`is_admin = true`)
3. Click **Mass Send** tab

### 5.2 Test Mass Email
1. Select an email type from sidebar (e.g., "Welcome Investor")
2. In Mass Send tab, select **Custom** recipient filter
3. Enter your test email in the textarea
4. Click **Send Test Email** first
5. Verify test email received
6. If test works, proceed to mass send

### 5.3 Send Mass Email (Optional - Test First!)
1. Select recipient filter:
   - **All Users** - Sends to everyone
   - **Investors** - Only investors
   - **Syndicators** - Only syndicators
   - **Custom** - Upload CSV or enter emails

2. For CSV upload:
   - Create CSV file with format:
     ```csv
     email
     user1@example.com
     user2@example.com
     ```
   - Click **Choose CSV** and select file
   - Verify emails loaded correctly

3. Click **Send Mass Email**
4. Confirm the action in popup
5. Monitor progress bar
6. Check results summary

## Step 6: Verify Everything Works (10 minutes)

### 6.1 Test Checklist
- [ ] Test email sent successfully from Edge Function
- [ ] Message notification email received when message sent
- [ ] Admin notification received for unclaimed profiles
- [ ] Mass email test sent successfully
- [ ] Email templates render correctly
- [ ] All links in emails work
- [ ] Email preferences are respected

### 6.2 Check Resend Dashboard
1. Go to Resend dashboard → **Emails**
2. Verify sent emails appear in list
3. Check delivery status (should be "Delivered")
4. Review any bounces or failures

### 6.3 Check Supabase Logs
1. Go to Supabase → **Edge Functions** → **Logs**
2. Review recent invocations
3. Check for any errors
4. Verify all emails processed successfully

## Troubleshooting

### Issue: Emails Not Sending

**Check 1: Resend API Key**
- Verify `RESEND_API_KEY` is set in Supabase Edge Functions secrets
- Check API key is active in Resend dashboard
- Ensure API key has "Sending access" permission

**Check 2: Domain Verification**
- Go to Resend → Domains
- Verify domain status is "Verified" (green)
- Check DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)

**Check 3: Edge Function Logs**
- Go to Supabase → Edge Functions → Logs
- Look for error messages
- Check function invocation details

### Issue: Emails Going to Spam

1. **Verify SPF Record**
   - Check SPF record includes Resend
   - Format: `v=spf1 include:_spf.resend.com ~all`

2. **Verify DKIM Records**
   - All DKIM CNAME records must be added
   - Wait for DNS propagation

3. **Verify DMARC Policy**
   - Add DMARC record: `v=DMARC1; p=none; rua=mailto:your-email@equitymd.com`
   - Start with `p=none` for testing

### Issue: Mass Email Not Working

1. **Check Admin Access**
   - Verify user has `is_admin = true` in profiles table
   - Check user is logged in

2. **Check Rate Limits**
   - Resend free tier: 100 emails/day
   - If hitting limits, upgrade plan or reduce batch size

3. **Check CSV Format**
   - Ensure CSV has `email` column header
   - Verify emails are valid format
   - Check file encoding (UTF-8)

## Quick Reference Commands

### Check User Email Preferences (SQL)
```sql
SELECT email, email_notifications 
FROM profiles 
WHERE id = 'user-id';
```

### Update Email Preferences (SQL)
```sql
UPDATE profiles 
SET email_notifications = jsonb_set(
  email_notifications, 
  '{messages}', 
  'true'
) 
WHERE id = 'user-id';
```

### Grant Admin Access (SQL)
```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@example.com';
```

### Test Email via Supabase CLI
```bash
supabase functions invoke send-email \
  --body '{
    "to": "test@example.com",
    "type": "welcome_email",
    "data": {
      "userName": "Test",
      "userType": "investor"
    }
  }'
```

## Support Resources

- **Resend Documentation**: https://resend.com/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Email Configuration Guide**: See `EMAIL_CONFIGURATION.md`

## Next Steps

After completing setup:
1. Monitor email delivery rates in Resend dashboard
2. Set up email analytics tracking
3. Configure email templates for your brand
4. Set up automated email campaigns
5. Monitor user engagement with emails

## Completion Checklist

- [ ] Resend account created and verified
- [ ] Domain verified in Resend
- [ ] API key added to Supabase Edge Functions
- [ ] Test email sent successfully
- [ ] Message notifications working
- [ ] Mass email interface accessible
- [ ] Test mass email sent successfully
- [ ] All email templates preview correctly
- [ ] Email preferences working
- [ ] Admin notifications working

**Congratulations!** Your email system is now fully configured. 🎉
