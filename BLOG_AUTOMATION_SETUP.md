# EquityMD Blog Automation Setup Guide

This guide explains how to set up automated weekly blog generation using xAI (Grok) and Supabase.

## Overview

The system automatically:
- Generates SEO + GEO optimized blog content using xAI's Grok API
- Writes directly to your Supabase database
- Publishes every Monday at 9:00 AM UTC (configurable)
- Uses evergreen topics (no dates that expire)

---

## Step 1: Apply the Database Migration

Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'EquityMD Team',
  category TEXT NOT NULL,
  image_url TEXT,
  
  -- SEO Fields
  meta_description TEXT,
  meta_keywords TEXT[],
  target_keyword TEXT,
  
  -- Structured Data (SEO + GEO)
  faq_schema JSONB DEFAULT '[]'::jsonb,
  sources JSONB DEFAULT '[]'::jsonb,
  internal_links TEXT[] DEFAULT '{}',
  reading_time INTEGER DEFAULT 5,
  key_takeaways TEXT[] DEFAULT '{}',
  quotable_stats TEXT[] DEFAULT '{}',
  
  -- Publishing
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Tracking
  ai_generated BOOLEAN DEFAULT true,
  generation_prompt TEXT,
  view_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public read published posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

-- Service role can do anything (for automation)
CREATE POLICY "Service role full access"
  ON blog_posts FOR ALL
  USING (auth.role() = 'service_role');

-- Admins can manage posts
CREATE POLICY "Admins manage posts"
  ON blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
```

---

## Step 2: Get Your Supabase Service Key

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
   - ⚠️ Keep this secret! It bypasses Row Level Security

---

## Step 3: Configure GitHub Secrets

Go to your GitHub repository:
1. **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these three secrets:

| Secret Name | Value |
|-------------|-------|
| `XAI_API_KEY` | Your xAI API key |
| `SUPABASE_URL` | Your Supabase project URL (e.g., `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | Your service_role key from Step 2 |

---

## Step 4: Test the Automation

### Option A: Manual Trigger from GitHub
1. Go to **Actions** tab in your repo
2. Select **Weekly Blog Generator**
3. Click **Run workflow**
4. Optionally enter a count (default: 1)
5. Click **Run workflow**

### Option B: Run Locally
```bash
# Add to .env file
XAI_API_KEY=your_xai_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Generate one blog (draft)
npm run generate-blog

# Generate and publish one blog
npm run generate-blog:publish

# Generate multiple blogs
npx tsx scripts/generate-blog.ts --publish --count 5
```

---

## Step 5: Customize the Schedule

Edit `.github/workflows/weekly-blog.yml`:

```yaml
on:
  schedule:
    # Current: Every Monday at 9:00 AM UTC
    - cron: '0 9 * * 1'
    
    # Other examples:
    # Daily at 6 AM UTC:      '0 6 * * *'
    # Every Wednesday:        '0 9 * * 3'
    # Twice a week (Mon/Thu): '0 9 * * 1,4'
    # First of each month:    '0 9 1 * *'
```

---

## Blog Topics Library

The system includes 55+ evergreen topics across these categories:

| Category | Topics |
|----------|--------|
| Investor Education | Getting started, accreditation, syndication basics |
| Deal Analysis | Cap rates, IRR, NOI, proforma analysis |
| Syndication | Waterfall structures, preferred returns, GP/LP roles |
| Due Diligence | Red flags, vetting syndicators, market research |
| Tax Strategy | K-1s, cost segregation, depreciation, 1031 exchanges |
| Market Insights | Market selection, economic indicators |
| Investment Strategy | Value-add vs core, asset classes, portfolio building |
| Financing | Agency debt, bridge loans, DSCR, LTV |
| Property Management | Third-party vs in-house, NOI optimization |
| Exit Strategies | Sale vs refinance, hold periods |

The system automatically:
- Tracks which topics have been used
- Rotates through unused topics first
- Starts fresh when all topics are exhausted

---

## Monitoring & Management

### View All Blog Posts
Go to **Admin Dashboard** → **Blog** tab

### View Generation Logs
Go to **GitHub** → **Actions** → **Weekly Blog Generator**

### Add Custom Topics
Edit `scripts/generate-blog.ts` and add to the `EVERGREEN_TOPICS` array:

```typescript
{ 
  category: 'Your Category', 
  topic: 'Your evergreen topic title', 
  targetKeyword: 'seo keyword' 
},
```

---

## Troubleshooting

### Blog posts not appearing
1. Check the `blog_posts` table in Supabase
2. Verify `is_published = true`
3. Check GitHub Actions logs for errors

### API rate limits
- The script waits 2 seconds between generations
- xAI has generous limits, but you can increase the delay if needed

### Database errors
- Verify your `SUPABASE_SERVICE_KEY` is the service_role key
- Check that the `blog_posts` table exists
- Ensure RLS policies are created

---

## Cost Considerations

- **xAI API**: Pay-per-use, ~$0.05-0.10 per blog post
- **GitHub Actions**: Free for public repos, 2000 min/month for private
- **Supabase**: Free tier includes plenty of storage

---

## Support

For issues with this automation, check:
1. GitHub Actions logs for error messages
2. Supabase logs (Dashboard → Logs)
3. The xAI API dashboard for usage/errors

