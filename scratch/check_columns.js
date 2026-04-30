import { pool } from '../backend/database/db.js';

async function check() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'data_log'");
        console.log("Columns:", res.rows.map(r => r.column_name));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

check();
