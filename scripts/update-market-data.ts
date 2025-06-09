import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cron from 'node-cron';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for server-side operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('  - VITE_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add these to your .env file:');
  console.error('VITE_SUPABASE_URL=your_supabase_project_url');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MarketDataPoint {
  location: string;
  median_price: number;
  sales_change: number;
  months_supply: number;
}

interface StateMarketData extends MarketDataPoint {
  state: string;
}

interface CityMarketData extends MarketDataPoint {
  city: string;
  state: string;
}

// Mock API data - In production, replace with real API calls
const mockStateData: StateMarketData[] = [
  { state: 'California', location: 'California', median_price: 750000, sales_change: -2.9, months_supply: 3.0 },
  { state: 'Texas', location: 'Texas', median_price: 350000, sales_change: 5.5, months_supply: 2.8 },
  { state: 'New York', location: 'New York', median_price: 450000, sales_change: -6.2, months_supply: 3.5 },
  { state: 'Florida', location: 'Florida', median_price: 400000, sales_change: 1.0, months_supply: 3.1 },
  // Add more states as needed
];

const mockCityData: CityMarketData[] = [
  { city: 'New York', state: 'New York', location: 'New York, NY', median_price: 1200000, sales_change: -8.5, months_supply: 4.2 },
  { city: 'Los Angeles', state: 'California', location: 'Los Angeles, CA', median_price: 950000, sales_change: -5.2, months_supply: 3.8 },
  { city: 'Austin', state: 'Texas', location: 'Austin, TX', median_price: 485000, sales_change: 3.4, months_supply: 3.2 },
  // Add more cities as needed
];

/**
 * Fetch real-time market data from external APIs
 * This is a placeholder implementation - replace with actual API calls
 */
async function fetchRealTimeData(): Promise<{ states: StateMarketData[], cities: CityMarketData[] }> {
  try {
    // Example: Redfin API call (replace with actual API endpoint)
    // const redfin = await axios.get('https://api.redfin.com/market-data', {
    //   headers: { 'Authorization': `Bearer ${process.env.REDFIN_API_KEY}` }
    // });

    // Example: Zillow API call (replace with actual API endpoint)
    // const zillow = await axios.get('https://api.zillow.com/market-stats', {
    //   headers: { 'X-API-Key': process.env.ZILLOW_API_KEY }
    // });

    // For now, return mock data with some random variation to simulate real updates
    const states = mockStateData.map(state => ({
      ...state,
      median_price: Math.round(state.median_price * (0.98 + Math.random() * 0.04)), // ±2% variation
      sales_change: parseFloat((state.sales_change + (Math.random() - 0.5) * 2).toFixed(1)), // ±1% variation
      months_supply: parseFloat((state.months_supply + (Math.random() - 0.5) * 0.4).toFixed(1)) // ±0.2 variation
    }));

    const cities = mockCityData.map(city => ({
      ...city,
      median_price: Math.round(city.median_price * (0.98 + Math.random() * 0.04)),
      sales_change: parseFloat((city.sales_change + (Math.random() - 0.5) * 2).toFixed(1)),
      months_supply: parseFloat((city.months_supply + (Math.random() - 0.5) * 0.4).toFixed(1))
    }));

    return { states, cities };
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    throw error;
  }
}

/**
 * Update states table with new market data
 */
async function updateStatesData(statesData: StateMarketData[]): Promise<void> {
  try {
    for (const stateData of statesData) {
      const { error } = await supabase
        .from('states')
        .update({
          median_price: stateData.median_price,
          sales_change: stateData.sales_change,
          months_supply: stateData.months_supply
        })
        .eq('name', stateData.state);

      if (error) {
        console.error(`Error updating state ${stateData.state}:`, error);
      } else {
        console.log(`✓ Updated ${stateData.state}: $${stateData.median_price.toLocaleString()}, ${stateData.sales_change}%, ${stateData.months_supply}mo`);
      }
    }

    // Log the update
    await logUpdate('states');
  } catch (error) {
    console.error('Error updating states data:', error);
    throw error;
  }
}

/**
 * Update cities table with new market data
 */
async function updateCitiesData(citiesData: CityMarketData[]): Promise<void> {
  try {
    for (const cityData of citiesData) {
      const { error } = await supabase
        .from('cities')
        .update({
          median_price: cityData.median_price,
          sales_change: cityData.sales_change,
          months_supply: cityData.months_supply
        })
        .eq('name', cityData.city)
        .eq('state', cityData.state);

      if (error) {
        console.error(`Error updating city ${cityData.city}, ${cityData.state}:`, error);
      } else {
        console.log(`✓ Updated ${cityData.city}, ${cityData.state}: $${cityData.median_price.toLocaleString()}, ${cityData.sales_change}%, ${cityData.months_supply}mo`);
      }
    }

    // Log the update
    await logUpdate('cities');
  } catch (error) {
    console.error('Error updating cities data:', error);
    throw error;
  }
}

/**
 * Log update to update_logs table
 */
async function logUpdate(tableName: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('update_logs')
      .insert({
        table_name: tableName,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`Error logging update for ${tableName}:`, error);
    }
  } catch (error) {
    console.error('Error logging update:', error);
  }
}

/**
 * Main function to update all market data
 */
async function updateMarketData(): Promise<void> {
  console.log(`🚀 Starting market data update at ${new Date().toISOString()}`);
  
  try {
    // Fetch real-time data
    console.log('📡 Fetching real-time market data...');
    const { states, cities } = await fetchRealTimeData();

    // Update states data
    console.log('🏛️ Updating states data...');
    await updateStatesData(states);

    // Update cities data
    console.log('🏙️ Updating cities data...');
    await updateCitiesData(cities);

    console.log(`✅ Market data update completed successfully at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('❌ Market data update failed:', error);
    
    // Log the error
    try {
      await supabase
        .from('update_logs')
        .insert({
          table_name: 'error',
          updated_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}

/**
 * Schedule the market data update to run daily at 2:00 AM PDT
 * Cron expression: '0 2 * * *' = At 02:00 every day
 * For PDT (UTC-7), this would be 9:00 AM UTC
 */
function scheduleMarketDataUpdates(): void {
  console.log('⏰ Scheduling market data updates for 2:00 AM PDT daily...');
  
  // Schedule for 2:00 AM PDT (9:00 AM UTC)
  cron.schedule('0 9 * * *', async () => {
    await updateMarketData();
  }, {
    timezone: "America/Los_Angeles"
  });

  console.log('📅 Market data updates scheduled successfully');
}

/**
 * Manual update function for testing
 */
async function runManualUpdate(): Promise<void> {
  console.log('🔧 Running manual market data update...');
  await updateMarketData();
}

// Export functions for use in other modules
export {
  updateMarketData,
  scheduleMarketDataUpdates,
  runManualUpdate
};

// If this script is run directly, execute manual update
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--schedule')) {
    // Start the scheduler
    scheduleMarketDataUpdates();
    console.log('🔄 Market data update scheduler is running. Press Ctrl+C to stop.');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down market data update scheduler...');
      process.exit(0);
    });
  } else {
    // Run manual update
    runManualUpdate()
      .then(() => {
        console.log('✨ Manual update completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Manual update failed:', error);
        process.exit(1);
      });
  }
}

// Instructions for setup:
/*
SETUP INSTRUCTIONS:

1. Environment Variables:
   Add these to your .env file:
   - VITE_SUPABASE_URL=your_supabase_url
   - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   - REDFIN_API_KEY=your_redfin_api_key (optional)
   - ZILLOW_API_KEY=your_zillow_api_key (optional)

2. Manual Run:
   npm run update-market-data
   or
   node scripts/update-market-data.js

3. Schedule Mode:
   npm run schedule-market-updates
   or
   node scripts/update-market-data.js --schedule

4. Production Deployment:
   - Use PM2 or similar process manager
   - Set up monitoring and alerting
   - Configure log rotation
   - Set up database backups before updates

5. API Integration:
   - Replace mock data with real API calls
   - Add error handling and retry logic
   - Implement rate limiting
   - Add data validation

6. Cron Job Setup (Alternative to Node.js scheduler):
   Add to crontab:
   0 9 * * * cd /path/to/your/app && npm run update-market-data

Example PM2 ecosystem file (ecosystem.config.js):
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
*/ 