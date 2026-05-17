import pkg from 'pg';
const { Pool } = pkg;

const pgUrl = "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable";

async function insertUser() {
    const pool = new Pool({ connectionString: pgUrl });
    
    try {
        const client = await pool.connect();
        
        // Let's insert the user
        const res = await client.query(`
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) 
            DO UPDATE SET password = $3, role = $4
            RETURNING id, name, email, role;
        `, ['Vitória', 'vitoria@makingpublicidade.com.br', 'vitoria123', 'CLIENT']);
        
        console.log("✅ Vitória user successfully created/restored!");
        console.log(JSON.stringify(res.rows[0], null, 2));
        
        client.release();
    } catch (err) {
        console.error("❌ Error inserting user:", err.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

insertUser();
