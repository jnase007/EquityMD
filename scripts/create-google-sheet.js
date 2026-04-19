#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { google } from 'googleapis';

const SERVICE_ACCOUNT_PATH = '/Users/dalenase/.openclaw/googlechat-service-account.json';

async function createGoogleSheet() {
  try {
    // Load enriched data
    let enrichedData;
    try {
      enrichedData = JSON.parse(await fs.readFile('syndicators-enriched-fixed.json', 'utf8'));
    } catch (error) {
      try {
        enrichedData = JSON.parse(await fs.readFile('syndicators-enriched.json', 'utf8'));
      } catch (error2) {
        console.log('⚠️ Main enriched file not found, using test data...');
        enrichedData = JSON.parse(await fs.readFile('syndicators-enriched-test.json', 'utf8'));
      }
    }
    
    console.log(`📊 Creating Google Sheet for ${enrichedData.length} syndicators...`);
    
    // Set up Google Sheets API
    const serviceAccount = JSON.parse(await fs.readFile(SERVICE_ACCOUNT_PATH, 'utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Create new spreadsheet
    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `EquityMD Syndicators with Apollo Contact Data - ${new Date().toISOString().split('T')[0]}`,
        },
      },
    });
    
    const spreadsheetId = createResponse.data.spreadsheetId;
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    
    console.log(`✅ Created spreadsheet: ${spreadsheetUrl}`);
    
    // Prepare data for sheet
    const headers = [
      'Company Name',
      'City', 
      'State',
      'Website',
      'Contact Name',
      'Title',
      'Email',
      'Phone',
      'LinkedIn',
      'Company LinkedIn',
      'EquityMD Profile Claimed',
      'Notes'
    ];
    
    // Sort data by state, then company name
    const sortedData = enrichedData.sort((a, b) => {
      if (a.state !== b.state) {
        return (a.state || '').localeCompare(b.state || '');
      }
      return (a.company_name || '').localeCompare(b.company_name || '');
    });
    
    const rows = [headers];
    
    for (const syndicator of sortedData) {
      const row = [
        syndicator.company_name || '',
        syndicator.city || '',
        syndicator.state || '',
        syndicator.website_url || '',
        syndicator.primary_contact?.name || '',
        syndicator.primary_contact?.title || '',
        syndicator.primary_contact?.email || '',
        syndicator.primary_contact?.phone || '',
        syndicator.primary_contact?.linkedin_url || '',
        syndicator.company_linkedin || '',
        syndicator.contact_email ? 'Yes' : 'No',
        syndicator.enrichment_status === 'no_domain' ? 'No valid website domain' : ''
      ];
      rows.push(row);
    }
    
    // Add data to sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    });
    
    // Format the sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                  textFormat: { bold: true },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId: 0,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 12,
              },
            },
          },
        ],
      },
    });
    
    console.log(`📋 Added ${rows.length - 1} rows of data to the sheet`);
    
    // Share with Justin and Dale
    const drive = google.drive({ version: 'v3', auth });
    
    try {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          role: 'editor',
          type: 'user',
          emailAddress: 'justin@brandastic.com',
        },
      });
      console.log(`✅ Shared with justin@brandastic.com as editor`);
    } catch (error) {
      console.log(`⚠️ Could not share with justin@brandastic.com: ${error.message}`);
    }
    
    try {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          role: 'editor',
          type: 'user',
          emailAddress: 'dalenase007@gmail.com',
        },
      });
      console.log(`✅ Shared with dalenase007@gmail.com as editor`);
    } catch (error) {
      console.log(`⚠️ Could not share with dalenase007@gmail.com: ${error.message}`);
    }
    
    console.log(`\n🎉 Google Sheet created successfully!`);
    console.log(`🔗 URL: ${spreadsheetUrl}`);
    console.log(`📊 Total syndicators: ${sortedData.length}`);
    console.log(`📧 With Apollo contacts: ${sortedData.filter(s => s.primary_contact?.name).length}`);
    console.log(`🔒 Claimed profiles: ${sortedData.filter(s => s.contact_email).length}`);
    
    return {
      spreadsheetUrl,
      spreadsheetId,
      totalSyndicators: sortedData.length,
      withContacts: sortedData.filter(s => s.primary_contact?.name).length,
      claimedProfiles: sortedData.filter(s => s.contact_email).length
    };
    
  } catch (error) {
    console.error('❌ Error creating Google Sheet:', error);
    
    // Fallback: create CSV file
    console.log('\n📄 Creating CSV file as fallback...');
    await createCSVFallback();
    throw error;
  }
}

async function createCSVFallback() {
  try {
    // Load enriched data
    let enrichedData;
    try {
      enrichedData = JSON.parse(await fs.readFile('syndicators-enriched-fixed.json', 'utf8'));
    } catch (error) {
      try {
        enrichedData = JSON.parse(await fs.readFile('syndicators-enriched.json', 'utf8'));
      } catch (error2) {
        console.log('⚠️ Main enriched file not found, using test data...');
        enrichedData = JSON.parse(await fs.readFile('syndicators-enriched-test.json', 'utf8'));
      }
    }
    
    const headers = [
      'Company Name',
      'City', 
      'State',
      'Website',
      'Contact Name',
      'Title',
      'Email',
      'Phone',
      'LinkedIn',
      'Company LinkedIn',
      'EquityMD Profile Claimed',
      'Notes'
    ];
    
    // Sort data by state, then company name
    const sortedData = enrichedData.sort((a, b) => {
      if (a.state !== b.state) {
        return (a.state || '').localeCompare(b.state || '');
      }
      return (a.company_name || '').localeCompare(b.company_name || '');
    });
    
    // Create CSV content
    const csvRows = [headers.join(',')];
    
    for (const syndicator of sortedData) {
      const row = [
        `"${(syndicator.company_name || '').replace(/"/g, '""')}"`,
        `"${(syndicator.city || '').replace(/"/g, '""')}"`,
        `"${(syndicator.state || '').replace(/"/g, '""')}"`,
        `"${(syndicator.website_url || '').replace(/"/g, '""')}"`,
        `"${(syndicator.primary_contact?.name || '').replace(/"/g, '""')}"`,
        `"${(syndicator.primary_contact?.title || '').replace(/"/g, '""')}"`,
        `"${(syndicator.primary_contact?.email || '').replace(/"/g, '""')}"`,
        `"${(syndicator.primary_contact?.phone || '').replace(/"/g, '""')}"`,
        `"${(syndicator.primary_contact?.linkedin_url || '').replace(/"/g, '""')}"`,
        `"${(syndicator.company_linkedin || '').replace(/"/g, '""')}"`,
        `"${syndicator.contact_email ? 'Yes' : 'No'}"`,
        `"${syndicator.enrichment_status === 'no_domain' ? 'No valid website domain' : ''}"`
      ];
      csvRows.push(row.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    const csvPath = '/Users/dalenase/.openclaw/workspace/equitymd-syndicator-contacts.csv';
    
    await fs.writeFile(csvPath, csvContent);
    
    console.log(`✅ CSV file created: ${csvPath}`);
    console.log(`📊 Total syndicators: ${sortedData.length}`);
    console.log(`📧 With Apollo contacts: ${sortedData.filter(s => s.primary_contact?.name).length}`);
    console.log(`🔒 Claimed profiles: ${sortedData.filter(s => s.contact_email).length}`);
    
    return csvPath;
    
  } catch (error) {
    console.error('❌ Error creating CSV:', error);
    throw error;
  }
}

// Check if we should create sheet or CSV
if (process.argv.includes('--csv-only')) {
  createCSVFallback().catch(console.error);
} else {
  createGoogleSheet().catch(console.error);
}