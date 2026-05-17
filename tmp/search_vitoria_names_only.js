import pkg from 'pg';
const { Pool } = pkg;

const pgUrl = "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable";
const supabaseUrl = 'postgresql://postgres:Marketing%40plugsales2026!@db.hpwahwsbtqvfyutosfyr.supabase.co:5432/postgres';

async function searchDB(url, name, isSupabase) {
    console.log(`\n🔍 Searching ${name} for a person named "Vitoria" or "Vitória"...`);
    const pool = new Pool({ 
        connectionString: url,
        ssl: isSupabase ? { rejectUnauthorized: false } : false
    });
    
    try {
        const client = await pool.connect();
        
        // Get all tables in public schema
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        for (const row of tablesRes.rows) {
            const table = row.table_name;
            
            // Find all columns containing 'name', 'nome', 'client', 'profile', 'contact', 'user'
            const colsRes = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = $1 
                  AND data_type IN ('text', 'character varying')
                  AND (
                     column_name LIKE '%name%' OR 
                     column_name LIKE '%nome%' OR 
                     column_name LIKE '%client%' OR 
                     column_name LIKE '%profile%' OR 
                     column_name LIKE '%user%' OR 
                     column_name LIKE '%assigned%' OR 
                     column_name LIKE '%accepted%'
                  )
            `, [table]);
            
            if (colsRes.rows.length === 0) continue;
            
            // Build query for each column
            const conditions = colsRes.rows.map(col => `LOWER("${col.column_name}") LIKE LOWER('%vitoria%') OR LOWER("${col.column_name}") LIKE LOWER('%vitória%')`).join(' OR ');
            
            try {
                const searchRes = await client.query(`SELECT * FROM "${table}" WHERE ${conditions}`);
                if (searchRes.rows.length > 0) {
                    console.log(`\n🎉 FOUND in ${name} Table [${table}] (${searchRes.rows.length} matches):`);
                    searchRes.rows.forEach(r => {
                        console.log(JSON.stringify(r, null, 2));
                    });
                }
            } catch (e) {
                // Ignore query errors for tables that might not have those columns (like cross-schema queries)
            }
        }
        
        client.release();
    } catch (err) {
        console.error(`${name} search error:`, err.message);
    } finally {
        await pool.end();
    }
}

async function runSearch() {
    await searchDB(supabaseUrl, "Supabase", true);
    await searchDB(pgUrl, "Postgres Remote", false);
}

runSearch();
