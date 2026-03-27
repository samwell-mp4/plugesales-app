
import pg from 'pg';
const { Pool } = pg;
const pgUrl = "postgres://postgres:123456@localhost:5432/plugesales";
const pool = new Pool({ connectionString: pgUrl });

async function check() {
    try {
        const res = await pool.query("SELECT count(*) FROM affiliate_leads");
        console.log("SUCCESS: affiliate_leads has", res.rows[0].count, "rows");
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables in DB:", tables.rows.map(t => t.table_name));
    } catch (err) {
        console.error("ERROR checking table:", err.message);
    } finally {
        await pool.end();
    }
}
check();
