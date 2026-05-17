import pkg from 'pg';
const { Pool } = pkg;

const connections = [
    "postgres://postgres:123456@localhost:5432/plugesales",
    "postgres://postgres:postgres@localhost:5432/plugesales",
    "postgres://postgres:Marketing@plugsales2026!@localhost:5432/plugesales",
    "postgres://postgres:Marketing@plugsales2026!@localhost:5432/plug_sales_dispatch_app"
];

async function diagnose() {
    console.log("Checking local PostgreSQL databases...");
    
    for (const url of connections) {
        console.log(`Trying to connect to: ${url.replace(/:[^:@]+@/, ':****@')}`);
        const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 3000 });
        
        try {
            const client = await pool.connect();
            console.log("✅ Successfully connected to local Postgres!");
            
            const result = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            `);
            
            console.log(`Found ${result.rows.length} tables:`);
            for (const row of result.rows) {
                const countRes = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
                console.log(` - ${row.table_name}: ${countRes.rows[0].count} records`);
            }
            
            client.release();
            await pool.end();
            console.log("All done with this local connection!\n");
        } catch (err) {
            console.warn(`❌ Failed to connect: ${err.message}\n`);
            await pool.end();
        }
    }
    
    process.exit(0);
}

diagnose();
