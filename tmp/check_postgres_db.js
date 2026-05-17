import pkg from 'pg';
const { Pool } = pkg;

const url = "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/postgres?sslmode=disable";

async function diagnose() {
    console.log("Checking tables in 'postgres' database...");
    const pool = new Pool({ connectionString: url });
    
    try {
        const client = await pool.connect();
        console.log("✅ Connected to 'postgres' database!");
        
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        console.log(`Found ${result.rows.length} tables in 'postgres' database:`);
        result.rows.forEach(row => console.log(` - ${row.table_name}`));
        
        client.release();
    } catch (err) {
        console.error("❌ Connection error:", err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

diagnose();
