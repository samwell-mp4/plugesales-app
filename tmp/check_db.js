import { pool, pgUrl } from '../backend/database/db.js';

async function diagnose() {
    console.log("Starting DB connection diagnostic...");
    console.log("Target Database URL:", pgUrl.replace(/:[^:@]+@/, ':****@'));
    
    try {
        const client = await pool.connect();
        console.log("✅ Successfully connected to PostgreSQL!");
        
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        console.log(`Found ${result.rows.length} tables in public schema:`);
        if (result.rows.length > 0) {
            result.rows.forEach(row => console.log(` - ${row.table_name}`));
        } else {
            console.log("❌ No tables found! The database is empty.");
        }
        
        client.release();
    } catch (err) {
        console.error("❌ Database connection error:", err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

diagnose();
