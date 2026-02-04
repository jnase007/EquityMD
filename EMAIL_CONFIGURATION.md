# Email Configuration Guide for EquityMD

This guide covers the complete email setup for EquityMD, including message notifications and mass email sending capabilities.

## Overview

EquityMD uses **Resend** for email delivery and **Supabase Edge Functions** for email processing. All email functionality is integrated with the Supabase backend.

## Email System Architecture

```
Frontend (React)
    ↓
Supabase Edge Functions (send-email, send-admin-message-email)
    ↓
Resend API
    ↓
Recipient Email
```

## Prerequisites

1. **Resend Account**: Sign up at [resend.com](https://resend.com)
2. **Resend API Key**: Get your API key from Resend dashboard
3. **Supabase Project**: Your EquityMD Supabase project
4. **Domain Verification**: Verify your sending domain in Resend (e.g., `equitymd.com`)

## Step-by-Step Setup Guide

### Step 1: Configure Resend

1. **Create Resend Account**
   - Go to [resend.com](https://resend.com) and sign up
   - Verify your email address

2. **Add and Verify Domain**
   - In Resend dashboard, go to **Domains**
   - Click **Add Domain**
   - Enter your domain: `equitymd.com`
   - Add the required DNS records (SPF, DKIM, DMARC)
   - Wait for verification (usually takes a few minutes)

3. **Get API Key**
   - Go to **API Keys** in Resend dashboard
   - Click **Create API Key**
   - Name it: `EquityMD Production`
   - Copy the API key (you'll need this for Step 2)

### Step 2: Configure Supabase Edge Functions

1. **Set Environment Variables**
   - Go to your Supabase project dashboard
   - Navigate to **Edge Functions** → **Settings**
   - Add the following secrets:
     ```
     RESEND_API_KEY=re_your_api_key_here
     ```
   - Click **Save**

2. **Verify Edge Functions are Deployed**
   - Check that these functions exist:
     - `send-email` - Main email sending function
     - `send-admin-message-email` - Admin notifications
     - `send-email-invitation` - Invitation emails

3. **Test Edge Function**
   - Go to **Edge Functions** → **send-email**
   - Click **Invoke** with test payload:
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
   - Check your email inbox for the test email

### Step 3: Verify Email Templates

All email templates are located in:
- `supabase/functions/send-email/templates.ts`

**Available Email Types:**
- `new_investor_signup` - Admin notification for new investor
- `new_syndicator_signup` - Admin notification for new syndicator
- `welcome_email` - Welcome email for new users
- `investor_launch` - Investor launch announcement
- `investment_interest` - Investment interest notification
- `new_message` - Message received notification
- `new_deal_listed` - Admin notification for new deal
- `deal_alert` - Deal alert for investors
- `weekly_digest` - Weekly digest email
- `profile_incomplete` - Profile completion reminder
- `deal_closing_soon` - Deal closing reminder

### Step 4: Configure Message Notifications

Message notifications are automatically sent when:
1. A user sends a message via `MessageModal` component
2. The recipient has email notifications enabled in their profile

**How it works:**
- `MessageModal` component (`src/components/MessageModal.tsx`) handles email sending
- Checks user's `email_notifications.messages` preference
- Sends email via `send-email` edge function with type `new_message`

**To test:**
1. Send a test message between two users
2. Check recipient's email inbox
3. Verify email contains message preview and link to inbox

### Step 5: Set Up Mass Email Sending

Mass email sending is available in the Email Preview page for admins.

1. **Access Email Preview**
   - Navigate to `/email-preview` in your app
   - Must be logged in as admin

2. **Preview Email Templates**
   - Select email type from sidebar
   - Preview the email template
   - Copy HTML or download for Mailchimp

3. **Send Mass Emails**
   - Click **Mass Send** tab
   - Select recipient filter:
     - **All Users** - All registered users
     - **Investors** - Only investors
     - **Syndicators** - Only syndicators
     - **Custom** - Upload CSV or enter emails manually
   - Click **Send Test Email** first to verify
   - Click **Send Mass Email** to send to all recipients

4. **CSV Format for Custom Recipients**
   ```csv
   email
   user1@example.com
   user2@example.com
   user3@example.com
   ```

### Step 6: Verify Email Configuration

1. **Test Message Notifications**
   - Send a message from one user to another
   - Verify recipient receives email notification
   - Check email contains correct message preview

2. **Test Mass Email**
   - Go to `/email-preview`
   - Select an email type
   - Send test email to your own address
   - Verify email renders correctly

3. **Check Email Logs**
   - Go to Resend dashboard → **Emails**
   - View sent emails and delivery status
   - Check for any bounces or failures

## Environment Variables

### Required in Supabase Edge Functions:
```
RESEND_API_KEY=re_your_api_key_here
```

### Optional (for local development):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Email Sending Limits

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day

**Resend Pro Tier:**
- 50,000 emails/month
- Higher rate limits

**Rate Limiting:**
- Mass email sender sends in batches of 10
- 1 second delay between batches
- Respects Resend rate limits automatically

## Troubleshooting

### Emails Not Sending

1. **Check Resend API Key**
   - Verify `RESEND_API_KEY` is set in Supabase Edge Functions
   - Check API key is active in Resend dashboard

2. **Check Domain Verification**
   - Ensure domain is verified in Resend
   - Check DNS records are correct

3. **Check Edge Function Logs**
   - Go to Supabase → Edge Functions → Logs
   - Look for error messages
   - Check function invocation logs

4. **Check User Preferences**
   - Verify user has email notifications enabled
   - Check `profiles.email_notifications.messages` is `true`

### Emails Going to Spam

1. **Verify SPF Record**
   - Check SPF record in domain DNS
   - Should include Resend's SPF record

2. **Verify DKIM Record**
   - Check DKIM record is added to DNS
   - Resend provides DKIM records in dashboard

3. **Verify DMARC Policy**
   - Add DMARC record to DNS
   - Start with `v=DMARC1; p=none;` for testing

### Mass Email Issues

1. **Rate Limiting**
   - If hitting rate limits, reduce batch size
   - Increase delay between batches
   - Upgrade Resend plan

2. **CSV Upload Issues**
   - Ensure CSV has `email` column header
   - Check CSV file format (UTF-8 encoding)
   - Verify emails are valid format

3. **Admin Access**
   - Verify user has `role = 'admin'` or `is_admin = true`
   - Check user is logged in

## Email Template Customization

Email templates are in `supabase/functions/send-email/templates.ts`.

**To customize:**
1. Edit template functions in `templates.ts`
2. Update HTML structure and styling
3. Test with preview in `/email-preview`
4. Deploy updated edge function

**Template Structure:**
- Base template with header/footer
- Type-specific content sections
- Responsive design
- Email client compatibility

## Monitoring and Analytics

1. **Resend Dashboard**
   - View sent emails
   - Check delivery rates
   - Monitor bounces and complaints

2. **Supabase Logs**
   - Edge function invocation logs
   - Error tracking
   - Performance metrics

3. **Application Logs**
   - Check browser console for errors
   - Check Supabase client logs
   - Monitor email sending success/failure

## Best Practices

1. **Always Test First**
   - Send test email before mass sending
   - Verify template renders correctly
   - Check all links work

2. **Respect User Preferences**
   - Check `email_notifications` before sending
   - Allow users to opt-out
   - Honor unsubscribe requests

3. **Rate Limiting**
   - Don't send too many emails at once
   - Use batch sending for large lists
   - Monitor Resend rate limits

4. **Email Content**
   - Keep subject lines clear and concise
   - Include unsubscribe links
   - Make emails mobile-friendly
   - Test in multiple email clients

## Support

For issues or questions:
1. Check Resend documentation: https://resend.com/docs
2. Check Supabase Edge Functions docs: https://supabase.com/docs/guides/functions
3. Review application logs and error messages
4. Contact support if issues persist

## Quick Reference

**Send Test Email:**
```typescript
await supabase.functions.invoke('send-email', {
  body: {
    to: 'test@example.com',
    type: 'welcome_email',
    data: {
      userName: 'Test User',
      userType: 'investor'
    }
  }
});
```

**Check User Email Preferences:**
```sql
SELECT email, email_notifications 
FROM profiles 
WHERE id = 'user-id';
```

**Update Email Preferences:**
```sql
UPDATE profiles 
SET email_notifications = jsonb_set(
  email_notifications, 
  '{messages}', 
  'true'
) 
WHERE id = 'user-id';
```
