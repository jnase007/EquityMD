# EquityMD Email Templates for Supabase Auth

These are custom email templates to replace Supabase's default auth emails.

## How to Update in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Email Templates**
4. For each template type, copy the HTML from the corresponding file below

## Template Files

| Supabase Template | File |
|-------------------|------|
| **Confirm signup** | `confirm-signup.html` |
| **Magic Link** | `magic-link.html` |
| **Reset Password** | `reset-password.html` |

## Template Variables

Supabase uses Go template syntax. These variables are available:

- `{{ .ConfirmationURL }}` - The magic link or confirmation URL
- `{{ .Token }}` - The token (if using token-based confirmation)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address

## Email Subjects

When updating templates, also update the subject lines:

| Template | Recommended Subject |
|----------|---------------------|
| Confirm signup | `Welcome to EquityMD - Confirm Your Email` |
| Magic Link | `Your Secure Login Link - EquityMD` |
| Reset Password | `Reset Your EquityMD Password` |

## Testing

After updating templates:
1. Test magic link login
2. Test email signup confirmation
3. Test password reset flow

Make sure to check on both desktop and mobile email clients.

