import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgres://postgres:123456@127.0.0.1:5432/plugesales' });
async function test() {
    try {
        const res = await pool.query('SELECT id, name, email, role FROM users');
        console.log('--- ALL USERS ---');
        console.table(res.rows);
        
        const clients = await pool.query("SELECT id, name, email, role FROM users WHERE role = 'CLIENT'");
        console.log('--- CLIENTS ONLY ---');
        console.table(clients.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        pool.end();
    }
}
test();
