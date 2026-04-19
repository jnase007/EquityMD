const fs = require('fs');

const API_KEY = 'YMelcWSplOfiqfMI9JR8QA';
const INPUT = '/Users/dalenase/.openclaw/workspace/equitymd-syndicator-contacts.csv';
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
      else if (ch === ',' && !inQuotes) { row.push(field.trim()); field = ''; }
      else field += ch;
    }
    row.push(field.trim());
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
    if (!resp.ok) {
      const txt = await resp.text();
      console.log(`  API ${resp.status}: ${txt.slice(0, 200)}`);
      return null;
    }
    return await resp.json();
  }
  return null;
}

async function findAndReveal(companyName, domain) {
  // Step 1: Search for CEO/Founder/President at this domain
  const searchBody = {
    person_titles: ['CEO', 'Founder', 'President', 'Owner', 'Managing Partner', 'Principal', 'Managing Director'],
    page: 1,
    per_page: 3,
  };
  if (domain) searchBody.q_organization_domains = domain;
  else searchBody.q_organization_name = companyName;

  const searchData = await apiCall('https://api.apollo.io/api/v1/mixed_people/api_search', searchBody);
  if (!searchData || !searchData.people || searchData.people.length === 0) return null;

  // Pick the best match (prefer CEO > Founder > President > others)
  const titleRank = (t) => {
    const tl = (t || '').toLowerCase();
    if (tl.includes('ceo') || tl.includes('chief executive')) return 1;
    if (tl.includes('founder')) return 2;
    if (tl.includes('owner')) return 3;
    if (tl.includes('president')) return 4;
    if (tl.includes('managing partner')) return 5;
    if (tl.includes('principal')) return 6;
    return 7;
  };
  const people = searchData.people.sort((a, b) => titleRank(a.title) - titleRank(b.title));
  const bestMatch = people[0];

  // Step 2: Reveal full contact details
  const revealData = await apiCall('https://api.apollo.io/api/v1/people/match', {
    id: bestMatch.id,
    reveal_personal_emails: false,
  });

  if (!revealData || !revealData.person) return null;
  const p = revealData.person;
  return {
    name: p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
    title: p.title || '',
    email: p.email || '',
    phone: (p.phone_numbers && p.phone_numbers[0]?.sanitized_number) || '',
    linkedin: p.linkedin_url || '',
    city: p.city || '',
    state: p.state || '',
  };
}

async function main() {
  const csv = fs.readFileSync(INPUT, 'utf8');
  const rows = parseCSV(csv);
  const header = rows[0];
  const dataRows = rows.slice(1);

  console.log(`Total companies: ${dataRows.length}\n`);

  const outHeader = 'Company Name,City,State,Website,Contact Name,Title,Email,Phone,LinkedIn,Company LinkedIn,EquityMD Profile Claimed';
  const outRows = [outHeader];
  let enriched = 0, skipped = 0, failed = 0;

  // Load progress if exists (resume support)
  const progressFile = OUTPUT + '.progress';
  let startFrom = 0;
  if (fs.existsSync(progressFile)) {
    const progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    startFrom = progress.lastIndex + 1;
    // Load existing output rows
    if (fs.existsSync(OUTPUT)) {
      const existingLines = fs.readFileSync(OUTPUT, 'utf8').split('\n').filter(l => l.trim());
      outRows.length = 0;
      outRows.push(...existingLines);
    }
    console.log(`Resuming from index ${startFrom}...\n`);
  }

  for (let i = startFrom; i < dataRows.length; i++) {
    const row = dataRows[i];
    const companyName = row[0] || '';
    const city = row[1] || '';
    const state = row[2] || '';
    const website = row[3] || '';
    const companyLinkedin = row[9] || '';
    const claimed = row[10] || '';

    const domain = getDomain(website);

    if (!companyName || (!domain && !companyName)) {
      outRows.push([companyName, city, state, website, '', '', '', '', '', companyLinkedin, claimed].map(esc).join(','));
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${dataRows.length}] ${companyName}${domain ? ' (' + domain + ')' : ''}`);

    const result = await findAndReveal(companyName, domain);

    if (result && result.name) {
      outRows.push([
        companyName, result.city || city, result.state || state, website,
        result.name, result.title, result.email, result.phone,
        result.linkedin, companyLinkedin, claimed
      ].map(esc).join(','));
      enriched++;
      console.log(`  ✅ ${result.name} | ${result.title} | ${result.email || 'no email'}`);
    } else {
      outRows.push([companyName, city, state, website, '', '', '', '', '', companyLinkedin, claimed].map(esc).join(','));
      failed++;
      console.log(`  ❌ No results`);
    }

    // Save progress every 10 rows
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(OUTPUT, outRows.join('\n'));
      fs.writeFileSync(progressFile, JSON.stringify({ lastIndex: i }));
      console.log(`  💾 Saved progress (${enriched} enriched so far)\n`);
    }

    // Rate limit: ~2 calls per company, stay under 200/min
    await sleep(400);
  }

  fs.writeFileSync(OUTPUT, outRows.join('\n'));
  if (fs.existsSync(progressFile)) fs.unlinkSync(progressFile);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Done! Enriched: ${enriched} | Failed: ${failed} | Skipped: ${skipped} | Total: ${dataRows.length}`);
  console.log(`Output: ${OUTPUT}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
