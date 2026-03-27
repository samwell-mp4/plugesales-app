import pg from 'pg';
const { Pool } = pg;

const LOCAL_PG = "postgres://postgres:123456@localhost:5432/plugesales";
const pool = new Pool({ connectionString: LOCAL_PG });

async function test() {
    console.log("--- DB Connection Test ---");
    let client;
    try {
        console.log("Connecting to:", LOCAL_PG.replace(/:[^:@]+@/, ':****@'));
        client = await pool.connect();
        console.log("✅ Connected successfully!");

        console.log("Checking table 'affiliate_leads'...");
        const tableCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'affiliate_leads'
        `);
        
        if (tableCheck.rows.length === 0) {
            console.log("❌ Table 'affiliate_leads' DOES NOT EXIST!");
            return;
        }
        console.log("✅ Table exists.");

        console.log("Inserting dummy lead...");
        const result = await client.query(`
            INSERT INTO affiliate_leads (name, phone, email, offer_text)
            VALUES ($1, $2, $3, $4) RETURNING id
        `, ['Test Bot', '123456789', 'test@example.com', 'Diagnostic Test']);
        
        console.log("✅ Lead inserted! ID:", result.rows[0].id);

        console.log("Fetching latest leads...");
        const fetch = await client.query('SELECT id, name, created_at FROM affiliate_leads ORDER BY created_at DESC LIMIT 5');
        console.table(fetch.rows);

    } catch (err) {
        console.error("❌ ERROR:", err.message);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

test();
