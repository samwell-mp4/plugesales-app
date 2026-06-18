import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable"
});

async function run() {
    try {
        const res = await pool.query("SELECT id, name, email, role, infobip_key, infobip_url FROM users WHERE name ILIKE '%sid%' OR name ILIKE '%luis%' OR email ILIKE '%sid%' OR role='ADMIN'");
        console.log("Users found:", res.rows);
    } catch (err) {
        console.error("DB Error:", err.message);
    } finally {
        await pool.end();
    }
}

run();
