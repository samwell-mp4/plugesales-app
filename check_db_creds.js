import pg from 'pg';
const { Pool } = pg;
const pgUrl = "postgres://postgres:Marketing@plugsales2026!@127.0.0.1:5432/plug_sales_dispatch_app";
const pool = new Pool({ connectionString: pgUrl });
async function test() {
    try {
        const res = await pool.query('SELECT id, name, email, role FROM users');
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        pool.end();
    }
}
test();
