import { pool } from '../backend/database/db.js';

async function run() {
    try {
        await pool.query("ALTER TABLE public.data_log ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDENTE'");
        console.log("Column 'status' added to data_log");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

run();
