const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '1su47AnuKpT-bBt5d6LiaTednx0eEPPCIRAvknMiP9MQ';
const TAB_NAME = 'Supabase Syndicators (298)';

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

async function main() {
  const keyFile = path.join(process.env.HOME, '.openclaw/googlechat-service-account.json');
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  const csv = fs.readFileSync('/Users/dalenase/.openclaw/workspace/equitymd-syndicator-contacts-enriched.csv', 'utf8');
  const rows = parseCSV(csv);
  console.log(`Parsed ${rows.length} rows (1 header + ${rows.length - 1} data)`);

  // Count enriched
  let withEmail = 0, withName = 0;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][4]) withName++;
    if (rows[i][6]) withEmail++;
  }
  console.log(`With contact name: ${withName}, With email: ${withEmail}`);

  // Clear and rewrite the tab
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${TAB_NAME}'!A:Z`,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${TAB_NAME}'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });

  console.log(`Updated ${rows.length} rows in "${TAB_NAME}"`);
  console.log(`\nDone! https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
