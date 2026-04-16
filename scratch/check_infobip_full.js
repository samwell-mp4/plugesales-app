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

async function checkDetailedSettings() {
    try {
        console.log('--- ALL INFOBIP SETTINGS ---');
        const settingsRes = await pool.query("SELECT * FROM settings WHERE key LIKE 'infobip%';");
        console.table(settingsRes.rows);

        console.log('\n--- USERS WITH INFOBIP KEYS ---');
        const userRes = await pool.query("SELECT id, name, role, infobip_key, infobip_sender FROM users WHERE infobip_key IS NOT NULL OR infobip_sender IS NOT NULL;");
        console.table(userRes.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkDetailedSettings();
