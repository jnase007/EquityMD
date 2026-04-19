#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load env from parent directory
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function exportSyndicators() {
  console.log('🔗 Connecting to Supabase...');
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  try {
    // Fetch all syndicators with pagination handling
    let allSyndicators = [];
    let from = 0;
    const pageSize = 1000; // Max page size
    
    while (true) {
      console.log(`📥 Fetching syndicators ${from} - ${from + pageSize - 1}...`);
      
      const { data, error, count } = await sb
        .from('syndicators')
        .select('id, company_name, contact_email, city, state, website_url, company_description, investment_focus, total_deal_volume', { count: 'exact' })
        .order('company_name')
        .range(from, from + pageSize - 1);
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        break;
      }
      
      allSyndicators = allSyndicators.concat(data);
      console.log(`✅ Fetched ${data.length} syndicators (total so far: ${allSyndicators.length})`);
      
      // If we got fewer than pageSize, we're at the end
      if (data.length < pageSize) {
        break;
      }
      
      from += pageSize;
    }
    
    console.log(`📊 Total syndicators exported: ${allSyndicators.length}`);
    
    // Save to JSON file
    const outputPath = path.join(process.cwd(), 'syndicators-raw.json');
    await fs.writeFile(outputPath, JSON.stringify(allSyndicators, null, 2));
    console.log(`💾 Saved to: ${outputPath}`);
    
    // Create a summary
    const withEmail = allSyndicators.filter(s => s.contact_email && s.contact_email.trim());
    const withWebsite = allSyndicators.filter(s => s.website_url && s.website_url.trim());
    
    console.log('\n📈 Summary:');
    console.log(`- Total syndicators: ${allSyndicators.length}`);
    console.log(`- With claimed profiles (email): ${withEmail.length}`);
    console.log(`- With website URLs: ${withWebsite.length}`);
    
    return allSyndicators;
    
  } catch (error) {
    console.error('❌ Error exporting syndicators:', error);
    throw error;
  }
}

// Run the export
exportSyndicators().catch(console.error);