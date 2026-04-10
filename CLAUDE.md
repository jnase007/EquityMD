# EquityMD - Claude Code Context

## Project Overview
EquityMD is a commercial real estate syndication marketplace. Syndicators list deals, investors browse and invest. Co-GP model where Justin raises investor capital.

## Stack
- **Frontend:** React + Vite + TypeScript
- **Backend:** Supabase (auth, DB, storage, edge functions)
- **Payments:** Stripe
- **Maps:** Mapbox
- **Hosting:** Netlify
- **SEO:** Edge function serves pre-rendered HTML to bots (SPA SEO fix)

## Key Architecture
- Supabase project: `frtxsynlvwhpnzzgfgbt` (LIVE)
- DealFlow DB: `csenyewugpjxijwmqbup`
- 369 syndicators in directory (cleaned)
- Track records for top 39
- SPA SEO via Netlify edge function (serves HTML to bots)

## Important URLs
- Production: https://equitymd.com
- Key pages: `/`, `/find`, `/blog`, `/how-it-works`, `/about`, `/contact`, `/pricing`
- City pages: `/cities/*`
- Syndicator profiles: dynamic routes

## Code Conventions
- TypeScript strict mode
- Tailwind CSS for styling
- Supabase client via `@supabase/supabase-js`
- All frontend changes via Cursor prompts (Justin deploys)

## Testing
- Run `npm run dev` for local dev server
- Run `npm run build` to verify production build
- Use `/browse` for QA testing on production

## Known Issues
- Missing SEO paths: /blog, /find, /how-it-works, /about, /contact, /pricing, /resources/*, /cities/*
- Need to verify all syndicator profiles render correctly
- Track record pages need validation
