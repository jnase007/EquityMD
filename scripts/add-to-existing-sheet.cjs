const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '1su47AnuKpT-bBt5d6LiaTednx0eEPPCIRAvknMiP9MQ';

async function main() {
  const keyFile = path.join(process.env.HOME, '.openclaw/googlechat-service-account.json');
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  // Read CSV
  const csv = fs.readFileSync('/Users/dalenase/.openclaw/workspace/equitymd-syndicator-contacts.csv', 'utf8');
  const rows = [];
  const lines = csv.split('\n');
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
        row.push(field);
        field = '';
      } else {
        field += ch;
      }
    }
    row.push(field);
    rows.push(row);
  }
  console.log(`Parsed ${rows.length} rows`);

  // Try to add a new sheet tab
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Supabase Syndicators (298)',
              gridProperties: { frozenRowCount: 1 },
            },
          },
        }],
      },
    });
    console.log('Created new tab');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('Tab already exists, will overwrite');
    } else {
      throw e;
    }
  }

  // Write data to the new tab
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: "'Supabase Syndicators (298)'!A1",
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
  console.log(`Wrote ${rows.length} rows to new tab`);

  // Format header
  const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const newSheet = sheetMeta.data.sheets.find(s => s.properties.title === 'Supabase Syndicators (298)');
  if (newSheet) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: { sheetId: newSheet.properties.sheetId, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.27, blue: 0.55 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: { sheetId: newSheet.properties.sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 12 },
            },
          },
        ],
      },
    });
    console.log('Formatted header');
  }

  console.log(`\nDone! Check: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
