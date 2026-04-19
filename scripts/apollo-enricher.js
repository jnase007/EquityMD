#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const APOLLO_API_KEY = 'YMelcWSplOfiqfMI9JR8QA';
const BATCH_SIZE = 10;
const BATCH_DELAY = 2000; // 2 seconds between batches
const REQUEST_DELAY = 1000; // 1 second between individual requests

// Helper function to extract domain from URL
function extractDomain(url) {
  if (!url) return null;
  try {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    const parsedUrl = new URL(cleanUrl);
    return parsedUrl.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Apollo Organization Enrichment
async function enrichOrganization(domain) {
  if (!domain) return null;
  
  try {
    const response = await fetch('https://api.apollo.io/api/v1/organizations/enrich', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify({
        domain: domain
      })
    });
    
    if (response.status === 429) {
      console.log(`⏳ Rate limited for domain ${domain}, waiting 5 seconds...`);
      await delay(5000);
      return enrichOrganization(domain); // Retry
    }
    
    if (!response.ok) {
      console.log(`⚠️ Apollo org enrichment failed for ${domain}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data.organization;
    
  } catch (error) {
    console.log(`❌ Error enriching organization ${domain}:`, error.message);
    return null;
  }
}

// Apollo People Search
async function findPeople(domain) {
  if (!domain) return [];
  
  try {
    const response = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify({
        organization_domains: [domain],
        person_titles: ['CEO', 'Founder', 'Managing Partner', 'Principal', 'President', 'Director'],
        page: 1,
        per_page: 10
      })
    });
    
    if (response.status === 429) {
      console.log(`⏳ Rate limited for people search ${domain}, waiting 5 seconds...`);
      await delay(5000);
      return findPeople(domain); // Retry
    }
    
    if (!response.ok) {
      console.log(`⚠️ Apollo people search failed for ${domain}: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.people || [];
    
  } catch (error) {
    console.log(`❌ Error finding people for ${domain}:`, error.message);
    return [];
  }
}

// Main enrichment function
async function enrichSyndicator(syndicator) {
  const domain = extractDomain(syndicator.website_url);
  
  if (!domain) {
    console.log(`⚠️ No valid domain for ${syndicator.company_name}`);
    return {
      ...syndicator,
      apollo_domain: null,
      apollo_org_data: null,
      apollo_contacts: [],
      enrichment_status: 'no_domain'
    };
  }
  
  console.log(`🔍 Enriching ${syndicator.company_name} (${domain})...`);
  
  // Get organization data
  const orgData = await enrichOrganization(domain);
  await delay(REQUEST_DELAY);
  
  // Get people data
  const people = await findPeople(domain);
  await delay(REQUEST_DELAY);
  
  // Extract primary contact (first person with highest priority title)
  const titlePriority = { 'CEO': 1, 'Founder': 2, 'Managing Partner': 3, 'Principal': 4, 'President': 5, 'Director': 6 };
  const sortedPeople = people.sort((a, b) => {
    const aPriority = titlePriority[a.title] || 99;
    const bPriority = titlePriority[b.title] || 99;
    return aPriority - bPriority;
  });
  
  const primaryContact = sortedPeople[0] || null;
  
  return {
    ...syndicator,
    apollo_domain: domain,
    apollo_org_data: orgData,
    apollo_contacts: people,
    primary_contact: primaryContact ? {
      name: primaryContact.name,
      title: primaryContact.title,
      email: primaryContact.email,
      phone: primaryContact.phone_numbers?.[0]?.raw_number || null,
      linkedin_url: primaryContact.linkedin_url
    } : null,
    company_linkedin: orgData?.linkedin_url || null,
    enrichment_status: 'success'
  };
}

async function processInBatches() {
  try {
    console.log('📊 Loading syndicators...');
    const rawData = JSON.parse(await fs.readFile('syndicators-raw.json', 'utf8'));
    console.log(`📈 Processing ${rawData.length} syndicators in batches of ${BATCH_SIZE}...`);
    
    const enrichedSyndicators = [];
    let successCount = 0;
    let emailCount = 0;
    
    for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
      const batch = rawData.slice(i, i + BATCH_SIZE);
      console.log(`\n🚀 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rawData.length / BATCH_SIZE)} (${batch.length} syndicators)...`);
      
      // Process batch in parallel
      const batchPromises = batch.map(syndicator => enrichSyndicator(syndicator));
      const batchResults = await Promise.all(batchPromises);
      
      // Count successes
      for (const result of batchResults) {
        if (result.enrichment_status === 'success') {
          successCount++;
          if (result.primary_contact?.email) {
            emailCount++;
          }
        }
      }
      
      enrichedSyndicators.push(...batchResults);
      
      console.log(`✅ Batch complete. Progress: ${enrichedSyndicators.length}/${rawData.length}`);
      
      // Wait between batches (except for the last one)
      if (i + BATCH_SIZE < rawData.length) {
        console.log(`⏱️ Waiting ${BATCH_DELAY}ms before next batch...`);
        await delay(BATCH_DELAY);
      }
    }
    
    // Save enriched data
    const outputPath = 'syndicators-enriched.json';
    await fs.writeFile(outputPath, JSON.stringify(enrichedSyndicators, null, 2));
    console.log(`\n💾 Enriched data saved to: ${outputPath}`);
    
    console.log(`\n📊 Final Summary:`);
    console.log(`- Total syndicators processed: ${enrichedSyndicators.length}`);
    console.log(`- Successfully enriched: ${successCount}`);
    console.log(`- Found emails: ${emailCount}`);
    console.log(`- Claimed profiles (from EquityMD): ${enrichedSyndicators.filter(s => s.contact_email).length}`);
    
    return enrichedSyndicators;
    
  } catch (error) {
    console.error('❌ Error in batch processing:', error);
    throw error;
  }
}

// Run the enrichment
processInBatches().catch(console.error);