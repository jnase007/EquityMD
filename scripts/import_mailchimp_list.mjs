#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { google } from 'googleapis';
import { parse } from 'csv-parse';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH =
  '/Users/dalenase/.openclaw/media/inbound/members_Equity_MD_Email_July_2026_sent_Jul_28_2026---42ba5488-afa8-4bec-ba80-cf259c061da5.csv';
const SERVICE_ACCOUNT_PATH = '/Users/dalenase/.openclaw/googlechat-service-account.json';
const LOCAL_OUT = path.join(__dirname, 'mailchimp-full-list-2026-08-06.csv');
const SHARE_WITH = ['justin@brandastic.com', 'justinnassie@gmail.com'];

function titleCaseName(value) {
  const s = String(value || '').trim().replace(/\s+/g, ' ');
  if (!s) return '';
  return s
    .toLowerCase()
    .split(' ')
    .map((part) => {
      if (!part) return part;
      if (part.includes("'")) {
        return part
          .split("'")
          .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
          .join("'");
      }
      if (part.includes('-')) {
        return part
          .split('-')
          .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
          .join('-');
      }
      return part[0].toUpperCase() + part.slice(1);
    })
    .join(' ');
}

function firstNameOnly(value) {
  const cleaned = titleCaseName(value);
  if (!cleaned) return '';
  return cleaned.split(' ')[0];
}

function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const records = [];
    createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          relax_column_count: true,
          trim: true,
          bom: true,
        })
      )
      .on('data', (row) => records.push(row))
      .on('error', reject)
      .on('end', () => resolve(records));
  });
}

async function main() {
  // Prefer workspace googleapis; csv-parse may need dynamic resolve from equitymd-repo or npx
  let records;
  try {
    records = await parseCsv(CSV_PATH);
  } catch (err) {
    // Fallback: manual CSV parse if csv-parse missing
    if (String(err.message || err).includes('Cannot find package') || err.code === 'ERR_MODULE_NOT_FOUND') {
      const raw = await fs.readFile(CSV_PATH, 'utf8');
      records = manualParse(raw);
    } else {
      throw err;
    }
  }

  const seen = new Map();
  let blankEmail = 0;
  let opened = 0;
  let clicked = 0;

  for (const row of records) {
    const email = String(row.email || '').trim();
    if (!email) {
      blankEmail += 1;
      continue;
    }
    const key = email.toLowerCase();
    const first = firstNameOnly(row.first_name);
    const last = titleCaseName(row.last_name);
    const opens = Number(row.opens || 0) || 0;
    const clicks = Number(row.clicks || 0) || 0;
    const address = String(row.address || '').trim();
    const phone = String(row.phone_number || '').trim();

    if (opens > 0) opened += 1;
    if (clicks > 0) clicked += 1;

    if (!seen.has(key)) {
      seen.set(key, {
        email,
        first_name: first,
        last_name: last,
        opens,
        clicks,
        address,
        phone_number: phone,
      });
    } else {
      const prev = seen.get(key);
      if (!prev.first_name && first) prev.first_name = first;
      if (!prev.last_name && last) prev.last_name = last;
      if (!prev.address && address) prev.address = address;
      if (!prev.phone_number && phone) prev.phone_number = phone;
      prev.opens = Math.max(prev.opens, opens);
      prev.clicks = Math.max(prev.clicks, clicks);
    }
  }

  const unique = [...seen.values()].sort((a, b) =>
    a.email.localeCompare(b.email, undefined, { sensitivity: 'base' })
  );

  const localLines = [
    'email,first_name,last_name,opens,clicks,address,phone_number',
    ...unique.map((r) =>
      [r.email, r.first_name, r.last_name, r.opens, r.clicks, r.address, r.phone_number]
        .map((v) => {
          const s = String(v ?? '');
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(',')
    ),
  ];
  await fs.writeFile(LOCAL_OUT, localLines.join('\n') + '\n', 'utf8');

  const serviceAccount = JSON.parse(await fs.readFile(SERVICE_ACCOUNT_PATH, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  const title = `EquityMD Full Investor List - ${new Date().toISOString().slice(0, 10)} (${unique.length})`;
  const createResponse = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
      sheets: [
        {
          properties: {
            title: 'Email + First Name',
            gridProperties: { frozenRowCount: 1 },
          },
        },
        {
          properties: {
            title: 'All Contacts',
            gridProperties: { frozenRowCount: 1 },
          },
        },
        {
          properties: {
            title: 'Summary',
            gridProperties: { frozenRowCount: 1 },
          },
        },
      ],
    },
  });

  const spreadsheetId = createResponse.data.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const fullHeaders = [
    'email',
    'first_name',
    'last_name',
    'opens',
    'clicks',
    'address',
    'phone_number',
  ];
  const withFirst = unique.filter((r) => r.first_name).length;
  const summaryValues = [
    ['metric', 'value'],
    ['source_file', path.basename(CSV_PATH)],
    ['raw_rows', records.length],
    ['blank_email_rows', blankEmail],
    ['unique_emails', unique.length],
    ['with_first_name', withFirst],
    ['missing_first_name', unique.length - withFirst],
    ['opened_gt_0_raw_rows', opened],
    ['clicked_gt_0_raw_rows', clicked],
    ['imported_at', new Date().toISOString()],
    ['local_backup', LOCAL_OUT],
  ];

  const CHUNK = 4000;

  // Email + First Name first (primary tab)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Email + First Name!A1',
    valueInputOption: 'RAW',
    requestBody: { values: [['email', 'first_name']] },
  });
  for (let i = 0; i < unique.length; i += CHUNK) {
    const slice = unique.slice(i, i + CHUNK).map((r) => [r.email, r.first_name]);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Email + First Name!A${i + 2}`,
      valueInputOption: 'RAW',
      requestBody: { values: slice },
    });
    console.log(`wrote Email+First ${i + 1}-${i + slice.length}`);
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'All Contacts!A1',
    valueInputOption: 'RAW',
    requestBody: { values: [fullHeaders] },
  });
  for (let i = 0; i < unique.length; i += CHUNK) {
    const slice = unique.slice(i, i + CHUNK).map((r) => [
      r.email,
      r.first_name,
      r.last_name,
      r.opens,
      r.clicks,
      r.address,
      r.phone_number,
    ]);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `All Contacts!A${i + 2}`,
      valueInputOption: 'RAW',
      requestBody: { values: slice },
    });
    console.log(`wrote All Contacts ${i + 1}-${i + slice.length}`);
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Summary!A1',
    valueInputOption: 'RAW',
    requestBody: { values: summaryValues },
  });

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetIds = Object.fromEntries(
    meta.data.sheets.map((s) => [s.properties.title, s.properties.sheetId])
  );

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: ['Email + First Name', 'All Contacts', 'Summary'].flatMap((name) => [
        {
          repeatCell: {
            range: {
              sheetId: sheetIds[name],
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
                backgroundColor: { red: 0.93, green: 0.93, blue: 0.93 },
              },
            },
            fields: 'userEnteredFormat(textFormat,backgroundColor)',
          },
        },
      ]).concat([
        {
          updateDimensionProperties: {
            range: {
              sheetId: sheetIds['Email + First Name'],
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 1,
            },
            properties: { pixelSize: 280 },
            fields: 'pixelSize',
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: sheetIds['Email + First Name'],
              dimension: 'COLUMNS',
              startIndex: 1,
              endIndex: 2,
            },
            properties: { pixelSize: 140 },
            fields: 'pixelSize',
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: sheetIds['All Contacts'],
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 1,
            },
            properties: { pixelSize: 280 },
            fields: 'pixelSize',
          },
        },
      ]),
    },
  });

  for (const email of SHARE_WITH) {
    try {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          type: 'user',
          role: 'writer',
          emailAddress: email,
        },
        sendNotificationEmail: false,
      });
      console.log(`shared_with ${email}`);
    } catch (err) {
      console.log(`share_failed ${email}: ${err.message}`);
    }
  }

  console.log(
    JSON.stringify(
      {
        spreadsheetId,
        spreadsheetUrl,
        raw_rows: records.length,
        blank_email_rows: blankEmail,
        unique_emails: unique.length,
        with_first_name: withFirst,
        missing_first_name: unique.length - withFirst,
        opened_gt_0_raw_rows: opened,
        clicked_gt_0_raw_rows: clicked,
        local_backup: LOCAL_OUT,
      },
      null,
      2
    )
  );
}

function manualParse(raw) {
  const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.length);
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]);
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (!cols.length || cols.every((c) => !c)) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] ?? '';
    });
    out.push(row);
  }
  return out;
}

function splitCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result.map((s) => s.trim());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
