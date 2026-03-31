require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('fs');

async function exportSubmissions() {
    const pool = new Pool({ 
        connectionString: process.env.DATABASE_URL, 
        ssl: { rejectUnauthorized: false } 
    });
    
    try {
        console.log("Fetching submissions...");
        const res = await pool.query('SELECT * FROM client_submissions ORDER BY id DESC');
        const data = JSON.stringify(res.rows, null, 2);
        
        // Ensure tmp directory exists
        const tmpDir = './tmp';
        if (!fs.existsSync(tmpDir)){
            fs.mkdirSync(tmpDir);
        }
        
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
