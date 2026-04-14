const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

const getSheetsClient = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: SERVICE_ACCOUNT_FILE,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
};

async function run() {
    try {
        const sheets = await getSheetsClient();
        const spreadsheetId = '1Kyg2H01DDrfR-bR_tBM_vDDXXvWaqk-61QbivSWZFV4';
        const res = await sheets.spreadsheets.get({ spreadsheetId });
        console.log('Sheets found:', res.data.sheets.map(s => s.properties.title));
    } catch (e) {
        console.error('Error fetching sheets:', e.message);
    }
}
run();
