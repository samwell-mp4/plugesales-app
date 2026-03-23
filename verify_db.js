import pg from 'pg';
const { Pool } = pg;

// Trying credentials from db_test.js
const pgUrl = "postgres://postgres:123456@localhost:5432/plugesales";

console.log('Testing connection to:', pgUrl.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({ connectionString: pgUrl });

async function test() {
    try {
        console.log('Connecting...');
        const client = await pool.connect();
        console.log('✅ Connection successful!');
        
        const res = await client.query('SELECT current_database(), current_user');
        console.log('Database Info:', res.rows[0]);
        
        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables found:', tables.rows.map(r => r.table_name));
        
        client.release();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

test();
