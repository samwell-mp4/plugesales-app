import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import pkg from 'pg';
const { Pool } = pkg;

const uploadsDir = './uploads';
const supabaseUrl = 'postgresql://postgres:Marketing%40plugsales2026!@db.hpwahwsbtqvfyutosfyr.supabase.co:5432/postgres';

async function searchSupabase(term) {
    console.log(`\n🔍 Searching Supabase for "${term}"...`);
    const pool = new Pool({ 
        connectionString: supabaseUrl,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        const client = await pool.connect();
        const tables = ['crm_leads', 'leads_empresas', 'leads_whatsapp', 'consultative_actions'];
        
        for (const table of tables) {
            // Find all columns
            const colsRes = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1 AND data_type IN ('text', 'character varying')
            `, [table]);
            
            if (colsRes.rows.length === 0) continue;
            
            // Build query
            const conditions = colsRes.rows.map(col => `LOWER("${col.column_name}") LIKE LOWER('%${term}%')`).join(' OR ');
            const queryStr = `SELECT * FROM "${table}" WHERE ${conditions}`;
            
            const searchRes = await client.query(queryStr);
            if (searchRes.rows.length > 0) {
                console.log(`✅ FOUND in Supabase Table [${table}] (${searchRes.rows.length} records):`);
                console.log(JSON.stringify(searchRes.rows, null, 2));
            }
        }
        
        client.release();
    } catch (err) {
        console.error("Supabase search error:", err.message);
    } finally {
        await pool.end();
    }
}

function searchSpreadsheets(term) {
    console.log(`\n🔍 Searching local files in ${uploadsDir} for "${term}"...`);
    
    try {
        if (!fs.existsSync(uploadsDir)) {
            console.log("No uploads directory found.");
            return;
        }
        
        const files = fs.readdirSync(uploadsDir);
        
        for (const file of files) {
            const filePath = path.join(uploadsDir, file);
            const ext = path.extname(file).toLowerCase();
            
            if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
                try {
                    const workbook = XLSX.readFile(filePath);
                    let foundInFile = [];
                    
                    for (const sheetName of workbook.SheetNames) {
                        const worksheet = workbook.Sheets[sheetName];
                        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        
                        rows.forEach((row, rowIndex) => {
                            const rowStr = JSON.stringify(row).toLowerCase();
                            if (rowStr.includes(term.toLowerCase())) {
                                foundInFile.push({ sheetName, rowIndex: rowIndex + 1, data: row });
                            }
                        });
                    }
                    
                    if (foundInFile.length > 0) {
                        console.log(`✅ FOUND in file: ${file} (${foundInFile.length} matching rows):`);
                        foundInFile.forEach(match => {
                            console.log(` - Sheet [${match.sheetName}] Row ${match.rowIndex}:`, match.data);
                        });
                    }
                } catch (e) {
                    console.error(`Error reading ${file}:`, e.message);
                }
            }
        }
    } catch (err) {
        console.error("Spreadsheet search error:", err.message);
    }
}

async function runSearch() {
    searchSpreadsheets('vitoria');
    searchSpreadsheets('vitória');
    
    await searchSupabase('vitoria');
    await searchSupabase('vitória');
}

runSearch();
