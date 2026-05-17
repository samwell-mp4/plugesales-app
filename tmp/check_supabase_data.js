import pkg from 'pg';
const { Pool } = pkg;

const url = 'postgresql://postgres:Marketing%40plugsales2026!@db.hpwahwsbtqvfyutosfyr.supabase.co:5432/postgres';

async function diagnose() {
    console.log("Checking tables and record counts on Supabase...");
    const pool = new Pool({ 
        connectionString: url,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        const client = await pool.connect();
        console.log("✅ Connected to Supabase!");
        
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        console.log(`Found ${tablesRes.rows.length} tables in Supabase:`);
        for (const row of tablesRes.rows) {
            const countRes = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
            console.log(` - ${row.table_name}: ${countRes.rows[0].count} records`);
        }
        
        client.release();
    } catch (err) {
        console.error("❌ Connection error:", err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

diagnose();
