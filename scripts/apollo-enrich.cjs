const fs = require('fs');
const path = require('path');

const API_KEY = 'YMelcWSplOfiqfMI9JR8QA';
const INPUT = '/Users/dalenase/.openclaw/workspace/equitymd-syndicator-contacts.csv';
const OUTPUT = '/Users/dalenase/.openclaw/workspace/equitymd-syndicator-contacts-enriched.csv';

// Simple CSV parser
function parseCSV(text) {
  const lines = text.split('\n');
  const result = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const row = [];
    let inQuotes = false;
    let field = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        row.push(field.trim());
        field = '';
      } else {
        field += ch;
      }
    }
    row.push(field.trim());
    result.push(row);
  }
  return result;
}

function escapeCSV(val) {
  if (!val) return '';
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

async function searchCompany(companyName, domain) {
  // Use Apollo people search to find CEO/Owner/President
  const titles = ['CEO', 'Founder', 'President', 'Owner', 'Managing Partner', 'Principal'];
  
  const body = {
    api_key: API_KEY,
    q_organization_name: companyName,
    person_titles: titles,
    page: 1,
    per_page: 3,
  };
  
  if (domain) {
    body.q_organization_domains = domain;
  }

  const resp = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (resp.status === 429) {
    console.log('  Rate limited, waiting 60s...');
    await new Promise(r => setTimeout(r, 60000));
    return searchCompany(companyName, domain);
  }

  if (!resp.ok) {
    console.log(`  API error ${resp.status}`);
    return null;
  }

  const data = await resp.json();
  if (data.people && data.people.length > 0) {
    const person = data.people[0];
    return {
      name: person.name || '',
      title: person.title || '',
      email: person.email || '',
      phone: person.phone_numbers?.[0]?.sanitized_number || '',
      linkedin: person.linkedin_url || '',
    };
  }
  return null;
}

function getDomain(website) {
  if (!website) return '';
  try {
    const u = new URL(website.startsWith('http') ? website : 'https://' + website);
    return u.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

async function main() {
  const csv = fs.readFileSync(INPUT, 'utf8');
  const rows = parseCSV(csv);
  const header = rows[0];
  const dataRows = rows.slice(1);

  console.log(`Total companies: ${dataRows.length}`);

  // New CSV header
  const outHeader = ['Company Name', 'City', 'State', 'Website', 'Contact Name', 'Title', 'Email', 'Phone', 'LinkedIn', 'Company LinkedIn', 'EquityMD Profile Claimed'];

  const outRows = [outHeader.map(escapeCSV).join(',')];
  let enriched = 0;
  let failed = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const companyName = row[0] || '';
    const city = row[1] || '';
    const state = row[2] || '';
    const website = row[3] || '';
    const existingName = row[4] || '';
    const existingTitle = row[5] || '';
    const existingEmail = row[6] || '';
    const existingPhone = row[7] || '';
    const existingLinkedin = row[8] || '';
    const companyLinkedin = row[9] || '';
    const claimed = row[10] || '';

    const needsEnrich = existingEmail === 'Available via Apollo' || existingName.includes('***') || !existingEmail;

    if (needsEnrich && companyName) {
      const domain = getDomain(website);
      console.log(`[${i + 1}/${dataRows.length}] Searching: ${companyName}${domain ? ' (' + domain + ')' : ''}`);

      const result = await searchCompany(companyName, domain);

      if (result && result.name) {
        outRows.push([
          companyName, city, state, website,
          result.name, result.title, result.email, result.phone,
          result.linkedin, companyLinkedin, claimed
        ].map(escapeCSV).join(','));
        enriched++;
        console.log(`  ✅ ${result.name} - ${result.title} - ${result.email || 'no email'}`);
      } else {
        outRows.push([
          companyName, city, state, website,
          '', '', '', '',
          '', companyLinkedin, claimed
        ].map(escapeCSV).join(','));
        failed++;
        console.log(`  ❌ No results`);
      }

      // Rate limit: ~5 requests/sec
      await new Promise(r => setTimeout(r, 250));
    } else {
      // Already has data
      outRows.push([
        companyName, city, state, website,
        existingName, existingTitle, existingEmail, existingPhone,
        existingLinkedin, companyLinkedin, claimed
      ].map(escapeCSV).join(','));
    }
  }

  fs.writeFileSync(OUTPUT, outRows.join('\n'));
  console.log(`\nDone! Enriched: ${enriched}, Failed: ${failed}, Total: ${dataRows.length}`);
  console.log(`Output: ${OUTPUT}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
