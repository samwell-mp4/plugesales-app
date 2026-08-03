import pg from 'pg';
import { pgUrl } from '../backend/database/db.js';

const { Pool } = pg;
const pool = new Pool({ connectionString: pgUrl });

async function check() {
    try {
        console.log("Connecting to:", pgUrl);
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        console.log("Tables in database:");
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
check();
