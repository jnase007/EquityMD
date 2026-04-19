#!/usr/bin/env node

import fs from 'fs/promises';

async function fixPrimaryContacts() {
  try {
    console.log('📊 Loading enriched data...');
    const enrichedData = JSON.parse(await fs.readFile('syndicators-enriched.json', 'utf8'));
    
    console.log(`🔧 Fixing primary contact data for ${enrichedData.length} syndicators...`);
    
    let fixedCount = 0;
    let withContactsCount = 0;
    
    for (const syndicator of enrichedData) {
      if (syndicator.apollo_contacts && syndicator.apollo_contacts.length > 0) {
        // Extract primary contact (first person with highest priority title)
        const titlePriority = { 'CEO': 1, 'Founder': 2, 'Managing Partner': 3, 'Principal': 4, 'President': 5, 'Director': 6 };
        const sortedPeople = syndicator.apollo_contacts.sort((a, b) => {
          const aPriority = titlePriority[a.title] || 99;
          const bPriority = titlePriority[b.title] || 99;
          return aPriority - bPriority;
        });
        
        const primaryContact = sortedPeople[0];
        
        if (primaryContact) {
          syndicator.primary_contact = {
            name: `${primaryContact.first_name} ${primaryContact.last_name_obfuscated || ''}`.trim(),
            title: primaryContact.title,
            email: primaryContact.has_email ? 'Available via Apollo' : null,
            phone: primaryContact.has_direct_phone === 'Yes' ? 'Available via Apollo' : null,
            linkedin_url: primaryContact.linkedin_url || null
          };
          fixedCount++;
          withContactsCount++;
        }
      }
    }
    
    // Save fixed data
    await fs.writeFile('syndicators-enriched-fixed.json', JSON.stringify(enrichedData, null, 2));
    
    console.log(`✅ Fixed primary contacts: ${fixedCount}`);
    console.log(`📧 Total with contacts: ${withContactsCount}`);
    console.log(`💾 Saved to: syndicators-enriched-fixed.json`);
    
    // Show sample results
    console.log(`\n📋 Sample fixed contacts:`);
    enrichedData.filter(s => s.primary_contact?.name).slice(0, 5).forEach((s, i) => {
      console.log(`${i + 1}. ${s.company_name} - ${s.primary_contact.name} (${s.primary_contact.title})`);
    });
    
    return enrichedData;
    
  } catch (error) {
    console.error('❌ Error fixing contacts:', error);
    throw error;
  }
}

fixPrimaryContacts().catch(console.error);