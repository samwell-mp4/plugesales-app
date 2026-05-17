import { pool, pgUrl } from '../backend/database/db.js';

async function diagnose() {
    console.log("Checking all databases on the server...");
    
    try {
        const client = await pool.connect();
        console.log("✅ Connected!");
        
        const result = await client.query(`
            SELECT datname 
            FROM pg_database 
            WHERE datistemplate = false;
        `);
        
        console.log("Databases found:");
        result.rows.forEach(row => console.log(` - ${row.datname}`));
        
        client.release();
    } catch (err) {
        console.error("❌ Connection error:", err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

diagnose();
