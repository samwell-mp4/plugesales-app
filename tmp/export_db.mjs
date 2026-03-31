import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function exportSubmissions() {
    const pool = new Pool({ 
        connectionString: process.env.DATABASE_URL, 
        ssl: { rejectUnauthorized: false } 
    });
    
    try {
        console.log("Fetching submissions...");
        const res = await pool.query('SELECT * FROM client_submissions ORDER BY id DESC');
        const data = JSON.stringify(res.rows, null, 2);
        
        const filePath = './tmp/submissions_backup.json';
        fs.writeFileSync(filePath, data);
        console.log(`Successfully exported ${res.rows.length} submissions to ${filePath}`);
    } catch (err) {
        console.error("Export failed:", err);
    } finally {
        await pool.end();
    }
}

exportSubmissions();
