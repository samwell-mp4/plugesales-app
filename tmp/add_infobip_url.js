import pkg from 'pg';
const { Pool } = pkg;

const pgUrl = "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable";

async function addColumn() {
    const pool = new Pool({ connectionString: pgUrl });
    
    try {
        const client = await pool.connect();
        
        console.log("Adding missing columns to the users table...");
        
        // Add infobip_url
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS infobip_url TEXT;`);
        console.log("✅ Column 'infobip_url' successfully verified/added to users!");
        
        // Add parent_id just in case
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES users(id);`);
        console.log("✅ Column 'parent_id' successfully verified/added to users!");
        
        client.release();
    } catch (err) {
        console.error("❌ Error adding column:", err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

addColumn();
