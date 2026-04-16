import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: "postgres://postgres:Marketing@plugsales2026!@72.62.138.244:5432/plug_sales_dispatch_app?sslmode=disable"
});

const newKey = '37fef1b6f2e0ee4882c502213c133b32-420e5355-d24c-4ff0-a1ba-56def5c595cc';

async function updateKeys() {
    try {
        console.log('--- Database Key Update ---');
        
        // 1. Update settings table
        const resSettings = await pool.query(
            "INSERT INTO settings (key, value) VALUES ('infobip_key', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
            [newKey]
        );
        console.log('✅ Settings table updated.');

        // 2. Update users table (where infobip_key was the old one or is empty and should be default)
        // Actually, the user likely wants to update ALL existing keys if they are resetting the system
        const resUsers = await pool.query(
            "UPDATE users SET infobip_key = $1",
            [newKey]
        );
        console.log(`✅ Users table updated (${resUsers.rowCount} rows).`);

        console.log('--- Update Complete ---');
    } catch (err) {
        console.error('❌ Error updating keys:', err.message);
    } finally {
        await pool.end();
    }
}

updateKeys();
