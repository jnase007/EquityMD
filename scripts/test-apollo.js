#!/usr/bin/env node

const APOLLO_API_KEY = 'YMelcWSplOfiqfMI9JR8QA';

async function testApollo() {
  try {
    // Test organization enrichment
    console.log('🧪 Testing Apollo Organization Enrichment...');
    const orgResponse = await fetch('https://api.apollo.io/api/v1/organizations/enrich', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify({
        domain: 'ashcroftcapital.com'
      })
    });
    
    console.log('Org response status:', orgResponse.status);
    const orgData = await orgResponse.json();
    console.log('Org response:', JSON.stringify(orgData, null, 2));
    
    // Test people search
    console.log('\n🧪 Testing Apollo People Search...');
    const peopleResponse = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify({
        organization_domains: ['ashcroftcapital.com'],
        person_titles: ['CEO', 'Founder', 'Managing Partner'],
        page: 1,
        per_page: 5
      })
    });
    
    console.log('People response status:', peopleResponse.status);
    const peopleData = await peopleResponse.json();
    console.log('People response:', JSON.stringify(peopleData, null, 2));
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testApollo();