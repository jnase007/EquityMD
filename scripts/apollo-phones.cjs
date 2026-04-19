const fs = require('fs');

const API_KEY = 'YMelcWSplOfiqfMI9JR8QA';
const INPUT = '/Users/dalenase/.openclaw/workspace/equitymd-syndicator-contacts-enriched.csv';
const OUTPUT = '/Users/dalenase/.openclaw/workspace/equitymd-syndicator-contacts-enriched.csv';

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

async function apiCall(url, body, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY },
      body: JSON.stringify(body),
    });
    if (resp.status === 429) {
      console.log('  ⏳ Rate limited, waiting 60s...');
      await sleep(60000);
      continue;
    }
    if (!resp.ok) return null;
    return await resp.json();
  }
  return null;
}

async function main() {
  const csv = fs.readFileSync(INPUT, 'utf8');
  const rows = parseCSV(csv);
  const header = rows[0];
  const dataRows = rows.slice(1);

  // Find rows that have a name+email but no phone
  let needPhone = 0;
  let alreadyHavePhone = 0;
  for (const row of dataRows) {
    if (row[4] && !row[7]) needPhone++;
    if (row[7]) alreadyHavePhone++;
  }
  console.log(`Already have phone: ${alreadyHavePhone}`);
  console.log(`Need phone lookup: ${needPhone}\n`);

  let found = 0;
  let idx = 0;
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const name = row[4] || '';
    const email = row[6] || '';
    const phone = row[7] || '';
    const company = row[0] || '';
    const domain = getDomain(row[3]);

    // Skip if already has phone, or no contact found
    if (phone || !name) continue;
    idx++;

    console.log(`[${idx}/${needPhone}] ${name} @ ${company}`);

    // Use people/match with name+domain to get phone
    const matchBody = {};
    if (email) {
      matchBody.email = email;
      matchBody.reveal_phone_number = true;
    } else {
      // Try name + domain
      const parts = name.split(' ');
      matchBody.first_name = parts[0];
      matchBody.last_name = parts.slice(1).join(' ');
      if (domain) matchBody.organization_domain = domain;
      matchBody.reveal_phone_number = true;
    }

    const data = await apiCall('https://api.apollo.io/api/v1/people/match', matchBody);

    if (data?.person) {
      const p = data.person;
      const phones = p.phone_numbers || [];
      const directPhone = phones.find(ph => ph.type === 'mobile' || ph.type === 'direct') || phones[0];
      
      if (directPhone?.sanitized_number) {
        dataRows[i][7] = directPhone.sanitized_number;
        found++;
        console.log(`  ✅ ${directPhone.sanitized_number} (${directPhone.type})`);
      } else if (p.organization?.phone) {
        dataRows[i][7] = p.organization.phone;
        found++;
        console.log(`  ✅ ${p.organization.phone} (company)`);
      } else {
        console.log(`  ❌ No phone`);
      }

      // Also backfill email if we didn't have it
      if (!row[6] && p.email) {
        dataRows[i][6] = p.email;
        console.log(`  📧 Also got email: ${p.email}`);
      }
    } else {
      console.log(`  ❌ No match`);
    }

    // Save every 20
    if (idx % 20 === 0) {
      const outRows = [header.map(esc).join(','), ...dataRows.map(r => r.map(esc).join(','))];
      fs.writeFileSync(OUTPUT, outRows.join('\n'));
      console.log(`  💾 Saved (${found} phones found so far)\n`);
    }

    await sleep(350);
  }

  // Final save
  const outRows = [header.map(esc).join(','), ...dataRows.map(r => r.map(esc).join(','))];
  fs.writeFileSync(OUTPUT, outRows.join('\n'));

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Done! Found ${found} new phone numbers`);
  console.log(`Total with phone: ${alreadyHavePhone + found} / ${dataRows.length}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
