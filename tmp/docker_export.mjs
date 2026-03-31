import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

async function exportToCSV() {
    // This is the string from server.js for the production/easypanel environment
    const pgUrl = "postgres://postgres:Marketing@plugsales2026!@plug_sales_dispatch_app_plug_sales_postgress:5432/plug_sales_dispatch_app?sslmode=disable";
    
    console.log(`Trying connection to: ${pgUrl}`);
    const pool = new Pool({ connectionString: pgUrl, ssl: false });
    
    try {
        const res = await pool.query('SELECT * FROM client_submissions ORDER BY id DESC');
        console.log(`Success! Fetched ${res.rows.length} records.`);
        
        const filePath = './tmp/client_submissions_backup.json';
        fs.writeFileSync(filePath, JSON.stringify(res.rows, null, 2));
        console.log(`Saved as ${filePath}`);
    } catch (err) {
        console.error("Export failed:", err.message);
    } finally {
        await pool.end();
    }
}

exportToCSV();
