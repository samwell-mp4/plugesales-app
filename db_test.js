import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgres://postgres:123456@localhost:5432/plugesales' });
async function test() {
    try {
        const res = await pool.query('SELECT * FROM settings');
        console.log(res.rows);
    } catch (err) {
        console.error('Full Error Object:', err);
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
    } finally {
        pool.end();
    }
}
test();
