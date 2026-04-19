const fs = require('fs');

const API_KEY = 'YMelcWSplOfiqfMI9JR8QA';
const INPUT = '/Users/dalenase/.openclaw/workspace/equitymd-syndicator-contacts-enriched.csv';
const OUTPUT = INPUT; // overwrite in place

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
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === ',' && !inQuotes) { row.push(field); field = ''; }
      else field += ch;
    }
    row.push(field);
    result.push(row);
  }
  return result;
}

function esc(val) {
  if (!val) return '';
  if (val.includes(',') || val.includes('"') || val.includes('\n')) return '"' + val.replace(/"/g, '""') + '"';
  return val;
}

function getDomain(website) {
  if (!website) return '';
  try {
    const u = new URL(website.startsWith('http') ? website : 'https://' + website);
    return u.hostname.replace('www.', '');
  } catch { return ''; }
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const csv = fs.readFileSync(INPUT, 'utf8');
  const rows = parseCSV(csv);
  const header = rows[0];
  const dataRows = rows.slice(1);

  // Deduplicate by domain — only look up each domain once
  const domainCache = {};
  let needLookup = 0;
  for (const row of dataRows) {
    if (row[4] && !row[7]) { // has name but no phone
      const domain = getDomain(row[3]);
      if (domain && !domainCache[domain]) {
        domainCache[domain] = null; // placeholder
        needLookup++;
      }
    }
  }
  console.log(`Unique domains to look up: ${needLookup}\n`);

  // Search each domain for person, get org phone from the reveal
  let found = 0;
  let idx = 0;
  const domains = Object.keys(domainCache);

  for (const domain of domains) {
    idx++;
    console.log(`[${idx}/${needLookup}] ${domain}`);

    // Search
    const searchResp = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY },
      body: JSON.stringify({
        q_organization_domains: domain,
        person_titles: ['CEO', 'Founder', 'President', 'Owner'],
        per_page: 1,
      }),
    });

    if (searchResp.status === 429) {
      console.log('  ⏳ Rate limited, waiting 60s...');
      await sleep(60000);
      idx--;
      continue;
    }

    if (!searchResp.ok) {
      console.log(`  ❌ Search error ${searchResp.status}`);
      await sleep(350);
      continue;
    }

    const searchData = await searchResp.json();
    if (!searchData.people || searchData.people.length === 0) {
      console.log(`  ❌ No people found`);
      await sleep(350);
      continue;
    }

    const personId = searchData.people[0].id;

    // Reveal to get org phone
    const revealResp = await fetch('https://api.apollo.io/api/v1/people/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY },
      body: JSON.stringify({ id: personId }),
    });

    if (!revealResp.ok) {
      console.log(`  ❌ Reveal error ${revealResp.status}`);
      await sleep(350);
      continue;
    }

    const revealData = await revealResp.json();
    const person = revealData.person;
    if (!person) {
      console.log(`  ❌ No person data`);
      await sleep(350);
      continue;
    }

    // Get phone: personal first, then org
    const personalPhone = (person.phone_numbers || []).find(p => p.sanitized_number)?.sanitized_number;
    const orgPhone = person.organization?.phone;
    const phone = personalPhone || orgPhone || '';

    if (phone) {
      domainCache[domain] = phone;
      found++;
      console.log(`  ✅ ${phone}${personalPhone ? ' (direct)' : ' (company)'}`);
    } else {
      console.log(`  ❌ No phone`);
    }

    // Save every 25
    if (idx % 25 === 0) {
      // Apply to rows
      for (let i = 0; i < dataRows.length; i++) {
        if (dataRows[i][4] && !dataRows[i][7]) {
          const d = getDomain(dataRows[i][3]);
          if (d && domainCache[d]) dataRows[i][7] = domainCache[d];
        }
      }
      const out = [header.map(esc).join(','), ...dataRows.map(r => r.map(esc).join(','))];
      fs.writeFileSync(OUTPUT, out.join('\n'));
      console.log(`  💾 Saved (${found} phones)\n`);
    }

    await sleep(350);
  }

  // Final apply + save
  for (let i = 0; i < dataRows.length; i++) {
    if (dataRows[i][4] && !dataRows[i][7]) {
      const d = getDomain(dataRows[i][3]);
      if (d && domainCache[d]) dataRows[i][7] = domainCache[d];
    }
  }
  const out = [header.map(esc).join(','), ...dataRows.map(r => r.map(esc).join(','))];
  fs.writeFileSync(OUTPUT, out.join('\n'));

  // Count final
  let withPhone = 0;
  for (const row of dataRows) { if (row[7]) withPhone++; }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Done! Found ${found} phone numbers from ${needLookup} domains`);
  console.log(`Total rows with phone: ${withPhone} / ${dataRows.length}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
