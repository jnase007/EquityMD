const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function main() {
  // Load service account
  const keyFile = path.join(process.env.HOME, '.openclaw/googlechat-service-account.json');
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
  });
  const authClient = await auth.getClient();

  // Read CSV
  const csv = fs.readFileSync('/Users/dalenase/.openclaw/workspace/equitymd-syndicator-contacts.csv', 'utf8');
  const rows = [];
  // Simple CSV parser that handles quoted fields
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

  console.log(`Parsed ${rows.length} rows (including header)`);

  // Create spreadsheet
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  const drive = google.drive({ version: 'v3', auth: authClient });

  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: 'EquityMD Syndicator Contacts',
      },
      sheets: [{
        properties: {
          title: 'Syndicators',
          gridProperties: { frozenRowCount: 1 },
        },
      }],
    },
  });

  const spreadsheetId = spreadsheet.data.spreadsheetId;
  console.log(`Created spreadsheet: ${spreadsheetId}`);
  console.log(`URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);

  // Write data
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Syndicators!A1',
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
  console.log(`Wrote ${rows.length} rows`);

  // Format header row (bold + background color)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
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
            dimensions: { sheetId: 0, dimension: 'COLUMNS', startIndex: 0, endIndex: 12 },
          },
        },
      ],
    },
  });

  // Share with Justin and Dale
  for (const email of ['justin@brandastic.com', 'dalenase007@gmail.com']) {
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: email,
      },
      sendNotificationEmail: false,
    });
    console.log(`Shared with ${email}`);
  }

  console.log('\nDone! Sheet is ready.');
}

main().catch(err => {
  console.error('Error:', err.message);
  if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
  process.exit(1);
});
