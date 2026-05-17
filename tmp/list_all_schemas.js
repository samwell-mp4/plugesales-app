import { pool } from '../backend/database/db.js';

async function diagnose() {
    try {
        const client = await pool.connect();
        const result = await client.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
            ORDER BY table_schema, table_name;
        `);
        console.log(`Found ${result.rows.length} total tables:`);
        result.rows.forEach(row => console.log(` - [Schema: ${row.table_schema}] ${row.table_name}`));
        client.release();
    } catch (e) {
        console.error("Error listing tables:", e.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

diagnose();
