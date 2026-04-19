#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from parent directory
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function checkSchema() {
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  try {
    // Get a sample row to see available columns
    const { data, error } = await sb
      .from('syndicators')
      .select('*')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('Available columns in syndicators table:');
      console.log(Object.keys(data[0]));
      console.log('\nSample row:');
      console.log(JSON.stringify(data[0], null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema();