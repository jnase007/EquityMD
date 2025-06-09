# Market Data System Setup Guide

This guide covers the implementation of the comprehensive market data system for EquityMD, including real-time data updates and automated scheduling.

## 🏗️ Implementation Overview

The market data system includes:
- **States Table**: Market data for all 50 US states
- **Cities Table**: Detailed data for 25 major investment cities
- **Automated Updates**: Daily data refresh at 2:00 AM PDT
- **SEO Optimization**: Dynamic meta tags and Schema.org markup
- **Responsive UI**: Mobile-optimized with loading skeletons

## 📊 Database Schema

### States Table
```sql
CREATE TABLE states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    median_price INTEGER,
    sales_change FLOAT,
    months_supply FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Cities Table (Enhanced)
```sql
ALTER TABLE cities ADD COLUMN state TEXT;
ALTER TABLE cities ADD COLUMN median_price INTEGER;
ALTER TABLE cities ADD COLUMN sales_change FLOAT;
ALTER TABLE cities ADD COLUMN months_supply FLOAT;
```

### Update Logs Table
```sql
CREATE TABLE update_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Setup Instructions

### 1. Database Migration

Run the SQL migrations in order:

```bash
# 1. Create states table with initial data
psql -h your-db-host -d your-db -f migrations/20250608_create_states_table.sql

# 2. Update cities table with market data
psql -h your-db-host -d your-db -f migrations/20250608_update_cities_market_data.sql
```

Or use Supabase Dashboard:
1. Go to SQL Editor in Supabase Dashboard
2. Copy and run each migration file content
3. Verify tables are created with `SELECT * FROM states LIMIT 5;`

### 2. Environment Variables

Add to your `.env` file:

```env
# Required for market data updates
VITE_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Real-time API keys
REDFIN_API_KEY=your_redfin_api_key
ZILLOW_API_KEY=your_zillow_api_key
```

### 3. Install Dependencies

```bash
npm install node-cron axios tsx
```

### 4. Test Manual Update

```bash
# Test the market data update script
npm run update-market-data
```

Expected output:
```
🚀 Starting market data update at 2025-06-08T21:24:00.000Z
📡 Fetching real-time market data...
🏛️ Updating states data...
✓ Updated California: $750,000, -2.9%, 3.0mo
✓ Updated Texas: $350,000, 5.5%, 2.8mo
...
🏙️ Updating cities data...
✓ Updated New York, New York: $1,200,000, -8.5%, 4.2mo
...
✅ Market data update completed successfully
```

## 🌐 Page Routes

### Market Reports Hub
- **URL**: `/resources/market-reports`
- **Component**: `MarketReportsHub`
- **Features**: State grid, search, sorting, responsive design

### State-Specific Pages
- **URL**: `/resources/market-reports/[state]`
- **Component**: `StateMarketReport`
- **Example**: `/resources/market-reports/california`
- **Features**: State overview, cities grid, investment CTA

### City-Specific Pages
- **URL**: `/cities/[city]`
- **Component**: `CityMarketReport`
- **Example**: `/cities/austin`
- **Features**: Detailed analysis, Schema.org markup, related resources

## 🔄 Automation Setup

### Option 1: Node.js Scheduler (Recommended)

Start the scheduler:
```bash
npm run schedule-market-updates
```

This runs the update daily at 2:00 AM PDT using node-cron.

### Option 2: System Cron Job

Add to crontab:
```bash
# Edit crontab
crontab -e

# Add this line (runs at 2:00 AM PDT = 9:00 AM UTC)
0 9 * * * cd /path/to/your/app && npm run update-market-data
```

### Option 3: PM2 Process Manager (Production)

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'market-data-scheduler',
    script: 'scripts/update-market-data.js',
    args: '--schedule',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔌 API Integration

### Current Implementation
The system uses mock data with random variations to simulate real updates. To integrate real APIs:

### Redfin API Integration
```typescript
const redfin = await axios.get('https://api.redfin.com/market-data', {
  headers: { 'Authorization': `Bearer ${process.env.REDFIN_API_KEY}` }
});
```

### Zillow API Integration
```typescript
const zillow = await axios.get('https://api.zillow.com/market-stats', {
  headers: { 'X-API-Key': process.env.ZILLOW_API_KEY }
});
```

### Custom API Sources
Replace the `fetchRealTimeData()` function in `scripts/update-market-data.ts` with your preferred data sources.

## 📱 Testing

### Local Development
```bash
# Start development server
npm run dev

# Visit test URLs
open http://localhost:3000/resources/market-reports
open http://localhost:3000/resources/market-reports/california
open http://localhost:3000/cities/austin
```

### Test Scenarios
1. **Loading States**: Verify skeleton loaders appear
2. **Search Functionality**: Test state search and filtering
3. **Responsive Design**: Check mobile layout
4. **Error Handling**: Test with invalid state/city slugs
5. **SEO**: Verify meta tags and Schema.org markup

### Performance Testing
```bash
# Build for production
npm run build

# Test bundle size
npm run preview
```

## 🎯 SEO Features

### Dynamic Meta Tags
- State pages: "California Real Estate Market Report 2025"
- City pages: "Austin Real Estate Market Report 2025"
- Keywords: Location-specific real estate terms

### Schema.org Markup
City pages include `RealEstateListing` structured data:
```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "name": "Austin Real Estate Market Report",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Austin",
    "addressRegion": "Texas"
  }
}
```

## 🔧 Troubleshooting

### Common Issues

**1. Environment Variables Missing**
```
❌ Missing required environment variables:
  - VITE_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
```
Solution: Add variables to `.env` file

**2. Database Connection Failed**
```
Error: Failed to connect to database
```
Solution: Check Supabase URL and service role key

**3. Migration Errors**
```
Error: relation "states" already exists
```
Solution: Tables already exist, skip to data verification

**4. Build Errors**
```
Module not found: Can't resolve './pages/resources/market-reports/index'
```
Solution: Ensure all new files are properly created and imported

### Verification Commands

```bash
# Check if tables exist
psql -c "SELECT COUNT(*) FROM states;"
psql -c "SELECT COUNT(*) FROM cities WHERE state IS NOT NULL;"

# Check recent updates
psql -c "SELECT * FROM update_logs ORDER BY updated_at DESC LIMIT 5;"

# Test API endpoints
curl -s http://localhost:3000/resources/market-reports | grep -o "<title>.*</title>"
```

## 📈 Monitoring

### Log Files
- Update logs: Check `update_logs` table
- Application logs: Monitor console output
- Error tracking: Implement Sentry or similar

### Metrics to Track
- Update success rate
- Page load times
- Search usage
- Mobile vs desktop traffic
- State/city page popularity

### Alerts
Set up monitoring for:
- Failed data updates
- API rate limits
- Database connection issues
- High error rates

## 🚀 Deployment

### Netlify Deployment
The system is configured for automatic deployment:
1. Push changes to main branch
2. Netlify builds and deploys automatically
3. Environment variables configured in Netlify dashboard

### Production Checklist
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] CDN caching optimized
- [ ] Monitoring alerts active
- [ ] Backup strategy implemented

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Node-cron Documentation](https://github.com/node-cron/node-cron)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🤝 Contributing

When adding new features:
1. Update database schema if needed
2. Add TypeScript interfaces
3. Include loading states
4. Add error handling
5. Update SEO meta tags
6. Test on mobile devices
7. Update this documentation

---

**Last Updated**: June 8, 2025  
**Version**: 1.0.0  
**Author**: EquityMD Development Team 