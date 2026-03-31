import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

async function exportToCSV() {
    // Try both common local ports/passwords found in server.js and sql_test.js
    const connections = [
        "postgres://postgres:123456@localhost:5432/plugesales",
        "postgres://postgres:postgres@localhost:5432/plugesales"
    ];

    let pool;
    let data;

    for (const url of connections) {
        try {
            console.log(`Trying connection: ${url}`);
            pool = new Pool({ connectionString: url, ssl: false });
            const res = await pool.query('SELECT * FROM client_submissions ORDER BY id DESC');
            data = res.rows;
            console.log(`Success! Fetched ${data.length} records.`);
            break;
        } catch (err) {
            console.warn(`Connection failed for ${url}: ${err.message}`);
            if (pool) await pool.end();
            pool = null;
        }
    }

    if (!data) {
        console.error("Could not connect to database on any local fallback.");
        process.exit(1);
    }

    try {
        const filePath = './tmp/client_submissions_export.json';
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Saved as ${filePath}`);
    } catch (err) {
        console.error("Failed to write file:", err.message);
    } finally {
        if (pool) await pool.end();
    }
}

exportToCSV();
