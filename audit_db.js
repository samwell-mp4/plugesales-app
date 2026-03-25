import pg from 'pg';
const { Pool } = pg;

const pgUrl = "postgres://postgres:123456@localhost:5432/plugesales";
const pool = new Pool({ connectionString: pgUrl });

async function audit() {
    try {
        const res = await pool.query('SELECT * FROM affiliate_leads LIMIT 10');
        console.log('--- AFFILIATE LEADS (LIMIT 10) ---');
        console.table(res.rows);
        
        const count = await pool.query('SELECT COUNT(*) FROM affiliate_leads');
        console.log('Total leads:', count.rows[0].count);

        const users = await pool.query('SELECT id, name, role FROM users LIMIT 10');
        console.log('--- USERS (LIMIT 10) ---');
        console.table(users.rows);
    } catch (err) {
        console.error('Audit failed:', err);
    } finally {
        await pool.end();
    }
}

audit();
