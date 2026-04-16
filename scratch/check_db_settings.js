import pg from 'pg';
import fs from 'fs';

const DEFAULT_PG = "postgres://postgres:Marketing@plugsales2026!@plug_sales_dispatch_app_plug_sales_postgress:5432/plug_sales_dispatch_app?sslmode=disable";
const LOCAL_PG = "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable";

let pgUrl = process.env.DATABASE_URL;

if (!pgUrl) {
    if (fs.existsSync('/.dockerenv')) {
        pgUrl = DEFAULT_PG;
    } else {
        pgUrl = LOCAL_PG;
    }
}

const { Pool } = pg;
const pool = new Pool({ connectionString: pgUrl });

async function checkSettings() {
    try {
        console.log('--- GLOBAL SETTINGS ---');
        const settingsRes = await pool.query("SELECT * FROM settings WHERE key LIKE 'infobip%';");
        console.table(settingsRes.rows);

        console.log('\n--- SAMWELL SOUZA USER ---');
        const userRes = await pool.query("SELECT id, name, email, role, infobip_key, infobip_sender FROM users WHERE name LIKE '%Samwell%';");
        console.table(userRes.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkSettings();
