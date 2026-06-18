import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable"
});

async function run() {
    try {
        const resUsers = await pool.query("SELECT id, name, infobip_key, infobip_url FROM users WHERE infobip_url IS NOT NULL AND infobip_url != ''");
        console.log("Users with custom URL:", resUsers.rows);

        // Also check if there's a settings table
        try {
            const resSettings = await pool.query("SELECT * FROM settings WHERE key ILIKE '%infobip%'");
            console.log("Settings found:", resSettings.rows);
        } catch (err) {
            console.log("No settings table or error:", err.message);
        }
    } catch (err) {
        console.error("DB Error:", err.message);
    } finally {
        await pool.end();
    }
}

run();
