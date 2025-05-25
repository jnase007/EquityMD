# OAuth Providers Setup Guide for Supabase

## 🚀 Quick Setup for Social Authentication

Your social auth buttons are showing but not working because the OAuth providers need to be configured in your Supabase dashboard.

---

## 🔧 Google OAuth Setup

### Step 1: Google Cloud Console Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** (or select existing one)
3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

### Step 2: Create OAuth Credentials

1. **Go to "APIs & Services" → "Credentials"**
2. **Click "Create Credentials" → "OAuth client ID"**
3. **Configure OAuth consent screen** (if first time):
   - Choose "External" for user type
   - Fill in app name, user support email, developer email
   - Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`

4. **Create OAuth Client ID:**
   - Application type: **Web application**
   - Name: `EquityMD Auth`
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     https://your-domain.com
     ```
   - **Authorized redirect URIs:**
     ```
     https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback
     http://localhost:5173
     ```

5. **Copy your Client ID and Client Secret**

### Step 3: Configure in Supabase

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Select your project**
3. **Go to Authentication → Providers**
4. **Find Google provider and toggle it ON**
5. **Paste your Google OAuth credentials:**
   - Client ID: `[Your Google Client ID]`
   - Client Secret: `[Your Google Client Secret]`
6. **Click Save**

---

## 📘 Facebook OAuth Setup

### Step 1: Facebook Developers Setup

1. **Go to [Facebook Developers](https://developers.facebook.com/)**
2. **Create a new app** or select existing one
3. **Add "Facebook Login" product**

### Step 2: Configure Facebook Login

1. **In Facebook Login settings:**
   - **Valid OAuth Redirect URIs:**
     ```
     https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback
     ```
   - **Valid OAuth Origins:**
     ```
     http://localhost:5173
     https://your-domain.com
     ```

2. **Get your App ID and App Secret:**
   - Go to Settings → Basic
   - Copy App ID and App Secret

### Step 3: Configure in Supabase

1. **Go to Supabase Dashboard → Authentication → Providers**
2. **Find Facebook provider and toggle it ON**
3. **Paste your Facebook credentials:**
   - Client ID: `[Your Facebook App ID]`
   - Client Secret: `[Your Facebook App Secret]`
4. **Click Save**

---

## 💼 LinkedIn OAuth Setup

### Step 1: LinkedIn Developers Setup

1. **Go to [LinkedIn Developers](https://www.linkedin.com/developers/)**
2. **Create a new app** or select existing one
3. **Request "Sign In with LinkedIn" product**

### Step 2: Configure LinkedIn App

1. **In your LinkedIn app settings:**
   - **Authorized redirect URLs:**
     ```
     https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback
     ```
   - **Scopes:** Request `r_liteprofile` and `r_emailaddress`

2. **Get your Client ID and Client Secret:**
   - Go to Auth tab
   - Copy Client ID and Client Secret

### Step 3: Configure in Supabase

1. **Go to Supabase Dashboard → Authentication → Providers**
2. **Find LinkedIn (OIDC) provider and toggle it ON**
3. **Paste your LinkedIn credentials:**
   - Client ID: `[Your LinkedIn Client ID]`
   - Client Secret: `[Your LinkedIn Client Secret]`
4. **Click Save**

---

## 🔧 Finding Your Supabase Project Details

To get your Supabase project ID for the redirect URLs:

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Select your project**
3. **Go to Settings → General**
4. **Your project URL will be:** `https://[PROJECT-ID].supabase.co`
5. **Use this format for redirect URLs:** `https://[PROJECT-ID].supabase.co/auth/v1/callback`

---

## ✅ Testing Your Setup

After configuring all providers:

1. **Visit your app:** `http://localhost:5173`
2. **Click "Get Started" button**
3. **Try clicking Google/Facebook/LinkedIn buttons**
4. **You should be redirected to the respective OAuth provider**
5. **After successful login, you'll be redirected back to your app**

---

## 🚨 Common Issues & Solutions

### Issue: "OAuth redirect URI mismatch"
**Solution:** Make sure your redirect URLs exactly match in both the OAuth provider settings and are included in your Supabase allowed redirect URLs.

### Issue: "Invalid client" error
**Solution:** Double-check that your Client ID and Client Secret are copied correctly with no extra spaces.

### Issue: "App not verified" warning
**Solution:** This is normal for development. Users can still click "Advanced" and proceed. For production, submit your app for verification.

### Issue: Localhost not working
**Solution:** Make sure you've added `http://localhost:5173` to your authorized origins in each OAuth provider.

---

## 📱 Next Steps

Once configured, your social authentication will work in both:
- ✅ **Sign In mode** ("Continue with Google/Facebook/LinkedIn")
- ✅ **Sign Up mode** ("Sign up with Google/Facebook/LinkedIn")

The user type selection (Investor/Syndicator) will be respected and the appropriate profiles will be created automatically.

---

## 🔗 Quick Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Facebook Developers](https://developers.facebook.com/)
- [LinkedIn Developers](https://www.linkedin.com/developers/)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Test Auth Page](http://localhost:5173/test-auth) 